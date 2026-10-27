// 5.77–14.13s: "מה זה היה" montage — a new world every ~2 beats
import { THREE, seg, lerp, E, mkRnd, clamp, envTex, chromeWord, dotTex, B, beatPulse, textCanvas, canvasTex, canvasPlane, rr, samplePoints } from "./core.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const persp = (fov = 40) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 800);
const additive = (o = {}) => ({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...o });

// ───────────────────────── 1. particles explode and assemble into the Claude spark ─────────────────────────
function makeLogo() {
  const T0 = B(6), LOCK = B(8);
  const rnd = mkRnd(21);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070302);
  const camera = persp(38);
  // the spark: uneven rounded rays around a core, the way the Claude mark is drawn
  const c = document.createElement("canvas"); c.width = c.height = 700; const g = c.getContext("2d");
  g.translate(350, 350); g.strokeStyle = g.fillStyle = "#d97757"; g.lineCap = "round";
  const RAYS = 11; for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 2 + (rnd() - 0.5) * 0.18; const L = 230 + rnd() * 100; g.lineWidth = 46 + rnd() * 18;
    g.beginPath(); g.moveTo(Math.cos(a) * 40, Math.sin(a) * 40); g.lineTo(Math.cos(a) * L, Math.sin(a) * L); g.stroke();
  }
  g.beginPath(); g.arc(0, 0, 82, 0, Math.PI * 2); g.fill();
  const S = 0.0105; // canvas px → world
  const logo = canvasPlane(c, 700 * S, { blending: THREE.AdditiveBlending, opacity: 0 }); scene.add(logo);
  const N = 16000; const tgt = samplePoints(c, N, rnd, 2);
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3); const P = [];
  for (let i = 0; i < N; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 5 + rnd() * 16;
    P.push({ dir: [Math.sqrt(1 - u * u) * Math.cos(a) * r, Math.sqrt(1 - u * u) * Math.sin(a) * r * 0.62, u * r * 0.7], tx: tgt[i][0] * S, ty: tgt[i][1] * S, d: rnd() * 0.16, sw: (rnd() - 0.5) * 5 });
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.1, map: dotTex, vertexColors: true, ...additive() })); scene.add(pts);
  // shockwave ring on lock
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 128), new THREE.MeshBasicMaterial({ color: 0xffb08a, ...additive({ side: THREE.DoubleSide }) })); scene.add(ring);
  const glow = canvasPlane((() => { const k = document.createElement("canvas"); k.width = k.height = 256; const q = k.getContext("2d"); const gr = q.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,120,70,.22)"); gr.addColorStop(1, "rgba(255,90,40,0)"); q.fillStyle = gr; q.fillRect(0, 0, 256, 256); return k; })(), 22, { blending: THREE.AdditiveBlending });
  glow.position.z = -3; scene.add(glow);
  const hot = new THREE.Color(2.2, 1.9, 1.6), org = new THREE.Color(0xd97757).multiplyScalar(0.75), tmp = new THREE.Color();
  function update(t) {
    const lt = t - T0;
    for (let i = 0; i < N; i++) {
      const p = P[i]; const ex = E.outExpo(clamp(lt / 0.42)); const k = E.inOutCubic(seg(lt, 0.3 + p.d, 0.86 + p.d));
      const ang = (1 - k) * p.sw * 0.6;
      const ex0 = p.dir[0] * ex, ey0 = p.dir[1] * ex, ez0 = p.dir[2] * ex;
      const x = lerp(ex0, p.tx, k), y = lerp(ey0, p.ty, k);
      pos[i * 3] = x * Math.cos(ang) - y * Math.sin(ang); pos[i * 3 + 1] = x * Math.sin(ang) + y * Math.cos(ang); pos[i * 3 + 2] = lerp(ez0, 0, k) + Math.sin(t * 3 + i) * 0.02;
      tmp.copy(hot).lerp(org, clamp(lt * 1.6)); if (t > LOCK) tmp.multiplyScalar(1 + 0.8 * Math.exp(-(t - LOCK) * 5)); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    const lk = t - LOCK;
    logo.material.opacity = lk > 0 ? 0.22 + 0.4 * Math.exp(-lk * 6) : 0; logo.scale.setScalar(lk > 0 ? 1 + 0.06 * Math.exp(-lk * 9) : 1);
    ring.visible = lk > 0; const rk = E.outCubic(seg(lk, 0, 0.55)); ring.scale.setScalar(0.5 + rk * 9); ring.material.opacity = (1 - rk) * 1.2;
    glow.material.opacity = 0.2 + (lk > 0 ? 0.5 * Math.exp(-lk * 4) : 0);
    pts.rotation.y = Math.sin(lt * 0.8) * 0.25 * (1 - seg(lt, 0.4, 0.9));
    camera.position.set(Math.sin(lt * 0.7) * 1.2, Math.cos(lt * 0.6) * 0.4, lerp(15, 10.6, E.outCubic(seg(lt, 0, 1.4))) + (lk > 0 ? Math.exp(-lk * 8) * -0.6 : 0));
    camera.lookAt(0, 0, 0); camera.rotation.z = lerp(0.25, 0, E.outCubic(seg(lt, 0, 1.1)));
  }
  const post = (t) => { const lk = t - LOCK; const h = lk > 0 ? Math.exp(-lk * 6) : 0; return { bloom: [0.55 + 0.8 * h, 0.5, 0.5], chroma: 0.004 + 0.02 * h, flash: lk > 0 ? 0.35 * Math.exp(-lk * 14) : 0, glitch: beatPulse(t, T0, B(9)) * 0.4 }; };
  return { scene, camera, update, post };
}

// ───────────────────────── 2. camera flight between floating editor panels ─────────────────────────
function uiCard(kind, rnd) {
  const c = document.createElement("canvas"); c.width = 900; c.height = 560; const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 0, 560); grd.addColorStop(0, "rgba(28,30,52,.94)"); grd.addColorStop(1, "rgba(12,13,26,.94)");
  rr(g, 6, 6, 888, 548, 34); g.fillStyle = grd; g.fill(); g.lineWidth = 3; g.strokeStyle = "rgba(160,180,255,.45)"; g.stroke();
  // window chrome
  ["#ff5f57", "#febc2e", "#28c840"].forEach((cc, i) => { g.fillStyle = cc; g.beginPath(); g.arc(46 + i * 30, 44, 9, 0, 7); g.fill(); });
  g.fillStyle = "rgba(255,255,255,.55)"; g.font = "700 26px Heebo"; g.textAlign = "right"; g.direction = "rtl";
  const title = { timeline: "ציר זמן", graph: "עקומות תנועה", color: "צבע", layers: "שכבות", prompt: "פרומפט", render: "רינדור", audio: "אודיו" }[kind];
  g.fillText(title, 850, 54);
  g.direction = "ltr"; g.textAlign = "left";
  if (kind === "timeline") {
    const cols = ["#ff4fd8", "#7af7ff", "#ffd60a", "#8a5cff", "#2bff5e"];
    for (let r = 0; r < 5; r++) { let x = 40 + rnd() * 60; while (x < 820) { const w = 80 + rnd() * 200; rr(g, x, 110 + r * 78, Math.min(w, 860 - x), 56, 12); g.fillStyle = cols[(r + Math.floor(x)) % 5]; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; x += w + 14 + rnd() * 30; } }
    g.fillStyle = "#fff"; g.fillRect(520, 90, 4, 440); g.beginPath(); g.moveTo(506, 90); g.lineTo(538, 90); g.lineTo(522, 108); g.fill();
    g.font = "700 24px Heebo"; g.fillText("00:00:07:12", 40, 54 + 30);
  } else if (kind === "graph") {
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; for (let x = 60; x < 860; x += 60) { g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 520); g.stroke(); } for (let y = 100; y < 520; y += 60) { g.beginPath(); g.moveTo(40, y); g.lineTo(860, y); g.stroke(); }
    g.lineWidth = 6; g.strokeStyle = "#7af7ff"; g.shadowColor = "#7af7ff"; g.shadowBlur = 18; g.beginPath(); g.moveTo(60, 480); g.bezierCurveTo(330, 480, 380, 130, 840, 130); g.stroke(); g.shadowBlur = 0;
    g.strokeStyle = "#ff4fd8"; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 480); g.lineTo(330, 480); g.moveTo(840, 130); g.lineTo(380, 130); g.stroke();
    [[60, 480], [840, 130]].forEach(([x, y]) => { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = "#ffd60a"; g.fillRect(-13, -13, 26, 26); g.restore(); });
    [[330, 480], [380, 130]].forEach(([x, y]) => { g.fillStyle = "#ff4fd8"; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); });
  } else if (kind === "color") {
    for (let a = 0; a < 360; a += 1) { g.strokeStyle = `hsl(${a},100%,60%)`; g.lineWidth = 6; g.beginPath(); g.arc(250, 310, 170, (a * Math.PI) / 180, ((a + 2) * Math.PI) / 180); g.lineTo(250, 310); g.stroke(); }
    const rg = g.createRadialGradient(250, 310, 0, 250, 310, 170); rg.addColorStop(0, "rgba(255,255,255,1)"); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.beginPath(); g.arc(250, 310, 170, 0, 7); g.fill();
    g.strokeStyle = "#fff"; g.lineWidth = 5; g.beginPath(); g.arc(330, 250, 18, 0, 7); g.stroke();
    ["#ff4fd8", "#7af7ff", "#ffd60a"].forEach((cc, i) => { rr(g, 500, 180 + i * 90, 330, 22, 11); g.fillStyle = "rgba(255,255,255,.12)"; g.fill(); rr(g, 500, 180 + i * 90, 120 + i * 80, 22, 11); g.fillStyle = cc; g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(620 + i * 80, 191 + i * 90, 18, 0, 7); g.fill(); });
  } else if (kind === "layers") {
    g.direction = "rtl"; g.textAlign = "right";
    [["טקסט כרום", "#ff4fd8"], ["חלקיקים", "#7af7ff"], ["תאורה", "#ffd60a"], ["מצלמה", "#8a5cff"], ["גליץ'", "#2bff5e"]].forEach(([n, cc], i) => {
      const y = 100 + i * 86; rr(g, 40, y, 820, 70, 14); g.fillStyle = i === 0 ? "rgba(122,247,255,.16)" : "rgba(255,255,255,.05)"; g.fill();
      g.fillStyle = cc; rr(g, 800, y + 17, 36, 36, 8); g.fill(); g.fillStyle = "#fff"; g.font = "700 32px Heebo"; g.fillText(n, 770, y + 47);
      g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 3; g.beginPath(); g.ellipse(80, y + 35, 18, 10, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(80, y + 35, 5, 0, 7); g.fill();
    });
  } else if (kind === "prompt") {
    g.direction = "rtl"; g.textAlign = "right";
    rr(g, 40, 120, 820, 280, 26); g.fillStyle = "rgba(255,255,255,.06)"; g.fill(); g.lineWidth = 4; g.strokeStyle = "#7af7ff"; g.shadowColor = "#7af7ff"; g.shadowBlur = 24; g.stroke(); g.shadowBlur = 0;
    g.fillStyle = "#fff"; g.font = "800 46px Heebo"; g.fillText("תעשה לי סרטון מושן", 820, 210); g.fillText("ברמה של אפטר אפקטס", 820, 280);
    g.fillStyle = "#7af7ff"; g.fillRect(372, 300, 6, 0); rr(g, 60, 430, 220, 80, 40); const bg = g.createLinearGradient(60, 0, 280, 0); bg.addColorStop(0, "#ff4fd8"); bg.addColorStop(1, "#8a5cff"); g.fillStyle = bg; g.fill();
    g.fillStyle = "#fff"; g.font = "800 36px Heebo"; g.textAlign = "center"; g.fillText("צור ✦", 170, 482);
  } else if (kind === "render") {
    g.fillStyle = "#fff"; g.font = "800 64px Heebo"; g.fillText("Rendering…", 60, 220);
    rr(g, 60, 280, 780, 40, 20); g.fillStyle = "rgba(255,255,255,.1)"; g.fill(); rr(g, 60, 280, 780, 40, 20); const pg = g.createLinearGradient(60, 0, 840, 0); pg.addColorStop(0, "#2bff5e"); pg.addColorStop(1, "#7af7ff"); g.fillStyle = pg; g.fill();
    g.font = "800 44px Heebo"; g.fillStyle = "#2bff5e"; g.fillText("100%   60fps   4K", 60, 420);
  } else if (kind === "audio") {
    g.fillStyle = "#ff4fd8"; for (let x = 50; x < 850; x += 12) { const h = (Math.abs(Math.sin(x * 0.05) * Math.sin(x * 0.013)) * 0.8 + rnd() * 0.2) * 300; rr(g, x, 310 - h / 2, 7, h, 3); g.fill(); }
    g.fillStyle = "#fff"; g.fillRect(560, 120, 4, 380);
  }
  return c;
}
function makeCards() {
  const T0 = B(9), T1 = B(12);
  const rnd = mkRnd(5);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05040f); scene.fog = new THREE.Fog(0x05040f, 30, 90);
  const camera = persp(46);
  const kinds = ["timeline", "graph", "layers", "color", "audio", "render", "prompt"];
  const cards = [];
  kinds.forEach((k, i) => {
    const m = canvasPlane(uiCard(k, rnd), 3.2); const side = i % 2 ? 1 : -1;
    m.position.set(side * (3.6 + rnd() * 1.4), (rnd() - 0.5) * 2.6, -i * 9 - 4); m.rotation.y = -side * (0.35 + rnd() * 0.25); m.rotation.z = (rnd() - 0.5) * 0.2;
    if (k === "prompt") { m.position.set(0, 0, -64); m.rotation.set(0, 0, 0); m.scale.setScalar(1.25); }
    scene.add(m); cards.push(m);
  });
  // nebula backdrop + dust
  const nb = document.createElement("canvas"); nb.width = 1024; nb.height = 512; const ng = nb.getContext("2d");
  [["rgba(138,92,255,.55)", 300, 260, 380], ["rgba(255,79,216,.35)", 700, 200, 300], ["rgba(122,247,255,.25)", 560, 380, 260]].forEach(([cc, x, y, r]) => { const gr = ng.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cc); gr.addColorStop(1, "rgba(0,0,0,0)"); ng.fillStyle = gr; ng.fillRect(0, 0, 1024, 512); });
  const neb = canvasPlane(nb, 160, { fog: false }); neb.position.z = -150; scene.add(neb);
  const N = 3000, dp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { dp[i * 3] = (rnd() - 0.5) * 40; dp[i * 3 + 1] = (rnd() - 0.5) * 24; dp[i * 3 + 2] = 10 - rnd() * 90; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xb8c4ff, size: 0.08, map: dotTex, ...additive() })));
  let lastZ = 8;
  function update(t) {
    const k = seg(t, T0 - 0.2, T1 + 0.2); const z = lerp(8, -57, E.inOutSine(k) * 0.35 + k * 0.65);
    camera.position.set(Math.sin(k * 7) * 0.5, Math.cos(k * 5) * 0.3, z); camera.lookAt(Math.sin(k * 7 + 0.6) * 0.6, 0, z - 10); camera.rotation.z += Math.sin(k * 4) * 0.12;
    cards.forEach((m, i) => { m.position.y += Math.sin(t * 2 + i) * 0.002; });
    lastZ = z;
  }
  const post = (t) => ({ bloom: [0.7, 0.5, 0.55], chroma: 0.006, glitch: beatPulse(t, T0, T1) * 0.35 });
  return { scene, camera, update, post };
}

