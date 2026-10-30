// the whole film is one studio and one camera. Shot 1 (0–3s, approved) assembles the icon; after that the
// same scene keeps going: the icon steps aside and the phone rises in, then five beats of the app play out on
// it — route planning on a map, the ways to ride, the price + Apple Pay, the digital ticket for inspection —
// and the icon returns for the end lockup. Everything is computed from t only.
import { THREE, seg, lerp, E, B, clamp } from "./core.js";
import { mats, shadowed, ACCENT, makeSweep, premiumDress, radialTex } from "./studio.js";
import { mkRnd } from "./core.js";
import { makeLogo } from "./s1_logo.js";

export const END = 23.0;

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
  const [map, station, ticket] = await Promise.all(["02-map", "06-pay-station", "10-ticket"].map((n) => loadImg(`assets/screens/${n}.png`)));
  const FLOOR = -2.8;

  // ── phone ──
  const phone = new THREE.Group(); scene.add(phone);
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(PW - 0.06, PH - 0.06, 0.25), { depth: PD - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 8, curveSegments: 24 });
  bodyGeo.translate(0, 0, -(PD - 0.06) / 2);
  phone.add(shadowed(new THREE.Mesh(bodyGeo, mats.lacquer({ color: 0x0b0b0d, roughness: 0.14, envMapIntensity: 1.7 }))));
  const T = { map: tex(screenCanvas(map)), station: tex(screenCanvas(station)), ticket: tex(screenCanvas(ticket, "#ffffff")) };
  const screenA = new THREE.MeshBasicMaterial({ map: T.map, transparent: true, color: new THREE.Color(1.07, 1.07, 1.07) });
  const screenB = new THREE.MeshBasicMaterial({ map: T.ticket, transparent: true, opacity: 0, depthWrite: false, color: new THREE.Color(1.07, 1.07, 1.07) });
  const sA = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenA); sA.position.z = SZ; phone.add(sA);
  const sB = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenB); sB.position.z = SZ + 0.0007; phone.add(sB);

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

  const dress = premiumDress(scene, mkRnd(9137));
  const scrSweep = makeSweep(SW, SH, 0.2, 0.55); scrSweep.position.z = SZ + 0.0016; phone.add(scrSweep);
  const iconSweep = makeSweep(2.4, 2.4, 92 / 512 * 2.4, 0.5); iconSweep.position.z = 0.24; icon.add(iconSweep);
  const glowTex = radialTex([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.5)"], [1, "rgba(255,255,255,0)"]]);
  const CY = new THREE.Color("#1AAEE5");
  const glow = (size, c = 3.2) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: CY.clone().multiplyScalar(c), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); s.scale.setScalar(size); s.renderOrder = 12; s.visible = false; return s; };

  // ══ SCENE 2 · the city map draws itself on the studio floor, the camera flies the route ══
  const MW = 9, MH = MW * SH / SW, MZ = 1.0;
  const mapG = new THREE.Group(); scene.add(mapG);       // local XY plane, +z up out of the map
  const mapC = document.createElement("canvas"); mapC.width = 1024; mapC.height = Math.round(1024 * MH / MW); const mg = mapC.getContext("2d");
  const toPx = (x, y) => [(x / MW + 0.5) * mapC.width, (0.5 - y / MH) * mapC.height];
  mg.fillStyle = "#d3dae3"; mg.fillRect(0, 0, mapC.width, mapC.height);
  const ROADX = [-3, -1.5, 0, 1.5, 3], ROADY = [-7.2, -4.8, -2.4, 0, 2.4, 4.8, 7.2];
  mg.fillStyle = "#b9def0"; mg.beginPath(); mg.moveTo(0, mapC.height * 0.08); mg.bezierCurveTo(mapC.width * 0.3, mapC.height * 0.14, mapC.width * 0.1, mapC.height * 0.3, 0, mapC.height * 0.36); mg.fill();   // a bit of water
  mg.strokeStyle = "#ffffff"; mg.lineCap = "round";
  ROADX.forEach((x) => { mg.lineWidth = 26; mg.beginPath(); mg.moveTo(...toPx(x, -MH / 2)); mg.lineTo(...toPx(x, MH / 2)); mg.stroke(); });
  ROADY.forEach((y) => { mg.lineWidth = 22; mg.beginPath(); mg.moveTo(...toPx(-MW / 2, y)); mg.lineTo(...toPx(MW / 2, y)); mg.stroke(); });
  mg.lineWidth = 34; mg.beginPath(); mg.moveTo(...toPx(-MW / 2, -6)); mg.bezierCurveTo(...toPx(-1, -3), ...toPx(1, 3), ...toPx(MW / 2, 6.3)); mg.stroke();   // one diagonal avenue
  const mapTex = tex(mapC);
  const PA = new THREE.Vector2(0, -4.8), PB = new THREE.Vector2(0, 4.8);
  const groundMat = new THREE.MeshStandardMaterial({ map: mapTex, roughness: 0.85, transparent: true });
  const wave = new THREE.Mesh(new THREE.RingGeometry(0.96, 1.0, 96), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(1.3), transparent: true, depthWrite: false })); wave.position.set(PA.x, PA.y, 0.02); mapG.add(wave);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), groundMat); ground.receiveShadow = true; mapG.add(ground);
  // blocks: rounded white towers on the cells between the roads, rising in a wave from point A
  const rndM = mkRnd(7741), cells = [];
  for (let x = -MW / 2 + 0.25; x < MW / 2; x += 0.42) for (let y = -MH / 2 + 0.25; y < MH / 2; y += 0.42) {
    if (ROADX.some((r) => Math.abs(x - r) < 0.32) || ROADY.some((r) => Math.abs(y - r) < 0.3)) continue;
    if (x < -1.9 && y > 3.2) continue;   // water
    cells.push({ x, y, h: 0.1 + Math.pow(rndM(), 1.6) * 0.65 + (rndM() < 0.08 ? 0.5 : 0), d: Math.hypot(x - PA.x, y - PA.y), j: rndM() * 0.15 });
  }
  const boxGeo = new THREE.BoxGeometry(0.32, 0.32, 1); boxGeo.translate(0, 0, 0.5);
  const blocks = new THREE.InstancedMesh(boxGeo, mats.ceramic(0xffffff, { roughness: 0.55, clearcoat: 0.25 }), cells.length); blocks.castShadow = blocks.receiveShadow = true; mapG.add(blocks);
  cells.forEach((c, i) => blocks.setColorAt(i, new THREE.Color().setScalar(0.9 + rndM() * 0.1)));
  const dm = new THREE.Object3D();
  // route along the roads A → B, two pins, a halo and a glowing head
  const routePts = [[0, -4.8], [0, -3.2], [0.15, -2.55], [0.6, -2.4], [1.35, -2.4], [1.5, -2.2], [1.5, -0.2], [1.5, 2.2], [1.3, 2.4], [0.4, 2.4], [0, 2.7], [0, 4.8]];
  const route = new THREE.CatmullRomCurve3(routePts.map(([x, y]) => V(x, y, 0.02)), false, "centripetal");
  const routeGeo = new THREE.TubeGeometry(route, 240, 0.05, 10); const routeN = routeGeo.index.count;
  const routeMesh = new THREE.Mesh(routeGeo, new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(1.15) })); mapG.add(routeMesh);
  const haloGeo = new THREE.TubeGeometry(route, 240, 0.16, 10); const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: CY, transparent: true, opacity: 0.22, depthWrite: false })); mapG.add(halo);
  const head = glow(0.55, 4); mapG.add(head);
  const pinMk = (m) => { const g = new THREE.Group(), cone = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 24), m); cone.rotation.x = -Math.PI / 2; cone.position.z = 0.25; const hd = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 16), m); hd.position.z = 0.6; g.add(cone, hd); mapG.add(g); return g; };
  const pinA = shadowed(pinMk(mats.lacquer())), pinB = shadowed(pinMk(mats.accent({ emissive: ACCENT, emissiveIntensity: 0.3 })));
  pinA.position.set(PA.x, PA.y, 0); pinB.position.set(PB.x, PB.y, 0);
  const ripples = [PA, PB].map((p) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.25, 48), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(1.5), transparent: true, depthWrite: false })); r.position.set(p.x, p.y, 0.03); mapG.add(r); return r; });
  const mapFlat = { p: V(0, FLOOR + 0.01, MZ), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), s: 1 };
  const w2 = (x, y, z = 0) => V(x, FLOOR + 0.01 + z, MZ - y);   // map local → world while the map lies flat

  // ══ SCENE 3 · at the stop: a shelter, and the ride pulls in — bus, train, light rail ══
  const stage = new THREE.Group(); scene.add(stage);
  const white = mats.ceramic(0xf3f3f1, { roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.1 });
  const glass = mats.lacquer({ color: 0x15171b, roughness: 0.08 });
  const SZ_ = -2.7;                                           // vehicles run along x at this depth
  const shelter = new THREE.Group(); stage.add(shelter);
  const post = (x, z) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 16), glass); m.position.set(x, FLOOR + 1.05, z); shelter.add(m); };
  post(-3.4, -0.7); post(-1.8, -0.7); post(-3.4, -1.6); post(-1.8, -1.6);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.2), white); roof.position.set(-2.6, FLOOR + 2.12, -1.15); shelter.add(roof);
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.5, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xdfe9ee, roughness: 0.1, transmission: 0, transparent: true, opacity: 0.45 })); back.position.set(-2.6, FLOOR + 1.2, -1.62); shelter.add(back);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 0.35), white); bench.position.set(-2.6, FLOOR + 0.5, -1.35); shelter.add(bench);
  const signPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.7, 16), glass); signPole.position.set(-1.25, FLOOR + 1.35, -0.6); shelter.add(signPole);
  const sign = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 48), mats.accent({ emissive: ACCENT, emissiveIntensity: 0.25 })); sign.rotation.x = Math.PI / 2; sign.position.set(-1.25, FLOOR + 2.6, -0.6); shelter.add(sign);
  const curb = new THREE.Mesh(new THREE.BoxGeometry(14, 0.12, 0.5), white); curb.position.set(0, FLOOR + 0.06, -1.95); shelter.add(curb);
  shadowed(shelter);
  function vehicle(L, H, kind) {
    const g = new THREE.Group(), W_ = 0.95;
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(L, H, kind === "train" ? 0.42 : 0.24), { depth: W_, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 8, curveSegments: 20 }), white);
    body.position.z = -W_ / 2; g.add(body);
    const win = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(L * 0.9, H * 0.3, 0.1), { depth: W_ + 0.14, bevelEnabled: false, curveSegments: 12 }), glass); win.position.set(0, H * 0.13, -(W_ + 0.14) / 2); g.add(win);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(L * 0.97, 0.06, W_ + 0.15), mats.accent({ emissive: ACCENT, emissiveIntensity: 0.25 })); stripe.position.y = -H * 0.16; g.add(stripe);
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(L * 0.94, 0.12, W_ + 0.13), mats.ceramic(0xc9cbd0)); skirt.position.y = -H / 2 + 0.06; g.add(skirt);
    const n = kind === "bus" ? 2 : 4;
    for (let i = 0; i < n; i++) { const wx = (i / (n - 1) - 0.5) * L * 0.7; const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, W_ + 0.02, 24), glass); wh.rotation.x = Math.PI / 2; wh.position.set(wx, -H / 2 - 0.03, 0); g.add(wh); }
    if (kind !== "bus") { const roofM = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(L * 0.3, 0.12, 0.05), { depth: W_ * 0.6, bevelEnabled: false }), mats.ceramic(0xd9dade)); roofM.position.set(0, H / 2 + 0.06, -W_ * 0.3); g.add(roofM); }
    shadowed(g); g.visible = false; stage.add(g); return g;
  }
  const VEH = [[vehicle(3.3, 1.2, "bus"), 10.75, 11.75], [vehicle(4.5, 1.15, "train"), 11.75, 12.75], [vehicle(4.1, 1.15, "rail"), 12.75, 19.3]];

  // ══ SCENES 4–5 · pay at the vehicle, show the ticket to the scanner ══
  const card = slab(station, [33, 547, 566, 748], 14, 0.05, 0xfdfdfd);
  const pay = slab(station, [51, 875, 549, 958], 10, 0.05, 0xfdfdfd);
  const ringShape = roundedRect(498 / 600 * SW + 0.06, 83 / 1304 * SH + 0.06, 0.1); ringShape.holes.push(roundedRect(498 / 600 * SW + 0.03, 83 / 1304 * SH + 0.03, 0.085));
  const ring = new THREE.Mesh(new THREE.ShapeGeometry(ringShape, 16), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(2.2), transparent: true, depthWrite: false }));
  pay.add(ring); ring.position.z = 0.003;
  const payGlow = glow(1.6, 2.2); pay.add(payGlow); payGlow.position.z = 0.02;
  const tk = slab(ticket, [17, 358, 583, 1008], 16, 0.05, 0x494949);
  const qrC = tk.userData.local(300, 765.5), qrH = 284 / 1304 * SH, qrW = 283 / 600 * SW;
  const beamC = document.createElement("canvas"); beamC.width = 8; beamC.height = 128; const bg = beamC.getContext("2d");
  const gr = bg.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(26,174,229,0)"); gr.addColorStop(0.92, "rgba(26,174,229,0.28)"); gr.addColorStop(0.97, "rgba(26,174,229,1)"); gr.addColorStop(1, "rgba(26,174,229,0)");
  bg.fillStyle = gr; bg.fillRect(0, 0, 8, 128);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(qrW * 1.16, qrH * 0.36), new THREE.MeshBasicMaterial({ map: tex(beamC), transparent: true, depthWrite: false }));
  beam.position.z = 0.004; tk.add(beam);
  const scanGlow = glow(0.9, 3); tk.add(scanGlow);
  const okRing = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.34, 64), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(2), transparent: true, depthWrite: false })); tk.add(okRing); okRing.position.set(qrC.x, qrC.y, 0.01);
  // the inspector's handheld scanner (a device, no people): dark lacquer with a cyan read window
  const scanner = new THREE.Group(); scene.add(scanner);
  const sb = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedRect(0.85, 1.6, 0.18), { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 6, curveSegments: 16 }), mats.lacquer({ color: 0x1a1c20 })); sb.position.z = -0.08; scanner.add(sb);
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(1.6) })); sw.position.set(0, 0.5, 0.115); scanner.add(sw);
  const sScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ color: 0x2a2d33 })); sScreen.position.set(0, -0.2, 0.115); scanner.add(sScreen);
  const sOk = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.17, 48), new THREE.MeshBasicMaterial({ color: CY.clone().multiplyScalar(1.8), transparent: true })); sOk.position.set(0, -0.2, 0.12); scanner.add(sOk);
  shadowed(scanner); scanner.visible = false;

  const SWEEPS = [[9.35, 10.05], [13.95, 14.6], [17.2, 17.9]];
  const PH_HOME = V(0, 0.02, 0.4), ICON_OUT = V(-4.6, 1.3, -1.8), v = new THREE.Vector3(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion();
  const camP = new THREE.Vector3(), camT = new THREE.Vector3(), cP = new THREE.Vector3(), cT = new THREE.Vector3();
  const PHONE_CAM = [V(0.3, 0.35, 10.6), V(0, -0.35, 0)], STOP_CAM = [V(3.0, 1.1, 18.5), V(-0.2, -1.4, -2.0)];

  // camera: one continuous rig blended between shot rigs
  function chase(k) { const p = route.getPoint(clamp(k)), a = route.getPoint(clamp(k + 0.06)); return [w2(p.x, p.y, 0).add(V(0.6, 10.5, 6.5)), w2(a.x, a.y, 0)]; }
  function rig(t, out) {
    // returns [pos, target] for the active shot, blended
    const icon0 = [V(0.9, 0.5, 11.1), V(0, -0.62, 0)];
    const KR0 = 5.75, KR1 = 8.0;
    const kc = E.inOutSine(seg(t, KR0, KR1));
    let A_ = icon0, B_ = icon0, k = 0;
    if (t < 5.75) { A_ = icon0; B_ = chase(0); k = E.inOutCubic(seg(t, 4.9, 5.75)); }
    else if (t < 8.6) { const up = [V(0, FLOOR + 13.5, MZ + 1.6), w2(0, 0.3, 0)]; A_ = chase(kc); B_ = up; k = E.inOutCubic(seg(t, 8.0, 8.6)); }
    else if (t < 10.1) { A_ = [V(0, FLOOR + 13.5, MZ + 1.6), w2(0, 0.3, 0)]; B_ = PHONE_CAM; k = E.inOutCubic(seg(t, 8.6, 9.5)); }
    else if (t < 13.4) { A_ = PHONE_CAM; B_ = [STOP_CAM[0].clone().add(V(-0.6 * seg(t, 10.6, 13.4), 0, -0.5 * seg(t, 10.6, 13.4))), STOP_CAM[1]]; k = E.inOutCubic(seg(t, 10.1, 10.7)); }
    else if (t < 20.2) { A_ = [STOP_CAM[0].clone().add(V(-0.6, 0, -0.5)), STOP_CAM[1]]; B_ = [PHONE_CAM[0].clone().add(V(0.35 * Math.sin(t * 0.35), 0.1 * seg(t, 14, 20), -0.4 * seg(t, 14, 20))), PHONE_CAM[1]]; k = E.inOutCubic(seg(t, 13.4, 14.1)); }
    else { A_ = [PHONE_CAM[0].clone().add(V(0.35 * Math.sin(t * 0.35), 0.1, -0.4)), PHONE_CAM[1]]; B_ = [V(0.55 - 0.5 * seg(t, 20.6, 23), 0.7, 12.4 - 1.9 * E.inOutSine(seg(t, 20.4, 23))), V(0, -0.5, 0)]; k = E.inOutCubic(seg(t, 20.2, 21.2)); }
    out[0].lerpVectors(A_[0], B_[0], k); out[1].lerpVectors(A_[1], B_[1], k);
  }

  function update(t) {
    // ── shot 1: the icon builds behind the text wheel, 2.0 s late ──
    const tl = t - 2.0; s1.update(clamp(tl, 0, 3));
    rig(t, [camP, camT]); camera.position.copy(camP); camera.lookAt(camT);
    icon.visible = t > 2.0 && (t < 6.0 || t > 20.2);
    if (tl > 3) icon.position.y = 0.35 + Math.sin(t * 1.3) * 0.02;
    const kOut = seg(t, 4.95, 5.55), kIn = E.outQuint(seg(t, 20.5, 21.6));
    if (t > 4.95) { const e = kOut * kOut * kOut * (1 - kIn); icon.position.lerp(ICON_OUT, e); icon.rotation.y += e * 0.9; }
    dress(t);
    // fog opens up for the high map shot
    scene.fog.far = lerp(44, 90, Math.sin(Math.PI * seg(t, 7.6, 9.6))); scene.fog.near = lerp(18, 40, Math.sin(Math.PI * seg(t, 7.6, 9.6)));

    // ── map ──
    const kMorph = E.inOutCubic(seg(t, 8.65, 9.45));
    mapG.visible = t > 5.0 && t < 9.5;
    groundMat.opacity = E.outCubic(seg(t, 5.0, 5.4)) * (1 - seg(t, 9.25, 9.45));
    const kw = seg(t, 5.2, 7.2); wave.visible = kw > 0 && kw < 1; wave.scale.setScalar(0.3 + E.outCubic(kw) * 13); wave.material.opacity = (1 - kw) * 0.8;
    // the key light follows the camera over the city so the blocks throw soft shadows
    const { key } = s1;
    if (t > 4.9 && t < 9.5) { key.target.position.copy(camT); key.position.copy(camT).add(v.set(-5, 9, 4)); key.intensity = 2.1; key.shadow.radius = 5; }
    else { key.target.position.set(0, 0, 0); key.position.set(0.8, 14, 2.5); key.intensity = 1.3; key.shadow.radius = 26; }
    cells.forEach((c, i) => {
      const e = E.outQuint(seg(t, 5.25 + c.d * 0.16 + c.j, 5.95 + c.d * 0.16 + c.j)) * (1 - kMorph);
      dm.position.set(c.x, c.y, 0); dm.scale.set(1, 1, Math.max(0.001, c.h * e)); dm.updateMatrix(); blocks.setMatrixAt(i, dm.matrix);
    });
    blocks.instanceMatrix.needsUpdate = true;
    [[pinA, 5.75], [pinB, 8.0]].forEach(([p, at]) => {
      const k = seg(t, at - 0.3, at), e = E.outCubic(k), bounce = t > at ? Math.exp(-(t - at) * 12) * Math.sin((t - at) * 30) * 0.08 : 0;
      p.visible = k > 0 && kMorph < 0.6; p.position.z = (1 - e) * 2.4 + bounce; p.scale.setScalar(lerp(0.4, 1, e) * (1 - kMorph));
    });
    ripples.forEach((r, i) => { const at = i ? 8.0 : 5.75, k = seg(t, at, at + 0.8); r.visible = k > 0 && k < 1; r.scale.setScalar(1 + E.outCubic(k) * 5); r.material.opacity = (1 - k) * 0.9; });
    const kr = E.inOutSine(seg(t, 5.85, 8.0));
    routeMesh.visible = halo.visible = kr > 0;
    routeGeo.setDrawRange(0, Math.floor(kr * routeN / 6) * 6); haloGeo.setDrawRange(0, Math.floor(kr * haloGeo.index.count / 6) * 6);
    head.visible = kr > 0 && t < 8.5;
    if (head.visible) { const hp = route.getPoint(kr); head.position.set(hp.x, hp.y, 0.08); head.material.opacity = 1 - seg(t, 8.0, 8.5); head.scale.setScalar(0.5 + 0.08 * Math.sin(t * 14)); }

    // ── phone ── rises to meet the map card (8.7–9.45), leaves for the stop (10.1–10.6), returns to pay (13.4–14.1), exits for the lockup (20.2–20.9)
    const kRise = E.outQuint(seg(t, 8.6, 9.45)), kL = E.inOutCubic(seg(t, 10.05, 10.6)), kR = E.outQuint(seg(t, 13.35, 14.15)), kExit = seg(t, 20.15, 20.9);
    const kSpin = E.inOutCubic(seg(t, 16.75, 17.45));
    phone.visible = (t > 8.6 && t < 10.6) || (t > 13.35 && kExit < 1);
    if (t < 12) {
      phone.position.set(lerp(0.6, PH_HOME.x, kRise) - 5.5 * kL * kL, lerp(-5.8, PH_HOME.y, kRise) + 1.2 * kL + Math.sin(t * 1.1) * 0.025, PH_HOME.z);
      phone.rotation.set(lerp(0.55, -0.05, kRise), lerp(0.7, -0.14, kRise) - kL * 0.9 + Math.sin(t * 0.8) * 0.03, lerp(-0.25, 0.0, kRise) + kL * 0.3);
    } else {
      phone.position.set(lerp(0.2, PH_HOME.x, kR), lerp(-6.2, PH_HOME.y, kR) + Math.sin(t * 1.1) * 0.025, PH_HOME.z);
      phone.rotation.set(lerp(0.35, -0.05, kR), lerp(0.2, -0.14, kR) + kSpin * Math.PI * 2 + Math.sin(t * 0.8) * 0.03, lerp(0.05, 0.0, kR));
      const ex = kExit * kExit * kExit; phone.position.add(v.set(3.6 * ex, -4.4 * ex, 0.6 * ex)); phone.rotation.y -= ex * 0.9; phone.rotation.z -= ex * 0.25;
    }
    phone.updateMatrixWorld(true);
    // the map card folds into the phone screen: flat on the floor → upright in the screen
    if (mapG.visible) {
      sA.getWorldPosition(v); sA.getWorldQuaternion(q2);
      mapG.position.lerpVectors(mapFlat.p, v.add(V(0, 0, 0.0)), kMorph);
      mapG.quaternion.copy(q.copy(mapFlat.q).slerp(q2, kMorph));
      mapG.scale.setScalar(lerp(1, SW / MW, kMorph));
      mapG.position.add(new THREE.Vector3(0, 0, 0.01).applyQuaternion(q2).multiplyScalar(kMorph));
    }
    screenA.map = t < 12 ? T.map : kSpin < 0.5 ? T.station : T.ticket; screenB.opacity = 0;
    let su = -1; SWEEPS.forEach(([a, b]) => { if (t >= a && t < b) su = lerp(-0.35, 1.35, E.inOutSine(seg(t, a, b))); }); scrSweep.userData.set(su);
    const iw = seg(t, 21.5, 22.3); iconSweep.userData.set(t < 6 ? (seg(t, 4.1, 4.9) > 0 && seg(t, 4.1, 4.9) < 1 ? lerp(-0.35, 1.35, seg(t, 4.1, 4.9)) : -1) : iw > 0 && iw < 1 ? lerp(-0.35, 1.35, E.inOutSine(iw)) : -1);

    // ── the stop ──
    stage.visible = t > 10.0 && t < 20.6;
    shelter.position.x = lerp(-4, 0, E.outQuint(seg(t, 10.05, 10.8))); shelter.visible = t < 14.0; shelter.position.x -= 9 * Math.pow(seg(t, 13.3, 13.9), 3);
    const back_ = E.inOutCubic(seg(t, 13.3, 14.1));
    VEH.forEach(([g, at, out], i) => {
      const kin = E.outExpo(seg(t, at - 0.3, at)), last = i === 2;
      const kout = last ? E.inOutCubic(seg(t, out, out + 1.1)) : Math.pow(seg(t, out - 0.32, out - 0.1), 3);
      g.visible = t > at - 0.3 && kout < 1;
      g.position.set(lerp(13, -0.3, kin) - 16 * kout, FLOOR + 0.2 + 0.6 + Math.sin(t * 9 + i) * 0.003, SZ_ - 3.0 * back_);
      g.rotation.z = (1 - kin) * 0.01;
    });

    // ── pay ──
    const kc2 = E.outQuint(seg(t, 14.1, 14.6)) * (1 - E.inOutCubic(seg(t, 16.4, 16.75)));
    show(card, kc2); card.position.copy(card.userData.home).add(v.set(0.1 * kc2, 0.25 * kc2, 0.6 * kc2)); card.rotation.set(-0.1 * kc2, 0.14 * kc2, 0); card.scale.setScalar(1 + 0.12 * kc2);
    const kp = E.outQuint(seg(t, 14.6, 15.1)) * (1 - E.inOutCubic(seg(t, 16.45, 16.8)));
    const PRESS = 15.5, press = t >= PRESS ? Math.exp(-(t - PRESS) * 14) * Math.min(1, (t - PRESS) * 40) : 0;
    show(pay, kp); pay.position.copy(pay.userData.home).add(v.set(-0.06 * kp, -0.05 * kp, 0.45 * kp - press * 0.12)); pay.rotation.set(0.08 * kp, -0.1 * kp, 0); pay.scale.setScalar((1 + 0.08 * kp) * (1 - press * 0.06));
    const kg = seg(t, PRESS, PRESS + 0.7); ring.visible = kg > 0 && kg < 1; ring.scale.set(1 + kg * 0.22, 1 + kg * 0.9, 1); ring.material.opacity = (1 - E.outCubic(kg)) * 0.95;
    const pg = seg(t, PRESS - 0.05, PRESS + 0.55); payGlow.visible = pg > 0 && pg < 1 && kp > 0.01; payGlow.material.opacity = Math.sin(Math.PI * pg) * 0.8; payGlow.scale.set(1.9 + pg * 0.8, 0.5 + pg * 0.2, 1);

    // ── ticket + scanner ──
    const kt = E.outQuint(seg(t, 17.45, 17.95)) * (1 - E.inOutCubic(seg(t, 19.9, 20.25)));
    show(tk, kt); tk.position.copy(tk.userData.home).add(v.set(-0.08 * kt, 0.12 * kt, 0.62 * kt)); tk.rotation.set(-0.08 * kt, -0.12 * kt, 0); tk.scale.setScalar(1 + 0.1 * kt);
    const SCAN = 18.15, ks = seg(t, SCAN, SCAN + 0.85); beam.visible = ks > 0 && ks < 1;
    beam.position.set(qrC.x, qrC.y + lerp(qrH * 0.55, -qrH * 0.5, E.inOutSine(ks)), 0.004); beam.material.opacity = Math.sin(Math.PI * ks);
    scanGlow.visible = beam.visible; scanGlow.position.set(qrC.x, beam.position.y + qrH * 0.17, 0.01); scanGlow.material.opacity = beam.material.opacity * 0.9; scanGlow.scale.set(qrW * 1.6, 0.18, 1);
    const ko = seg(t, 19.0, 19.7); okRing.visible = ko > 0 && ko < 1; okRing.scale.setScalar(1 + E.outCubic(ko) * 2.2); okRing.material.opacity = (1 - ko);
    const kS = E.outQuint(seg(t, 17.6, 18.15)), kSo = E.inOutCubic(seg(t, 19.6, 20.2));
    scanner.visible = kS > 0 && kSo < 1;
    scanner.position.set(lerp(4.2, 0.95, kS) + 3.5 * kSo * kSo, lerp(-2.2, -0.75, kS), 1.1); scanner.scale.setScalar(0.72); scanner.rotation.set(0.1, lerp(-1.0, -0.42, kS), lerp(-0.5, 0.12, kS));
    sOk.material.opacity = seg(t, 19.0, 19.15); sw.material.color.copy(CY).multiplyScalar(1.2 + 1.2 * Math.sin(Math.PI * ks));

    camera.rotateZ(Math.sin(t * 0.42) * 0.008);
    camera.updateMatrixWorld(true);
  }
  const lv = new THREE.Vector3();
  function labels(t) {
    const out = [];
    [[pinA, 5.9, 8.55], [pinB, 8.1, 8.55]].forEach(([p, a, b]) => { p.getWorldPosition(lv); lv.y += 0.9; lv.project(camera);
      out.push({ x: clamp((lv.x * 0.5 + 0.5) * 1080, 150, 930), y: Math.min(1180, (0.5 - lv.y * 0.5) * 1920), k: E.outCubic(seg(t, a, a + 0.35)) * (1 - seg(t, b, b + 0.25)) }); });
    return out;
  }
  return { scene, camera, update, labels, post: s1.post };
}
