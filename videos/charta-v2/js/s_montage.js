// 5.77–14.13s, v2: the "מה זה היה" montage rebuilt in the pale studio — real materials, soft shadows, one accent
import { THREE, seg, lerp, E, mkRnd, clamp, chromeWord, B, beatPulse, textCanvas, canvasTex, canvasPlane, rr, samplePoints, dotTex } from "./core.js";
import { makeStudio, studioPost, mats, shadowed, ACCENT, INK } from "./studio.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const persp = (fov = 32) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 200);

// ink particles that read on a light background (normal blending, soft round dots, size by depth)
function inkPoints(N, color = INK) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("aA", new THREE.BufferAttribute(new Float32Array(N), 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uCol: { value: color.clone() }, uSize: { value: 0.03 }, uPx: { value: 1080 / (2 * Math.tan((32 * Math.PI) / 360)) } },
    vertexShader: `attribute float aA; uniform float uSize, uPx; varying float vA;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = max(1.5, uPx * uSize / -mv.z); vA = aA; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.2, d) * vA; if (a < 0.01) discard; gl_FragColor = vec4(uCol, a); }`,
  });
  const p = new THREE.Points(geo, mat); p.frustumCulled = false; return p;
}

// the Claude spark as real geometry: rounded rays + a core disc, extruded and bevelled
function sparkShapes(rnd) {
  const shapes = []; const RAYS = 11;
  for (let i = 0; i < RAYS; i++) {
    const a = (i / RAYS) * Math.PI * 2 + (rnd() - 0.5) * 0.18, L = 2.3 + rnd() * 1.0, w = 0.24 + rnd() * 0.08;
    const s = new THREE.Shape(); const r0 = 0.25;
    // capsule from r0 to L along angle a
    const ca = Math.cos(a), sa = Math.sin(a), nx = -sa * w, ny = ca * w;
    s.moveTo(ca * r0 + nx, sa * r0 + ny); s.lineTo(ca * L + nx, sa * L + ny);
    s.absarc(ca * L, sa * L, w, a + Math.PI / 2, a - Math.PI / 2, true);
    s.lineTo(ca * r0 - nx, sa * r0 - ny); s.absarc(ca * r0, sa * r0, w, a - Math.PI / 2, a + Math.PI / 2, true);
    shapes.push(s);
  }
  const core = new THREE.Shape(); core.absarc(0, 0, 0.85, 0, Math.PI * 2, false); shapes.push(core);
  return shapes;
}

// ───────── 1. ink particles burst, then assemble into the spark, which turns solid terracotta lacquer ─────────
function makeParticles() {
  const T0 = B(6), LOCK = B(8), T1 = B(9);
  const rnd = mkRnd(21);
  const { scene, key } = makeStudio({ floorY: -2.1, reach: 5 });
  const camera = persp(32);
  const shapes = sparkShapes(mkRnd(4));
  const spark = new THREE.Group(); spark.position.set(0, 0.35, 0); scene.add(spark);
  const sMat = mats.accent({ transparent: true, opacity: 0 });
  shapes.forEach((sh) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.07, bevelSegments: 6, curveSegments: 24 }), sMat); m.position.z = -0.16; m.castShadow = true; spark.add(m); });
  spark.scale.setScalar(0.62);
  // particle targets: sample the spark silhouette from a canvas drawing of the same shapes
  const c = document.createElement("canvas"); c.width = c.height = 800; const g = c.getContext("2d"); g.translate(400, 400); g.scale(110, -110); g.fillStyle = "#000";
  shapes.forEach((sh) => { const pts = sh.getPoints(24); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.closePath(); g.fill(); });
  const N = 14000; const tg = samplePoints(c, N, rnd, 2); const S = 0.62 / 110;
  const pts = inkPoints(N); scene.add(pts); pts.position.copy(spark.position);
  const pos = pts.geometry.attributes.position.array, al = pts.geometry.attributes.aA.array; const P = [];
  for (let i = 0; i < N; i++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 3 + rnd() * 9; P.push({ d: [Math.sqrt(1 - u * u) * Math.cos(a) * r, Math.sqrt(1 - u * u) * Math.sin(a) * r * 0.6, u * r * 0.6], tx: tg[i][0] * S, ty: tg[i][1] * S, dl: rnd() * 0.16, sw: (rnd() - 0.5) * 4 }); }
  function update(t) {
    const lt = t - T0;
    for (let i = 0; i < N; i++) {
      const p = P[i]; const ex = E.outExpo(clamp(lt / 0.42)); const k = E.inOutCubic(seg(lt, 0.3 + p.dl, 0.88 + p.dl)); const ang = (1 - k) * p.sw * 0.5;
      const x = lerp(p.d[0] * ex, p.tx, k), y = lerp(p.d[1] * ex, p.ty, k);
      pos[i * 3] = x * Math.cos(ang) - y * Math.sin(ang); pos[i * 3 + 1] = x * Math.sin(ang) + y * Math.cos(ang); pos[i * 3 + 2] = lerp(p.d[2] * ex, 0.18, k);
      al[i] = (0.55 + 0.45 * k) * (1 - seg(t, LOCK + 0.05, LOCK + 0.35));
    }
    pts.geometry.attributes.position.needsUpdate = true; pts.geometry.attributes.aA.needsUpdate = true;
    const lk = seg(t, LOCK - 0.08, LOCK + 0.25); sMat.opacity = lk; sMat.transparent = lk < 1; spark.visible = lk > 0;
    spark.rotation.set(Math.sin(t * 0.8) * 0.15 * lk, lerp(-0.3, 0.25, seg(t, LOCK, T1 + 0.3)), lerp(0.4, 0, E.outCubic(lk)));
    spark.scale.setScalar(0.62 * (1 + 0.05 * (t > LOCK ? Math.exp(-(t - LOCK) * 8) : 0)));
    camera.position.set(Math.sin(lt * 0.5) * 1.2, 0.9 - lt * 0.1, lerp(17, 13, E.outCubic(seg(lt, 0, 1.4)))); camera.lookAt(0, 0.1, 0);
  }
  const post = (t) => studioPost({ glitch: beatPulse(t, T0, T1) * 0.12 });
  return { scene, camera, update, post };
}

