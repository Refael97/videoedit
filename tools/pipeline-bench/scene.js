// representative premium shot: studio cyclorama, VSM soft shadow, lacquer / chrome / ceramic / accent PBR,
// 30k-point particle shell (GPU-animated), canvas HUD, MSAA HalfFloat RT, bloom, neutral tone map, grain.
// Everything is a pure function of the frame index: renderFrame(f) never reads wall-clock, RAF or Math.random.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const mkRnd = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const expoInOut = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;

export function createShot({ canvas, W, H, fps = 30, frames = 60, scale = 1, opts = {} }) {
  const t0 = performance.now();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = !opts.noShadow; renderer.shadowMap.type = THREE.VSMShadowMap;

  // softbox env (PMREM, built once) — given only to reflective materials
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.MeshBasicMaterial({ color: 0x2a2a2e, side: THREE.BackSide })));
  const box = (w, h, x, y, z, I) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(I, I, I), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
  box(26, 14, 0, 30, 4, 40); box(6, 30, -26, 6, 10, 30); box(4, 26, 24, 5, -8, 16);
  const env = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.035).texture;
  const lacquer = new THREE.MeshPhysicalMaterial({ envMap: env, color: 0x050506, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5 });
  const chrome = new THREE.MeshPhysicalMaterial({ envMap: env, color: 0xffffff, metalness: 1, roughness: 0.06, envMapIntensity: 1.35 });
  const ceramic = new THREE.MeshPhysicalMaterial({ envMap: env, color: 0xf2f2f0, roughness: 0.42, clearcoat: 0.35, envMapIntensity: 0.55 });
  const accent = new THREE.MeshPhysicalMaterial({ envMap: env, color: 0xe8743b, roughness: 0.32, clearcoat: 0.8, envMapIntensity: 0.8 });

  const scene = new THREE.Scene(); const BG = new THREE.Color(0xdcdce0);
  scene.background = BG; scene.fog = new THREE.Fog(BG, 16, 40);
  // cyclorama
  const prof = [new THREE.Vector2(30, -1)]; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI / 2; prof.push(new THREE.Vector2(-8 - Math.sin(a) * 7, -1 + (1 - Math.cos(a)) * 7)); } prof.push(new THREE.Vector2(-15, 30));
  const pos = [], idx = []; prof.forEach((p) => [-60, 60].forEach((x) => pos.push(x, p.y, p.x))); for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); cg.setIndex(idx); cg.computeVertexNormals();
  const floor = new THREE.Mesh(cg, new THREE.MeshStandardMaterial({ color: 0xbdbdc2, roughness: 0.6, side: THREE.DoubleSide })); floor.receiveShadow = true; scene.add(floor);
  const key = new THREE.DirectionalLight(0xffffff, 1.9); key.position.set(-2, 12, 2.5); key.castShadow = true; key.shadow.mapSize.set(opts.shadow1k ? 1024 : 2048, opts.shadow1k ? 1024 : 2048);
  const sc = key.shadow.camera; sc.left = sc.bottom = -6; sc.right = sc.top = 6; sc.near = 0.5; sc.far = 40; key.shadow.radius = 16; key.shadow.blurSamples = opts.vsmLite ? 8 : 24; if (opts.vsmLite) key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004;
  scene.add(key, key.target, new THREE.HemisphereLight(0xffffff, 0xd8d8dc, 2.3));
  // hero objects
  const hero = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.6, 1.6, 8, 0.22), lacquer); hero.castShadow = true; scene.add(hero);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 96, 64), chrome); ball.castShadow = true; scene.add(ball);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.06, 32, 200), accent); ring.castShadow = true; scene.add(ring);
  const rnd = mkRnd(7); const tiles = [];
  for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.12, 4, 0.05), ceramic); m.castShadow = true; m.userData.ph = rnd() * 6.28; tiles.push(m); scene.add(m); }
  // particle shell — animated entirely in the vertex shader from uTime
  const N = 30000; const pg = new THREE.BufferGeometry(); const pp = new Float32Array(N * 3), ps = new Float32Array(N);
  for (let i = 0; i < N; i++) { const u = rnd() * 2 - 1, a = rnd() * 6.283; const r = Math.sqrt(1 - u * u); pp.set([r * Math.cos(a), u, r * Math.sin(a)], i * 3); ps[i] = rnd(); }
  pg.setAttribute("position", new THREE.BufferAttribute(pp, 3)); pg.setAttribute("aS", new THREE.BufferAttribute(ps, 1));
  const pmat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uTime: { value: 0 }, uPx: { value: H * 0.9 * scale } },
    vertexShader: "attribute float aS; uniform float uTime, uPx; varying float vA; void main(){ vec3 p = position * (3.2 + 0.12 * sin(position.y * 6.0 + uTime * 2.0 + aS * 6.28)); vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = max(1.0, uPx * 0.012 / -mv.z); vA = 0.25 + 0.5 * aS; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.15, d) * vA; if (a < 0.01) discard; gl_FragColor = vec4(vec3(0.07), a); }" });
  const pts = new THREE.Points(pg, pmat); pts.position.y = 1.4; pts.frustumCulled = false; if (!opts.noParticles) scene.add(pts);
  // HUD (editorial grid) drawn once into a canvas texture
  const hud = new THREE.Scene(); const hudCam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -10, 10);
  const hc = document.createElement("canvas"); hc.width = W; hc.height = H; const g = hc.getContext("2d");
  const S = W / 1080; g.fillStyle = "rgba(18,18,20,.55)"; g.fillRect(60 * S, 120 * S, W - 120 * S, 2 * S);
  g.font = `500 ${26 * S}px JBM, monospace`; g.fillText("HOW A STUDIO SHOT IS BUILT", 60 * S, 100 * S); g.textAlign = "right"; g.fillText("02 / 04", W - 60 * S, 100 * S);
  g.direction = "rtl"; g.font = `800 ${120 * S}px Heebo`; g.fillStyle = "#121214"; g.fillText("סטודיו אחד", W - 60 * S, H - 300 * S);
  g.font = `500 ${40 * S}px Heebo`; g.fillStyle = "#55555c"; g.fillText("חומר אחד, אור אחד, צבע הדגשה אחד.", W - 60 * S, H - 220 * S);
  const ht = new THREE.CanvasTexture(hc); ht.colorSpace = THREE.SRGBColorSpace;
  hud.add(new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: ht, transparent: true, depthTest: false, toneMapped: false })));

  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: opts.noMSAA ? 0 : 4 }));
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  class HudPass extends RenderPass { constructor() { super(hud, hudCam); this.clear = false; } render(r, w, rb) { r.autoClear = false; r.setRenderTarget(rb); r.clearDepth(); r.render(hud, hudCam); r.autoClear = true; } }
  const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.12, 0.3, 0.97); if (!opts.noBloom) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grain = new ShaderPass({ uniforms: { tDiffuse: { value: null }, seed: { value: 0 }, amt: { value: 0.022 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform sampler2D tDiffuse; uniform float seed, amt; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + seed * 61.7) * 43758.5453); } void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; vec2 d = vUv - 0.5; c *= mix(0.82, 1.0, smoothstep(0.9, 0.3, length(d * vec2(0.8, 1.0)))); c += (h(floor(gl_FragCoord.xy)) - 0.5) * amt; gl_FragColor = vec4(c, 1.0); }" });
  composer.addPass(grain);
  // HUD after the post chain? keep it in-chain (like charta) so grain sits on top of the type
  if (!opts.htmlHud) composer.passes.splice(1, 0, new HudPass());

  // camera rig: two stations, expo.inOut, slight orbit
  function rig(t) { const T = frames / fps; const k = expoInOut(clamp(t / T)); const a = -0.6 + k * 1.1;
    camera.position.set(Math.sin(a) * (9 - 2.5 * k), 2.2 + 1.6 * (1 - k), Math.cos(a) * (9 - 2.5 * k)); camera.lookAt(0, 0.9 + 0.3 * k, 0); }

  let calls = 0;
  function renderFrame(f) {
    calls++;
    const t = f / fps;
    hero.position.set(0, 0.8 + 0.08 * Math.sin(t * 2.2), 0); hero.rotation.set(0.35, opts.accum ? hero.rotation.y + 0.03 : t * 0.9, 0.15); // accum = the classic delta-time bug, kept as a negative control
    ball.position.set(1.9 * Math.cos(t * 1.4), 0.55, 1.9 * Math.sin(t * 1.4));
    ring.position.y = 0.95; ring.rotation.set(Math.PI / 2 + 0.25 * Math.sin(t), t * 0.4, 0);
    tiles.forEach((m, i) => { const a = (i / tiles.length) * 6.283 + t * 0.7; m.position.set(Math.cos(a) * 3, 0.7 + 0.6 * Math.sin(a * 2 + m.userData.ph), Math.sin(a) * 3); m.rotation.set(t + i, a, 0); });
    pmat.uniforms.uTime.value = t; grain.uniforms.seed.value = f % 997;
    rig(t); if (opts.staticShadow && f > 0) renderer.shadowMap.autoUpdate = false; composer.render();
  }
  // per-pass timing (each pass synced with a 1px readback) — diagnostics only
  function profileFrame(f) {
    const g = renderer.getContext(), px = new Uint8Array(4), sync = () => g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, px);
    const t = f / fps; renderFrame(f); sync(); // warm with the real state
    const out = {}; let a = performance.now();
    composer.passes.forEach((p, i) => { p.enabled = false; }); composer.render(); sync(); out.emptyComposer = performance.now() - a;
    composer.passes.forEach((p, i) => { p.enabled = true; for (let j = 0; j < composer.passes.length; j++) composer.passes[j].enabled = j <= i; a = performance.now(); composer.render(); sync(); out['upTo_' + i + '_' + p.constructor.name] = performance.now() - a; });
    renderer.setRenderTarget(null); a = performance.now(); renderer.render(scene, camera); sync(); out.sceneToCanvasNoMSAA = performance.now() - a;
    renderer.shadowMap.autoUpdate = false; a = performance.now(); renderer.render(scene, camera); sync(); out.sceneToCanvasNoShadowUpdate = performance.now() - a; renderer.shadowMap.autoUpdate = true;
    const vis = scene.children.map((c) => c.visible); scene.children.forEach((c) => (c.visible = false)); a = performance.now(); renderer.render(scene, camera); sync(); out.emptySceneClearOnly = performance.now() - a; scene.children.forEach((c, i) => (c.visible = vis[i]));
    return out;
  }
  return { renderFrame, profileFrame, renderer, calls: () => calls, buildMs: performance.now() - t0 };
}
