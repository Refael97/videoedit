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
  box(26, 14, 0, 30, 4, 40); box(6, 30, -26, 6, 10, 30); box(4, 26, 24, 5, -8, 16); box(4, 22, 18, 3, -24, 5); box(4, 22, -18, 3, 24, 5);
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