// ───────── 2. a glide between frosted-glass editor panels standing in the studio ─────────
function panelUI(kind, rnd) {
  const c = document.createElement("canvas"); c.width = 900; c.height = 560; const g = c.getContext("2d");
  const ink = "#16161a", soft = "rgba(22,22,26,.35)", acc = "#e8743b";
  g.fillStyle = "rgba(255,255,255,0)"; g.fillRect(0, 0, 900, 560);
  g.font = "500 22px JBM"; g.fillStyle = soft; g.letterSpacing = "3px"; g.fillText({ timeline: "TIMELINE", graph: "MOTION CURVES", layers: "LAYERS", render: "RENDER", prompt: "PROMPT", color: "GRADE" }[kind], 48, 64); g.letterSpacing = "0px";
  g.fillStyle = "rgba(22,22,26,.12)"; g.fillRect(48, 84, 804, 2);
  if (kind === "timeline") { for (let r = 0; r < 5; r++) { let x = 48 + rnd() * 40; while (x < 820) { const w = 70 + rnd() * 190; rr(g, x, 120 + r * 78, Math.min(w, 852 - x), 52, 10); g.fillStyle = r === 1 && x > 300 && x < 520 ? acc : `rgba(22,22,26,${0.12 + r * 0.05})`; g.fill(); x += w + 12 + rnd() * 24; } } g.fillStyle = acc; g.fillRect(560, 100, 4, 420); }
  else if (kind === "graph") { g.strokeStyle = "rgba(22,22,26,.07)"; g.lineWidth = 2; for (let x = 60; x < 860; x += 60) { g.beginPath(); g.moveTo(x, 110); g.lineTo(x, 520); g.stroke(); } g.lineWidth = 6; g.strokeStyle = ink; g.beginPath(); g.moveTo(60, 490); g.bezierCurveTo(360, 490, 380, 140, 840, 140); g.stroke(); g.strokeStyle = acc; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 490); g.lineTo(360, 490); g.moveTo(840, 140); g.lineTo(380, 140); g.stroke(); [[60, 490], [840, 140]].forEach(([x, y]) => { g.save(); g.translate(x, y); g.rotate(Math.PI / 4); g.fillStyle = ink; g.fillRect(-12, -12, 24, 24); g.restore(); }); }
  else if (kind === "layers") { g.direction = "rtl"; g.textAlign = "right"; ["טקסט כרום", "חלקיקים", "תאורה", "מצלמה", "זכוכית"].forEach((n, i) => { const y = 112 + i * 84; rr(g, 48, y, 804, 66, 12); g.fillStyle = i === 0 ? "rgba(232,116,59,.16)" : "rgba(22,22,26,.05)"; g.fill(); g.fillStyle = i === 0 ? acc : ink; g.font = "800 32px Heebo"; g.fillText(n, 820, y + 44); }); }
  else if (kind === "render") { g.fillStyle = ink; g.font = "800 66px Heebo"; g.fillText("Rendering", 48, 230); rr(g, 48, 290, 804, 18, 9); g.fillStyle = "rgba(22,22,26,.1)"; g.fill(); rr(g, 48, 290, 804, 18, 9); g.fillStyle = acc; g.fill(); g.font = "500 30px JBM"; g.fillStyle = soft; g.fillText("100%  ·  60 FPS  ·  4K", 48, 380); }
  else if (kind === "prompt") { g.direction = "rtl"; g.textAlign = "right"; g.fillStyle = ink; g.font = "800 50px Heebo"; g.fillText("תעשה לי סרטון מושן", 852, 220); g.fillText("ברמה של סטודיו", 852, 290); rr(g, 48, 420, 200, 80, 40); g.fillStyle = acc; g.fill(); g.fillStyle = "#fff"; g.font = "800 34px Heebo"; g.textAlign = "center"; g.fillText("צור", 148, 472); }
  else if (kind === "color") { for (let a = 0; a < 360; a += 2) { g.strokeStyle = `hsl(${a},55%,60%)`; g.lineWidth = 8; g.beginPath(); g.arc(260, 320, 160, (a * Math.PI) / 180, ((a + 3) * Math.PI) / 180); g.stroke(); } [0, 1, 2].forEach((i) => { rr(g, 500, 220 + i * 80, 340, 16, 8); g.fillStyle = "rgba(22,22,26,.1)"; g.fill(); g.fillStyle = i === 1 ? acc : ink; g.beginPath(); g.arc(560 + i * 90, 228 + i * 80, 16, 0, 7); g.fill(); }); }
  return c;
}
function makePanels() {
  const T0 = B(9), T1 = B(12);
  const rnd = mkRnd(5);
  const { scene } = makeStudio({ floorY: -1.6, reach: 14, keyPos: [-4, 14, 6] });
  const camera = persp(36);
  const kinds = ["timeline", "graph", "layers", "color", "render", "prompt"];
  const panels = kinds.map((k, i) => {
    const grp = new THREE.Group(); const side = i % 2 ? 1 : -1;
    const slab = new THREE.Mesh(new RoundedBoxGeometry(3.6, 2.24, 0.1, 4, 0.08), mats.glass({ roughness: 0.5, thickness: 0.6, color: 0xeef0f4, attenuationColor: new THREE.Color(0xc9ccd6), attenuationDistance: 0.6 }));
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new RoundedBoxGeometry(3.6, 2.24, 0.1, 2, 0.08), 30), new THREE.LineBasicMaterial({ color: 0x9a9ca4, transparent: true, opacity: 0.5 })); grp.add(edge);
    const face = canvasPlane(panelUI(k, rnd), 2.24); face.position.z = 0.05; face.material.toneMapped = true;
    grp.add(slab, face); slab.castShadow = true;
    // a staggered row the camera trucks along; the prompt panel closes the move
    grp.position.set(-7.2 + i * 2.9, 0.35 + (side > 0 ? 0.25 : -0.15), side > 0 ? -2.2 : -0.6); grp.rotation.y = -0.18 + (rnd() - 0.5) * 0.12;
    if (k === "prompt") { grp.position.set(7.6, 0.4, -0.2); grp.rotation.y = -0.1; }
    scene.add(grp); return grp;
  });
  function update(t) {
    const k = seg(t, T0 - 0.2, T1 + 0.2); const x = lerp(-7.4, 7.2, E.inOutSine(k) * 0.4 + k * 0.6);
    camera.position.set(x, 0.75, 6.4); camera.lookAt(x + 0.9, 0.3, 0); camera.rotation.z += Math.sin(k * 4) * 0.03;
    panels.forEach((p, i) => { p.position.y += Math.sin(t * 1.6 + i) * 0.0015; });
  }
  const post = (t) => studioPost({ glitch: beatPulse(t, T0, T1) * 0.1 });
  return { scene, camera, update, post };
}

