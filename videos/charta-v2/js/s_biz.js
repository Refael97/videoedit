// 17.84–22.95s, v2: "...ובין אם זה לעסק שלכם" — lacquer phones in the studio, a terracotta cable threading them,
// a ceramic price tag that lands, then a ceramic brand mark with a lacquer wordmark
import { THREE, seg, lerp, E, mkRnd, clamp, chromeWord, B, textCanvas, canvasTex, canvasPlane, rr } from "./core.js";
import { makeStudio, studioPost, mats, ACCENT } from "./studio.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const ACC = "#e8743b", INKS = "#121214";
function screen(kind) {
  const c = document.createElement("canvas"); c.width = 540; c.height = 1110; const g = c.getContext("2d");
  g.fillStyle = "#f6f5f2"; g.fillRect(0, 0, 540, 1110);
  g.fillStyle = INKS; g.font = "700 26px Heebo"; g.fillText("9:41", 40, 52); rr(g, 190, 22, 160, 40, 20); g.fillStyle = "#0b0b0c"; g.fill();
  g.direction = "rtl"; g.textAlign = "right";
  if (kind === "shop") {
    g.fillStyle = INKS; g.font = "800 46px Heebo"; g.direction = "ltr"; g.fillText("Refael AI", 500, 140); g.direction = "rtl"; g.fillStyle = "rgba(18,18,20,.45)"; g.font = "500 26px Heebo"; g.fillText("קורסים", 500, 182);
    rr(g, 40, 220, 460, 460, 32); g.fillStyle = "#e9e7e2"; g.fill();
    rr(g, 40, 220, 460, 460, 32); g.fillStyle = INKS; g.fill();
    g.save(); g.translate(270, 430); g.fillStyle = ACC; for (let i = 0; i < 11; i++) { g.save(); g.rotate((i / 11) * Math.PI * 2); rr(g, -14, 22, 28, 92, 14); g.fill(); g.restore(); } g.beginPath(); g.arc(0, 0, 36, 0, 7); g.fill(); g.restore();
    g.fillStyle = "#fff"; g.font = "800 40px Heebo"; g.textAlign = "center"; g.fillText("Claude מאפס", 270, 620); g.textAlign = "right";
    g.fillStyle = INKS; g.font = "800 40px Heebo"; g.fillText("קורס Claude מלא", 500, 750); g.fillStyle = "rgba(18,18,20,.5)"; g.font = "500 28px Heebo"; g.fillText("★★★★★  4.9", 500, 798);
    g.fillStyle = INKS; g.font = "800 62px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("₪299", 40, 880); g.direction = "rtl"; g.textAlign = "right";
    rr(g, 40, 930, 460, 106, 53); g.fillStyle = INKS; g.fill(); g.fillStyle = "#fff"; g.font = "800 42px Heebo"; g.textAlign = "center"; g.fillText("הוסף לסל", 270, 998);
  } else if (kind === "ad") {
    g.fillStyle = INKS; g.font = "800 30px Heebo"; g.direction = "ltr"; g.fillText("refael-ai.com", 440, 130); g.direction = "rtl"; g.fillStyle = ACC; g.beginPath(); g.arc(475, 120, 24, 0, 7); g.fill();
    rr(g, 0, 170, 540, 620, 0); g.fillStyle = "#121214"; g.fill();
    g.fillStyle = ACC; g.font = "800 120px Heebo"; g.textAlign = "center"; g.fillText("-40%", 270, 470); g.fillStyle = "#fff"; g.font = "800 46px Heebo"; g.fillText("רק היום", 270, 560);
    g.textAlign = "right"; g.fillStyle = INKS; g.font = "700 30px Heebo"; g.fillText("12,480 אהבו", 500, 850);
    rr(g, 40, 900, 460, 96, 48); g.strokeStyle = INKS; g.lineWidth = 3; g.stroke(); g.fillStyle = INKS; g.font = "800 34px Heebo"; g.textAlign = "center"; g.fillText("לרכישה", 270, 962);
  } else {
    g.fillStyle = INKS; g.font = "800 44px Heebo"; g.fillText("מכירות", 500, 140);
    g.fillStyle = ACC; g.font = "800 110px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("+248%", 40, 300); g.direction = "rtl"; g.textAlign = "right";
    g.strokeStyle = "rgba(18,18,20,.08)"; g.lineWidth = 2; for (let y = 380; y < 820; y += 70) { g.beginPath(); g.moveTo(40, y); g.lineTo(500, y); g.stroke(); }
    const pts = [[40, 780], [110, 740], [180, 760], [250, 650], [320, 620], [390, 500], [450, 430], [500, 380]];
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = INKS; g.lineWidth = 7; g.lineJoin = "round"; g.stroke();
    [["הזמנות", "1,284"], ["לקוחות חדשים", "862"]].forEach(([a, b], i) => { rr(g, 40, 870 + i * 110, 460, 90, 20); g.fillStyle = "rgba(18,18,20,.05)"; g.fill(); g.fillStyle = INKS; g.font = "700 32px Heebo"; g.fillText(a, 470, 927 + i * 110); g.font = "800 36px Heebo"; g.textAlign = "left"; g.direction = "ltr"; g.fillText(b, 70, 927 + i * 110); g.textAlign = "right"; g.direction = "rtl"; });
  }
  return c;
}
function phone(kind) {
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(2.36, 4.8, 0.26, 6, 0.32), mats.lacquer()); body.castShadow = true;
  const scr = canvasPlane(screen(kind), 4.56); scr.position.z = 0.135; scr.material.side = THREE.FrontSide; scr.material.toneMapped = true;
  grp.add(body, scr); return grp;
}

