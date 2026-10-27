// 22.95–28.99s: the crescendo — every line two seconds, every line bigger
// "אתם יכולים ליצור" → a city grows out of cubes · "כל מה שאתם" → through a spinning portal · "יכולים לדמיין." → the word bursts into particles
import { THREE, seg, lerp, E, mkRnd, clamp, B, beatPulse, textCanvas, canvasTex, canvasPlane, hudText, samplePoints, dotTex } from "./core.js";

const persp = (fov = 50) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 900);

// a HUD line that slams in word by word on the beats
function slamLine(text, px, y, beats, o = {}) {
  const grp = new THREE.Group(); const words = text.split(" ");
  const meshes = words.map((w) => hudText(w, { font: `900 ${px}px Heebo`, pad: 24, shadow: 40, shadowColor: "rgba(0,0,0,.55)", ...o }));
  const gap = px * 0.28; const total = meshes.reduce((a, m) => a + m.userData.w - 48, 0) + gap * (words.length - 1);
  let x = total / 2; // RTL: first word on the right
  meshes.forEach((m) => { const w = m.userData.w - 48; m.position.set(x - w / 2, y, 0); m.userData.x = x - w / 2; x -= w + gap; grp.add(m); });
  return { grp, update(t) { meshes.forEach((m, i) => { const st = beats[Math.min(i, beats.length - 1)]; const k = seg(t, st, st + 0.22); m.visible = t >= st; m.scale.setScalar(lerp(1.9, 1, E.outExpo(k))); m.material.opacity = clamp(k * 2.5); m.position.y = y + (1 - E.outExpo(k)) * 40; }); } };
}

// ───────────── 1. a city built from cubes in one second ─────────────
function makeCity() {
  const T0 = B(43), T1 = B(47);
  const rnd = mkRnd(31);
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x1a0b2e, 30, 140);
  const camera = persp(55);
  // dusk sky
  const sky = document.createElement("canvas"); sky.width = 16; sky.height = 256; const sg = sky.getContext("2d"); const gr = sg.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#08051a"); gr.addColorStop(0.55, "#3a1250"); gr.addColorStop(0.8, "#ff4f7a"); gr.addColorStop(1, "#ffb347"); sg.fillStyle = gr; sg.fillRect(0, 0, 16, 256);
  scene.background = canvasTex(sky);
  scene.add(new THREE.HemisphereLight(0xff8ab0, 0x1a0b2e, 1.1)); const sun = new THREE.DirectionalLight(0xffb37a, 2.2); sun.position.set(-20, 12, -40); scene.add(sun);
  // windows texture shared by every tower
  const wc = document.createElement("canvas"); wc.width = 64; wc.height = 128; const wg = wc.getContext("2d"); wg.fillStyle = "#000"; wg.fillRect(0, 0, 64, 128);
  for (let y = 4; y < 128; y += 10) for (let x = 4; x < 64; x += 10) { if (rnd() < 0.4) { wg.fillStyle = rnd() < 0.7 ? "#ffcf7a" : "#7af7ff"; wg.fillRect(x, y, 6, 6); } }
  const wt = canvasTex(wc); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(1, 3);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1c1430, roughness: 0.6, metalness: 0.3, emissive: 0xffffff, emissiveMap: wt, emissiveIntensity: 0.55 });
  const G = 26, N = G * G; const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), mat, N); scene.add(city);
  const C = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    const x = (i - G / 2) * 3.2, z = -(j) * 3.2 + 6; if (Math.abs(x) < 4) { C.push(null); continue; } // the avenue the camera flies down
    const d = Math.hypot(x, z + 30); const h = (2 + rnd() * 6) * (1 + 2.5 * Math.exp(-d / 22)) * (rnd() < 0.08 ? 2 : 1);
    C.push({ x, z, h, w: 1.6 + rnd() * 1.0, d: 1.6 + rnd() * 1.0, delay: Math.abs(z) * 0.012 + rnd() * 0.12 });
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x0c0818, roughness: 0.4, metalness: 0.6 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 200), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.4, 0.6), toneMapped: false })); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, -60); scene.add(road);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const hud = new THREE.Scene(); const line = slamLine("אתם יכולים ליצור", 130, 330, [T0, B(44), B(45)], { shadow: 60, shadowColor: "rgba(10,0,30,.9)" }); hud.add(line.grp);
  function update(t) {
    const lt = t - T0;
    C.forEach((c, i) => {
      if (!c) { m4.makeScale(0, 0, 0); city.setMatrixAt(i, m4); return; }
      const k = seg(lt, c.delay, c.delay + 0.5); const hk = k <= 0 ? 0.0001 : E.outBack(k);
      p.set(c.x, 0, c.z); s.set(c.w, c.h * hk, c.d); m4.compose(p, q, s); city.setMatrixAt(i, m4);
    });
    city.instanceMatrix.needsUpdate = true;
    const k = seg(t, T0 - 0.2, T1 + 0.2);
    camera.position.set(Math.sin(k * 2) * 0.6, lerp(2.5, 22, E.inOutCubic(k)), lerp(14, -2, k)); camera.lookAt(0, lerp(4, 2, k), lerp(-30, -40, k)); camera.rotation.z += lerp(0.05, -0.08, k);
    line.update(t);
  }
  const post = (t) => ({ bloom: [0.6, 0.55, 0.7], chroma: 0.004 + beatPulse(t, T0, T1) * 0.01, glitch: beatPulse(t, T0, T1) * 0.25 });
  return { scene, camera, update, post, hud };
}

