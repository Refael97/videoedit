// Fable 5.2 launch film — one pale studio, one camera travelling through six stations along a clay line.
// Everything is a pure function of film time `t` (seconds): renderAt(t) poses the 3D scene and seeks the type overlay.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const W = 1080, H = 1920, DUR = 23.2;
const O = 0.8;                      // narration starts here; every `v(...)` time below is on the narration clock
const v = (s) => s + O;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outBack: (x) => { const c1 = 1.55, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

const INK = "#141413", PAPER = "#f5f2ea", CLAY = "#c9562c", CLAY3D = "#a04a2a", LINE = "#e2ddd0";

async function build() {
  await Promise.all(['900 80px "Heebo"', '700 80px "Heebo"', '500 80px "Heebo"', '500 40px "Mono"', '700 40px "Mono"', '700 80px "Serif"'].map((f) => document.fonts.load(f, "אבג Fable 5.2")));

  const canvas = document.getElementById("gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;

  // ---------- studio: softbox environment that ONLY the glossy materials see, so the floor keeps its soft shadows ----------
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(vec3(0.36), vec3(0.13), smoothstep(0.0, 0.7, h)); c = mix(c, vec3(0.62), smoothstep(-0.05, -0.5, h)); gl_FragColor = vec4(c, 1.0); }" })));
  const sbox = (w, h, x, y, z, I) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(I, I, I), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
  sbox(26, 14, 0, 30, 4, 40); sbox(6, 30, -26, 6, 10, 30); sbox(4, 26, 24, 5, -8, 16); sbox(4, 22, 18, 3, -24, 5); sbox(4, 22, -18, 3, 24, 5); sbox(10, 16, 4, 8, 30, 9);
  const env = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.035).texture;
  const M = {
    lacquer: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: env, color: 0x050506, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5, ...o }),
    ceramic: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: env, color: 0xf3f1ec, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.55, ...o }),
    chrome: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: env, color: 0xffffff, metalness: 1, roughness: 0.07, envMapIntensity: 1.35, ...o }),
    clay: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: env, color: new THREE.Color(CLAY3D), roughness: 0.34, clearcoat: 0.9, clearcoatRoughness: 0.12, envMapIntensity: 0.7, ...o }),
  };
  const BG = new THREE.Color(0xe2e1e3);
  const scene = new THREE.Scene(); scene.background = BG; scene.fog = new THREE.Fog(BG, 10, 30);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0xbfbfc4, roughness: 0.6 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5; key.shadow.camera.far = 140; key.shadow.radius = 14; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;
  scene.add(key); scene.add(key.target); scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8dc, 2.3));
  const cast = (o) => { o.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return o; };

  // ---------- type as textures (real fonts, proper Hebrew shaping) ----------
  const texOf = (c) => { const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx; };
  const plane = (c, hgt) => new THREE.Mesh(new THREE.PlaneGeometry((hgt * c.width) / c.height, hgt), new THREE.MeshBasicMaterial({ map: texOf(c), transparent: true, depthWrite: false, toneMapped: false }));
  const label = (text, font, color, hgt, dir = "ltr") => {
    const c = document.createElement("canvas"); let g = c.getContext("2d"); g.font = font; const px = parseFloat(font.match(/(\d+)px/)[1]);
    c.width = Math.ceil(g.measureText(text).width + px * 0.5); c.height = Math.ceil(px * 1.4); g = c.getContext("2d");
    g.font = font; g.direction = dir; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = color; g.fillText(text, c.width / 2, c.height / 2 + px * 0.04);
    return plane(c, hgt);
  };
  const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const RAYS = [[0, 45], [31, 37], [58, 43], [92, 35], [119, 45], [152, 38], [178, 44], [211, 36], [240, 45], [268, 37], [301, 43], [329, 36]];
  const sparkIcon = (g, cx, cy, s) => { g.save(); g.strokeStyle = CLAY; g.lineWidth = s * 0.17; g.lineCap = "round"; RAYS.forEach(([a, r]) => { const q = (a * Math.PI) / 180; g.beginPath(); g.moveTo(cx + Math.cos(q) * s * 0.2, cy + Math.sin(q) * s * 0.2); g.lineTo(cx + Math.cos(q) * s * r / 45, cy + Math.sin(q) * s * r / 45); g.stroke(); }); g.restore(); };

  // ---------- the route: stations alternate left / right of one spine that runs into the depth of the studio ----------
  const ST = [[0, 0], [2.4, -6], [-2.4, -12], [2.4, -18], [-2.4, -24], [2.4, -30]];
  const FRONT = [1.0, 1.25, 1.2, 2.15, 1.35, 1.75];
  const sp = [new THREE.Vector3(0, 0, FRONT[0])], bIdx = [0];
  for (let i = 1; i < ST.length; i++) { const [x, z] = ST[i], s = Math.sign(x), f = FRONT[i];
    sp.push(new THREE.Vector3(x - s * 2.0, 0, z + f + 1.1)); bIdx.push(sp.length); sp.push(new THREE.Vector3(x, 0, z + f), new THREE.Vector3(x + s * 2.0, 0, z + f - 0.9), new THREE.Vector3(x + s * 2.35, 0, z - 1.3)); }
  sp.push(new THREE.Vector3(0, 0, ST[5][1] - 3.6));
  const spine = new THREE.CatmullRomCurve3(sp, false, "catmullrom", 0.5);
  const TUBE_N = 1400, TUBE_R = 10;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(spine, TUBE_N, 0.03, TUBE_R, false), M.clay({ roughness: 0.36 }));
  tube.position.y = 0.03; tube.castShadow = true; scene.add(tube);
  const bead = cast(new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 20), M.clay())); scene.add(bead);
  // spine parameter (0..1) at each station, found by nearest z
  const uAt = bIdx.map((bi) => { if (!bi) return 0; let best = 0, bd = 1e9; for (let k = 0; k <= 4000; k++) { const d = spine.getPointAt(k / 4000).distanceTo(sp[bi]); if (d < bd) { bd = d; best = k / 4000; } } return best; });

  // ---------- station 0: the mark ----------
  const mark = new THREE.Group(); const markRays = [];
  RAYS.forEach(([a, r]) => { const len = (r / 45) * 0.62; const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.058, len, 8, 20), M.clay()); m.scale.z = 0.62; const q = (a * Math.PI) / 180;
    m.position.set(Math.cos(q) * (0.15 + len / 2), Math.sin(q) * (0.15 + len / 2), 0); m.rotation.z = q - Math.PI / 2; mark.add(m); markRays.push(m); });
  cast(mark); scene.add(mark);

  // ---------- station 1: a lacquer slab showing the model list; the Fable 5.2 row lifts off it ----------
  const drawRow = (g, x, y, w, h, name, on, withCheck) => {
    if (on) { g.fillStyle = "#f6e6da"; rr(g, x, y, w, h, 34); g.fill(); }
    if (on) sparkIcon(g, x + 62, y + h / 2, 26); else { g.fillStyle = "#cfc8b8"; g.beginPath(); g.arc(x + 62, y + h / 2, 9, 0, 7); g.fill(); }
    g.font = '700 56px "Heebo"'; g.fillStyle = "#2b2925"; g.textAlign = "left"; g.textBaseline = "middle"; g.direction = "ltr"; g.fillText(name, x + 112, y + h / 2 + 3);
    if (on) { const tw = g.measureText(name).width; g.fillStyle = CLAY; rr(g, x + 112 + tw + 22, y + h / 2 - 23, 92, 46, 12); g.fill(); g.font = '700 26px "Mono"'; g.fillStyle = "#fff"; g.fillText("NEW", x + 112 + tw + 43, y + h / 2 + 2); }
    if (withCheck) { g.strokeStyle = CLAY; g.lineWidth = 7; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(x + w - 84, y + h / 2 + 2); g.lineTo(x + w - 66, y + h / 2 + 20); g.lineTo(x + w - 36, y + h / 2 - 16); g.stroke(); }
  };
  const drawScreen = (picked) => {
    const c = document.createElement("canvas"); c.width = 820; c.height = 1270; const g = c.getContext("2d");
    g.fillStyle = PAPER; rr(g, 0, 0, 820, 1270, 56); g.fill();
    g.fillStyle = "#d9d3c5"; [52, 86, 120].forEach((x) => { g.beginPath(); g.arc(x, 50, 10, 0, 7); g.fill(); });
    g.font = '500 30px "Mono"'; g.fillStyle = "#8a8578"; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText("Claude", 772, 52); sparkIcon(g, 628, 50, 15);
    g.strokeStyle = LINE; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, 100); g.lineTo(820, 100); g.stroke();
    g.font = '700 80px "Serif"'; g.fillStyle = "#2b2925"; g.textAlign = "center"; g.direction = "rtl"; g.fillText("מה בונים היום?", 410, 215);
    g.fillStyle = "#fff"; rr(g, 40, 300, 740, 190, 40); g.fill(); g.strokeStyle = LINE; g.lineWidth = 2.5; g.stroke();
    g.font = '500 40px "Heebo"'; g.fillStyle = "#a39e92"; g.textAlign = "right"; g.fillText("כתבו כאן…", 740, 356);
    g.fillStyle = "#f0ebe0"; rr(g, 64, 406, 262, 64, 20); g.fill();
    g.font = '700 33px "Heebo"'; g.fillStyle = "#3a3833"; g.textAlign = "left"; g.direction = "ltr"; g.fillText(picked ? "Fable 5.2" : "Opus 5.5", 88, 440);
    g.strokeStyle = "#3a3833"; g.lineWidth = 4; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(272, 433); g.lineTo(284, 445); g.lineTo(296, 433); g.stroke();
    g.fillStyle = "#fff"; rr(g, 40, 530, 740, 632, 40); g.fill(); g.strokeStyle = LINE; g.lineWidth = 2.5; g.stroke();
    ["Fable 5.2", "Opus 5.5", "Sonnet 5.5", "Haiku 5.5"].forEach((n, i) => drawRow(g, 56, 546 + i * 150, 708, 138, n, i === 0 && picked, i === 0 && picked));
    if (!picked) { sparkIcon(g, 118, 615, 26); }
    return c;
  };
  const slab = new THREE.Group(); slab.position.set(ST[1][0], 0, ST[1][1]);
  const slabBody = new THREE.Mesh(new RoundedBoxGeometry(1.8, 2.7, 0.16, 8, 0.07), M.lacquer()); slabBody.position.y = 1.37; slab.add(slabBody);
  const scrA = plane(drawScreen(false), 2.54), scrB = plane(drawScreen(true), 2.54);
  scrA.position.set(0, 1.37, 0.0815); scrB.position.set(0, 1.37, 0.083); slab.add(scrA, scrB);
  const tagC = document.createElement("canvas"); tagC.width = 708; tagC.height = 138; drawRow(tagC.getContext("2d"), 0, 0, 708, 138, "Fable 5.2", true, false);
  const tag = new THREE.Group(); const tagBody = new THREE.Mesh(new RoundedBoxGeometry(1.416, 0.276, 0.05, 6, 0.024), M.ceramic({ color: 0xf6e6da })); const tagFace = plane(tagC, 0.276); tagFace.position.z = 0.0262;
  tag.add(tagBody, tagFace); slab.add(tag); cast(slab); scene.add(slab);

  // ---------- station 2: FrontierCode 2.0, three bars to scale from zero ----------
  const BARS = [["GPT-6 Astra", 42.8], ["Opus 5.5", 45.5], ["Fable 5.2", 49.1]];
  const bars = new THREE.Group(); bars.position.set(ST[2][0], 0, ST[2][1]);
  const barObjs = BARS.map(([name, val], i) => {
    const hgt = (val / 49.1) * 2.3, hero = i === 2;
    const g = new THREE.BoxGeometry(0.5, 1, 0.5); g.translate(0, 0.5, 0);
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.5, hgt, 0.5, 6, 0.035), hero ? M.clay() : M.ceramic()); m.geometry.translate(0, hgt / 2, 0); m.position.x = (i - 1) * 0.78; bars.add(m);
    const num = label(val.toFixed(1) + "%", '700 ' + (hero ? 96 : 72) + 'px "Mono"', hero ? CLAY : "#3c3a36", hero ? 0.3 : 0.22); num.position.set(m.position.x, hgt + 0.26, 0); bars.add(num);
    const nm = label(name, '500 60px "Mono"', "#4a4741", 0.15); nm.rotation.x = -Math.PI / 2 + 0.5; nm.position.set(m.position.x, 0.09, 0.56); bars.add(nm);
    return { m, num, nm, hgt };
  });
  cast(bars); scene.add(bars);

  // ---------- station 3: one lead agent, a thousand subagents ----------
  const NA = 1000, agents = new THREE.Group(); agents.position.set(ST[3][0], 0, ST[3][1]);
  const lead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), M.clay()); agents.add(lead);
  const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.041, 16, 12), M.lacquer({ roughness: 0.12 }), NA); inst.castShadow = true; inst.frustumCulled = false; agents.add(inst);
  const AG = []; for (let i = 0; i < NA; i++) { const r = 0.34 + 1.42 * Math.sqrt((i + 0.5) / NA), a = i * 2.399963; AG.push([Math.cos(a) * r, Math.sin(a) * r, r]); }
  cast(lead); scene.add(agents); const dummy = new THREE.Object3D();

  // ---------- station 4: eight days, eight slabs; the sun moves while they rise ----------
  const days = new THREE.Group(); days.position.set(ST[4][0], 0, ST[4][1]);
  const dayObjs = []; for (let i = 0; i < 8; i++) {
    const g = new THREE.Group(); g.position.set(-1.12 + i * 0.32, 0, 0.5 - i * 0.14);
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.24, 1.25, 0.09, 4, 0.02), i === 7 ? M.clay() : M.lacquer()); m.position.y = 0.625; g.add(m);
    const n = label("0" + (i + 1), '700 64px "Mono"', "#f4f1ea", 0.085); n.position.set(0, 1.1, 0.047); g.add(n);
    days.add(g); dayObjs.push(g);
  }
  cast(days); scene.add(days);

  // ---------- station 5: a race (5.2 goes 30% further in the same time) and a stack of ten coins that becomes eight ----------
  const deal = new THREE.Group(); deal.position.set(ST[5][0], 0, ST[5][1]);
  const mkTrack = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.014, 0.04), M.lacquer({ roughness: 0.4 })); m.position.set(0.1, 0.007, z); deal.add(m); return m; };
  mkTrack(1.0); mkTrack(0.56);
  const run51 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 40, 28), M.ceramic()), run52 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 40, 28), M.clay()); deal.add(run51, run52);
  const l51 = label("5.1", '500 60px "Mono"', "#4a4741", 0.16), l52 = label("5.2", '700 60px "Mono"', CLAY, 0.16);
  [l51, l52].forEach((l, i) => { l.rotation.x = -Math.PI / 2 + 0.5; l.position.set(-1.42, 0.09, i ? 0.62 : 1.06); deal.add(l); });
  const coins = []; for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.075, 72), M.chrome()); deal.add(c); coins.push(c); }
  cast(deal); scene.add(deal);

  // ---------- camera: a pose per station, expo moves between them, a slow push-in while it rests ----------
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.1, 400);
  const TAN = Math.tan((17 * Math.PI) / 180);
  // frame an object of height `oh` whose top is `top`, so it sits in the lower part of the story frame under the type
  const pose = (i, top, oh, ow, { frac = 0.4, topAt = 0.46, lift = 0.9, side = 0.42, dz = 0 } = {}) => {
    const vis = Math.max(oh / frac, (ow / 0.82) * (H / W)), dist = vis / (2 * TAN), ty = top - (0.5 - topAt) * vis;
    const [x, z] = ST[i]; return { p: new THREE.Vector3(x - Math.sign(x || 1) * side * (x ? 1 : 0), ty + lift, z + dz + dist), q: new THREE.Vector3(x, ty, z + dz), vis };
  };
  const POSES = [
    pose(0, 1.86, 1.8, 1.8, { lift: 0.5, frac: 0.36, topAt: 0.5 }),
    pose(1, 2.72, 2.75, 1.9, { frac: 0.45, topAt: 0.44, lift: 0.7 }),
    pose(2, 2.72, 2.8, 2.2, { frac: 0.42, topAt: 0.45, lift: 1.0 }),
    pose(3, 0.2, 1.6, 3.7, { topAt: 0.58, lift: 5.4, side: 0.3, dz: -0.2 }),
    pose(4, 1.3, 1.5, 2.7, { topAt: 0.55, lift: 1.7, dz: -0.2 }),
    pose(5, 0.9, 1.5, 3.05, { topAt: 0.56, lift: 2.6, dz: 0.25, side: 0.2 }),
    { p: new THREE.Vector3(0.5, 34, 31), q: new THREE.Vector3(0, 0, -24), vis: 40 },
  ];
  const MOVES = [[v(2.0), 0.85], [v(6.45), 0.78], [v(8.2), 0.72], [v(10.3), 0.72], [v(12.6), 0.72], [v(15.3), 2.3]];
  const ARR = [0, ...MOVES.map(([a, d]) => a + d)];
  const tmpP = new THREE.Vector3(), tmpQ = new THREE.Vector3(), pA = new THREE.Vector3(), qA = new THREE.Vector3();
  const held = (i, t, outP, outQ) => { const P = POSES[i], k = clamp((t - ARR[i]) * 0.012 + 0.0, -0.02, 0.09); outP.copy(P.p).lerp(P.q, i === 6 ? k * 0.6 : k); outQ.copy(P.q); const s = Math.sin((t - ARR[i]) * 0.5) * 0.06; if (i < 6) outP.x += s; };
  // station progress as a float: 0 at station 0, 1 at station 1 ...
  const stage = (t) => { let s = 0; MOVES.forEach(([a, d], i) => { const k = seg(t, a, a + d); s = Math.max(s, k > 0 ? i + (i === 5 ? E.inOutCubic(k) : E.inOutExpo(k)) : 0); }); return s; };

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const bokeh = new BokehPass(scene, camera, { focus: 9, aperture: 0.0011, maxblur: 0.0055 }); composer.addPass(bokeh);
  composer.addPass(new OutputPass());
  const lens = new ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time) * 43758.5453); }
      void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; c *= mix(0.9, 1.0, smoothstep(1.05, 0.35, length((vUv - 0.5) * vec2(0.9, 1.0))));
        c += (hash(floor(vUv * vec2(1080.0, 1920.0))) - 0.5) * 0.016; gl_FragColor = vec4(c, 1.0); }` });
  composer.addPass(lens);

  const ov = window.__overlay;      // paused GSAP timeline for the type layer (built in index.html)
  const cnt = document.getElementById("cnt"), numEl = document.getElementById("n1000");
  const CNT = ["00 / 05", "01 / 05", "02 / 05", "03 / 05", "04 / 05", "05 / 05", "05 / 05"];
  const focus = new THREE.Vector3(); let lastReach = 0;

  function renderAt(t) {
    t = clamp(t, 0, DUR - 1e-4);
    const st = stage(t), si = Math.min(5, Math.floor(st)), sk = st - si;

    // camera
    held(si, t, tmpP, tmpQ);
    if (sk > 0) { held(si + 1, t, pA, qA); tmpP.lerp(pA, sk); tmpQ.lerp(qA, sk); if (si < 5) tmpP.y += Math.sin(sk * Math.PI) * 0.5; }
    camera.position.copy(tmpP); camera.lookAt(tmpQ);
    const far = st > 5 ? E.inOutCubic(st - 5) : 0;
    scene.fog.near = lerp(10, 48, far); scene.fog.far = lerp(30, 110, far);
    bokeh.uniforms.focus.value = camera.position.distanceTo(tmpQ); bokeh.uniforms.aperture.value = lerp(0.0011, 0.00002, far);

    // key light follows the action; its azimuth swings while the days pass (station 4)
    const sun = E.inOutSine(seg(t, v(10.7), v(12.5))) * 1.15, az = -0.675 + sun;
    focus.set(lerp(tmpQ.x, 0, far), 0, lerp(tmpQ.z, -14, far));
    key.position.set(focus.x + Math.sin(az) * 3.2, 12, focus.z + Math.cos(az) * 3.2).sub(focus).multiplyScalar(lerp(1, 4.5, far)).add(focus); key.target.position.copy(focus);
    const reach = lerp(5.5, 24, far); if (Math.abs(reach - lastReach) > 0.01) { const c = key.shadow.camera; c.left = c.bottom = -reach; c.right = c.top = reach; c.updateProjectionMatrix(); lastReach = reach; }
    key.shadow.radius = lerp(14, 5, far);

    // the line: drawn up to the camera's progress along the route
    const drawK = E.inOutSine(seg(t, v(1.46), v(2.0)));
    let u = 0.012 * drawK;
    if (st > 0) u = lerp(Math.max(0.012, uAt[si]), uAt[Math.min(5, si + 1)], si < 5 ? sk : 0);
    if (st >= 5) u = lerp(uAt[5], 1, E.outCubic(seg(t, v(15.3), v(16.6))));
    tube.geometry.setDrawRange(0, Math.floor(u * TUBE_N) * TUBE_R * 6);
    const hp = spine.getPointAt(clamp(u)); bead.position.set(hp.x, 0.075, hp.z); bead.visible = t > v(1.46);
    tube.scale.set(1, 1, 1); tube.material.roughness = 0.36;

    // 0 the mark drops, settles, breathes; pulses on "הוא כאן"
    const fall = E.inCubic(seg(t, 0.02, 0.5)), bounce = Math.sin(seg(t, 0.5, 0.95) * Math.PI) * 0.14 * (1 - seg(t, 0.5, 0.95));
    const here = Math.sin(seg(t, v(1.46), v(1.95)) * Math.PI) * 0.09;
    mark.position.set(0, lerp(4.6, 0.95, fall) + bounce, 0); mark.rotation.z = -0.5 + t * 0.32 + (1 - fall) * 2.2; mark.rotation.y = Math.sin(t * 0.6) * 0.16;
    mark.scale.setScalar(1 + here);

    [slab, bars, agents, days, deal].forEach((g, i) => { g.visible = t >= MOVES[i][0]; });
    slab.scale.setScalar(Math.max(0.001, E.outCubic(seg(t, MOVES[0][0] + 0.1, MOVES[0][0] + 0.75))));
    // 1 slab turns toward the lens; the row lifts off, the selection lands
    const a1 = ARR[1];
    slab.rotation.y = lerp(-0.62, -0.2, E.outCubic(seg(t, a1 - 0.7, a1 + 2.2))) + Math.sin((t - a1) * 0.45) * 0.03;
    slabBody.rotation.x = 0;
    const pk = seg(t, v(4.3), v(4.85)), pe = E.outBack(pk), picked = seg(t, v(4.76), v(4.98));
    scrB.material.opacity = picked; scrA.material.opacity = 1;
    tag.visible = pk > 0; tag.position.set(lerp(0, 0.16, pe), lerp(1.41, 2.02, pe) + Math.sin((t - v(4.8)) * 1.3) * 0.02 * pk, lerp(0.11, 1.05, pe));
    tag.scale.setScalar(lerp(1, 1.16, pe) * (1 - 0.06 * Math.sin(seg(t, v(4.76), v(4.96)) * Math.PI))); tag.rotation.y = lerp(0, 0.22, pe); tag.rotation.x = lerp(0, -0.08, pe);

    // 2 bars grow to scale
    barObjs.forEach((b, i) => { const k = E.outCubic(seg(t, v(6.92) + i * 0.16, v(7.5) + i * 0.16)); b.m.scale.y = Math.max(0.001, k); b.m.visible = k > 0;
      b.num.position.y = b.hgt * k + 0.26; b.num.material.opacity = seg(k, 0.5, 1); b.nm.material.opacity = seg(t, v(6.8) + i * 0.1, v(7.1) + i * 0.1); });

    // 3 the lead agent lands, a thousand subagents pop outward in a wave and keep rippling
    const a3 = v(8.72), lk = E.outBack(seg(t, a3 - 0.25, a3 + 0.2)); lead.scale.setScalar(Math.max(0.001, lk)); lead.position.y = 0.2;
    for (let i = 0; i < NA; i++) { const [x, z, r] = AG[i]; const k = seg(t, a3 + ((r - 0.34) / 1.42) * 0.95, a3 + ((r - 0.34) / 1.42) * 0.95 + 0.34); const s = k <= 0 ? 0.0001 : E.outBack(k);
      const rip = Math.max(0, Math.sin(r * 5.2 - (t - a3) * 5.5)) * 0.035 * seg(t, a3 + 1.0, a3 + 1.5);
      dummy.position.set(x, 0.041 + Math.sin(k * Math.PI) * 0.1 + rip, z); dummy.scale.setScalar(s); dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix); }
    inst.instanceMatrix.needsUpdate = true;

    // 4 a slab per day
    dayObjs.forEach((g, i) => { const k = E.outCubic(seg(t, v(10.72) + i * 0.19, v(11.12) + i * 0.19)); g.scale.set(1, Math.max(0.001, k), 1); g.visible = k > 0; });

    // 5 the race, then the coins
    const rk = E.inOutSine(seg(t, v(13.0), v(13.95)));
    run51.position.set(-1.1 + 1.7 * rk, 0.16, 1.0); run52.position.set(-1.1 + 2.21 * rk, 0.16, 0.56);
    const rin = E.outBack(seg(t, v(12.75), v(13.05))); run51.scale.setScalar(Math.max(0.001, rin)); run52.scale.setScalar(Math.max(0.001, rin));
    l51.material.opacity = l52.material.opacity = seg(t, v(12.8), v(13.1));
    coins.forEach((c, i) => { const k = seg(t, v(14.15) + i * 0.045, v(14.5) + i * 0.045), d = E.inCubic(k); const off = i >= 8 ? E.inOutCubic(seg(t, v(14.86) + (9 - i) * 0.08, v(15.3) + (9 - i) * 0.08)) : 0;
      c.visible = k > 0 && off < 1; c.position.set(off * 1.15, 0.0375 + i * 0.08 + (1 - d) * 0.75 + Math.sin(off * Math.PI) * 0.3 - off * i * 0.08 * 0.0, -0.55 + off * 0.25); c.rotation.z = -off * 1.2; c.scale.setScalar(1 - E.inCubic(off)); });

    lens.uniforms.time.value = Math.floor(t * 60);
    composer.render();

    // type overlay
    cnt.textContent = CNT[Math.min(6, Math.round(st))];
    numEl.textContent = Math.round(lerp(1, 1000, E.outCubic(seg(t, v(9.08), v(9.95))))).toLocaleString("en-US");
    ov.seek(t, false);
  }
  window.__renderAt = renderAt;
  renderAt(window.__hfThreeTime || 0);
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
}
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["fable"] = build();
