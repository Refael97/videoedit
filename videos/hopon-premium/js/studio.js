// the pale-grey photo studio every hopon shot lives in (adapted from charta-v2/js/studio.js):
// seamless cyclorama, one soft key with VSM shadows, and a softbox environment that ONLY reflective
// materials see, so the floor keeps its soft shadow instead of burning to white
import { THREE, renderer } from "./core.js";

renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;

export const ACCENT = new THREE.Color("#03b5e5");   // HopOn cyan, measured from the app icon — the only accent
const ACCENT_LIT = new THREE.Color("#0090c0");  // albedo that lands on #03b5e5 on screen under the studio fill
export const BG = new THREE.Color(0xdcdce0);

export const studioEnv = (() => {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(vec3(0.36), vec3(0.13), smoothstep(0.0, 0.7, h)); c = mix(c, vec3(0.62), smoothstep(-0.05, -0.5, h)); gl_FragColor = vec4(c, 1.0); }" })));
  const box = (w, h, x, y, z, I) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(I, I, I), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  box(26, 14, 0, 30, 4, 40); box(6, 30, -26, 6, 10, 30); box(4, 26, 24, 5, -8, 16); box(4, 22, 18, 3, -24, 5); box(4, 22, -18, 3, 24, 5); box(0.8, 30, 20, 4, 14, 9); box(0.8, 30, -20, 4, 14, 7);
  return new THREE.PMREMGenerator(renderer).fromScene(s, 0.035).texture;
})();

export const mats = {
  lacquer: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: studioEnv, color: 0x050506, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5, ...o }),
  ceramic: (color = 0xf2f2f0, o = {}) => new THREE.MeshPhysicalMaterial({ envMap: studioEnv, color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.55, ...o }),
  accent: (o = {}) => new THREE.MeshPhysicalMaterial({ envMap: studioEnv, color: ACCENT_LIT, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9, ...o }),
};

function cycGeometry() {
  const prof = [new THREE.Vector2(30, -1)];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI / 2; prof.push(new THREE.Vector2(-8 - Math.sin(a) * 7, -1 + (1 - Math.cos(a)) * 7)); }
  prof.push(new THREE.Vector2(-15, 30));
  const pos = [], idx = []; prof.forEach((p) => [-60, 60].forEach((x) => pos.push(x, p.y, p.x)));
  for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

export function makeStudio({ floorY = -1, reach = 6, keyPos = [-3, 12, 6], keyI = 1.9, hemiI = 2.3, floorColor = 0xbdbdc2, fog = [18, 44] } = {}) {
  const scene = new THREE.Scene();
  scene.background = BG.clone(); scene.fog = new THREE.Fog(BG, fog[0], fog[1]);
  const floor = new THREE.Mesh(cycGeometry(), new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.6, side: THREE.DoubleSide }));
  floor.position.y = floorY + 1; floor.receiveShadow = true; scene.add(floor);
  const key = new THREE.DirectionalLight(0xffffff, keyI); key.position.set(...keyPos); key.castShadow = true;
  key.shadow.mapSize.set(512, 512); const c = key.shadow.camera; c.left = c.bottom = -reach; c.right = c.top = reach; c.near = 0.5; c.far = 40;
  key.shadow.radius = 26; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;   // "light VSM" from the pipeline audit
  scene.add(key); scene.add(key.target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d8dc, hemiI));
  return { scene, floor, key };
}
export const shadowed = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };

// ── premium layer ─────────────────────────────────────────────────────────────
// soft radial texture used for the light pool, bokeh and glows
export function radialTex(stops = [[0, "rgba(255,255,255,1)"], [0.35, "rgba(255,255,255,0.55)"], [1, "rgba(255,255,255,0)"]], n = 256) {
  const c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d");
  const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr; g.fillRect(0, 0, n, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// a specular glint that travels diagonally across a rounded rect (w×h, corner r). set .u from -0.4 → 1.4
export function makeSweep(w, h, r, strength = 0.75) {
  const m = new THREE.ShaderMaterial({
    uniforms: { u: { value: -1 }, size: { value: new THREE.Vector2(w, h) }, rad: { value: r }, k: { value: strength } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float u, rad, k; uniform vec2 size; varying vec2 vUv;
      float sdRR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      void main(){ vec2 p = (vUv - 0.5) * size; float inside = 1.0 - smoothstep(-0.004, 0.004, sdRR(p, size * 0.5, rad));
        float d = (vUv.x * 0.62 + (1.0 - vUv.y) * 0.38) - u;
        float band = exp(-d * d / 0.0018) + 0.35 * exp(-(d + 0.07) * (d + 0.07) / 0.0004);
        gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) * band * k * inside, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); mesh.renderOrder = 10;
  mesh.userData.set = (x) => { m.uniforms.u.value = x; mesh.visible = x > -0.35 && x < 1.35; };
  mesh.visible = false; return mesh;
}
// studio dressing: a soft area-light pool on the cyc behind the hero, a cool rim light, and drifting
// out-of-focus dust/bokeh at three depths (seeded, pure function of t) for parallax and a shallow-DOF feel
export function premiumDress(scene, rnd) {
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(34, 30), new THREE.MeshBasicMaterial({ map: radialTex([[0, "rgba(255,255,255,0.42)"], [0.45, "rgba(250,252,255,0.16)"], [1, "rgba(255,255,255,0)"]]), transparent: true, depthWrite: false, fog: false }));
  pool.position.set(0, 3.2, -13.5); scene.add(pool);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: radialTex([[0, "rgba(26,174,229,0.36)"], [0.5, "rgba(26,174,229,0.12)"], [1, "rgba(26,174,229,0)"]]), transparent: true, depthWrite: false, fog: false }));
  halo.position.set(0.4, 1.6, -12.8); scene.add(halo);
  const rim = new THREE.DirectionalLight(0xeaf6ff, 2.2); rim.position.set(6, 5, -9); scene.add(rim); scene.add(rim.target);
  const rim2 = new THREE.DirectionalLight(0xffffff, 1.1); rim2.position.set(-7, 3, -6); scene.add(rim2); scene.add(rim2.target);
  const disc = radialTex([[0, "rgba(255,255,255,0.9)"], [0.62, "rgba(255,255,255,0.75)"], [0.78, "rgba(255,255,255,0.95)"], [0.86, "rgba(255,255,255,0.2)"], [1, "rgba(255,255,255,0)"]]);
  const soft = radialTex();
  const motes = [];
  for (let i = 0; i < 40; i++) {
    const near = i < 5, cyan = !near && i % 7 === 3;
    const m = new THREE.SpriteMaterial({ map: near ? disc : soft, color: cyan ? new THREE.Color("#1AAEE5") : new THREE.Color(1, 1, 1), transparent: true, depthWrite: false, fog: false, opacity: near ? 0.07 + rnd() * 0.05 : 0.3 + rnd() * 0.3 });
    const s = new THREE.Sprite(m);
    const base = near ? new THREE.Vector3((rnd() < 0.5 ? -1 : 1) * (1.1 + rnd() * 0.9), (rnd() - 0.5) * 4.6, 6 + rnd() * 2) : new THREE.Vector3((rnd() - 0.5) * 14, -2 + rnd() * 9, -9 + rnd() * 9);
    const sc = near ? 0.22 + rnd() * 0.42 : 0.05 + rnd() * 0.09; s.scale.setScalar(sc);
    s.renderOrder = near ? 20 : 1; scene.add(s);
    motes.push({ s, base, ph: rnd() * 6.28, w: 0.25 + rnd() * 0.35, a: near ? 0.35 : 0.25, rise: near ? 0.025 : 0.05 + rnd() * 0.08 });
  }
  return (t) => {
    motes.forEach((m) => m.s.position.set(m.base.x + Math.sin(t * m.w + m.ph) * m.a, m.base.y + Math.cos(t * m.w * 0.8 + m.ph) * m.a * 0.6 + t * m.rise, m.base.z));
    pool.material.opacity = 0.9 + Math.sin(t * 0.6) * 0.1;
  };
}