// ───────────── 2. through a spinning portal ─────────────
function makePortal() {
  const T0 = B(47), T1 = B(51);
  const rnd = mkRnd(41);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x02010a);
  const camera = persp(55);
  const vortex = new THREE.Mesh(new THREE.CircleGeometry(4.2, 128), new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } }, transparent: true,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float time; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
      void main(){ vec2 c = vUv - 0.5; float r = length(c) * 2.0; float a = atan(c.y, c.x);
        float sw = a + 3.0 / (r + 0.15) - time * 3.0;
        float n = noise(vec2(sw * 2.0, r * 6.0 - time * 4.0)) * 0.6 + noise(vec2(sw * 5.0, r * 14.0)) * 0.4;
        vec3 col = mix(vec3(0.2, 0.9, 1.8), vec3(1.6, 0.3, 1.4), 0.5 + 0.5 * sin(sw * 2.0));
        col *= n * 1.6 * smoothstep(1.0, 0.85, r) + smoothstep(0.3, 0.0, r) * 2.5;
        gl_FragColor = vec4(col, smoothstep(1.0, 0.9, r)); }`,
  })); scene.add(vortex);
  const rings = [4.4, 4.9, 5.6, 6.4].map((R, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, i === 0 ? 0.12 : 0.04, 12, 220), new THREE.MeshBasicMaterial({ color: [new THREE.Color(2.4, 2.0, 2.6), new THREE.Color(0.4, 1.8, 2.2), new THREE.Color(2.2, 0.4, 1.8), new THREE.Color(1.2, 1.0, 2.4)][i], toneMapped: false })); scene.add(m); return m; });
  // runes/segments around the main ring
  const segs = new THREE.Group(); for (let i = 0; i < 36; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.8, 2.4), toneMapped: false })); const a = (i / 36) * Math.PI * 2; b.position.set(Math.cos(a) * 5.2, Math.sin(a) * 5.2, 0); b.rotation.z = a + Math.PI / 2; segs.add(b); } scene.add(segs);
  const N = 2500, pp = new Float32Array(N * 3), PA = []; for (let i = 0; i < N; i++) PA.push([rnd() * Math.PI * 2, 4.5 + rnd() * 5, (rnd() - 0.5) * 30, 0.5 + rnd()]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: new THREE.Color(1.4, 1.2, 2.2), size: 0.07, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const hud = new THREE.Scene(); const line = slamLine("כל מה שאתם", 180, 330, [T0, B(48), B(49)]); hud.add(line.grp);
  function update(t) {
    const lt = t - T0; vortex.material.uniforms.time.value = t;
    rings.forEach((r, i) => { r.rotation.set(Math.sin(t * (0.7 + i * 0.3)) * (0.5 + i * 0.25), Math.cos(t * (0.5 + i * 0.2)) * (0.4 + i * 0.2), t * (1 + i * 0.6) * (i % 2 ? -1 : 1)); });
    segs.rotation.z = -t * 0.8;
    for (let i = 0; i < N; i++) { const a = PA[i][0] + t * PA[i][3] * 1.6; pp[i * 3] = Math.cos(a) * PA[i][1]; pp[i * 3 + 1] = Math.sin(a) * PA[i][1]; pp[i * 3 + 2] = PA[i][2] + ((t * 10 * PA[i][3]) % 30) - 15; }
    pg.attributes.position.needsUpdate = true;
    const k = seg(t, T0, T1); const z = lerp(15, 0.5, E.inExpo(k) * 0.7 + k * 0.3);
    camera.position.set(Math.sin(lt * 1.2) * 1.2 * (1 - k), Math.cos(lt) * 0.6 * (1 - k), z); camera.lookAt(0, 0, -10); camera.rotation.z = lt * 0.6;
    line.update(t); line.grp.visible = t < T1 - 0.25;
  }
  const post = (t) => ({ bloom: [0.6, 0.6, 0.6], chroma: 0.005 + seg(t, T1 - 0.6, T1) * 0.03, glitch: beatPulse(t, T0, T1) * 0.3 });
  return { scene, camera, update, post, hud };
}

// ───────────── 3. "לדמיין" bursts into thousands of particles that fill the frame ─────────────
function makeImagine() {
  const T0 = B(51), BURST = B(53), T1 = B(56);
  const rnd = mkRnd(51);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x030208);
  const camera = persp(45);
  const tc = textCanvas("לדמיין", { font: "900 420px Heebo", pad: 20 }).canvas; const S = 0.0105;
  const N = 34000; const tg = samplePoints(tc, N, rnd, 2);
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3); const P = [];
  const pal = [new THREE.Color(2.2, 2.2, 2.4), new THREE.Color(0.4, 1.9, 2.3), new THREE.Color(2.3, 0.5, 1.9), new THREE.Color(2.4, 1.8, 0.4), new THREE.Color(1.3, 0.8, 2.6)];
  for (let i = 0; i < N; i++) {
    const a = rnd() * Math.PI * 2, u = rnd() * 2 - 1;
    P.push({ tx: tg[i][0] * S, ty: tg[i][1] * S, sx: (rnd() - 0.5) * 40, sy: (rnd() - 0.5) * 24, sz: -10 - rnd() * 30,
      v: [Math.cos(a) * Math.sqrt(1 - u * u) * (4 + rnd() * 18), Math.sin(a) * Math.sqrt(1 - u * u) * (3 + rnd() * 12), u * 10 + 4], c: pal[i % 5], d: rnd() * 0.25, ph: rnd() * 6.28 });
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({ size: 0.055, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(geo, mat));
  const hud = new THREE.Scene(); const line = slamLine("יכולים", 120, 330, [T0]); hud.add(line.grp);
  const white = new THREE.Color(1.6, 1.6, 1.7), tmp = new THREE.Color();
  function update(t) {
    const form = seg(t, T0 - 0.15, T0 + 0.45);
    for (let i = 0; i < N; i++) {
      const p = P[i]; const kf = E.outQuint(seg(form, p.d * 0.6, p.d * 0.6 + 0.75));
      let x = lerp(p.sx, p.tx, kf), y = lerp(p.sy, p.ty, kf), z = lerp(p.sz, 0, kf);
      const bt = Math.max(0, t - BURST - p.d * 0.3);
      if (bt > 0) { const dr = (1 - Math.exp(-bt * 2.2)) / 2.2; x += p.v[0] * dr + Math.sin(bt * 3 + p.ph) * bt * 1.5; y += p.v[1] * dr + Math.cos(bt * 2.5 + p.ph) * bt; z += p.v[2] * dr; }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      tmp.copy(white).lerp(p.c, clamp(bt * 3)); const tw = 0.75 + 0.25 * Math.sin(t * 9 + p.ph); col[i * 3] = tmp.r * tw; col[i * 3 + 1] = tmp.g * tw; col[i * 3 + 2] = tmp.b * tw;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    const bk = seg(t, BURST, T1);
    camera.position.set(Math.sin(t * 0.8) * 0.4, -0.3 + Math.cos(t * 0.7) * 0.2, lerp(12, 10.5, seg(t, T0, BURST)) - E.outCubic(bk) * 6); camera.lookAt(0, -0.3, 0); camera.rotation.z = E.outCubic(bk) * 0.25;
    line.update(t); line.grp.position.y = (1 - E.inCubic(seg(t, BURST - 0.1, BURST + 0.3))) * 0 + E.inCubic(seg(t, BURST - 0.1, BURST + 0.3)) * 600;
  }
  const post = (t) => { const h = t > BURST ? Math.exp(-(t - BURST) * 6) : 0; return { bloom: [0.7 + h, 0.6, 0.35], chroma: 0.004 + h * 0.03, flash: t > BURST ? 0.4 * Math.exp(-(t - BURST) * 14) : 0, glitch: h * 0.4 }; };
  return { scene, camera, update, post, hud };
}

export const SHOTS_CRESC = [
  [B(43), makeCity, "flash", 0.2],
  [B(47), makePortal, "zoom", 0.3],
  [B(51), makeImagine, "zoom", 0.32],
];
