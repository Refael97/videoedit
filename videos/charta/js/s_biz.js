// 17.84–22.95s: "...ובין אם זה לעסק שלכם" — black + electric yellow: a neon line threads three phones,
// the app UI comes alive, a price tag lands, and the line draws the brand mark
import { THREE, seg, lerp, E, mkRnd, clamp, envTex, B, beatPulse, textCanvas, canvasTex, canvasPlane, rr, dotTex } from "./core.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const Y = "#ffd60a";
function screen(kind) {
  const c = document.createElement("canvas"); c.width = 540; c.height = 1110; const g = c.getContext("2d");
  g.fillStyle = "#0d0d10"; g.fillRect(0, 0, 540, 1110);
  g.direction = "rtl"; g.textAlign = "right";
  // status bar + notch
  g.fillStyle = "#fff"; g.font = "700 26px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("9:41", 40, 52); g.direction = "rtl"; g.textAlign = "right";
  rr(g, 190, 22, 160, 40, 20); g.fillStyle = "#000"; g.fill();
  if (kind === "shop") {
    g.fillStyle = "#fff"; g.font = "900 46px Heebo"; g.fillText("נובה", 500, 140);
    g.fillStyle = "rgba(255,255,255,.5)"; g.font = "500 26px Heebo"; g.fillText("קולקציית חורף", 500, 182);
    rr(g, 40, 220, 460, 460, 36); const gr = g.createLinearGradient(0, 220, 0, 680); gr.addColorStop(0, "#ffd60a"); gr.addColorStop(1, "#ff9f0a"); g.fillStyle = gr; g.fill();
    // a stylised sneaker silhouette
    g.save(); g.translate(270, 470); g.rotate(-0.12); g.fillStyle = "#111";
    g.beginPath(); g.moveTo(-170, 40); g.bezierCurveTo(-170, -10, -120, -40, -60, -50); g.lineTo(10, -110); g.bezierCurveTo(40, -120, 70, -100, 80, -70); g.bezierCurveTo(120, -40, 170, -10, 185, 30); g.lineTo(185, 60); g.lineTo(-170, 60); g.closePath(); g.fill();
    g.fillStyle = "#fff"; g.fillRect(-170, 52, 355, 18); g.strokeStyle = "#ffd60a"; g.lineWidth = 8; g.beginPath(); g.moveTo(-90, 10); g.quadraticCurveTo(10, -10, 90, 20); g.stroke(); g.restore();
    g.fillStyle = "#fff"; g.font = "800 40px Heebo"; g.fillText("נעלי ריצה נובה X", 500, 750);
    g.fillStyle = Y; g.font = "700 30px Heebo"; g.fillText("★★★★★  4.9", 500, 800);
    g.fillStyle = "#fff"; g.font = "900 64px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("₪299", 40, 880); g.direction = "rtl"; g.textAlign = "right";
    rr(g, 40, 930, 460, 110, 55); g.fillStyle = Y; g.fill(); g.fillStyle = "#111"; g.font = "900 44px Heebo"; g.textAlign = "center"; g.fillText("הוסף לסל", 270, 1000);
  } else if (kind === "ad") {
    g.fillStyle = "#fff"; g.font = "800 30px Heebo"; g.fillText("nova.store", 440, 130);
    g.fillStyle = Y; g.beginPath(); g.arc(475, 120, 26, 0, 7); g.fill();
    rr(g, 0, 170, 540, 620, 0); const gr = g.createLinearGradient(0, 170, 540, 790); gr.addColorStop(0, "#1b1b22"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fill();
    g.fillStyle = Y; g.font = "900 120px Heebo"; g.textAlign = "center"; g.fillText("-40%", 270, 470); g.fillStyle = "#fff"; g.font = "800 46px Heebo"; g.fillText("רק היום", 270, 560);
    g.textAlign = "right"; g.fillStyle = "#fff"; g.font = "700 30px Heebo"; g.fillText("♥ 12,480   💬 932", 500, 850);
    rr(g, 40, 900, 460, 96, 22); g.fillStyle = "rgba(255,255,255,.1)"; g.fill(); g.fillStyle = "#fff"; g.font = "800 34px Heebo"; g.textAlign = "center"; g.fillText("לרכישה ←", 270, 962);
  } else {
    g.fillStyle = "#fff"; g.font = "900 44px Heebo"; g.fillText("מכירות", 500, 140);
    g.fillStyle = Y; g.font = "900 110px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("+248%", 40, 300); g.direction = "rtl"; g.textAlign = "right";
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; for (let y = 380; y < 820; y += 70) { g.beginPath(); g.moveTo(40, y); g.lineTo(500, y); g.stroke(); }
    const pts = [[40, 780], [110, 740], [180, 760], [250, 650], [320, 620], [390, 500], [450, 430], [500, 380]];
    const fg = g.createLinearGradient(0, 380, 0, 820); fg.addColorStop(0, "rgba(255,214,10,.45)"); fg.addColorStop(1, "rgba(255,214,10,0)");
    g.beginPath(); g.moveTo(40, 820); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(500, 820); g.closePath(); g.fillStyle = fg; g.fill();
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = Y; g.lineWidth = 8; g.lineJoin = "round"; g.stroke();
    [["הזמנות", "1,284"], ["לקוחות חדשים", "862"]].forEach(([a, b], i) => { rr(g, 40, 870 + i * 110, 460, 90, 20); g.fillStyle = "rgba(255,255,255,.07)"; g.fill(); g.fillStyle = "#fff"; g.font = "700 32px Heebo"; g.fillText(a, 470, 927 + i * 110); g.font = "900 36px Heebo"; g.textAlign = "left"; g.direction = "ltr"; g.fillText(b, 70, 927 + i * 110); g.textAlign = "right"; g.direction = "rtl"; });
  }
  return c;
}
function phone(kind) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.36, 4.8, 0.26, 6, 0.32), new THREE.MeshPhysicalMaterial({ color: 0x0b0b0e, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.1 }));
  const scr = canvasPlane(screen(kind), 4.58); scr.position.z = 0.135; scr.material.side = THREE.FrontSide; scr.material.toneMapped = false;
  grp.add(body, scr); return grp;
}

