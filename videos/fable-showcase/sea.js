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
  uniform vec2 uRes; uniform float uT, uDay, uFly, uPitch, uH, uElev, uCurve, uLz, uLx, uLy; uniform sampler2D uTex; out vec4 o;
  const float LW = 66.0, LH = 9.67;
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
  // HIGGSFIELD standing in the sea: a stack of text planes gives the letters real thickness. Backlit by the sun behind them.
  vec4 letters(vec3 ro, vec3 rd, out float tH) {
    tH = -1.0; if (abs(rd.z) < 1e-4) return vec4(0.0);
    float sunUp = smoothstep(-0.02, 0.03, uElev);
    for (int k = 0; k < 6; k++) {
      float t = (uLz + float(k) * 0.45 - ro.z) / rd.z; if (t <= 0.0) continue;
      vec3 p = ro + rd * t; vec2 uv = vec2((p.x - uLx) / LW + 0.5, (p.y - uLy) / LH);
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) continue;
      float a = texture(uTex, uv).r; if (a < 0.5) continue;
      tH = t; vec3 base = mix(vec3(0.004, 0.012, 0.035), vec3(0.012, 0.028, 0.07), uDay), c;
      if (k == 0) { c = base * (0.7 + 0.9 * uv.y) + mix(vec3(0.02, 0.08, 0.3), vec3(0.25, 0.4, 0.6), uDay) * 0.18; c += vec3(1.0, 0.8, 0.5) * smoothstep(0.78, 0.5, a) * 0.9 * sunUp; }
      else c = base * 1.3 + vec3(1.0, 0.72, 0.4) * 0.5 * sunUp + vec3(0.1, 0.4, 1.0) * 0.25 * (1.0 - uDay);
      c = mix(c, sky(vec3(rd.x, 0.01, abs(rd.z))), (1.0 - exp(-t * 0.0035)) * 0.42);
      return vec4(c, 1.0);
    }
    return vec4(0.0); }
  void main() {
    vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float bend = uCurve * q.x * q.x; // the horizon starts as the curve of the planet's limb and flattens as we fly in
    vec3 ro = vec3(0.0, uH, uFly), rd = normalize(vec3(q.x, q.y + bend + uPitch, 1.25));
    vec3 col = sky(rd);
    float tL, tW = 1e9; vec4 L = letters(ro, rd, tL);
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
      float tR, tS; vec4 LR = letters(p + vec3(0.0, 0.02, 0.0), r, tR); refl = mix(refl, LR.rgb * 0.7, LR.a * 0.9); // the letters mirror in the water
      float shadow = letters(p + vec3(0.0, 0.02, 0.0), s, tS).a;                                                       // and throw long shadows toward us
      float sp = pow(max(dot(r, s), 0.0), mix(220.0, 420.0, uDay));
      vec3 glit = mix(vec3(0.55, 0.78, 1.0) * 7.0, vec3(1.0, 0.9, 0.7) * 30.0, uDay) * sp;
      vec3 w = mix(body * (1.0 - 0.45 * shadow), refl, fr) + glit * (1.0 - 0.92 * shadow); tW = tm;
      col = mix(w, sky(vec3(rd.x, 0.004, rd.z)), (1.0 - exp(-tm * mix(0.0011, 0.0022, uDay))) * mix(0.75, 0.9, uDay));
    }
    if (L.a > 0.0 && tL < tW) col = L.rgb;
    col *= 1.0 - 0.35 * dot(q, q);
    col = col / (1.0 + col * 0.12); col = pow(max(col, 0.0), vec3(0.4545 * mix(1.2, 1.0, uDay)));
    col += (hash(gl_FragCoord.xy + uT * 61.0) - 0.5) * 0.012;
    o = vec4(col, 1.0);
  }`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error("[sea]", gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["uRes", "uT", "uDay", "uFly", "uPitch", "uH", "uElev", "uCurve", "uLz", "uLx", "uLy", "uTex"].forEach((n) => (U[n] = gl.getUniformLocation(pr, n)));
  const T = { fade: T0 - 0.3, in: T0 + 0.1, day0: T0 + 1.9, day1: T0 + 3.5, rise0: T0 + 2.0, rise1: T0 + 3.3, white: T0 + 5.25, end: T0 + 5.7 };
  // the word as a texture; the gap between S and F is centred on the flight path so the drone passes between the letters
  const LW = 66, LH = 9.67, tc = document.createElement("canvas"); tc.width = 2048; tc.height = 300; let gapX = 1024;
  const tex = gl.createTexture();
  const drawWord = () => { const g = tc.getContext("2d"), word = "HIGGSFIELD"; g.clearRect(0, 0, 2048, 300); g.fillStyle = "#000"; g.fillRect(0, 0, 2048, 300);
    let fs = 250; g.font = "700 " + fs + "px UI, Inter, sans-serif"; const sp = () => fs * 0.13, width = () => [...word].reduce((a, ch) => a + g.measureText(ch).width, 0) + sp() * (word.length - 1);
    fs *= 1960 / width(); g.font = "700 " + fs + "px UI, Inter, sans-serif"; g.fillStyle = "#fff"; g.textBaseline = "alphabetic"; g.shadowColor = "#fff"; g.shadowBlur = 5;
    let x = (2048 - width()) / 2; [...word].forEach((ch, i) => { g.fillText(ch, x, 268); x += g.measureText(ch).width; if (i === 4) gapX = x + sp() / 2; x += sp(); });
    gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); };
  drawWord(); if (document.fonts && document.fonts.load) document.fonts.load("700 200px UI").then(drawWord).catch(() => {});
  const fly = (s) => 13.0 * s + 2.6 * s * s, LZ = fly(T.end - T.fade + 0.25); // the letters stand where the drone will be a moment after the white-out
  // white-out into the sun, and the label for the filmed shots
  const root = document.getElementById("root"), white = document.createElement("div"), label = document.createElement("div");
  white.style.cssText = "position:absolute;inset:0;z-index:8;pointer-events:none;opacity:0;background:radial-gradient(circle at 50% 44%, #fff 0%, #fffaf0 45%, #ffe9c4 100%)";
  label.textContent = "Seedance 2.5"; label.style.cssText = "position:absolute;left:64px;bottom:56px;z-index:7;padding:14px 26px;border-radius:999px;font:600 26px/1 'UI',sans-serif;letter-spacing:.2px;color:#fff;background:rgba(20,22,28,.38);backdrop-filter:blur(18px) saturate(1.4);box-shadow:inset 0 1px 0 rgba(255,255,255,.45), inset 0 0 0 1px rgba(255,255,255,.16);opacity:0";
  root.appendChild(white); root.appendChild(label);
  const SHOTS_END = T.end + 6.2;
  function update(t) {
    white.style.opacity = (t < T.end ? smooth(seg(t, T.white, T.end - 0.02)) : 1 - smooth(seg(t, T.end, T.end + 0.55))).toFixed(3);
    label.style.opacity = (smooth(seg(t, T.end + 0.5, T.end + 0.9)) * (1 - smooth(seg(t, SHOTS_END - 0.4, SHOTS_END)))).toFixed(3);
    if (t < T.fade - 0.02 || t > T.end + 0.05) { cv.style.display = "none"; return; }
    cv.style.display = "block"; cv.style.opacity = smooth(seg(t, T.fade, T.in)).toFixed(3);
    // the sun climbs first; the light comes only once it is over the horizon and grows as it rises
    const s = t - T.fade, elev = lerp(-0.035, 0.115, smooth(seg(t, T.day0, T.day1))), day = smooth(clamp((elev - 0.012) / 0.098));
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uT, s); gl.uniform1f(U.uDay, day); gl.uniform1f(U.uElev, elev);
    // a drone cruising forward from the first frame: constant low altitude, the surface streaming underneath, gently accelerating
    gl.uniform1f(U.uFly, fly(s));
    gl.uniform1f(U.uLz, LZ); gl.uniform1f(U.uLx, -(gapX / 2048 - 0.5) * LW); gl.uniform1f(U.uLy, lerp(-LH - 0.6, -0.95, 1 - Math.pow(1 - seg(t, T.rise0, T.rise1), 3)));
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uTex, 0);
    gl.uniform1f(U.uPitch, lerp(0.132, 0.085, inOut(seg(t, T.fade, T.fade + 3.2)))); // starts where the limb sat in the frame
    gl.uniform1f(U.uH, 2.6);
    gl.uniform1f(U.uCurve, 0.15 * (1 - inOut(seg(t, T.fade + 0.15, T.fade + 1.9))));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  return { update, T };
}
