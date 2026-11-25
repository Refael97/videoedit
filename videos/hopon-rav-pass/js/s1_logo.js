// shot 1 (0–3s): the HopOn app icon assembles itself in the studio. A white ceramic plate turns to camera,
// then the icon's own parts fly in and lock on the beats: finder rings → lines → dashes + grey blocks → cyan.
// Geometry is traced from assets/icon.png (512² px), so the result is the real mark, not an approximation.
import { THREE, seg, lerp, E, B, mkRnd, iconShape, rect } from "./core.js";
import { makeStudio, mats, shadowed } from "./studio.js";

const SIZE = 2.4;                       // plate edge in world units
const FACE = 0.13;                      // plate front face (z) the parts lock onto

// [name, points, radius/radii, material, depth, beat it locks on]
const PARTS = [
  ["ringTL", rect(75, 80, 182, 188), 10, "ink", 0.05, 1, rect(93, 98, 165, 170)],
  ["ringTR", rect(328, 80, 436, 188), 10, "ink", 0.05, 1, rect(346, 98, 418, 170)],
  ["ringBL", rect(75, 324, 182, 431), 10, "ink", 0.05, 1, rect(93, 342, 165, 414)],
  ["bar", rect(182, 150, 271, 168), 0.5, "ink", 0.05, 2],
  ["hook", [[270, 81], [287, 81], [287, 207], [436, 207], [436, 225], [270, 225]], [8.5, 8.5, 1, 9, 9, 18], "ink", 0.05, 2],
  ["stem", rect(330, 224, 347, 315), 0.5, "ink", 0.05, 2],
  ["rail", [[237, 314], [436, 314], [436, 332], [237, 332]], [0.5, 9, 9, 0.5], "ink", 0.05, 2],
  ["elbow", [[75, 280], [238, 280], [238, 431], [221, 431], [221, 297], [75, 297]], [8.5, 18, 8.5, 8.5, 1, 8.5], "ink", 0.05, 2],
  ["dashA", rect(110, 199, 146, 214), 7, "ink", 0.05, 3], ["dashB", rect(110, 227, 146, 241), 7, "ink", 0.05, 3], ["dashC", rect(110, 254, 146, 269), 7, "ink", 0.05, 3],
  ["tickA", rect(258, 369, 273, 404), 7, "ink", 0.05, 3], ["tickB", rect(287, 369, 302, 404), 7, "ink", 0.05, 3], ["tickC", rect(317, 369, 332, 404), 7, "ink", 0.05, 3],
  ["greyL1", [[197, 84], [245, 84], [245, 108], [218, 108], [218, 137], [197, 137]], [8, 8, 8, 6, 8, 8], "grey", 0.04, 3],
  ["greyL2", [[358, 239], [436, 239], [436, 295], [400, 295], [400, 265], [358, 265]], [8, 8, 8, 8, 6, 8], "grey", 0.04, 3],
  ["greyBox", rect(280, 247, 317, 302), 9, "grey", 0.04, 3],
  ["cyanTL", rect(103, 109, 153, 159), 9, "cyan", 0.065, 4], ["cyanTR", rect(357, 109, 407, 159), 9, "cyan", 0.065, 4],
  ["cyanBL", rect(103, 352, 153, 402), 9, "cyan", 0.065, 4], ["cyanBig", rect(357, 352, 436, 431), 9, "cyan", 0.075, 4],
];
const FLY = 0.55;                       // seconds of flight before each lock

export function makeLogo() {
  const { scene, key } = makeStudio({ floorY: -2.8, reach: 4, keyPos: [0.8, 14, 2.5], keyI: 1.3, hemiI: 2.75 });
  const camera = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 100);
  const M = { ink: mats.lacquer(), grey: mats.ceramic(0x8f8f94, { roughness: 0.34, clearcoat: 0.6 }), cyan: mats.accent() };

  // the plate: the app icon's white rounded square, as matte ceramic with a soft bevel
  const icon = new THREE.Group(); scene.add(icon);
  const plateGeo = new THREE.ExtrudeGeometry(iconShape(rect(0, 0, 512, 512), 92, SIZE), { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 8, curveSegments: 24 });
  plateGeo.translate(0, 0, -0.09);
  const plate = shadowed(new THREE.Mesh(plateGeo, mats.ceramic(0xefefed, { roughness: 0.45, clearcoat: 0.55, clearcoatRoughness: 0.18 }))); icon.add(plate);

  const rnd = mkRnd(4217);
  const parts = PARTS.map(([name, pts, r, m, depth, beat, hole], i) => {
    const shape = iconShape(pts, r, SIZE); if (hole) shape.holes.push(iconShape(hole, 3, SIZE));
    const bev = Math.min(0.012, depth * 0.3);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 4, curveSegments: 12 });
    geo.computeBoundingBox(); const c = new THREE.Vector3(); geo.boundingBox.getCenter(c); geo.translate(-c.x, -c.y, 0);
    const mesh = shadowed(new THREE.Mesh(geo, M[m])); icon.add(mesh);
    const home = new THREE.Vector3(c.x, c.y, FACE);
    // each part starts off-plate: pushed out radially + towards camera, tumbled; groups stagger a few frames apart
    const dir = new THREE.Vector3(c.x, c.y, 0).normalize(); if (!isFinite(dir.x)) dir.set(0, 1, 0);
    const from = home.clone().add(new THREE.Vector3(dir.x * (1.4 + rnd() * 1.2), dir.y * (1.4 + rnd() * 1.2) + 0.4, 2.2 + rnd() * 2.2));
    const rot = new THREE.Euler((rnd() - 0.5) * 3.2, (rnd() - 0.5) * 3.2, (rnd() - 0.5) * 2.4);
    const lock = B(beat) + (i % 7) * 0.025;
    return { name, mesh, home, from, rot, lock };
  });

  const target = new THREE.Vector3(0, -0.62, 0);
  function update(t) {
    // plate: rises out of a quarter turn into a slight three-quarter hero angle and keeps breathing
    const k0 = E.outQuint(seg(t, 0, 0.9));
    icon.position.set(0, lerp(-0.5, 0.35, k0) + Math.sin(t * 1.3) * 0.02, 0);
    icon.rotation.set(lerp(-0.55, -0.1, k0), lerp(0.9, -0.2, k0) + seg(t, 0.9, 3) * 0.08, lerp(-0.12, 0.03, k0));

    parts.forEach((p) => {
      const k = seg(t, p.lock - FLY, p.lock); const e = E.outQuint(k);
      p.mesh.visible = t > p.lock - FLY;
      p.mesh.position.lerpVectors(p.from, p.home, e);
      // lock: a 2-frame press into the plate and back, so every hit reads physically
      const press = Math.exp(-Math.max(0, t - p.lock) * 28) * (t >= p.lock ? 1 : 0);
      p.mesh.position.z -= press * 0.018;
      p.mesh.rotation.set(p.rot.x * (1 - e), p.rot.y * (1 - e), p.rot.z * (1 - e));
      const s = lerp(0.6, 1, E.outCubic(k)); p.mesh.scale.setScalar(s);
    });

    // camera: one continuous move — a slow orbit from low-left into the hero framing while pushing in
    const kc = E.inOutSine(seg(t, 0, 3));
    camera.position.set(lerp(-2.6, 0.9, kc), lerp(-1.1, 0.5, kc), lerp(12.8, 11.1, kc));
    camera.lookAt(target);
    key.target.position.set(0, 0, 0);
  }
  return { scene, camera, update, icon, key, post: () => ({ bloom: [0.08, 0.3, 0.98], grain: 0.022, vig: 0.32 }) };
}