// ───────── 3. editorial type on a grid: "בלי After Effects. בלי מעצב. רק פרומפט." ─────────
function makeType() {
  const T0 = B(12), P = [B(12), B(13.5), B(15)], T1 = B(17);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe7e6e2);
  const camera = persp(34);
  const wall = new THREE.Group(); wall.rotation.set(0.1, -0.4, 0.03); wall.position.set(1.4, 0, -7); scene.add(wall);
  const words = ["בלי AFTER EFFECTS", "בלי מעצב", "רק פרומפט", "מושן", "בלי טיימליין", "CLAUDE"]; const rows = [];
  for (let r = 0; r < 11; r++) {
    const c = document.createElement("canvas"); c.width = 4096; c.height = 200; const g = c.getContext("2d");
    g.font = "700 186px Karantina"; g.textBaseline = "middle"; g.direction = "rtl"; g.textAlign = "right"; let x = 4096, k = r;
    while (x > 0) { const w = words[k % words.length]; g.lineWidth = 2.5; g.strokeStyle = g.fillStyle = "#16161a"; if ((k + r) % 2) g.strokeText(w, x, 104); else g.fillText(w, x, 104); x -= g.measureText(w).width + 90; k++; }
    const tex = canvasTex(c); tex.wrapS = THREE.RepeatWrapping;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.95), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.08, depthWrite: false }));
    m.position.y = (r - 5) * 2.1; wall.add(m); rows.push({ m, tex, sp: (r % 2 ? 1 : -1) * (0.05 + (r % 3) * 0.02) });
  }
  const lg = []; for (let r = -6; r <= 6; r++) lg.push(-20, (r - 0.5) * 2.1 + 1.05, 0.01, 20, (r - 0.5) * 2.1 + 1.05, 0.01);
  for (let x = -20; x <= 20; x += 2.6) lg.push(x, -13, 0.01, x, 13, 0.01);
  const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute("position", new THREE.Float32BufferAttribute(lg, 3));
  const lines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ color: 0x16161a, transparent: true, opacity: 0.1 })); wall.add(lines);
  const ph = [
    textCanvas("בלי After Effects.", { font: "800 190px Heebo", color: "#121214", pad: 30 }),
    textCanvas("בלי מעצב.", { font: "800 230px Heebo", color: "#121214", pad: 30 }),
    textCanvas("רק פרומפט.", { font: "800 270px Heebo", color: "#e8743b", pad: 30 }),
  ].map((tc, i) => { const m = canvasPlane(tc.canvas, [1.45, 1.75, 2.05][i]); m.material.toneMapped = true; m.position.z = 2; scene.add(m); return m; });
  const cur = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.4), new THREE.MeshBasicMaterial({ color: 0x121214 })); scene.add(cur);
  const eyebrow = canvasPlane(textCanvas("NO TIMELINE · NO DESIGNER · JUST A PROMPT", { font: "500 46px JBM", color: "rgba(18,18,20,.55)", dir: "ltr", pad: 10 }).canvas, 0.2); eyebrow.material.toneMapped = true; eyebrow.position.set(0, 1.35, 2); scene.add(eyebrow);
  function update(t) {
    rows.forEach((r, i) => { r.tex.offset.x = r.sp * (t - T0) * 6 + i * 0.13; const hot = (t >= P[2] && i % 3 === 2) || (t >= P[1] && t < P[2] && i % 3 === 1) || (t < P[1] && i % 3 === 0); r.m.material.opacity = hot ? 0.16 : 0.06; });
    lines.material.opacity = 0.08 + 0.12 * beatPulse(t, T0, T1, 10);
    ph.forEach((m, i) => { const st = P[i], en = i < 2 ? P[i + 1] : T1 + 1; const k = seg(t, st, st + 0.3); const out = seg(t, en - 0.02, en + 0.14);
      m.visible = t >= st && t < en + 0.14; m.scale.setScalar(lerp(1.25, 1, E.outExpo(k)) * (1 + out * 0.3)); m.material.opacity = Math.min(1, k * 3) * (1 - out); m.position.set(0, -0.05, 2 + out * 2); });
    cur.visible = t >= P[2] + 0.25 && Math.floor((t - P[2]) * 3.2) % 2 === 0; cur.position.set(-ph[2].geometry.parameters.width / 2 * ph[2].scale.x - 0.02, -0.05, 2);
    eyebrow.material.opacity = seg(t, T0 + 0.1, T0 + 0.4);
    const kick = P.reduce((a, p) => a + (t >= p ? Math.exp(-(t - p) * 7) : 0), 0);
    camera.position.set(lerp(-1.2, 1.0, seg(t, T0, T1)), lerp(0.3, -0.2, seg(t, T0, T1)), 9.5 - kick * 0.5); camera.lookAt(0, 0, 0);
    wall.rotation.y = -0.4 + Math.sin(t * 0.8) * 0.05;
  }
  const post = (t) => studioPost({ glitch: P.reduce((a, p) => a + (t >= p ? Math.exp(-(t - p) * 12) : 0), 0) * 0.25 });
  return { scene, camera, update, post };
}