// ───────────────────────── 3. type moving on a grid: "בלי After Effects. בלי מעצב. רק פרומפט." ─────────────────────────
function makeGrid() {
  const T0 = B(12), P = [B(12), B(13.5), B(15)], T1 = B(17);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060608);
  const camera = persp(42);
  const wall = new THREE.Group(); wall.rotation.set(0.12, -0.42, 0.04); wall.position.set(1.5, 0, -6); scene.add(wall);
  const words = ["בלי AFTER EFFECTS", "בלי מעצב", "רק פרומפט", "מושן גרפיקס", "בלי טיימליין", "קלוד"];
  const rows = [];
  for (let r = 0; r < 11; r++) {
    const c = document.createElement("canvas"); c.width = 4096; c.height = 200; const g = c.getContext("2d");
    g.font = "700 190px Karantina"; g.textBaseline = "middle"; g.direction = "rtl"; g.textAlign = "right";
    let x = 4096; let k = r;
    while (x > 0) { const w = words[k % words.length]; const outline = (k + r) % 2 === 0; g.lineWidth = 3; g.strokeStyle = g.fillStyle = "rgba(255,255,255,1)";
      if (outline) g.strokeText(w, x, 104); else g.fillText(w, x, 104); x -= g.measureText(w).width + 90; k++; }
    const tex = canvasTex(c); tex.wrapS = THREE.RepeatWrapping;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false }));
    m.position.y = (r - 5) * 2.1; wall.add(m); rows.push({ m, tex, sp: (r % 2 ? 1 : -1) * (0.05 + (r % 3) * 0.02) });
  }
  // the grid itself
  const lg = []; for (let r = -6; r <= 6; r++) lg.push(-20, (r - 0.5) * 2.1 + 1.05, 0.01, 20, (r - 0.5) * 2.1 + 1.05, 0.01);
  for (let x = -20; x <= 20; x += 2.6) lg.push(x, -13, 0.01, x, 13, 0.01);
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute("position", new THREE.Float32BufferAttribute(lg, 3));
  const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ color: 0x7af7ff, transparent: true, opacity: 0.18 })); wall.add(lines);
  // the three phrases
  const ph = [
    textCanvas("בלי After Effects.", { font: "900 190px Heebo", pad: 30 }),
    textCanvas("בלי מעצב.", { font: "900 230px Heebo", pad: 30 }),
    textCanvas("רק פרומפט.", { font: "900 270px Heebo", pad: 30, gradient: ["#7af7ff", "#b18cff", "#ff4fd8"] }),
  ].map((tc, i) => { const m = canvasPlane(tc.canvas, [1.5, 1.8, 2.1][i]); m.position.z = 2; scene.add(m); return m; });
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.5), new THREE.MeshBasicMaterial({ color: 0xff4fd8, toneMapped: false })); scene.add(cur);
  function update(t) {
    rows.forEach((r, i) => {
      r.tex.offset.x = r.sp * (t - T0) * 6 + i * 0.13;
      const hot = (t >= P[2] && i % 3 === 2) || (t >= P[1] && t < P[2] && i % 3 === 1) || (t < P[1] && i % 3 === 0);
      r.m.material.opacity = (hot ? 0.3 : 0.09) + 0.25 * beatPulse(t, T0, T1, 12) * (hot ? 1 : 0);
    });
    lines.material.opacity = 0.14 + 0.4 * beatPulse(t, T0, T1, 10);
    ph.forEach((m, i) => {
      const st = P[i], en = i < 2 ? P[i + 1] : T1 + 1; const k = seg(t, st, st + 0.26);
      m.visible = t >= st && t < en + 0.12; const out = seg(t, en - 0.02, en + 0.12);
      m.scale.setScalar(lerp(2.4, 1, E.outExpo(k)) * (1 + out * 0.6)); m.material.opacity = Math.min(1, k * 3) * (1 - out);
      m.position.set(i === 1 ? 0.2 : 0, (i - 1) * -0.05, 2 + out * 3); m.rotation.z = lerp(i % 2 ? 0.08 : -0.08, 0, E.outExpo(k));
    });
    const pk = seg(t, P[2], P[2] + 0.26); cur.visible = t >= P[2] + 0.2 && Math.floor((t - P[2]) * 3.2) % 2 === 0;
    cur.position.set(-ph[2].geometry.parameters.width / 2 * ph[2].scale.x - 0.05, 0, 2);
    const kick = [0, 1, 2].reduce((a, i) => a + (t >= P[i] ? Math.exp(-(t - P[i]) * 7) : 0), 0);
    camera.position.set(lerp(-1.5, 1.2, seg(t, T0, T1)), lerp(0.4, -0.3, seg(t, T0, T1)), 9.5 - kick * 0.9);
    camera.lookAt(0, 0, 0); camera.rotation.z = Math.sin(t * 1.3) * 0.03;
    wall.rotation.y = -0.42 + Math.sin(t * 0.8) * 0.06;
  }
  const post = (t) => { const kick = P.reduce((a, p) => a + (t >= p ? Math.exp(-(t - p) * 9) : 0), 0); return { bloom: [0.55, 0.4, 0.75], chroma: 0.004 + 0.02 * kick, glitch: kick * 0.6 + beatPulse(t, T0, T1) * 0.2 }; };
  return { scene, camera, update, post };
}