function makeBiz() {
  const T0 = B(32), LINE0 = B(33), LINE1 = B(35.5), TAG = B(38), LOGO = B(40), HIT = B(41.5), T1 = B(43);
  const { scene } = makeStudio({ floorY: -3.4, reach: 9, keyPos: [-4, 14, 8] });
  const camera = new THREE.PerspectiveCamera(34, 16 / 9, 0.1, 300);
  const P = [phone("ad"), phone("shop"), phone("stats")]; const home = [[-3.6, 0, -0.6, 0.35], [0, 0.2, 0.4, 0], [3.6, 0, -0.6, -0.35]];
  P.forEach((p) => scene.add(p));
  // terracotta cable (matte, physical, no glow) weaving in front of the phones
  const pts = [[-9, -3.0, 1], [-5.2, -1.6, 0.7], [-3.6, 1.2, 0.2], [-1.8, 2.6, 0.9], [0, -0.8, 1.0], [1.8, -2.4, 0.9], [3.6, -0.6, 0.2], [5.2, 1.8, 0.7], [9, 2.6, 1]].map((a) => new THREE.Vector3(...a));
  const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.045, 12, false), mats.accent()); cable.castShadow = true; scene.add(cable); const TOT = cable.geometry.index.count;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), mats.accent()); scene.add(tip);
  // ceramic price tag
  const sh = new THREE.Shape(); sh.moveTo(-1.1, -0.62); sh.lineTo(0.75, -0.62); sh.lineTo(1.25, 0); sh.lineTo(0.75, 0.62); sh.lineTo(-1.1, 0.62); sh.lineTo(-1.1, -0.62);
  const hole = new THREE.Path(); hole.absarc(0.85, 0, 0.12, 0, Math.PI * 2, true); sh.holes.push(hole);
  const tagG = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 }); tagG.translate(0, 0, -0.06);
  const tag = new THREE.Group(); const tagM = new THREE.Mesh(tagG, mats.accent()); tagM.castShadow = true; tag.add(tagM);
  const tt = canvasPlane(textCanvas("₪299", { font: "800 150px Heebo", color: "#121214", dir: "ltr", pad: 10 }).canvas, 0.8); tt.position.set(-0.18, 0, 0.11); tt.material.toneMapped = true; tag.add(tt); scene.add(tag);
  // brand reveal: white ceramic disc + lacquer N + lacquer wordmark
  const logo = new THREE.Group(); logo.position.set(0, 0.7, 3.2); scene.add(logo);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.28, 96).rotateX(Math.PI / 2), mats.ceramic()); disc.castShadow = true; logo.add(disc);
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 16, 160), mats.accent()); ringM.position.z = 0.0; logo.add(ringM); const RT = ringM.geometry.index.count;
  const lac = mats.lacquer(); const N = chromeWord("R", { size: 1.25, depth: 0.25, mats: [lac, lac] }); N.group.position.set(0, 0.05, 0.25); logo.add(N.group);
  const wm = chromeWord("Refael AI", { size: 0.7, depth: 0.26, spacing: 1.04, mats: [lac, mats.lacquer({ roughness: 0.3 })] }); wm.group.position.set(0, -1.95, 0); logo.add(wm.group);
  const sub = canvasPlane(textCanvas("לומדים AI בקלות", { font: "800 90px Heebo", color: ACC, pad: 10 }).canvas, 0.42); sub.material.toneMapped = true; sub.position.set(0, -2.72, 0); logo.add(sub);
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(80, 50), new THREE.MeshBasicMaterial({ color: 0xdcdce0, transparent: true, fog: false })); backdrop.position.z = 1.6; scene.add(backdrop);
  const TAGPOS = new THREE.Vector3(2.35, -0.55, 1.3);
  function update(t) {
    P.forEach((p, i) => { const st = T0 + i * 0.07; const k = E.outBack(seg(t, st, st + 0.5)); const h = home[i];
      p.position.set(h[0] * (0.6 + 0.4 * k), lerp(-9, h[1], k) + Math.sin(t * 1.6 + i) * 0.05, h[2]); p.rotation.set(lerp(0.8, 0, k), h[3] + lerp(i - 1, 0, k) + Math.sin(t * 0.9 + i) * 0.04, 0);
      const out = E.inCubic(seg(t, LOGO - 0.1, LOGO + 0.45)); p.position.x += (i - 1) * out * 6; p.position.z -= out * 3; });
    const lk = E.inOutCubic(seg(t, LINE1 - 0.2, TAG)); P[1].rotation.y += -0.15 * lk; P[1].position.z += 0.3 * lk;
    const dk = E.inOutSine(seg(t, LINE0, LINE1)); cable.geometry.setDrawRange(0, Math.floor((TOT * dk) / 3) * 3); cable.visible = t >= LINE0; tip.visible = t >= LINE0 && dk < 1; tip.position.copy(curve.getPointAt(clamp(dk)));
    const tk = seg(t, TAG - 0.28, TAG); tag.visible = t >= TAG - 0.28; tag.position.set(TAGPOS.x, lerp(TAGPOS.y + 7, TAGPOS.y, E.inCubic(tk)), TAGPOS.z);
    const after = Math.max(0, t - TAG); tag.rotation.set(0.1, -0.2, -0.35 + (t > TAG ? Math.exp(-after * 5) * Math.sin(after * 18) * 0.3 : 0));
    tag.scale.set(0.72 * (1 + (t > TAG ? Math.exp(-after * 12) * 0.2 : 0)), 0.72 * (1 - (t > TAG ? Math.exp(-after * 12) * 0.16 : 0)), 0.72);
    logo.visible = backdrop.visible = t >= LOGO; backdrop.material.opacity = E.outCubic(seg(t, LOGO, LOGO + 0.3));
    ringM.geometry.setDrawRange(0, Math.floor((RT * E.inOutCubic(seg(t, LOGO, LOGO + 0.55))) / 3) * 3);
    disc.scale.setScalar(lerp(0.2, 1, E.outBack(seg(t, HIT - 0.2, HIT + 0.05)))); disc.visible = t >= HIT - 0.2;
    N.group.visible = t >= HIT - 0.05; N.group.scale.setScalar(E.outBack(seg(t, HIT - 0.05, HIT + 0.2)));
    wm.glyphs.forEach((g, i) => { const st = HIT + 0.02 + i * 0.022; const k = seg(t, st, st + 0.24); g.visible = t >= st; g.position.y = lerp(-1.2, 0, E.outBack(k)); });
    sub.material.opacity = seg(t, HIT + 0.3, HIT + 0.6);
    logo.rotation.y = Math.sin(t * 1.2) * 0.15 * seg(t, HIT, T1);
    const c1 = E.inOutCubic(seg(t, LINE1 - 0.3, TAG - 0.1)), c2 = E.inOutCubic(seg(t, LOGO - 0.1, LOGO + 0.5));
    camera.position.set(lerp(lerp(-1.2, 0.6, seg(t, T0, LINE1)), 0.5, c1) * (1 - c2), lerp(lerp(0.6, 0.2, c1), 0.2, c2), lerp(lerp(14.5, 7.4, c1), 12, c2));
    camera.lookAt(lerp(0, 0.2, c1) * (1 - c2), lerp(0.1, 0.6, c1) * (1 - c2) - 0.1 * c2, 0);
  }
  const post = (t) => studioPost({ glitch: (t > TAG ? Math.exp(-(t - TAG) * 12) : 0) * 0.15 });
  return { scene, camera, update, post };
}

export const SHOTS_BIZ = [[B(32), makeBiz, "whip", 0.3]];