// ───────── 4. ceramic app tiles orbiting a black lacquer sphere ─────────
function glyphTile(sym) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#16161a"; g.strokeStyle = "#16161a"; g.lineCap = g.lineJoin = "round";
  if (sym === "play") { g.beginPath(); g.moveTo(100, 76); g.lineTo(180, 128); g.lineTo(100, 180); g.closePath(); g.fill(); }
  else if (sym === "spark") { g.fillStyle = "#e8743b"; g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? 22 : 74; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); g.fill(); }
  else if (sym === "wave") [40, 90, 60, 110, 70, 40].forEach((h, i) => { rr(g, 62 + i * 24, 128 - h / 2, 13, h, 6); g.fill(); });
  else if (sym === "layers") [0, 1, 2].forEach((i) => { g.globalAlpha = 1 - i * 0.3; g.beginPath(); g.moveTo(128, 74 + i * 28); g.lineTo(196, 106 + i * 28); g.lineTo(128, 138 + i * 28); g.lineTo(60, 106 + i * 28); g.closePath(); g.fill(); g.globalAlpha = 1; });
  else if (sym === "T") { g.font = "800 160px Heebo"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("T", 128, 138); }
  else if (sym === "note") { g.lineWidth = 15; g.beginPath(); g.moveTo(108, 172); g.lineTo(108, 74); g.lineTo(178, 60); g.lineTo(178, 156); g.stroke(); g.beginPath(); g.ellipse(90, 176, 24, 18, -0.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(160, 160, 24, 18, -0.4, 0, 7); g.fill(); }
  else if (sym === "cam") { rr(g, 56, 92, 144, 96, 18); g.fill(); g.fillStyle = "#f2f2f0"; g.beginPath(); g.arc(128, 140, 30, 0, 7); g.fill(); g.fillStyle = "#16161a"; g.beginPath(); g.arc(128, 140, 16, 0, 7); g.fill(); }
  else if (sym === "pen") { g.lineWidth = 13; g.beginPath(); g.moveTo(72, 182); g.bezierCurveTo(92, 64, 168, 196, 186, 74); g.stroke(); }
  return c;
}
function makeOrbit() {
  const T0 = B(17), T1 = B(20);
  const { scene } = makeStudio({ floorY: -1.9, reach: 7, dark: true });
  const camera = persp(34);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.25, 96, 64), mats.chrome()); ball.castShadow = true; scene.add(ball);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.012, 8, 220), new THREE.MeshBasicMaterial({ color: 0xe8e8ea, transparent: true, opacity: 0.3 })); ring.rotation.x = Math.PI / 2 + 0.28; scene.add(ring);
  const syms = ["play", "T", "note", "cam", "spark", "layers", "wave", "pen"];
  const tiles = syms.map((s, i) => {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.82, 0.22, 5, 0.16), s === "spark" ? mats.accent() : mats.ceramic()); body.castShadow = true;
    const face = canvasPlane(glyphTile(s), 0.5); face.position.z = 0.112; face.material.toneMapped = true; face.material.side = THREE.FrontSide;
    if (s === "spark") face.visible = false;
    grp.add(body, face); scene.add(grp); return { grp, a0: (i / syms.length) * Math.PI * 2 };
  });
  const v = new THREE.Vector3(), eul = new THREE.Euler(0.28, 0, 0);
  function update(t) {
    const lt = t - T0, k = seg(t, T0, T1);
    camera.position.set(Math.sin(k * 1.2 - 0.6) * 9.5, lerp(1.6, 0.6, k), Math.cos(k * 1.2 - 0.6) * 9.5); camera.lookAt(0, 0, 0);
    tiles.forEach((tl, i) => { const a = tl.a0 + lt * 0.9; const pop = E.outBack(seg(lt, i * 0.04, i * 0.04 + 0.35));
      v.set(Math.cos(a) * 2.9, 0, Math.sin(a) * 2.9).applyEuler(eul); tl.grp.position.copy(v); tl.grp.scale.setScalar(pop); tl.grp.lookAt(camera.position); tl.grp.rotateZ(Math.sin(a) * 0.1); });
    ball.rotation.y = t * 0.3;
  }
  const post = (t) => studioPost({ glitch: beatPulse(t, T0, T1) * 0.1 });
  return { scene, camera, update, post };
}