// ───────────────────────── 4. app icons orbiting a glowing core ─────────────────────────
function iconTile(sym, c1, c2) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  rr(g, 8, 8, 240, 240, 58); const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fill();
  const hl = g.createLinearGradient(0, 0, 0, 140); hl.addColorStop(0, "rgba(255,255,255,.45)"); hl.addColorStop(1, "rgba(255,255,255,0)"); rr(g, 8, 8, 240, 130, 58); g.fillStyle = hl; g.fill();
  g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = g.lineJoin = "round";
  if (sym === "play") { g.beginPath(); g.moveTo(98, 72); g.lineTo(186, 128); g.lineTo(98, 184); g.closePath(); g.fill(); }
  else if (sym === "spark") { g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? 26 : 84; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  else if (sym === "wave") { [40, 90, 60, 110, 70, 40].forEach((h, i) => { rr(g, 58 + i * 25, 128 - h / 2, 14, h, 7); g.fill(); }); }
  else if (sym === "layers") { [0, 1, 2].forEach((i) => { g.globalAlpha = 1 - i * 0.25; g.beginPath(); g.moveTo(128, 70 + i * 30); g.lineTo(200, 104 + i * 30); g.lineTo(128, 138 + i * 30); g.lineTo(56, 104 + i * 30); g.closePath(); g.fill(); }); g.globalAlpha = 1; }
  else if (sym === "cam") { rr(g, 52, 88, 152, 104, 18); g.fill(); g.fillStyle = c2; g.beginPath(); g.arc(128, 140, 34, 0, 7); g.fill(); g.fillStyle = "#fff"; rr(g, 96, 70, 64, 26, 8); g.fill(); g.fillStyle = c2; g.beginPath(); g.arc(128, 140, 18, 0, 7); g.fill(); }
  else if (sym === "T") { g.font = "900 170px Heebo"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("T", 128, 140); }
  else if (sym === "note") { g.lineWidth = 16; g.beginPath(); g.moveTo(108, 176); g.lineTo(108, 70); g.lineTo(184, 56); g.lineTo(184, 160); g.stroke(); g.beginPath(); g.ellipse(88, 180, 26, 20, -0.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(164, 164, 26, 20, -0.4, 0, 7); g.fill(); }
  else if (sym === "pen") { g.lineWidth = 14; g.beginPath(); g.moveTo(70, 186); g.bezierCurveTo(90, 60, 170, 200, 190, 70); g.stroke(); g.beginPath(); g.arc(70, 186, 14, 0, 7); g.arc(190, 70, 14, 0, 7); g.fill(); }
  return c;
}
function makeOrbit() {
  const T0 = B(17), T1 = B(20);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x03030a); scene.environment = envTex;
  const camera = persp(40);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 96, 64), new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }",
    fragmentShader: `uniform float time; varying vec3 vN; varying vec3 vP;
      void main(){ float f = pow(1.0 - abs(dot(vN, normalize(-vP))), 2.2);
        float bands = 0.5 + 0.5 * sin(vN.y * 14.0 + time * 3.0 + sin(vN.x * 6.0 + time) * 2.0);
        vec3 a = vec3(0.25, 0.9, 1.6), b = vec3(1.4, 0.3, 1.3);
        vec3 c = mix(a, b, bands) * (0.35 + 0.65 * bands) * 0.7 + mix(a, b, 0.5) * f * 2.6;
        gl_FragColor = vec4(c, 1.0); }`,
  })); scene.add(core);
  const halo = canvasPlane((() => { const k = document.createElement("canvas"); k.width = k.height = 256; const q = k.getContext("2d"); const gr = q.createRadialGradient(128, 128, 30, 128, 128, 128); gr.addColorStop(0, "rgba(140,160,255,.35)"); gr.addColorStop(1, "rgba(80,40,255,0)"); q.fillStyle = gr; q.fillRect(0, 0, 256, 256); return k; })(), 9, { blending: THREE.AdditiveBlending }); halo.position.z = -0.5; scene.add(halo);
  const rings = [0.3, -0.5, 1.1].map((tilt, i) => { const r = new THREE.Mesh(new THREE.TorusGeometry(3.2 + i * 0.9, 0.012, 8, 200), new THREE.MeshBasicMaterial({ color: [0x7af7ff, 0xff4fd8, 0xb18cff][i], ...additive() })); r.rotation.set(Math.PI / 2 + tilt, tilt * 0.6, 0); scene.add(r); return r; });
  const defs = [["play", "#ff4f7a", "#ff9a3c"], ["T", "#5b6cff", "#8a5cff"], ["note", "#ff4fd8", "#8a5cff"], ["cam", "#2bd8ff", "#2b7bff"], ["spark", "#ffd60a", "#ff7b2b"], ["layers", "#2bff9e", "#1fb6ff"], ["wave", "#ff3d6e", "#b41fff"], ["pen", "#7af7ff", "#3d5cff"]];
  const icons = defs.map(([s, a, b], i) => {
    const grp = new THREE.Group();
    const box = new THREE.Mesh(new RoundedBoxGeometry(1, 1, 0.3, 4, 0.12), new THREE.MeshPhysicalMaterial({ color: 0x15151f, metalness: 0.6, roughness: 0.25, clearcoat: 1 }));
    const face = canvasPlane(iconTile(s, a, b), 0.98); face.position.z = 0.16; face.material.side = THREE.FrontSide;
    grp.add(box, face); scene.add(grp);
    return { grp, ring: i % 3, a0: (i / defs.length) * Math.PI * 2, r: 3.2 + (i % 3) * 0.9, sp: 0.9 + (i % 3) * 0.25 };
  });
  const v = new THREE.Vector3();
  function update(t) {
    const lt = t - T0;
    const k = seg(t, T0, T1);
    camera.position.set(Math.sin(k * 1.4 - 0.7) * 10, lerp(2.2, -0.4, k), Math.cos(k * 1.4 - 0.7) * 10 - k * 2.5); camera.lookAt(0, 0, 0);
    core.material.uniforms.time.value = t; core.rotation.y = t * 0.4;
    icons.forEach((ic, i) => {
      const ring = rings[ic.ring]; const a = ic.a0 + lt * ic.sp; const pop = E.outBack(seg(lt, i * 0.05, i * 0.05 + 0.35));
      v.set(Math.cos(a) * ic.r, Math.sin(a) * ic.r, 0).applyEuler(ring.rotation);
      ic.grp.position.copy(v); ic.grp.scale.setScalar(1.35 * pop); ic.grp.lookAt(camera.position);
    });
    rings.forEach((r, i) => { r.rotation.z = lt * (0.3 + i * 0.1); });
  }
  const post = (t) => ({ bloom: [0.55, 0.5, 0.75], chroma: 0.005, glitch: beatPulse(t, T0, T1) * 0.4 });
  return { scene, camera, update, post };
}

