// 22.95–28.99s, v2 crescendo — every line two seconds, every line bigger, all in the pale studio
// "אתם יכולים ליצור" → a white ceramic architectural model city rises · "כל מה שאתם" → through a chrome gyroscope portal
// "יכולים לדמיין." → the ink word bursts into thousands of particles
import { THREE, seg, lerp, E, mkRnd, clamp, B, beatPulse, textCanvas, hudText, samplePoints } from "./core.js";
import { makeStudio, studioPost, mats, ACCENT, INK } from "./studio.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const persp = (fov = 40) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 400);
function slamLine(text, px, y, beats, color = "#121214") {
  const grp = new THREE.Group(); const words = text.split(" ");
  const meshes = words.map((w) => { const m = hudText(w, { font: `800 ${px}px Heebo`, color, pad: 24 }); m.material.toneMapped = true; return m; });
  const gap = px * 0.26; const total = meshes.reduce((a, m) => a + m.userData.w - 48, 0) + gap * (words.length - 1);
  let x = total / 2; meshes.forEach((m) => { const w = m.userData.w - 48; m.position.set(x - w / 2, y, 0); x -= w + gap; grp.add(m); });
  return { grp, update(t) { meshes.forEach((m, i) => { const st = beats[Math.min(i, beats.length - 1)]; const k = seg(t, st, st + 0.26); m.visible = t >= st; m.scale.setScalar(lerp(1.25, 1, E.outExpo(k))); m.material.opacity = clamp(k * 2.5); m.position.y = y + (1 - E.outExpo(k)) * 30; }); } };
}

// ───────── 1. an architectural model city grows out of the floor ─────────
function makeCity() {
  const T0 = B(43), T1 = B(47);
  const rnd = mkRnd(31);
  const { scene } = makeStudio({ floorY: 0, reach: 22, keyPos: [-10, 26, 8], fog: [30, 75] });
  const camera = persp(40);
  const G = 22, N = G * G; const city = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.04).translate(0, 0.5, 0), mats.lacquer({ roughness: 0.25 }), N);
  city.castShadow = true; city.receiveShadow = true; scene.add(city);
  const tower = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1, 1.4, 2, 0.05).translate(0, 0.5, 0), mats.accent()); tower.castShadow = true; scene.add(tower);
  const C = []; for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
    const x = (i - G / 2) * 1.9, z = -j * 1.9 + 4; if (Math.abs(x) < 1.5) { C.push(null); continue; }
    const d = Math.hypot(x, z + 16); const h = (0.6 + rnd() * 2.2) * (1 + 2.6 * Math.exp(-d / 12)) * (rnd() < 0.07 ? 1.8 : 1);
    C.push({ x, z, h, w: 1.0 + rnd() * 0.6, d: 1.0 + rnd() * 0.6, dl: Math.abs(z) * 0.014 + rnd() * 0.1 });
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const hud = new THREE.Scene(); const line = slamLine("אתם יכולים ליצור", 128, 360, [T0, B(44), B(45)]); hud.add(line.grp);
  function update(t) {
    const lt = t - T0;
    C.forEach((c, i) => { if (!c) { m4.makeScale(0, 0, 0); city.setMatrixAt(i, m4); return; } const k = seg(lt, c.dl, c.dl + 0.5); const hk = k <= 0 ? 0.0001 : E.outBack(k); p.set(c.x, 0, c.z); s.set(c.w, c.h * hk, c.d); m4.compose(p, q, s); city.setMatrixAt(i, m4); });
    city.instanceMatrix.needsUpdate = true;
    const tk = seg(lt, 0.45, 1.0); tower.scale.set(1, 0.0001 + 9 * E.outBack(tk), 1); tower.position.set(2.85, 0, -14);
    const k = seg(t, T0 - 0.2, T1 + 0.2);
    camera.position.set(Math.sin(k * 2) * 1.5 + 4, lerp(5, 17, E.inOutCubic(k)), lerp(16, 8, k)); camera.lookAt(0, lerp(4.2, 2.6, k), lerp(-13, -16, k));
    line.update(t);
  }
  const post = (t) => studioPost({ glitch: beatPulse(t, T0, T1) * 0.08 });
  return { scene, camera, update, post, hud };
}