function makeBiz() {
  const T0 = B(32), LINE0 = B(33), LINE1 = B(35.5), TAG = B(38), LOGO = B(40), HIT = B(41.5), T1 = B(43);
  const rnd = mkRnd(4);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060607); scene.environment = envTex;
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 300);
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.PointLight(0xffd60a, 40, 30, 1.5); key.position.set(0, 2, 6); scene.add(key);
  // floor grid in yellow for that slick product-launch vibe
  const grid = new THREE.GridHelper(80, 80, 0xffd60a, 0x2a2a10); grid.position.y = -3.4; grid.material.transparent = true; grid.material.opacity = 0.18; scene.add(grid);
  const P = [phone("ad"), phone("shop"), phone("stats")];
  const home = [[-3.6, 0, -0.6, 0.35], [0, 0.2, 0.4, 0], [3.6, 0, -0.6, -0.35]];
  P.forEach((p) => scene.add(p));
  // the neon line: one curve weaving through all three phones, then curling into the brand ring
  const pts = [[-9, -2.8, 1], [-5.2, -1.5, 0.6], [-3.6, 1.2, 0.0], [-1.8, 2.6, 0.9], [0, -0.8, 1.0], [1.8, -2.4, 0.9], [3.6, -0.6, 0.0], [5.2, 1.8, 0.6], [9, 2.6, 1]].map((a) => new THREE.Vector3(...a));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.05, 10, false), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.7, 0.2), toneMapped: false }));
  const glowTube = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.16, 10, false), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.75, 0), transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(tube, glowTube); const TOT = tube.geometry.index.count;
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: new THREE.Color(3, 2.6, 1), blending: THREE.AdditiveBlending, depthWrite: false })); head.scale.setScalar(1.1); scene.add(head);
  // price tag: an extruded tag shape with a punched hole + a string
  const sh = new THREE.Shape(); sh.moveTo(-1.1, -0.62); sh.lineTo(0.75, -0.62); sh.lineTo(1.25, 0); sh.lineTo(0.75, 0.62); sh.lineTo(-1.1, 0.62); sh.lineTo(-1.1, -0.62);
  const hole = new THREE.Path(); hole.absarc(0.85, 0, 0.12, 0, Math.PI * 2, true); sh.holes.push(hole);
  const tagG = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 }); tagG.translate(0, 0, -0.06);
  const tag = new THREE.Group(); tag.add(new THREE.Mesh(tagG, new THREE.MeshPhysicalMaterial({ color: 0xd9b000, metalness: 0.2, roughness: 0.45, clearcoat: 0.6 })));
  const tagTxt = canvasPlane(textCanvas("₪299", { font: "900 150px Heebo", color: "#111", dir: "ltr", pad: 10 }).canvas, 0.82); tagTxt.position.set(-0.18, 0, 0.11); tagTxt.material.toneMapped = true; tag.add(tagTxt); scene.add(tag);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 1.6, 0.2), transparent: true, side: THREE.DoubleSide, toneMapped: false })); scene.add(ring);
  // brand mark: a ring the line draws, a bold N-star inside, then the wordmark
  const logo = new THREE.Group(); logo.position.set(0, 0.2, 3.2); scene.add(logo);
  const lr = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.07, 16, 160, Math.PI * 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.7, 0.2), toneMapped: false })); logo.add(lr); const LRT = lr.geometry.index.count;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.18, 96), new THREE.MeshBasicMaterial({ color: 0xffd60a, toneMapped: false, transparent: true })); disc.position.z = -0.02; logo.add(disc);
  const mark = canvasPlane(textCanvas("N", { font: "900 300px Heebo", color: "#0b0b0b", dir: "ltr", pad: 0 }).canvas, 1.9); mark.position.z = 0.01; mark.material.toneMapped = true; logo.add(mark);
  const word = canvasPlane(textCanvas("נובה", { font: "900 240px Heebo", color: "#ffffff", pad: 10 }).canvas, 1.5); word.position.set(0, -2.15, 0); logo.add(word);
  const sub = canvasPlane(textCanvas("החנות שלך. בכל מסך.", { font: "800 90px Heebo", color: "#ffd60a", pad: 10 }).canvas, 0.5); sub.position.set(0, -3.0, 0); logo.add(sub);
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshBasicMaterial({ color: 0x060607, transparent: true })); backdrop.position.z = 2.2; scene.add(backdrop);
  // sparks on the tag landing
  const NS = 260, sp = new Float32Array(NS * 3), SV = []; for (let i = 0; i < NS; i++) { const a = rnd() * Math.PI * 2; SV.push([Math.cos(a) * (2 + rnd() * 5), Math.sin(a) * (2 + rnd() * 5), rnd() * 3]); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sparks = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(2, 1.6, 0.3), size: 0.06, map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(sparks);
  const TAGPOS = new THREE.Vector3(1.9, 0.35, 1.3);

  function update(t) {
    P.forEach((p, i) => {
      const st = T0 + i * 0.07; const k = E.outBack(seg(t, st, st + 0.5)); const h = home[i];
      p.position.set(h[0] * (0.6 + 0.4 * k), lerp(-9, h[1], k) + Math.sin(t * 1.6 + i) * 0.06, h[2]); p.rotation.set(lerp(0.8, 0, k), h[3] + lerp(i - 1, 0, k) + Math.sin(t * 0.9 + i) * 0.05, 0);
      const out = E.inCubic(seg(t, LOGO - 0.1, LOGO + 0.45)); p.position.x += (i - 1) * out * 6; p.position.z -= out * 3; p.rotation.y += (i - 1) * out * 0.6;
    });
    // phone B leans in when the camera arrives
    const lk = E.inOutCubic(seg(t, LINE1 - 0.2, TAG)); P[1].rotation.y += -0.15 * lk; P[1].position.z += 0.3 * lk;
    const dk = seg(t, LINE0, LINE1); tube.geometry.setDrawRange(0, Math.floor(TOT * E.inOutSine(dk) / 3) * 3); glowTube.geometry.setDrawRange(0, Math.floor(TOT * E.inOutSine(dk) / 3) * 3);
    tube.visible = glowTube.visible = t >= LINE0; head.visible = t >= LINE0 && dk < 1; head.position.copy(curve.getPointAt(clamp(E.inOutSine(dk), 0, 1)));
    // tag: dropped from above, lands on the beat, wobbles on its string
    const tk = seg(t, TAG - 0.28, TAG); tag.visible = t >= TAG - 0.28;
    tag.position.set(TAGPOS.x, lerp(TAGPOS.y + 7, TAGPOS.y, E.inCubic(tk)), TAGPOS.z);
    const after = Math.max(0, t - TAG); tag.rotation.set(0.1, -0.2, -0.35 + Math.exp(-after * 5) * Math.sin(after * 18) * 0.35 * (t > TAG ? 1 : 0));
    tag.scale.set(1 + (t > TAG ? Math.exp(-after * 12) * 0.25 : 0), 1 - (t > TAG ? Math.exp(-after * 12) * 0.2 : 0), 1);
    ring.visible = t > TAG && after < 0.6; ring.position.copy(TAGPOS); ring.scale.setScalar(0.5 + E.outCubic(after / 0.6) * 4); ring.material.opacity = 1 - after / 0.6;
    sparks.visible = t > TAG && after < 0.9; for (let i = 0; i < NS; i++) { sp[i * 3] = TAGPOS.x + SV[i][0] * after; sp[i * 3 + 1] = TAGPOS.y + SV[i][1] * after - 6 * after * after; sp[i * 3 + 2] = TAGPOS.z + SV[i][2] * after; } sg.attributes.position.needsUpdate = true;
    sparks.material.opacity = 1 - after / 0.9;
    // logo
    const lg = seg(t, LOGO, HIT); logo.visible = backdrop.visible = t >= LOGO;
    backdrop.material.opacity = E.outCubic(seg(t, LOGO, LOGO + 0.3)) * 0.92;
    lr.geometry.setDrawRange(0, Math.floor((LRT * E.inOutCubic(seg(t, LOGO, LOGO + 0.55))) / 3) * 3);
    disc.material.opacity = E.outCubic(seg(t, HIT - 0.12, HIT)); disc.scale.setScalar(lerp(0.3, 1, E.outBack(seg(t, HIT - 0.15, HIT + 0.1))));
    mark.visible = t >= HIT - 0.05; mark.scale.setScalar(E.outBack(seg(t, HIT - 0.05, HIT + 0.2)));
    word.visible = sub.visible = t >= HIT; word.scale.setScalar(E.outExpo(seg(t, HIT, HIT + 0.3))); sub.material.opacity = seg(t, HIT + 0.15, HIT + 0.45);
    logo.rotation.y = Math.sin(t * 1.2) * 0.12 * seg(t, HIT, T1); logo.position.y = 0.6;
    // camera: wide → dolly to the shop phone → pull back for the logo
    const c1 = E.inOutCubic(seg(t, LINE1 - 0.3, TAG - 0.1)), c2 = E.inOutCubic(seg(t, LOGO - 0.1, LOGO + 0.5));
    camera.position.set(lerp(lerp(-1.2, 0.6, seg(t, T0, LINE1)), 0.5, c1) * (1 - c2), lerp(lerp(0.6, 0.2, c1), 0, c2), lerp(lerp(13.5, 7.2, c1), 11.2, c2));
    camera.lookAt(lerp(0, 0.2, c1) * (1 - c2), lerp(0.1, 0.6, c1) * (1 - c2) + 0.2 * c2, 0); camera.rotation.z += Math.sin(t * 1.1) * 0.02;
    key.position.x = Math.sin(t * 1.5) * 4;
  }
  const post = (t) => { const hit = (t > TAG ? Math.exp(-(t - TAG) * 9) : 0) + (t > HIT ? Math.exp(-(t - HIT) * 8) : 0); return { bloom: [0.45 + hit * 0.35, 0.5, 0.85], chroma: 0.003 + hit * 0.015, glitch: hit * 0.25, flash: (t > HIT ? 0.3 * Math.exp(-(t - HIT) * 14) : 0) }; };
  return { scene, camera, update, post };
}

export const SHOTS_BIZ = [[B(32), makeBiz, "glitch", 0.28]];