// ───────── 5. chrome rings spinning around ceramic blocks, the camera whips through ─────────
function makeRings() {
  const T0 = B(20), T1 = B(22);
  const rnd = mkRnd(12);
  const { scene } = makeStudio({ floorY: -2.2, reach: 7, dark: true });
  const camera = persp(40);
  const blocks = new THREE.Group(); scene.add(blocks);
  for (let i = 0; i < 34; i++) { const w = 0.35 + rnd() * 0.7, h = 0.2 + rnd() * 0.35; const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.35 + rnd() * 0.5, 3, 0.05), i === 7 ? mats.accent() : mats.ceramic()); m.position.set((rnd() - 0.5) * 3.0, (rnd() - 0.5) * 1.9, (rnd() - 0.5) * 1.6); m.castShadow = true; blocks.add(m); }
  const rings = [2.2, 2.75, 3.3].map((R, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(R, 0.09 + i * 0.015, 32, 220), mats.chrome()); m.castShadow = true; scene.add(m); return m; });
  function update(t) {
    const lt = t - T0;
    rings.forEach((r, i) => r.rotation.set(1.1 + Math.sin(t * 0.9 + i * 2) * 0.5, t * (0.8 + i * 0.3) * (i % 2 ? 1 : -1) + i * 1.3, 0.3 * i));
    blocks.rotation.y = t * 0.5; blocks.rotation.x = Math.sin(t) * 0.2;
    const w = E.inExpo(seg(t, T1 - 0.4, T1));
    camera.position.set(lerp(-1.5, 1.2, seg(t, T0, T1)) + w * 6, 0.4, lerp(10, 8.6, seg(t, T0, T1))); camera.lookAt(w * 9, 0, 0);
  }
  const post = (t) => { const w = E.inExpo(seg(t, T1 - 0.4, T1)); return studioPost({ mblur: [w * 0.2, 0], glitch: beatPulse(t, T0, T1) * 0.1 }); };
  return { scene, camera, update, post };
}