// ───────── 2. through a chrome gyroscope that stands on the studio floor ─────────
function makePortal() {
  const T0 = B(47), T1 = B(51);
  const { scene } = makeStudio({ floorY: -4.2, reach: 9, keyPos: [-5, 16, 6], dark: true });
  const camera = persp(45);
  const rings = [3.6, 3.15, 2.7, 2.25].map((R, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, 0.16 - i * 0.02, 32, 240), i === 2 ? mats.accent() : mats.chrome()); m.castShadow = true; scene.add(m); return m; });
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 48), mats.ceramic()); core.castShadow = true; scene.add(core);
  const hud = new THREE.Scene(); const line = slamLine("כל מה שאתם", 176, 350, [T0, B(48), B(49)], "#f2f2f0"); hud.add(line.grp);
  function update(t) {
    const lt = t - T0;
    rings.forEach((r, i) => r.rotation.set(Math.sin(t * (0.8 + i * 0.25) + i) * (0.6 + i * 0.2), t * (0.7 + i * 0.45) * (i % 2 ? 1 : -1), i * 0.5));
    // the gyroscope opens up (rings line up face-on) right before the camera passes through
    const open = E.inOutCubic(seg(t, T1 - 0.9, T1 - 0.3)); rings.forEach((r) => { r.rotation.x *= 1 - open; r.rotation.y *= 1 - open; });
    core.scale.setScalar(1 - open); core.visible = open < 0.99;
    const k = seg(t, T0, T1); const z = lerp(16, -2, E.inExpo(k) * 0.7 + k * 0.3);
    camera.position.set(Math.sin(lt * 1.1) * 1.4 * (1 - k), 0.4 * (1 - k), z); camera.lookAt(0, 0, z - 10); camera.rotation.z = lt * 0.25;
    line.update(t); line.grp.visible = t < T1 - 0.3;
  }
  const post = (t) => studioPost({ chroma: 0.0012 + seg(t, T1 - 0.5, T1) * 0.012, glitch: beatPulse(t, T0, T1) * 0.08 });
  return { scene, camera, update, post, hud };
}

// ───────── 3. "לדמיין" in ink bursts into particles that fill the frame ─────────
function makeImagine() {
  const T0 = B(51), BURST = B(53), T1 = B(56);
  const rnd = mkRnd(51);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe7e6e2);
  const camera = persp(45);
  const tc = textCanvas("לדמיין", { font: "800 420px Heebo", pad: 20 }).canvas; const S = 0.0105;
  const N = 30000; const tg = samplePoints(tc, N, rnd, 2);
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), aa = new Float32Array(N);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3)); geo.setAttribute("aA", new THREE.BufferAttribute(aa, 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { uPx: { value: 1080 / (2 * Math.tan((45 * Math.PI) / 360)) } },
    vertexShader: "attribute float aA; uniform float uPx; varying vec3 vC; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = max(1.5, uPx * 0.045 / -mv.z); vC = color; vA = aA; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.2, d) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vC, a); }" });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  const ink = new THREE.Color(0x121214), acc = new THREE.Color(0xe8743b), grey = new THREE.Color(0x8b8b92);
  const P = []; for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, u = rnd() * 2 - 1;
    P.push({ tx: tg[i][0] * S, ty: tg[i][1] * S, sx: (rnd() - 0.5) * 40, sy: (rnd() - 0.5) * 24, sz: -10 - rnd() * 30, v: [Math.cos(a) * Math.sqrt(1 - u * u) * (4 + rnd() * 18), Math.sin(a) * Math.sqrt(1 - u * u) * (3 + rnd() * 12), u * 10 + 4], c: rnd() < 0.12 ? acc : rnd() < 0.3 ? grey : ink, d: rnd() * 0.25, ph: rnd() * 6.28 }); }
  const hud = new THREE.Scene(); const line = slamLine("יכולים", 120, 340, [T0]); hud.add(line.grp);
  function update(t) {
    const form = seg(t, T0 - 0.15, T0 + 0.45);
    for (let i = 0; i < N; i++) { const p = P[i]; const kf = E.outQuint(seg(form, p.d * 0.6, p.d * 0.6 + 0.75));
      let x = lerp(p.sx, p.tx, kf), y = lerp(p.sy, p.ty, kf), z = lerp(p.sz, 0, kf); const bt = Math.max(0, t - BURST - p.d * 0.3);
      if (bt > 0) { const dr = (1 - Math.exp(-bt * 2.2)) / 2.2; x += p.v[0] * dr + Math.sin(bt * 3 + p.ph) * bt * 1.5; y += p.v[1] * dr + Math.cos(bt * 2.5 + p.ph) * bt; z += p.v[2] * dr; }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const c = bt > 0 ? p.c : ink; col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; aa[i] = 0.35 + 0.65 * kf; }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.attributes.aA.needsUpdate = true;
    const bk = seg(t, BURST, T1);
    camera.position.set(Math.sin(t * 0.8) * 0.4, -0.3, lerp(12, 10.5, seg(t, T0, BURST)) - E.outCubic(bk) * 6); camera.lookAt(0, -0.3, 0); camera.rotation.z = E.outCubic(bk) * 0.2;
    line.update(t); line.grp.position.y = E.inCubic(seg(t, BURST - 0.1, BURST + 0.3)) * 600;
  }
  const post = (t) => studioPost({ glitch: (t > BURST ? Math.exp(-(t - BURST) * 8) : 0) * 0.3 });
  return { scene, camera, update, post, hud };
}

export const SHOTS_CRESC = [
  [B(43), makeCity, "whip", 0.26],
  [B(47), makePortal, "zoom", 0.3],
  [B(51), makeImagine, "zoom", 0.32],
];