// ───────────────────────── 5. light streaks + whip pan ─────────────────────────
function makeTunnel() {
  const T0 = B(20), T1 = B(22);
  const rnd = mkRnd(9);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020208);
  const camera = persp(70);
  const N = 1400; const pos = new Float32Array(N * 6), col = new Float32Array(N * 6); const S = [];
  const pal = [[0.5, 1.6, 2.0], [2.0, 0.5, 1.7], [1.8, 1.8, 2.0], [1.6, 1.2, 0.3]];
  for (let i = 0; i < N; i++) { const a = rnd() * Math.PI * 2, r = 1.5 + Math.pow(rnd(), 0.6) * 9; S.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -rnd() * 200, len: 3 + rnd() * 14, c: pal[i % 4] }); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, ...additive() })); scene.add(lines);
  function update(t) {
    const lt = t - T0; const travel = lt * 150 + lt * lt * 60;
    S.forEach((s, i) => {
      let z = ((s.z + travel) % 200 + 200) % 200 - 200 + 4; const L = s.len * (1 + lt * 2);
      pos.set([s.x, s.y, z, s.x, s.y, z - L], i * 6);
      const f = clamp((z + 200) / 60); col.set([s.c[0] * f, s.c[1] * f, s.c[2] * f, 0, 0, 0], i * 6);
    });
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
    camera.position.set(0, 0, 0); camera.rotation.set(0, 0, lt * 1.6 + E.inExpo(seg(t, T1 - 0.3, T1)) * 1.5);
    camera.rotation.y = E.inExpo(seg(t, T1 - 0.35, T1)) * 1.2;
  }
  const post = (t) => { const w = E.inExpo(seg(t, T1 - 0.35, T1)); return { bloom: [1.1, 0.4, 0.2], chroma: 0.01 + 0.03 * w, mblur: [w * 0.25, 0], glitch: beatPulse(t, T0, T1) * 0.3 }; };
  return { scene, camera, update, post };
}