// ───────── 6. black lacquer "Claude" drops onto the studio floor on the beat ─────────
function makeClaude() {
  const T0 = B(22), T2 = B(23), T1 = B(24);
  const { scene } = makeStudio({ floorY: -1.0, reach: 6, keyPos: [-3, 12, 4] });
  const camera = persp(30);
  const lac = mats.lacquer(), side = mats.lacquer({ roughness: 0.3 });
  const { group, glyphs } = chromeWord("Claude", { size: 1.9, depth: 0.7, spacing: 1.03, mats: [lac, side] }); group.position.y = -1 + 0.69; scene.add(group);
  glyphs.forEach((g) => g.traverse((m) => { if (m.isMesh) m.castShadow = true; }));
  function update(t) {
    glyphs.forEach((g, i) => { const st = T0 + i * 0.045; const k = seg(t, st, st + 0.22); g.visible = t >= st - 0.3;
      const land = k >= 1 ? Math.exp(-(t - st - 0.22) * 12) * Math.sin((t - st - 0.22) * 40) * 0.06 : 0;
      g.position.y = lerp(5.5, 0, E.inCubic(k)) + Math.abs(land); g.rotation.z = lerp((i % 2 ? 0.3 : -0.3), 0, E.inCubic(k));
      g.rotation.y = t >= T2 ? E.outBack(seg(t, T2 + i * 0.03, T2 + i * 0.03 + 0.34)) * Math.PI * 2 : 0; });
    camera.position.set(lerp(-1.2, 1.2, seg(t, T0, T1)), 1.1, lerp(12, 11, seg(t, T0, T1))); camera.lookAt(0, -0.1, 0);
  }
  const post = (t) => studioPost({ glitch: (t > T0 + 0.22 ? Math.exp(-(t - T0 - 0.22) * 10) : 0) * 0.25 });
  return { scene, camera, update, post };
}

export const SHOTS_MONTAGE = [
  [B(6), makeParticles, "flash", 0.3],
  [B(9), makePanels, "zoom", 0.3],
  [B(12), makeType, "whip", 0.32],
  [B(17), makeOrbit, "glitch", 0.2],
  [B(20), makeRings, "zoom", 0.28],
  [B(22), makeClaude, "whip", 0.22],
];
