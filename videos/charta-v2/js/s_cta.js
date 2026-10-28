// 28.99–33.0s: the call to action — "רוצים לדעת איך עשיתי את זה?" → chrome "מושן" + a comment being typed
// plus the global caption layer used by the fun/business sections
import { THREE, seg, lerp, E, mkRnd, clamp, envTex, chromeWord, B, beatPulse, textCanvas, canvasTex, hudText, rr, dotTex } from "./core.js";

function pill(text, { bg, color, px = 70, padX = 46, padY = 22 }) {
  const t = textCanvas(text, { font: `900 ${px}px Heebo`, color, pad: 0 });
  const c = document.createElement("canvas"); c.width = t.w + padX * 2 + 40; c.height = t.h + padY * 2 + 40; const g = c.getContext("2d");
  g.shadowColor = "rgba(0,0,0,.35)"; g.shadowBlur = 24; g.shadowOffsetY = 8; rr(g, 20, 16, c.width - 40, c.height - 40, (c.height - 40) / 2); g.fillStyle = bg; g.fill(); g.shadowColor = "transparent";
  g.drawImage(t.canvas, 20 + padX, 16 + padY);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(c.width, c.height), new THREE.MeshBasicMaterial({ color: 0xd0d0d0, map: canvasTex(c), transparent: true, depthTest: false, toneMapped: false }));
  return m;
}

// editorial HUD over the studio section: thin top rule, mono labels, shot counter, chapter titles
const SHOT_LABELS = [[B(6), "PARTICLES"], [B(9), "GLASS INTERFACE"], [B(12), "TYPOGRAPHY"], [B(17), "CERAMIC ORBIT"], [B(20), "CHROME"], [B(22), "LACQUER"],
  [B(24), "PRINT & STICKERS"], [B(27), "PAPER CONFETTI"], [B(29), "MEME"], [B(32), "COMMERCE"], [B(43), "ARCHITECTURE"], [B(47), "PORTAL"], [B(51), "PARTICLES"]];
function mono(text, px, color, alignRight) {
  const m = hudText(text, { font: `500 ${px}px JBM`, color, dir: "ltr", pad: 8 }); m.material.toneMapped = true;
  m.geometry.translate(alignRight ? -m.userData.w / 2 : m.userData.w / 2, 0, 0); return m;
}
export function makeCaptions() {
  const scene = new THREE.Scene(); const ON0 = B(6) + 0.1, ON1 = B(56) - 0.15;
  const ink = "#ffffff"; // drawn white, tinted per scene: ink on the light studio, near-white on the black one
  const rule = new THREE.Mesh(new THREE.PlaneGeometry(1760, 1.5), new THREE.MeshBasicMaterial({ color: 0x121214, transparent: true, opacity: 0.16, depthTest: false })); rule.position.y = 462; scene.add(rule);
  const brand = mono("CHARTA?!  ·  CLAUDE × THREE.JS", 20, ink, false); brand.position.set(-880, 488, 0); scene.add(brand);
  const counters = SHOT_LABELS.map((_, i) => { const m = mono(`${String(i + 1).padStart(2, "0")} / ${SHOT_LABELS.length}`, 20, "rgba(232,116,59,1)", true); m.position.set(880, 488, 0); scene.add(m); return m; });
  const labels = SHOT_LABELS.map(([, l]) => { const m = mono(l, 18, ink, false); m.position.set(-880, -488, 0); scene.add(m); return m; });
  const corner = new THREE.Group(); [[-1, -1], [1, -1]].forEach(([sx]) => {}); scene.add(corner);
  const chapter = (eb, title, t0, t1) => { const e = mono(eb, 20, "rgba(232,116,59,1)", true); const h = hudText(title, { font: "800 64px Heebo", color: "#ffffff", pad: 12 }); h.material.toneMapped = true;
    h.geometry.translate(-h.userData.w / 2, 0, 0); e.position.set(880, -352, 0); h.position.set(892, -410, 0); scene.add(e, h); return { e, h, t0, t1 }; };
  const chapters = [chapter("01 — FOR FUN", "בין אם אתם עורכים בשביל הכיף...", B(24) + 0.05, B(32) - 0.05), chapter("02 — FOR BUSINESS", "...ובין אם זה לעסק שלכם", B(32) + 0.25, B(35.5))];
  const DARK = [[B(17), B(22)], [B(27), B(29)], [B(47), B(51)]];
  const tintable = [rule, brand, ...labels, ...chapters.map((c) => c.h)];
  const api = { scene, active: false, update(t) {
    api.active = t > ON0 && t < ON1; if (!api.active) return;
    const dark = DARK.some(([a, b]) => t >= a && t < b); tintable.forEach((m) => m.material.color.set(dark ? 0xe9e9ec : 0x121214));
    const k = E.outCubic(seg(t, ON0, ON0 + 0.4)) * (1 - seg(t, ON1 - 0.25, ON1)); rule.scale.x = Math.max(0.001, k); rule.material.opacity = 0.16 * k; brand.material.opacity = k * 0.62;
    let idx = 0; SHOT_LABELS.forEach(([t0], i) => { if (t >= t0 - 0.05) idx = i; });
    counters.forEach((m, i) => { m.visible = i === idx; m.material.opacity = k; }); labels.forEach((m, i) => { m.visible = i === idx; m.material.opacity = 0.62 * k * seg(t, SHOT_LABELS[i][0], SHOT_LABELS[i][0] + 0.25); });
    chapters.forEach((c) => { const on = t >= c.t0 && t < c.t1 + 0.25; c.e.visible = c.h.visible = on; if (!on) return; const a = E.outCubic(seg(t, c.t0, c.t0 + 0.35)), o = seg(t, c.t1, c.t1 + 0.25);
      c.e.material.opacity = a * (1 - o); c.h.material.opacity = a * (1 - o); c.h.position.y = -410 - (1 - a) * 24; });
  } };
  return api;
}