// ───────────────────────── 6. chrome "Claude" slams on the beat ─────────────────────────
function makeClaude() {
  const T0 = B(22), T2 = B(23), T1 = B(24);
  const rnd = mkRnd(3);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050302); scene.environment = envTex;
  const camera = persp(36);
  const { group, glyphs } = chromeWord("Claude", { size: 2.1, depth: 0.8, spacing: 1.02 }); group.position.y = -0.3; scene.add(group);
  const kL = new THREE.PointLight(0xff7a3d, 40, 30, 1.4); kL.position.set(-6, 3, 5); scene.add(kL);
  const kR = new THREE.PointLight(0xffc9a6, 20, 30, 1.4); kR.position.set(6, -2, 5); scene.add(kR);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ color: 0x030202, metalness: 0.3, roughness: 0.35, envMapIntensity: 0.05 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.75; // (no floor: the void reads cleaner)
  const N = 700, sp = new Float32Array(N * 3), V = []; for (let i = 0; i < N; i++) { const a = rnd() * Math.PI, s = 3 + rnd() * 9; V.push([Math.cos(a) * s * (rnd() < 0.5 ? -1 : 1), Math.sin(a) * s * 0.8 + 2, (rnd() - 0.5) * 6]); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffb27a, size: 0.07, map: dotTex, ...additive() })); scene.add(sparks);
  function update(t) {
    glyphs.forEach((g, i) => { const st = T0 + i * 0.03; const k = seg(t, st, st + 0.16); g.position.y = lerp(9, 0, E.inCubic(k)) + (k >= 1 ? Math.exp(-(t - st - 0.16) * 14) * Math.sin((t - st) * 50) * 0.08 : 0); g.rotation.x = lerp(-0.6, 0, k); g.visible = t >= st;
      g.rotation.y = t >= T2 ? E.outBack(seg(t, T2 + i * 0.02, T2 + i * 0.02 + 0.3)) * Math.PI * 2 : 0; });
    const st = t - T0 - 0.2; sparks.visible = st > 0;
    for (let i = 0; i < N; i++) { sp[i * 3] = V[i][0] * st; sp[i * 3 + 1] = -1.6 + V[i][1] * st - 9 * st * st; sp[i * 3 + 2] = V[i][2] * st; }
    sg.attributes.position.needsUpdate = true; sparks.material.opacity = clamp(1 - st * 1.4);
    const hit = (t > T0 + 0.2 ? Math.exp(-(t - T0 - 0.2) * 9) : 0) + (t > T2 ? Math.exp(-(t - T2) * 9) : 0);
    camera.position.set(Math.sin(t * 90) * hit * 0.2, 0.6 + Math.cos(t * 77) * hit * 0.2, lerp(13, 11.5, seg(t, T0, T1))); camera.lookAt(0, 0, 0);
    kL.position.x = lerp(-8, 8, seg(t, T0, T1));
  }
  const post = (t) => { const hit = (t > T0 + 0.2 ? Math.exp(-(t - T0 - 0.2) * 9) : 0) + (t > T2 ? Math.exp(-(t - T2) * 9) : 0); return { bloom: [0.35 + hit * 0.6, 0.45, 0.8], chroma: 0.004 + hit * 0.02, glitch: hit * 0.5, exposure: 0.85 }; };
  return { scene, camera, update, post };
}

export const SHOTS_MONTAGE = [
  [B(6), makeLogo, "liquid", 0.5],
  [B(9), makeCards, "zoom", 0.3],
  [B(12), makeGrid, "whip", 0.32],
  [B(17), makeOrbit, "glitch", 0.22],
  [B(20), makeTunnel, "zoom", 0.28],
  [B(22), makeClaude, "flash", 0.14],
];
