// 0–5.77s: old green terminal → glass shatters → chrome "חארטה?!" spins in space
// 33–35s: the loop back to the terminal ("...טוב. אולי לא חארטה.") and a CRT power-off into black (= frame 0)
import { THREE, DATA, seg, lerp, E, mkRnd, clamp, envTex, chromeWord, dotTex, B } from "./core.js";

// ---------- the terminal: drawn tiny, sampled with nearest filtering → chunky phosphor pixels ----------
export function makeTerminal() {
  const TW = 480, TH = 270;
  const tc = document.createElement("canvas"); tc.width = TW; tc.height = TH; const tg = tc.getContext("2d");
  const tex = new THREE.CanvasTexture(tc);
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.colorSpace = THREE.SRGBColorSpace;
  let last = "";
  // lines: [{text, dim}], cur: index of line holding the cursor (or -1)
  function draw(lines, cur, t) {
    const on = Math.floor(t * 2.6) % 2 === 0;
    const key = JSON.stringify(lines) + cur + on; if (key === last) return; last = key;
    tg.fillStyle = "#010502"; tg.fillRect(0, 0, TW, TH);
    tg.fillStyle = "#2bff5e";
    tg.font = "500 11px Heebo"; tg.direction = "ltr"; tg.textAlign = "left"; tg.textBaseline = "alphabetic";
    tg.globalAlpha = 0.65; tg.fillText("RAFAEL-OS v1.0   640K RAM OK   C:\\>", 22, 26); tg.globalAlpha = 1;
    tg.fillRect(22, 32, TW - 44, 1);
    tg.font = "700 22px Heebo"; tg.direction = "rtl"; tg.textAlign = "right";
    const xr = TW - 58, x0 = xr - 18, y0 = lines.length > 2 ? 84 : 108, dy = 40;
    lines.forEach((l, i) => {
      const y = y0 + i * dy; tg.globalAlpha = l.dim ? 0.45 : 1;
      tg.fillText(">", xr + 2, y); tg.fillText(l.text, x0, y); tg.globalAlpha = 1;
    });
    if (on && cur >= 0) { const w = tg.measureText(lines[cur].text).width; tg.fillRect(x0 - w - 14, y0 + cur * dy - 18, 11, 22); }
    tex.needsUpdate = true;
  }
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: { tex: { value: tex }, time: { value: 0 }, on: { value: 0 }, off: { value: 0 }, shake: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform sampler2D tex; uniform float time; uniform float on; uniform float off; uniform float shake; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time*37.0) * 43758.5453); }
      void main(){
        vec2 c = vUv - 0.5; float r2 = dot(c, c);
        vec2 uv = 0.5 + c * (1.0 + 0.16 * r2 + 0.05 * r2 * r2);
        // power-off squeezes the picture into a line, then a dot
        float sy = mix(1.0, 0.004, smoothstep(0.0, 0.55, off)); float sx = mix(1.0, 0.002, smoothstep(0.5, 1.0, off));
        uv = 0.5 + (uv - 0.5) / vec2(sx, sy);
        uv.x += sin(uv.y * 900.0 + time * 40.0) * 0.0007 + shake * 0.004 * sin(time * 90.0);
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec3 col = texture2D(tex, uv).rgb;
        vec3 glow = vec3(0.0);
        for (int i = -2; i <= 2; i++) { for (int j = -2; j <= 2; j++) { glow += texture2D(tex, uv + vec2(float(i), float(j)) * 0.0024).rgb; } }
        col = col * 0.85 + glow / 25.0 * 0.9;
        col *= 0.72 + 0.28 * sin(uv.y * 270.0 * 3.14159 * 2.0);
        col *= 0.94 + 0.06 * sin(time * 113.0);
        float bar = smoothstep(0.0, 0.08, fract(uv.y - time * 0.35)) * smoothstep(0.16, 0.08, fract(uv.y - time * 0.35));
        col += vec3(0.02, 0.08, 0.03) * bar;
        col += vec3(0.0, 0.02, 0.005) + (hash(floor(uv * vec2(960.0, 540.0))) - 0.5) * 0.05;
        float vig = smoothstep(0.75, 0.25, length(c * vec2(1.0, 1.15)));
        col *= mix(0.25, 1.0, vig);
        col += vec3(0.75, 1.0, 0.8) * off * 1.6 * (1.0 - smoothstep(0.85, 1.0, off));
        float open = smoothstep(0.0, 1.0, on);
        float band = step(abs(vUv.y - 0.5), 0.5 * open + 0.002);
        float line = exp(-pow((vUv.y - 0.5) / (0.003 + 0.06 * open), 2.0)) * (1.0 - open) * 1.6;
        col = col * band + vec3(0.7, 1.0, 0.75) * line * step(abs(vUv.x - 0.5), 0.5 * clamp(on * 3.0, 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  return { draw, mat, tex };
}
const typed = (sched, t) => { const s = {}; for (const e of sched) { if (e.t > t) break; s[e.line] = e.text; } return s; };
const lastLine = (sched, t) => { let l = 1; for (const e of sched) { if (e.t > t) break; l = e.line; } return l; };

const CAMZ = 12.4;
export function makeOpening() {
  const rnd = mkRnd(7);
  const T_BREAK = 3.0;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0); scene.environment = envTex;
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 500);
  const term = makeTerminal();

  // glass, pre-cut into radial shards around the impact point
  const SW = 17.2, SH = SW * 9 / 16; const IMP = new THREE.Vector2(-1.2, -0.6); const shards = [];
  {
    const NS = 18, RINGS = [0, 0.55, 1.3, 2.4, 3.8, 5.6, 8.2, 13]; const P = [];
    for (let r = 0; r < RINGS.length; r++) { P.push([]); for (let s = 0; s < NS; s++) {
      const a = (s / NS) * Math.PI * 2 + (rnd() - 0.5) * 0.28; const rr = RINGS[r] * (r ? 0.85 + rnd() * 0.3 : 0);
      P[r].push(new THREE.Vector2(clamp(IMP.x + Math.cos(a) * rr, -SW / 2, SW / 2), clamp(IMP.y + Math.sin(a) * rr, -SH / 2, SH / 2))); } }
    const uvOf = (p) => [(p.x + SW / 2) / SW, (p.y + SH / 2) / SH];
    for (let r = 0; r < RINGS.length - 1; r++) for (let s = 0; s < NS; s++) {
      const a = P[r][s], b = P[r][(s + 1) % NS], c = P[r + 1][(s + 1) % NS], d = P[r + 1][s];
      (r === 0 ? [[a, c, d]] : [[a, b, c], [a, c, d]]).forEach((tri) => {
        const cx = (tri[0].x + tri[1].x + tri[2].x) / 3, cy = (tri[0].y + tri[1].y + tri[2].y) / 3;
        const area = Math.abs((tri[1].x - tri[0].x) * (tri[2].y - tri[0].y) - (tri[2].x - tri[0].x) * (tri[1].y - tri[0].y)) / 2; if (area < 1e-4) return;
        const pos = [], uv = []; tri.forEach((p) => { pos.push(p.x - cx, p.y - cy, 0); uv.push(...uvOf(p)); });
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        const m = new THREE.Mesh(g, term.mat); m.position.set(cx, cy, 0); scene.add(m);
        const dir = new THREE.Vector2(cx - IMP.x, cy - IMP.y); const dist = dir.length(); dir.normalize();
        shards.push({ m, c: new THREE.Vector3(cx, cy, 0), dist, v: new THREE.Vector3(dir.x * (2.5 + rnd() * 5), dir.y * (2.5 + rnd() * 5) + 1.5, 6 + rnd() * 14 - dist * 0.4),
          ax: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), w: 3 + rnd() * 9, delay: dist * 0.012 });
      });
    }
  }

  const { group: word, glyphs } = chromeWord("חארטה?!");
  word.position.set(0, 0.2, 1.5); word.scale.setScalar(0.8); scene.add(word);
  const streaks = new THREE.Group(); scene.add(streaks);
  [[0xff2a8a, -3.2, -40], [0x2ad8ff, 2.6, -46], [0x8a5cff, 0.4, -60], [0x2bff5e, -1.4, -70]].forEach(([c, y, z], i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.12 + i * 0.03), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(0, y, z); streaks.add(m);
  });
  const kL = new THREE.PointLight(0xff3d9a, 60, 30, 1.5); kL.position.set(-7, 3, 6); scene.add(kL);
  const kR = new THREE.PointLight(0x3ddcff, 60, 30, 1.5); kR.position.set(7, -2, 6); scene.add(kR);
  const NP = 900; const pg = new THREE.BufferGeometry(); const pp = new Float32Array(NP * 3); const P0 = [];
  for (let i = 0; i < NP; i++) { const a = rnd() * Math.PI * 2, b = rnd() * 2 - 1, s = 3 + rnd() * 16; P0.push([Math.cos(a) * Math.sqrt(1 - b * b) * s, b * s * 0.6, Math.sin(a) * Math.sqrt(1 - b * b) * s * 0.4 + 6 * rnd()]); }
  pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  const sparks = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xcfffe0, size: 0.07, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(sparks);
  // distant star dust for the spin in space
  const sd = new THREE.BufferGeometry(); const sdp = new Float32Array(2400 * 3);
  for (let i = 0; i < 2400; i++) { sdp[i * 3] = (rnd() - 0.5) * 120; sdp[i * 3 + 1] = (rnd() - 0.5) * 70; sdp[i * 3 + 2] = -20 - rnd() * 80; }
  sd.setAttribute("position", new THREE.BufferAttribute(sdp, 3));
  const dust = new THREE.Points(sd, new THREE.PointsMaterial({ color: 0x9fb4ff, size: 0.14, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  const q = new THREE.Quaternion();
  const SPIN = B(3); // 4.37: the word starts its full turn on the beat
  function update(t) {
    const s = typed(DATA.type1, t);
    term.draw([{ text: s[1] || "" }, ...(s[2] !== undefined || lastLine(DATA.type1, t) === 2 ? [{ text: s[2] || "" }] : [])], lastLine(DATA.type1, t) - 1, t);
    term.mat.uniforms.time.value = t; term.mat.uniforms.on.value = seg(t, 0.05, 0.4); term.mat.uniforms.off.value = 0;
    term.mat.uniforms.shake.value = seg(t, 2.86, T_BREAK);
    const hitK = t >= T_BREAK ? Math.exp(-(t - T_BREAK) * 7) : 0;
    shards.forEach((sh) => {
      const dt = t - T_BREAK - sh.delay;
      if (t < T_BREAK - 0.08) { sh.m.position.copy(sh.c); sh.m.quaternion.identity(); sh.m.visible = true; return; }
      if (dt < 0) { const pre = seg(t, T_BREAK - 0.08, T_BREAK); sh.m.position.set(sh.c.x + (sh.c.x - IMP.x) * 0.006 * pre, sh.c.y + (sh.c.y - IMP.y) * 0.006 * pre, pre * 0.05 * (sh.dist % 1)); sh.m.quaternion.identity(); sh.m.visible = true; return; }
      sh.m.position.set(sh.c.x + sh.v.x * dt, sh.c.y + sh.v.y * dt - 3.5 * dt * dt, sh.v.z * dt);
      q.setFromAxisAngle(sh.ax, sh.w * dt); sh.m.quaternion.copy(q);
      sh.m.visible = sh.m.position.z < CAMZ - 0.3 && dt < 2.2;
    });
    glyphs.forEach((g, i) => {
      const j = glyphs.length - 1 - i; const st = T_BREAK + 0.02 + j * 0.035; const k = seg(t, st, st + 0.3);
      g.visible = t >= st;
      g.position.z = lerp(-70, 0, E.outExpo(k)); g.position.y = lerp((j % 2 ? 1 : -1) * 3, 0, E.outExpo(k));
      g.rotation.y = lerp((j - 3) * 0.9, 0, E.outBack(k)) + (t > st + 0.3 ? Math.sin((t - st) * 1.4 + j) * 0.12 * (1 - seg(t, SPIN - 0.2, SPIN)) : 0);
      g.rotation.x = lerp(-1.2, 0, E.outBack(k));
      // during the spin each glyph peels off on its own axis a little
      const sp = seg(t, SPIN, B(6));
      g.position.z += Math.sin(sp * Math.PI) * (j - 3) * 0.5;
      g.rotation.x += Math.sin(sp * Math.PI) * (j % 2 ? 0.5 : -0.5);
    });
    const spin = E.inOutCubic(seg(t, SPIN, B(5.6)));
    word.rotation.y = Math.sin(t * 0.9) * 0.18 * seg(t, 3.4, 4.0) * (1 - seg(t, SPIN - 0.3, SPIN)) + spin * Math.PI * 2;
    word.rotation.z = Math.sin(spin * Math.PI) * 0.25;
    word.position.z = 1.0 + 0.8 * E.inOutSine(seg(t, 3.3, 4.4)) - 0.4 * Math.sin(spin * Math.PI);
    streaks.visible = t >= T_BREAK;
    streaks.children.forEach((m, i) => { m.position.x = Math.sin(t * 0.7 + i) * 6; m.material.opacity = 0.9 * seg(t, T_BREAK, T_BREAK + 0.4); });
    kL.intensity = kR.intensity = (60 - 35 * seg(t, SPIN - 0.3, SPIN)) * seg(t, T_BREAK, T_BREAK + 0.2) + 220 * hitK;
    kL.position.set(-7 * Math.cos(spin * 6.28), 3, 6 - 4 * Math.sin(spin * 3.14)); kR.position.set(7 * Math.cos(spin * 6.28), -2, 6 - 4 * Math.sin(spin * 3.14));
    const sp = t - T_BREAK; sparks.visible = sp > 0;
    for (let i = 0; i < NP; i++) { const k = 1 - Math.exp(-sp * 2.2); pp[i * 3] = IMP.x + P0[i][0] * k; pp[i * 3 + 1] = IMP.y + P0[i][1] * k - sp * sp * 0.6; pp[i * 3 + 2] = P0[i][2] * k; }
    pg.attributes.position.needsUpdate = true; sparks.material.opacity = Math.max(0, 1 - sp / 1.6);
    dust.visible = t > T_BREAK; dust.material.opacity = seg(t, T_BREAK, 3.6); dust.position.z = (t - T_BREAK) * 6;

    const push = E.inOutSine(seg(t, 0.3, 2.95)); const shake = hitK * 0.35 + seg(t, 2.9, T_BREAK) * 0.04;
    const orbit = E.inOutCubic(seg(t, SPIN, B(6)));
    camera.position.set(Math.sin(t * 1.1) * 0.06 + Math.sin(t * 97) * shake + lerp(0, 0.35, E.inOutSine(seg(t, 3.3, 4.4))) + Math.sin(orbit * Math.PI) * -2.2,
      Math.cos(t * 0.9) * 0.04 + Math.cos(t * 83) * shake + lerp(0, 0.5, E.inOutSine(seg(t, 3.3, 4.4))) + Math.sin(orbit * Math.PI) * 1.2,
      lerp(CAMZ, CAMZ - 0.9, push) + (t > T_BREAK ? -0.9 * E.outCubic(seg(t, T_BREAK, T_BREAK + 0.4)) : 0) - orbit * 1.2);
    camera.lookAt(0, 0, 0); camera.rotation.z += Math.sin(t * 71) * shake * 0.05 + Math.sin(orbit * Math.PI) * 0.12;
  }
  function post(t) {
    const hitK = t >= T_BREAK ? Math.exp(-(t - T_BREAK) * 7) : 0;
    return {
      bloom: t < T_BREAK ? [0.62, 0.6, 0.42] : [0.55 + 1.4 * hitK - 0.25 * seg(t, SPIN - 0.3, SPIN), 0.6, 0.7 + 0.2 * seg(t, SPIN - 0.3, SPIN)],
      chroma: 0.0025 + 0.03 * hitK + 0.006 * seg(t, 2.9, T_BREAK),
      flash: t >= T_BREAK ? 0.95 * Math.exp(-(t - T_BREAK) * 16) : 0,
    };
  }
  return { scene, camera, update, post };
}

export function makeLoop() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0);
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 100);
  const term = makeTerminal();
  const SW = 17.2; const screen = new THREE.Mesh(new THREE.PlaneGeometry(SW, SW * 9 / 16), term.mat); scene.add(screen);
  const T0 = 33.0, OFF = 34.62;
  function update(t) {
    const s = typed(DATA.type2, t);
    const hist = [{ text: "Claude לא יודע לערוך סרטונים.", dim: true }, { text: "...זה סתם חארטה.", dim: true }];
    term.draw([...hist, { text: s[3] || "" }], 2, t);
    term.mat.uniforms.time.value = t; term.mat.uniforms.on.value = 1; term.mat.uniforms.off.value = seg(t, OFF, OFF + 0.3);
    term.mat.uniforms.shake.value = Math.exp(-(t - T0) * 10) * 0.6;
    camera.position.set(Math.sin(t * 1.1) * 0.06, Math.cos(t * 0.9) * 0.04, lerp(CAMZ - 1.4, CAMZ - 0.9, E.outCubic(seg(t, T0, T0 + 0.8))));
    camera.lookAt(0, 0, 0);
  }
  function post(t) { return { bloom: [0.62, 0.6, 0.42], chroma: 0.0025 + 0.02 * Math.exp(-(t - T0) * 8), black: seg(t, OFF + 0.3, OFF + 0.36) }; }
  return { scene, camera, update, post };
}
