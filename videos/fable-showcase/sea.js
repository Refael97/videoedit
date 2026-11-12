// Scene 3 (VFX): a drone flight from the planet's limb down onto a night sea that turns into a real daylight sea.
// One full-screen fragment shader (height-field ocean + procedural sky), driven by update(t). Deterministic and seek-safe.
export function initSea({ T0, DPR }) {
  const W = 1920, H = 1080, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (x) => x * x * (3 - 2 * x), inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const cv = document.createElement("canvas"); cv.id = "sea"; cv.width = W * DPR; cv.height = H * DPR;
  cv.style.cssText = "position:absolute;left:0;top:0;width:1920px;height:1080px;display:none";
  document.getElementById("root").appendChild(cv);
  const gl = cv.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false, alpha: false });
  const VS = `#version 300 es
  in vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`;
  const FS = `#version 300 es
  precision highp float;
  uniform vec2 uRes; uniform float uT, uDay, uFly, uPitch, uH, uElev; out vec4 o;
  float hash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
  float noise(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; } return s; }
  // one octave of choppy water: ridged sine noise
  float oct(vec2 uv, float ch) { uv += noise(uv) * 2.0 - 1.0; vec2 wv = 1.0 - abs(sin(uv)), sw = abs(cos(uv)); wv = mix(wv, sw, wv); return pow(1.0 - pow(wv.x * wv.y, 0.65), ch); }
  float sea(vec2 p, int n) { float f = 0.16, a = mix(0.42, 0.6, uDay), ch = 4.0, h = 0.0, tt = 1.0 + uT * 0.8; vec2 uv = p; uv.x *= 0.75;
    for (int i = 0; i < 6; i++) { if (i >= n) break; float d = oct((uv + tt) * f, ch) + oct((uv - tt) * f, ch); h += d * a; uv = mat2(1.6, 1.2, -1.2, 1.6) * uv; f *= 1.9; a *= 0.22; ch = mix(ch, 1.0, 0.2); }
    return h; }
  vec3 sunDir() { return normalize(vec3(0.0, uElev, 1.0)); }
  vec3 sky(vec3 d) {
    vec3 s = sunDir(); float y = max(d.y, 0.0), az = d.x / max(d.z, 0.05), sd = max(dot(d, s), 0.0);
    // night: black space, a band of blue light hugging the horizon, hottest at the centre
    vec3 n = vec3(0.0, 0.004, 0.016);
    float band = exp(-y * 9.0), core = exp(-az * az * 1.6);
    n += vec3(0.02, 0.16, 0.75) * band * (0.25 + 0.95 * core);
    n += vec3(0.10, 0.45, 1.0) * exp(-y * 34.0) * (0.3 + 1.5 * core);
    n += vec3(0.9, 0.97, 1.0) * exp(-y * 150.0) * exp(-az * az * 7.0) * 1.6;
    // day: deep blue above, pale at the horizon, warm around a low sun, wisps of cloud
    vec3 dcol = mix(vec3(0.36, 0.62, 0.95), vec3(0.016, 0.105, 0.52), pow(y, 0.45));
    dcol = mix(dcol, vec3(1.0, 0.72, 0.34), exp(-y * 22.0) * (0.12 + 0.88 * exp(-az * az * 2.2)) * 0.8);
    // the sun shows first, on the still-dark sky; the daylight follows it up
    vec3 sun = vec3(1.0, 0.93, 0.78) * (pow(sd, 260.0) * 0.5 + pow(sd, 2200.0) * 2.5 + pow(sd, 16000.0) * 30.0) * smoothstep(-0.02, 0.0, uElev);
    vec2 cp = d.xz / (d.y + 0.12); float ci = smoothstep(0.52, 0.86, fbm(cp * vec2(0.9, 2.6) + vec2(3.0, uT * 0.02))) * smoothstep(0.02, 0.16, y) * 0.55;
    float lowc = smoothstep(0.5, 0.78, fbm(vec2(az * 3.4 + 7.0, y * 46.0))) * smoothstep(0.075, 0.02, y) * smoothstep(0.004, 0.02, y) * smoothstep(0.35, 0.9, abs(az));
    dcol = mix(dcol, vec3(1.0, 0.98, 0.95), ci); dcol = mix(dcol, vec3(1.0, 0.95, 0.86), lowc * 0.9);
    return mix(n, dcol, uDay) + sun * mix(0.8, 1.0, uDay); }
  void main() {
    vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    vec3 ro = vec3(0.0, uH, uFly), rd = normalize(vec3(q.x, q.y + uPitch, 1.25));
    vec3 col = sky(rd);
    if (rd.y < 0.0) {
      // height-field trace: bracket the surface between the crest plane and the mean plane, then refine
      float tm = 0.0, ta = -(ro.y - 1.4) / rd.y, tb = -ro.y / rd.y * 1.02;
      float ha = ro.y + rd.y * ta - sea((ro + rd * ta).xz, 3), hb = ro.y + rd.y * tb - sea((ro + rd * tb).xz, 3);
      for (int i = 0; i < 8; i++) { tm = mix(ta, tb, ha / (ha - hb)); vec3 p = ro + rd * tm; float hm = p.y - sea(p.xz, 3); if (hm < 0.0) { tb = tm; hb = hm; } else { ta = tm; ha = hm; } }
      vec3 p = ro + rd * tm; float e = max(0.012, tm * 0.0016);
      float hc = sea(p.xz, 6), hx = sea(p.xz + vec2(e, 0.0), 6), hz = sea(p.xz + vec2(0.0, e), 6);
      vec3 nrm = normalize(vec3(hc - hx, e, hc - hz)); nrm = normalize(mix(nrm, vec3(0, 1, 0), smoothstep(40.0, 420.0, tm) * 0.85));
      vec3 s = sunDir(), r = reflect(rd, nrm); r.y = abs(r.y);
      float fr = 0.03 + 0.97 * pow(1.0 - max(dot(-rd, nrm), 0.0), 5.0);
      vec3 deep = mix(vec3(0.0, 0.003, 0.014), vec3(0.004, 0.045, 0.15), uDay), shallow = mix(vec3(0.0, 0.012, 0.07), vec3(0.02, 0.16, 0.36), uDay);
      vec3 body = deep + shallow * (0.18 + 0.5 * smoothstep(0.0, 0.7, hc)) * mix(0.55, 1.0, uDay);
      vec3 refl = sky(r) * mix(0.42, 0.9, uDay);
      float sp = pow(max(dot(r, s), 0.0), mix(220.0, 420.0, uDay));
      vec3 glit = mix(vec3(0.55, 0.78, 1.0) * 7.0, vec3(1.0, 0.9, 0.7) * 30.0, uDay) * sp;
      vec3 w = mix(body, refl, fr) + glit;
      col = mix(w, sky(vec3(rd.x, 0.004, rd.z)), (1.0 - exp(-tm * mix(0.0011, 0.0022, uDay))) * mix(0.75, 0.9, uDay));
    }
    col *= 1.0 - 0.35 * dot(q, q);
    col = col / (1.0 + col * 0.12); col = pow(max(col, 0.0), vec3(0.4545 * mix(1.2, 1.0, uDay)));
    col += (hash(gl_FragCoord.xy + uT * 61.0) - 0.5) * 0.012;
    o = vec4(col, 1.0);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[sea]", gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes", "uT", "uDay", "uFly", "uPitch", "uH", "uElev"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
  const T = { fade: T0 + 0.45, in: T0 + 1.05, day0: T0 + 1.9, day1: T0 + 3.5, end: T0 + 4.2 };
  function update(t) {
    if (t < T.fade - 0.02) { cv.style.display = "none"; return; }
    cv.style.display = "block"; cv.style.opacity = smooth(seg(t, T.fade, T.in)).toFixed(3);
    // the sun climbs first; the light comes only once it is over the horizon and grows as it rises
    const s = t - T.fade, elev = lerp(-0.035, 0.115, smooth(seg(t, T.day0, T.day1))), day = smooth(clamp((elev - 0.012) / 0.098));
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uT, s); gl.uniform1f(U.uDay, day); gl.uniform1f(U.uElev, elev);
    gl.uniform1f(U.uFly, 3.0 * s + 2.75 * s * s + 9.0 * Math.max(0, s - 1.2)); // the drone keeps accelerating
    gl.uniform1f(U.uPitch, lerp(0.132, 0.062, inOut(seg(t, T.fade, T.fade + 2.4)))); // starts where the limb sat in the frame
    gl.uniform1f(U.uH, lerp(7.5, 2.3, inOut(seg(t, T.fade, T.fade + 2.6)))); // and comes down to skim the water
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  return { update, T };
}
