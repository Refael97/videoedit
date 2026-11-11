// Scene 2 of the Fable 5.2 showcase (6.4 s -> 10.6 s): premium motion graphics, one continuous camera move.
//   burst    the orb exhales and the camera dives through its dots
//   word     the dots gather into "MOTION" and bake into black lacquer letters; the camera tracks along them, low
//   board    the letters fold away and a small design board builds on the floor (bars, ring, counter card, spheres, a drawn curve)
//   frame    a 16:9 frame draws around the board, fills with light, and the camera pushes into it (hand-off to the VFX shot)
export function initScene2({ THREE, RoundedBoxGeometry, scene, renderer, rnd, H, DPR, FOV, word, T2 }) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const outCubic = (x) => 1 - Math.pow(1 - x, 3);
  const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const inCubic = (x) => x * x * x;
  const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const backOut = (x, s = 1.7) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2));

  const FLOOR = -0.55, WORD_W = 7.2, SC = WORD_W / word.width, OFFX = -word.width / 2, DEPTH = 0.5;
  const T = { burst: T2 + 0.15, gather: T2 + 0.5, bake: T2 + 1.15, fold: T2 + 1.8, board: T2 + 1.95, frame: T2 + 2.95, fill: T2 + 3.55, end: T2 + 4.2 };

  // ---------- light: a dark room with warm softboxes (reflections only), one key light for shadows ----------
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({ side: THREE.BackSide,
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "varying vec3 vP; void main(){ float h = vP.y; vec3 c = mix(vec3(0.05,0.04,0.035), vec3(0.012), smoothstep(-0.2, 0.8, h)); gl_FragColor = vec4(c, 1.0); }" })));
  const soft = (w, h, x, y, z, r, g, b) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
  soft(26, 12, 0, 30, 6, 26, 23, 19);      // big cream top light
  soft(5, 30, -26, 6, 10, 26, 10, 3.2);    // tall amber strip, left
  soft(4, 26, 24, 5, 6, 12, 10.5, 9);      // cream strip, right
  soft(30, 3, 0, 2, 30, 5, 2.2, 0.9);      // low warm fill in front
  const envTex = new THREE.PMREMGenerator(renderer).fromScene(envScene, 0.03).texture;
  const key = new THREE.DirectionalLight(0xfff0e0, 0); key.position.set(-3.5, 9, 4.5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = key.shadow.camera.bottom = -7; key.shadow.camera.right = key.shadow.camera.top = 7; key.shadow.radius = 14; key.shadow.blurSamples = 20; key.shadow.bias = -0.0005;
  const hemi = new THREE.HemisphereLight(0x9a8676, 0x0b0808, 0);
  scene.add(key, hemi);

  const lacquer = (extra = {}) => new THREE.MeshPhysicalMaterial({ envMap: envTex, color: 0x040404, roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.5, ...extra });
  // on a dark stage the objects are light: matte white ceramic and chrome, with one amber accent
  const ceramic = (extra = {}) => new THREE.MeshPhysicalMaterial({ envMap: envTex, color: 0xefe9e1, roughness: 0.5, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.55, ...extra });
  const chrome = () => new THREE.MeshStandardMaterial({ envMap: envTex, color: 0xffffff, metalness: 1, roughness: 0.07, envMapIntensity: 1.7 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xff8a3c, emissive: 0xff6418, emissiveIntensity: 1.35, roughness: 0.45 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x131011, roughness: 0.46, metalness: 0, envMap: envTex, envMapIntensity: 0.22, transparent: true, opacity: 0 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR - 0.002; floor.receiveShadow = true; floor.visible = false; scene.add(floor);

  // ---------- the word: real extruded letters from the font outlines ----------
  const letters = [];
  word.glyphs.forEach((g) => {
    const sp = new THREE.ShapePath(); const X = (x) => (g.x + x + OFFX) * SC, Y = (y) => y * SC;
    g.cmds.forEach((c) => {
      if (c[0] === "M") sp.moveTo(X(c[1]), Y(c[2])); else if (c[0] === "L") sp.lineTo(X(c[1]), Y(c[2]));
      else if (c[0] === "Q") sp.quadraticCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4])); else if (c[0] === "C") sp.bezierCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]), X(c[5]), Y(c[6]));
    });
    const geo = new THREE.ExtrudeGeometry(sp.toShapes(false), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.028, bevelSegments: 5, curveSegments: 18 });
    geo.computeBoundingBox(); const c = geo.boundingBox.getCenter(new THREE.Vector3()); geo.translate(-c.x, -c.y, -c.z);
    const m = new THREE.Mesh(geo, ceramic({ transparent: true, opacity: 0 })); m.castShadow = true; m.userData.home = new THREE.Vector3(c.x, c.y + FLOOR + 0.03, 0); m.position.copy(m.userData.home); m.visible = false;
    scene.add(m); letters.push(m);
  });

  // ---------- the dots that become the word ----------
  const NW = 46000, K = 1500 / word.width, CW = 1500, CHH = Math.ceil(word.capHeight * K) + 8;
  const cv = document.createElement("canvas"); cv.width = CW; cv.height = CHH; const cg = cv.getContext("2d", { willReadFrequently: true }); cg.fillStyle = "#fff";
  word.glyphs.forEach((g) => { const p = new Path2D(); const X = (x) => (g.x + x) * K, Y = (y) => (word.capHeight - y) * K + 4;
    g.cmds.forEach((c) => { if (c[0] === "M") p.moveTo(X(c[1]), Y(c[2])); else if (c[0] === "L") p.lineTo(X(c[1]), Y(c[2])); else if (c[0] === "Q") p.quadraticCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4])); else if (c[0] === "C") p.bezierCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]), X(c[5]), Y(c[6])); else p.closePath(); });
    cg.fill(p, "evenodd"); });
  const px = cg.getImageData(0, 0, CW, CHH).data, inside = [];
  for (let y = 0; y < CHH; y += 2) for (let x = 0; x < CW; x += 2) if (px[(y * CW + x) * 4 + 3] > 128) inside.push(x, y);
  const wTarget = new Float32Array(NW * 3), wStart = new Float32Array(NW * 3), wRnd = new Float32Array(NW * 3);
  for (let i = 0; i < NW; i++) {
    const j = Math.floor(rnd() * (inside.length / 2)) * 2, fx = inside[j] + rnd() * 2, fy = inside[j + 1] + rnd() * 2;
    wTarget.set([(fx / K + OFFX) * SC, FLOOR + 0.03 + (word.capHeight - (fy - 4) / K) * SC, rnd() < 0.72 ? DEPTH / 2 + 0.03 : (rnd() - 0.5) * DEPTH], i * 3);
    const u = rnd() * 2 - 1, a = rnd() * 6.2832, r = 2.2 + rnd() * 6.5, q = Math.sqrt(1 - u * u);
    wStart.set([q * Math.cos(a) * r, u * r * 0.8, q * Math.sin(a) * r + 1.5], i * 3); wRnd.set([rnd(), rnd(), rnd()], i * 3);
  }
  const wGeo = new THREE.BufferGeometry(); wGeo.setAttribute("position", new THREE.BufferAttribute(wTarget, 3)); wGeo.setAttribute("aStart", new THREE.BufferAttribute(wStart, 3)); wGeo.setAttribute("aR", new THREE.BufferAttribute(wRnd, 3));
  wGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  const wMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uG: { value: 0 }, uFade: { value: 0 }, uTime: { value: 0 }, uPx: { value: (H * DPR) / (2 * Math.tan((FOV * Math.PI) / 360)) } },
    vertexShader: `uniform float uG, uFade, uTime, uPx; attribute vec3 aStart; attribute vec3 aR; varying vec3 vC; varying float vA;
      void main(){ float e = clamp(uG * 1.55 - aR.x * 0.55, 0.0, 1.0); e = 1.0 - pow(1.0 - e, 4.0);
        vec3 p = mix(aStart, position, e);
        float sw = (1.0 - e) * e * 4.0; p += vec3(sin(aR.y * 40.0 + uTime * 2.0), cos(aR.z * 37.0 + uTime * 1.7), sin(aR.x * 31.0)) * sw * 0.55;
        p += vec3(0.0, sin(uTime * 3.0 + aR.y * 20.0) * 0.004, 0.0) * e;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_PointSize = max(1.0, uPx * (0.011 + 0.008 * aR.z) / -mv.z);
        vC = mix(vec3(1.0, 0.52, 0.2), vec3(1.0, 0.93, 0.8), aR.y * 0.6 + e * 0.4); vA = uFade * (0.22 + 0.5 * e);
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: "varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vC * vA * smoothstep(0.5, 0.08, d), 1.0); }" });
  const wDots = new THREE.Points(wGeo, wMat); wDots.frustumCulled = false; wDots.visible = false; scene.add(wDots);

  // ---------- the board ----------
  const board = new THREE.Group(); board.position.y = FLOOR; scene.add(board);
  const pops = []; // [object, t0, kind]
  const mk = (geo, mat, x, y, z, t0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.scale.setScalar(0.0001); m.visible = false; board.add(m); pops.push([m, t0]); return m; };
  const BARS = [0.55, 0.95, 0.7, 1.45, 1.1].map((h, i) => { const g = new THREE.BoxGeometry(0.34, 1, 0.34); g.translate(0, 0.5, 0); const m = mk(g, i === 3 ? amber : ceramic(), -3.25 + i * 0.5, 0, -1.05, T.board + 0.05 + i * 0.06); m.userData.h = h; return m; });
  const ring = mk(new THREE.TorusGeometry(0.62, 0.12, 24, 96), ceramic(), 2.75, 0.78, -1.0, T.board + 0.2);
  const arc = mk(new THREE.TorusGeometry(0.62, 0.135, 20, 96, Math.PI * 1.25), amber, 2.75, 0.78, -1.0, T.board + 0.32);
  const card = mk(new RoundedBoxGeometry(2.5, 0.12, 1.45, 6, 0.06), lacquer(), -2.3, 0.06, 1.15, T.board + 0.12);
  const nc = document.createElement("canvas"); nc.width = 640; nc.height = 372; const ng = nc.getContext("2d"); const nTex = new THREE.CanvasTexture(nc); nTex.colorSpace = THREE.SRGBColorSpace;
  const num = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.336), new THREE.MeshBasicMaterial({ map: nTex, transparent: true, depthWrite: false, toneMapped: false })); num.rotation.x = -Math.PI / 2; num.position.set(0, 0.066, 0); card.add(num);
  const drawNum = (v) => { ng.clearRect(0, 0, 640, 372); ng.textBaseline = "alphabetic"; ng.fillStyle = "#ff9a4e"; ng.font = "500 210px UI"; ng.fillText(String(v).padStart(2, "0"), 44, 262); const w = ng.measureText(String(v).padStart(2, "0")).width; ng.fillStyle = "rgba(255,240,224,.72)"; ng.font = "500 54px UI"; ng.fillText("FPS", 64 + w, 262); ng.fillStyle = "rgba(255,240,224,.45)"; ng.font = "500 30px UI"; ng.fillText("RENDERED IN CODE", 50, 78); nTex.needsUpdate = true; };
  const balls = [0, 1, 2, 3].map((i) => mk(new THREE.SphereGeometry(0.3, 48, 32), i === 1 ? amber : chrome(), 1.35 + i * 0.78, 0.3, 1.2, T.board + 0.3 + i * 0.07));
  const curve = new THREE.CatmullRomCurve3([[-1.15, 0.12, -0.2], [-0.6, 0.55, -0.2], [-0.1, 0.32, -0.2], [0.45, 0.95, -0.2], [0.95, 0.7, -0.2], [1.45, 1.35, -0.2]].map((p) => new THREE.Vector3(...p)));
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.045, 12, false), amber); tube.castShadow = true; tube.visible = false; board.add(tube);
  const TUBE_N = tube.geometry.index.count; const tip = mk(new THREE.SphereGeometry(0.1, 24, 16), amber, 0, 0, 0, T.board + 0.25);
  // the 16:9 frame and the light that fills it
  const FW = 8.6, FH = FW * 9 / 16, bar = (w, d, x, z) => { const g = new THREE.BoxGeometry(w, 0.04, d); const m = new THREE.Mesh(g, amber); m.position.set(x, 0.02, z); m.visible = false; board.add(m); return m; };
  const frame = [bar(FW, 0.05, 0, -FH / 2), bar(0.05, FH, FW / 2, 0), bar(FW, 0.05, 0, FH / 2), bar(0.05, FH, -FW / 2, 0)];
  const fillMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.9, 0.78), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const fill = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), fillMat); fill.rotation.x = -Math.PI / 2; fill.position.y = 0.012; fill.visible = false; board.add(fill);

  // ---------- camera path (positions and look-at targets through the whole scene) ----------
  let camKeys = null, cP, cT;
  function setStart(p0) {
    camKeys = [[T2, p0, [0, 0, 0]], [T2 + 0.65, [0.25, 0.05, 1.3], [0, 0, -1.5]], [T2 + 1.1, [3.7, -0.2, 3.3], [2.3, -0.02, 0.2]], [T2 + 1.8, [-0.9, -0.16, 3.1], [-1.9, 0.0, 0.2]],
      [T2 + 2.4, [0.6, 3.4, 6.4], [0, -0.3, 0]], [T2 + 3.05, [0, 7.4, 3.3], [0, FLOOR, 0]], [T2 + 3.6, [0, 8.6, 0.95], [0, FLOOR, 0]], [T.end, [0, 2.2, 0.14], [0, FLOOR, 0]]];
    cP = new THREE.CatmullRomCurve3(camKeys.map((k) => new THREE.Vector3(...k[1])), false, "centripetal"); cT = new THREE.CatmullRomCurve3(camKeys.map((k) => new THREE.Vector3(...k[2])), false, "centripetal");
  }
  const up0 = new THREE.Vector3(0, 1, 0), up1 = new THREE.Vector3(0, 0.35, -1).normalize(), tmp = new THREE.Vector3();
  function cameraAt(t, camera) {
    let i = 0; while (i < camKeys.length - 2 && t > camKeys[i + 1][0]) i++;
    const k = seg(t, camKeys[i][0], camKeys[i + 1][0]), u = (i + (i === camKeys.length - 2 ? inCubic(k) * 0.6 + k * 0.4 : k)) / (camKeys.length - 1);
    camera.position.copy(cP.getPoint(u)); camera.up.copy(up0).lerp(up1, inOutCubic(seg(t, T2 + 2.3, T2 + 3.1))).normalize(); camera.lookAt(cT.getPoint(u));
  }

  function update(t) {
    const on = t >= T2;
    const lightK = outCubic(seg(t, T.gather + 0.3, T.bake + 0.3)); key.intensity = 2.3 * lightK; hemi.intensity = 0.8 * lightK;
    floor.visible = on && t > T.gather; floorMat.opacity = outCubic(seg(t, T.gather + 0.1, T.bake + 0.2));
    // dots -> word
    wDots.visible = on && t > T.burst && t < T.bake + 0.5; wMat.uniforms.uTime.value = t;
    wMat.uniforms.uG.value = seg(t, T.gather, T.bake + 0.1); wMat.uniforms.uFade.value = outCubic(seg(t, T.burst + 0.1, T.gather + 0.2)) * (1 - seg(t, T.bake + 0.05, T.bake + 0.45));
    letters.forEach((m, i) => {
      const a = seg(t, T.bake + i * 0.03, T.bake + 0.45 + i * 0.03), f = inOutCubic(seg(t, T.fold + i * 0.045, T.fold + 0.42 + i * 0.045));
      m.visible = on && a > 0 && f < 1; m.material.opacity = a; m.material.transparent = a < 1;
      m.scale.setScalar(Math.max(0.0001, 1 - f)); m.position.set(m.userData.home.x * (1 - f * 0.25), m.userData.home.y - f * 0.45, 0); m.rotation.set(-f * 2.2, f * (i % 2 ? 1.4 : -1.4), 0);
    });
    // board
    const out = (m, i) => inOutCubic(seg(t, T.fill - 0.5 + i * 0.02, T.fill - 0.12 + i * 0.02));
    pops.forEach(([m, t0], i) => { const s = backOut(seg(t, t0, t0 + 0.42)) * (1 - out(m, i)); m.visible = on && s > 0.0002; m.scale.setScalar(Math.max(0.0001, s)); });
    BARS.forEach((m, i) => { const s = backOut(seg(t, T.board + 0.05 + i * 0.06, T.board + 0.6 + i * 0.06), 1.2) * (1 - out(m, i)); m.scale.set(Math.max(0.0001, Math.min(1, s * 3)), Math.max(0.0001, m.userData.h * s), Math.max(0.0001, Math.min(1, s * 3))); });
    ring.rotation.set(0.5, t * 0.9, 0); arc.rotation.set(0.5, t * 0.9, -t * 2.2);
    balls.forEach((m, i) => { m.position.y = 0.3 + Math.abs(Math.sin((t - T.board) * 4.2 - i * 0.55)) * 0.55 * (1 - seg(t, T.frame, T.fill)); });
    const dr = inOutCubic(seg(t, T.board + 0.25, T.board + 1.05)) * (1 - seg(t, T.fill - 0.45, T.fill - 0.15)); tube.visible = on && dr > 0.002; tube.geometry.setDrawRange(0, Math.floor((TUBE_N * dr) / 6) * 6);
    tip.position.copy(curve.getPoint(Math.min(1, inOutCubic(seg(t, T.board + 0.25, T.board + 1.05)))));
    if (t > T.board) drawNum(Math.round(60 * outCubic(seg(t, T.board + 0.2, T.board + 1.0))));
    // frame + light
    frame.forEach((m, i) => { const s = inOutCubic(seg(t, T.frame + i * 0.1, T.frame + 0.38 + i * 0.1)); m.visible = on && s > 0; m.scale.set(i % 2 ? 1 : Math.max(0.0001, s), 1, i % 2 ? Math.max(0.0001, s) : 1); });
    num.material.opacity = 1 - seg(t, T.fill - 0.5, T.fill - 0.3);
    const fl = inCubic(seg(t, T.fill - 0.1, T.end - 0.1)); fill.visible = on && fl > 0; fillMat.opacity = fl;
  }
  return { update, cameraAt, setStart, T, bloomK: (t) => 1 - 0.6 * seg(t, T.bake, T.bake + 0.4) };
}