function commentBar(txt, avatar) {
  const c = document.createElement("canvas"); c.width = 1240; c.height = 170; const g = c.getContext("2d");
  rr(g, 8, 8, 1224, 154, 77); g.fillStyle = "rgba(255,255,255,.96)"; g.fill();
  // avatar on the right (RTL layout), photo clipped to a circle with a gradient ring
  const ring = g.createLinearGradient(1060, 20, 1200, 150); ring.addColorStop(0, "#feda75"); ring.addColorStop(0.5, "#d62976"); ring.addColorStop(1, "#4f5bd5");
  g.fillStyle = ring; g.beginPath(); g.arc(1150, 85, 64, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(1150, 85, 58, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(1150, 85, 53, 0, 7); g.clip(); if (avatar) { const s = Math.max(106 / avatar.width, 106 / avatar.height); g.drawImage(avatar, 1150 - (avatar.width * s) / 2, 85 - (avatar.height * s) / 2, avatar.width * s, avatar.height * s); } g.restore();
  g.direction = "rtl"; g.textAlign = "right"; g.textBaseline = "middle";
  if (txt) { g.fillStyle = "#111"; g.font = "800 64px Heebo"; g.fillText(txt, 1050, 90); const w = g.measureText(txt).width; g.fillStyle = "#0095f6"; g.fillRect(1050 - w - 14, 52, 5, 74); }
  else { g.fillStyle = "#9a9a9a"; g.font = "500 54px Heebo"; g.fillText("הוסף תגובה...", 1050, 90); }
  g.fillStyle = txt === "מושן" ? "#0095f6" : "#b9dcfb"; g.font = "800 50px Heebo"; g.direction = "ltr"; g.textAlign = "left"; g.fillText("פרסם", 60, 90);
  return c;
}

function makeCTA() {
  const T0 = B(56), L2 = B(60), TYPE0 = B(61), T1 = 33.0;
  const rnd = mkRnd(61);
  const scene = new THREE.Scene(); scene.environment = envTex;
  const bgc = document.createElement("canvas"); bgc.width = 1920; bgc.height = 1080; const bg = bgc.getContext("2d");
  const gr = bg.createRadialGradient(960, 600, 50, 960, 540, 1100); gr.addColorStop(0, "#2a1458"); gr.addColorStop(0.55, "#0c0820"); gr.addColorStop(1, "#030208"); bg.fillStyle = gr; bg.fillRect(0, 0, 1920, 1080);
  scene.background = canvasTex(bgc);
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 300);
  const { group: word, glyphs } = chromeWord("מושן", { size: 2.0, depth: 0.8, spacing: 1.06 }); word.position.set(0, 0.55, 0); scene.add(word);
  const kL = new THREE.PointLight(0xff3d9a, 80, 30, 1.5); kL.position.set(-6, 3, 6); scene.add(kL);
  const kR = new THREE.PointLight(0x3ddcff, 80, 30, 1.5); kR.position.set(6, -2, 6); scene.add(kR);
  // glitter drifting through
  const N = 1800, pp = new Float32Array(N * 3), cc = new Float32Array(N * 3), G = [];
  const pal = [[1.8, 1.8, 2], [0.4, 1.6, 2], [2, 0.5, 1.6], [2, 1.6, 0.4]];
  for (let i = 0; i < N; i++) { G.push([(rnd() - 0.5) * 30, (rnd() - 0.5) * 18, -2 - rnd() * 18, rnd() * 6.28, 0.3 + rnd()]); cc.set(pal[i % 4], i * 3); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3)); pg.setAttribute("color", new THREE.BufferAttribute(cc, 3));
  scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.06, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

  const hud = new THREE.Scene();
  const words = "רוצים לדעת איך עשיתי את זה?".split(" ");
  const wm = words.map((w) => hudText(w, { font: "900 118px Heebo", pad: 24, shadow: 36, shadowColor: "rgba(0,0,0,.6)" }));
  const gap = 30; const tot = wm.reduce((a, m) => a + m.userData.w - 48, 0) + gap * (wm.length - 1);
  const line1 = new THREE.Group(); let x = tot / 2; wm.forEach((m) => { const w = m.userData.w - 48; m.position.x = x - w / 2; x -= w + gap; line1.add(m); }); hud.add(line1);
  const write = hudText("כתבו ״מושן״ בתגובות", { font: "900 84px Heebo", pad: 20, gradient: ["#7af7ff", "#ffffff", "#ff4fd8"], shadow: 30, shadowColor: "rgba(0,0,0,.6)" }); hud.add(write);
  const finger = hudText("👇", { font: "120px 'Noto Color Emoji'", pad: 10 }); hud.add(finger);
  const handle = hudText("@refaelleviii", { font: "800 50px Heebo", dir: "ltr", color: "rgba(255,255,255,.9)", pad: 10 }); hud.add(handle);
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(1240, 170), new THREE.MeshBasicMaterial({ color: 0xbbbbbb, transparent: true, depthTest: false, toneMapped: false })); hud.add(bar);
  const heart = hudText("❤️", { font: "110px 'Noto Color Emoji'", pad: 10 }); hud.add(heart);
  const states = ["", "מ", "מו", "מוש", "מושן"]; let barTex = [];
  const ready = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "assets/img/avatar.jpg"; })
    .then((im) => { barTex = states.map((s) => canvasTex(commentBar(s, im))); bar.material.map = barTex[0]; bar.material.needsUpdate = true; });

  function update(t) {
    const lt = t - T0;
    wm.forEach((m, i) => { const st = T0 + i * 0.2; const k = seg(t, st, st + 0.22); m.visible = t >= st; m.scale.setScalar(lerp(1.8, 1, E.outExpo(k))); m.material.opacity = clamp(k * 2.5); });
    const up = E.inOutCubic(seg(t, L2 - 0.2, L2 + 0.2));
    line1.position.y = lerp(30, 405, up); line1.scale.setScalar(lerp(1, 0.62, up));
    // chrome word lands on L2, glyph by glyph from deep space
    glyphs.forEach((g, i) => { const j = glyphs.length - 1 - i; const st = L2 + j * 0.05; const k = seg(t, st, st + 0.3); g.visible = t >= st; g.position.z = lerp(-60, 0, E.outExpo(k)); g.rotation.y = lerp((j - 1.5) * 1.2, 0, E.outBack(k)) + Math.sin(t * 2 + j) * 0.08 * seg(t, st + 0.3, st + 0.8); g.rotation.x = lerp(-1, 0, E.outBack(k)); });
    word.rotation.y = Math.sin(t * 1.1) * 0.15; word.position.y = 0.55 + Math.sin(t * 1.6) * 0.06;
    kL.position.x = -6 + Math.sin(t * 2) * 3; kR.position.x = 6 - Math.sin(t * 2) * 3;
    const wk = seg(t, L2 + 0.25, L2 + 0.6); write.visible = t >= L2 + 0.25; write.scale.setScalar(E.outBack(wk)); write.position.set(40, -210, 0);
    finger.visible = write.visible; finger.position.set(-write.userData.w / 2 - 40, -205 - Math.abs(Math.sin((t - L2) * Math.PI / 0.4645)) * 22, 0); finger.scale.setScalar(E.outBack(seg(t, L2 + 0.35, L2 + 0.65)));
    const bk = E.outCubic(seg(t, TYPE0 - 0.25, TYPE0 + 0.1)); bar.visible = t >= TYPE0 - 0.25; bar.position.set(0, lerp(-700, -395, bk), 0);
    const si = Math.min(4, Math.max(0, Math.floor(seg(t, TYPE0 + 0.15, TYPE0 + 0.9) * 4.999))); if (barTex.length && bar.material.map !== barTex[si]) { bar.material.map = barTex[si]; bar.material.needsUpdate = true; }
    handle.visible = bar.visible; handle.position.set(0, lerp(-900, -505, bk), 0);
    const POST = TYPE0 + 1.25; const hk = seg(t, POST, POST + 0.35); heart.visible = t >= POST; heart.scale.setScalar(E.outElastic(hk) * (1 + Math.max(0, 1 - hk) * 0.4)); heart.position.set(-640, -330 + E.outCubic(hk) * 50, 0);
    for (let i = 0; i < N; i++) { const g = G[i]; pp[i * 3] = g[0] + Math.sin(t * g[4] + g[3]) * 0.6; pp[i * 3 + 1] = ((g[1] + t * g[4] * 0.8 + 9) % 18) - 9; pp[i * 3 + 2] = g[2]; }
    pg.attributes.position.needsUpdate = true;
    camera.position.set(Math.sin(lt * 0.5) * 0.5, 0.2, lerp(14, 12.2, E.outCubic(seg(t, T0, T1)))); camera.lookAt(0, 0.3, 0);
  }
  const post = (t) => { const h = t > L2 ? Math.exp(-(t - L2) * 8) : 0; return { bloom: [0.55 + h * 0.6, 0.55, 0.72], chroma: 0.003 + h * 0.02, glitch: h * 0.3 + beatPulse(t, T0, L2) * 0.15 }; };
  return { scene, camera, update, post, hud, ready };
}

export const SHOTS_CTA = [[B(56), makeCTA, "liquid", 0.4]];
