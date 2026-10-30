// the whole film is one studio and one camera. Shot 1 (0–3s, approved) assembles the icon; after that the
// same scene keeps going: the icon steps aside and the phone rises in, then five beats of the app play out on
// it — route planning on a map, the ways to ride, the price + Apple Pay, the digital ticket for inspection —
// and the icon returns for the end lockup. Everything is computed from t only.
import { THREE, seg, lerp, E, B } from "./core.js";
import { mats, shadowed, ACCENT, makeSweep, premiumDress, radialTex } from "./studio.js";
import { mkRnd } from "./core.js";
import { makeLogo } from "./s1_logo.js";

export const END = 20.4;

// phone: proportions of the 600×1304 screen captures, black lacquer body
const SW = 1.48, SH = SW * 1304 / 600, PW = SW + 0.09, PH = SH + 0.09, PD = 0.14, SZ = PD / 2 + 0.031;
const px2 = (x, y) => new THREE.Vector2((x - 300) / 600 * SW, (652 - y) / 1304 * SH);

function roundedRect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function rrPath(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// screen texture at 2× with a clean iOS status bar (9:41, full bars, full battery) and the Dynamic Island
function screenCanvas(img, ink = "#0c0c0e") {
  const k = 2, c = document.createElement("canvas"); c.width = 600 * k; c.height = 1304 * k; const g = c.getContext("2d");
  g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, c.width, c.height); g.scale(k, k);
  g.fillStyle = "#000"; rrPath(g, 214, 22, 172, 50, 25); g.fill();
  g.fillStyle = ink; g.strokeStyle = ink; g.font = "600 31px -apple-system, 'Noto Sans Hebrew', sans-serif"; g.textBaseline = "middle"; g.textAlign = "center";
  g.fillText("9:41", 486, 48);
  [0, 1, 2, 3].forEach((i) => { const h = 7 + i * 4; rrPath(g, 66 + i * 9, 56 - h, 6, h, 1.5); g.fill(); });        // signal
  g.lineWidth = 3.4; g.lineCap = "round"; [14, 9].forEach((r) => { g.beginPath(); g.arc(122, 59, r, -Math.PI * 0.75, -Math.PI * 0.25); g.stroke(); });
  g.beginPath(); g.arc(122, 57, 2.6, 0, Math.PI * 2); g.fill();                                                        // wifi
  g.lineWidth = 2; g.globalAlpha = 0.45; rrPath(g, 146, 39, 38, 18, 5); g.stroke(); g.globalAlpha = 1;
  rrPath(g, 149, 42, 32, 12, 3); g.fill(); g.globalAlpha = 0.45; rrPath(g, 186, 45, 3, 6, 1.5); g.fill(); g.globalAlpha = 1; // battery
  return c;
}
// one UI element cut out of a screen capture (2×, rounded alpha corners), in the 600×1304 screen space
function cropCanvas(img, x0, y0, x1, y1, r) {
  const k = 2, c = document.createElement("canvas"); c.width = (x1 - x0) * k; c.height = (y1 - y0) * k; const g = c.getContext("2d");
  g.scale(k, k); rrPath(g, 0, 0, x1 - x0, y1 - y0, r); g.clip(); g.imageSmoothingQuality = "high"; g.drawImage(img, -x0, -y0, 600, 1304); return c;
}
// piecewise camera path: [t, position, target], eased between keys
function camPath(keys) {
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  return (t, cam) => {
    let i = keys.findIndex((k) => k[0] > t); if (i < 0) i = keys.length; i = Math.max(1, Math.min(keys.length - 1, i));
    const [t0, p0, q0] = keys[i - 1], [t1, p1, q1] = keys[i], k = E.inOutSine(seg(t, t0, t1));
    cam.position.copy(p.lerpVectors(p0, p1, k)); cam.lookAt(q.lerpVectors(q0, q1, k));
  };
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export async function makeFilm() {
  const s1 = makeLogo(); const { scene, camera, icon } = s1;
  const [map, menu, station, ticket] = await Promise.all(["02-map", "03-pay-menu", "06-pay-station", "10-ticket"].map((n) => loadImg(`assets/screens/${n}.png`)));

  // ── phone ──
  const phone = new THREE.Group(); scene.add(phone);
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(PW - 0.06, PH - 0.06, 0.25), { depth: PD - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 8, curveSegments: 24 });
  bodyGeo.translate(0, 0, -(PD - 0.06) / 2);
  phone.add(shadowed(new THREE.Mesh(bodyGeo, mats.lacquer({ color: 0x0b0b0d, roughness: 0.14, envMapIntensity: 1.7 }))));
  const T = { map: tex(screenCanvas(map)), menu: tex(screenCanvas(menu)), station: tex(screenCanvas(station)), ticket: tex(screenCanvas(ticket, "#ffffff")) };
  // two stacked screen layers: the top one cross-fades in when the app changes screen
  const screenA = new THREE.MeshBasicMaterial({ map: T.map, transparent: true, color: new THREE.Color(1.07, 1.07, 1.07) });
  const screenB = new THREE.MeshBasicMaterial({ map: T.menu, transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(1.07, 1.07, 1.07) });
  const sA = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenA); sA.position.z = SZ; phone.add(sA);
  const sB = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenB); sB.position.z = SZ + 0.0007; phone.add(sB);

  // ── UI slabs that lift off the screen; the screen keeps an empty slot so nothing doubles up ──
  const slab = (img, rect, r, depth = 0.04, slotColor = 0xefeff2) => {
    const [x0, y0, x1, y1] = rect, w = (x1 - x0) / 600 * SW, h = (y1 - y0) / 1304 * SH;
    const g = new THREE.Group();
    const side = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(w, h, Math.min(w, h) * 0.12), { depth, bevelEnabled: false, curveSegments: 10 }), mats.ceramic(0xf6f6f4));
    side.position.z = -depth; g.add(shadowed(side));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(cropCanvas(img, x0, y0, x1, y1, r)), transparent: true, color: new THREE.Color(1.07, 1.07, 1.07) }));
    face.position.z = 0.001; g.add(face);
    const c = px2((x0 + x1) / 2, (y0 + y1) / 2); g.userData.home = new THREE.Vector3(c.x, c.y, SZ + depth * 0.5);
    g.userData.local = (px, py) => new THREE.Vector2((px - (x0 + x1) / 2) / 600 * SW, ((y0 + y1) / 2 - py) / 1304 * SH);
    const slot = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(w, h, Math.min(w, h) * 0.12), 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(slotColor).multiplyScalar(1.07) }));
    slot.position.set(c.x, c.y, SZ + 0.0015); slot.visible = false; phone.add(slot); g.userData.slot = slot;
    g.visible = false; phone.add(g); return g;
  };
  const show = (g, k) => { g.visible = g.userData.slot.visible = k > 0.001; };

  // 1 · route planning: the map lifts off and lies back like a table; two pins drop, a cyan route draws between them
  const mapSlab = slab(map, [0, 100, 600, 580], 22, 0.04, 0xe9e9eb);
  const pin = (material) => {
    const g = new THREE.Group(), cone = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.17, 24), material);
    cone.rotation.x = -Math.PI / 2; cone.position.z = 0.085; const head = new THREE.Mesh(new THREE.SphereGeometry(0.062, 32, 16), material);
    head.position.z = 0.2; g.add(cone, head); shadowed(g); g.visible = false; mapSlab.add(g); return g;
  };
  const pinA = pin(mats.lacquer()), pinB = pin(mats.accent());
  const A = mapSlab.userData.local(298, 413), Bp = mapSlab.userData.local(480, 190);
  pinA.position.set(A.x, A.y, 0.001); pinB.position.set(Bp.x, Bp.y, 0.001);
  const route = new THREE.CatmullRomCurve3([[298, 413], [318, 360], [352, 322], [420, 300], [452, 250], [476, 205], [480, 190]]
    .map(([x, y]) => { const p = mapSlab.userData.local(x, y); return V(p.x, p.y, 0.014); }));
  const routeGeo = new THREE.TubeGeometry(route, 160, 0.015, 10); const routeN = routeGeo.index.count;
  const routeMesh = new THREE.Mesh(routeGeo, mats.accent({ roughness: 0.35 })); mapSlab.add(routeMesh);

  // 2 · ways to ride: bus, train, light rail rows lift one per beat
  const rows = [[272, 384, B(14), 0.22, 0.16], [408, 520, B(15), -0.2, -0.14], [544, 656, B(16), 0.16, 0.12]]
    .map(([y0, y1, at, dx, ry]) => ({ g: slab(menu, [18, y0, 581, y1], 14), at, dx, ry }));
  // 3 · price + Apple Pay
  const card = slab(station, [33, 547, 566, 748], 14, 0.05, 0xfdfdfd);
  const pay = slab(station, [51, 875, 549, 958], 10, 0.05, 0xfdfdfd);
  const ringShape = roundedRect(498 / 600 * SW + 0.06, 83 / 1304 * SH + 0.06, 0.1); ringShape.holes.push(roundedRect(498 / 600 * SW + 0.03, 83 / 1304 * SH + 0.03, 0.085));
  const ring = new THREE.Mesh(new THREE.ShapeGeometry(ringShape, 16), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, depthWrite: false }));
  pay.add(ring); ring.position.z = 0.003;
  // 4 · the digital ticket for inspection, with a scan line passing over its code
  const tk = slab(ticket, [17, 358, 583, 1008], 16, 0.05, 0x494949);
  const qrC = tk.userData.local(300, 765.5), qrH = 284 / 1304 * SH, qrW = 283 / 600 * SW;
  const beamC = document.createElement("canvas"); beamC.width = 8; beamC.height = 128; const bg = beamC.getContext("2d");
  const gr = bg.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(3,181,229,0)"); gr.addColorStop(0.92, "rgba(3,181,229,0.28)"); gr.addColorStop(0.97, "rgba(3,181,229,1)"); gr.addColorStop(1, "rgba(3,181,229,0)");
  bg.fillStyle = gr; bg.fillRect(0, 0, 8, 128);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(qrW * 1.16, qrH * 0.36), new THREE.MeshBasicMaterial({ map: tex(beamC), transparent: true, depthWrite: false }));
  beam.position.z = 0.004; tk.add(beam);


  // ── premium: studio dressing, glints, glows ──
  const dress = premiumDress(scene, mkRnd(9137));
  const scrSweep = makeSweep(SW, SH, 0.2, 0.55); scrSweep.position.z = SZ + 0.0016; phone.add(scrSweep);
  const iconSweep = makeSweep(2.4, 2.4, 92 / 512 * 2.4, 0.5); iconSweep.position.z = 0.24; icon.add(iconSweep);
  const glowTex = radialTex([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.5)"], [1, "rgba(255,255,255,0)"]]);
  const glow = (size, c = 3.2) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color("#1AAEE5").multiplyScalar(c), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); s.scale.setScalar(size); s.renderOrder = 12; s.visible = false; return s; };
  // route: soft halo tube under the line + a glowing head that rides the draw front
  const haloGeo = new THREE.TubeGeometry(route, 160, 0.05, 10); const halo2 = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color("#1AAEE5"), transparent: true, opacity: 0.22, depthWrite: false })); mapSlab.add(halo2);
  const head = glow(0.42, 4); mapSlab.add(head);
  const ripples = [A, Bp].map((p) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.085, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color("#1AAEE5").multiplyScalar(1.6), transparent: true, depthWrite: false })); r.position.set(p.x, p.y, 0.006); r.visible = false; mapSlab.add(r); return r; });
  const payGlow = glow(1.6, 2.2); pay.add(payGlow); payGlow.position.z = 0.02;
  const scanGlow = glow(0.9, 3); tk.add(scanGlow);
  ring.material.color = new THREE.Color("#1AAEE5").multiplyScalar(2.2);
  const SWEEPS = [[3.95, 4.75], [6.45, 7.15], [8.15, 8.85], [10.5, 11.2], [12.95, 13.65], [14.9, 15.6]];
  const PH_HOME = V(0, 0.02, 0.4), ICON_OUT = V(-4.6, 1.3, -1.8), v = new THREE.Vector3();
  const camera_ = camPath([
    [3.0, V(0.9, 0.5, 11.1), V(0, -0.62, 0)],                            // end of shot 1
    [4.3, V(0.25, 1.75, 10.5), V(0, -0.2, 0)], [6.2, V(0.05, 1.55, 10.6), V(0, -0.25, 0)],   // look down onto the map
    [7.0, V(-0.45, 0.25, 10.7), V(0, -0.5, 0)], [9.7, V(-0.2, 0.3, 10.8), V(0, -0.5, 0)],
    [12.6, V(0.55, 0.4, 10.75), V(0, -0.5, 0)], [13.6, V(-0.3, 0.55, 10.3), V(0, -0.4, 0)],
    [16.4, V(-0.15, 0.45, 10.5), V(0, -0.5, 0)], [END, V(0.55, 0.7, 12.3), V(0, -0.62, 0)],
  ]);

  // screen schedule: [from, to, start, end] cross-fades; the spin swaps menu → station while the back faces camera
  const FADES = [[T.map, T.menu, 6.3, 6.7], [T.station, T.ticket, 12.6, 13.0]];

  function update(t) {
    s1.update(Math.min(t, 3));
    if (t > 3) icon.position.y = 0.35 + Math.sin(t * 1.3) * 0.02;   // keep the plate breathing past shot 1

    // icon steps aside for the phone, then comes back for the lockup
    const kOut = seg(t, 3.0, 3.7), kIn = E.outQuint(seg(t, 16.7, 17.8));
    if (t > 3) { const e = kOut * kOut * kOut * (1 - kIn); icon.position.lerp(ICON_OUT, e); icon.rotation.y += e * 0.9; }

    // phone: rises in, spins to the payment screen, exits for the lockup
    const kRise = E.outQuint(seg(t, 3.05, 3.95)), kSpin = E.inOutCubic(seg(t, 9.8, 10.55)), kExit = seg(t, 16.45, 17.3);
    phone.visible = t > 3.0 && kExit < 1;
    phone.position.set(lerp(0.6, PH_HOME.x, kRise), lerp(-5.8, PH_HOME.y, kRise) + Math.sin(t * 1.1) * 0.025, PH_HOME.z);
    phone.rotation.set(lerp(0.55, -0.05, kRise), lerp(0.7, -0.14, kRise) + kSpin * Math.PI * 2 + Math.sin(t * 0.8) * 0.03, lerp(-0.25, 0.0, kRise));
    const ex = kExit * kExit * kExit;
    phone.position.add(v.set(3.6 * ex, -4.4 * ex, 0.6 * ex)); phone.rotation.y -= ex * 0.9; phone.rotation.z -= ex * 0.25;

    // which screen is showing
    let base = t < 6.3 ? T.map : kSpin < 0.5 ? T.menu : t < 12.6 ? T.station : T.ticket; screenB.opacity = 0;
    FADES.forEach(([a, b, t0, t1]) => { if (t >= t0 && t < t1) { base = a; screenB.map = b; screenB.opacity = E.inOutSine(seg(t, t0, t1)); } });
    screenA.map = base;

    // 1 · map
    const km = E.outQuint(seg(t, 3.9, B(9))) * (1 - E.inOutCubic(seg(t, 5.95, 6.4)));
    show(mapSlab, km);
    mapSlab.position.copy(mapSlab.userData.home).add(v.set(0, 0.3 * km, 0.75 * km)); mapSlab.rotation.set(-1.0 * km, 0, 0); mapSlab.scale.setScalar(1 + 0.4 * km);
    [[pinA, B(9)], [pinB, B(10)]].forEach(([p, at]) => {
      const k = seg(t, at - 0.3, at), e = E.outCubic(k), bounce = t > at ? Math.exp(-(t - at) * 12) * Math.sin((t - at) * 30) * 0.03 : 0;
      p.visible = k > 0 && km > 0.5; p.position.z = 0.001 + (1 - e) * 0.9 + bounce; p.scale.setScalar(lerp(0.4, 1, e));
    });
    const kr = E.inOutCubic(seg(t, B(10), B(10) + 0.85)); routeMesh.visible = kr > 0 && km > 0.5;
    routeGeo.setDrawRange(0, Math.floor(kr * routeN / 6) * 6);

    // 2 · rows lift one per beat, hover, drop back before the spin
    rows.forEach((r, i) => {
      const up = E.outQuint(seg(t, r.at - 0.4, r.at)), dn = E.inOutCubic(seg(t, 9.25 + i * 0.06, 9.7 + i * 0.06)), k = up * (1 - dn);
      show(r.g, k);
      r.g.position.copy(r.g.userData.home).add(v.set(r.dx * k, (r.g.userData.home.y * 0.28) * k, (0.55 + i * 0.06) * k));
      r.g.rotation.set(-0.12 * k, r.ry * k, 0); r.g.scale.setScalar(1 + 0.12 * k);
    });

    // 3 · price card + Apple Pay, then the press at B(24)
    const kc = E.outQuint(seg(t, 10.6, B(22))) * (1 - E.inOutCubic(seg(t, 12.3, 12.7)));
    show(card, kc); card.position.copy(card.userData.home).add(v.set(0.1 * kc, 0.25 * kc, 0.6 * kc)); card.rotation.set(-0.1 * kc, 0.14 * kc, 0); card.scale.setScalar(1 + 0.12 * kc);
    const kp = E.outQuint(seg(t, 11.15, B(23))) * (1 - E.inOutCubic(seg(t, 12.35, 12.75)));
    const press = t >= B(24) ? Math.exp(-(t - B(24)) * 14) * Math.min(1, (t - B(24)) * 40) : 0;
    show(pay, kp); pay.position.copy(pay.userData.home).add(v.set(-0.06 * kp, -0.05 * kp, 0.45 * kp - press * 0.12)); pay.rotation.set(0.08 * kp, -0.1 * kp, 0);
    pay.scale.setScalar((1 + 0.08 * kp) * (1 - press * 0.06));
    const kg = seg(t, B(24), B(24) + 0.7); ring.visible = kg > 0 && kg < 1;
    ring.scale.set(1 + kg * 0.22, 1 + kg * 0.9, 1); ring.material.opacity = (1 - E.outCubic(kg)) * 0.95;

    // 4 · ticket lifts, the scan line passes over the code on the beat
    const kt = E.outQuint(seg(t, 13.05, B(27))) * (1 - E.inOutCubic(seg(t, 16.05, 16.45)));
    show(tk, kt); tk.position.copy(tk.userData.home).add(v.set(0.04 * kt, 0.12 * kt, 0.62 * kt)); tk.rotation.set(-0.08 * kt, 0.16 * kt, 0); tk.scale.setScalar(1 + 0.1 * kt);
    const ks = seg(t, B(28), B(28) + 0.9); beam.visible = ks > 0 && ks < 1;
    beam.position.set(qrC.x, qrC.y + lerp(qrH * 0.55, -qrH * 0.5, E.inOutSine(ks)), 0.004);
    beam.material.opacity = Math.sin(Math.PI * ks);


    // ── premium per-frame ──
    dress(t);
    let su = -1; SWEEPS.forEach(([a, b]) => { if (t >= a && t < b) su = lerp(-0.35, 1.35, E.inOutSine(seg(t, a, b))); }); scrSweep.userData.set(su);
    const iw = t < 3 ? seg(t, 2.15, 2.95) : seg(t, 17.95, 18.85); iconSweep.userData.set(iw > 0 && iw < 1 ? lerp(-0.35, 1.35, E.inOutSine(iw)) : -1);
    halo2.visible = routeMesh.visible; halo2.geometry.setDrawRange(0, Math.floor(kr * haloGeo.index.count / 6) * 6); halo2.material.opacity = 0.2 * km;
    head.visible = routeMesh.visible && kr < 1.0 || (km > 0.5 && t > B(10) && t < B(10) + 1.3);
    if (head.visible) { const hp = route.getPoint(Math.min(1, kr)); head.position.set(hp.x, hp.y, hp.z + 0.02); const pulse = kr >= 1 ? Math.max(0, 1 - (t - B(10) - 0.85) / 0.45) : 1; head.material.opacity = pulse * km; head.scale.setScalar(0.34 + 0.12 * Math.sin(t * 14) * 0.5 + (kr >= 1 ? 0.3 * (1 - pulse) : 0)); }
    [[ripples[0], B(9)], [ripples[1], B(10)]].forEach(([r, at]) => { const k = seg(t, at, at + 0.7); r.visible = k > 0 && k < 1 && km > 0.5; r.scale.setScalar(1 + E.outCubic(k) * 4); r.material.opacity = (1 - k) * 0.9; });
    const pg = seg(t, B(24) - 0.05, B(24) + 0.55); payGlow.visible = pg > 0 && pg < 1 && kp > 0.01; payGlow.material.opacity = Math.sin(Math.PI * pg) * 0.8; payGlow.scale.set(1.9 + pg * 0.8, 0.5 + pg * 0.2, 1);
    scanGlow.visible = beam.visible; scanGlow.position.set(qrC.x, beam.position.y + qrH * 0.17, 0.01); scanGlow.material.opacity = beam.material.opacity * 0.9; scanGlow.scale.set(qrW * 1.6, 0.18, 1);
    if (t > 3) camera_(t, camera);
    camera.rotateZ(Math.sin(t * 0.42) * 0.008);   // a breath of dutch roll: reads as a real camera on a slider
  }
  return { scene, camera, update, post: s1.post, dress };
}
