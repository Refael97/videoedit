// 14.13–17.84s, v2: "בין אם אתם עורכים בשביל הכיף..." — printed photo cards and real objects in the studio
import { THREE, seg, lerp, E, mkRnd, clamp, chromeWord, B, beatPulse, textCanvas, canvasTex, canvasPlane, rr } from "./core.js";
import { makeStudio, studioPost, mats, ACCENT, INK } from "./studio.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const persp = (fov = 30) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 200);
const loadImg = (url) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = url; });

// a printed photo on thick matte stock with a white border
function photoCard(img, w, h, border = 0.12, caption = null) {
  const c = document.createElement("canvas"); const PX = 900; c.width = PX; c.height = Math.round((PX * h) / w); const g = c.getContext("2d");
  g.fillStyle = "#f5f4f1"; g.fillRect(0, 0, c.width, c.height);
  const b = (border / w) * PX; const iw = c.width - 2 * b, ih = c.height - 2 * b - (caption ? b * 1.6 : 0);
  if (img) { const s = Math.max(iw / img.width, ih / img.height); const sw = iw / s, sh = ih / s; g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, b, b, iw, ih); }
  if (caption) caption(g, c.width, c.height, b);
  const grp = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.03, 2, 0.012), mats.ceramic(0xf5f4f1, { roughness: 0.7, clearcoat: 0 })); body.castShadow = true;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: canvasTex(c), roughness: 0.55 })); face.position.z = 0.0155;
  grp.add(body, face); return { grp, canvas: c, face };
}
// die-cut vinyl sticker: emoji (or word) with a thick white border; casts a real shadow via alphaTest
function sticker(content, size = 1, word = false) {
  const c = document.createElement("canvas"); const S = 300, pad = 50; c.width = c.height = S + pad * 2; const g = c.getContext("2d");
  g.font = word ? `900 ${S * 0.36}px Heebo` : `${S * 0.78}px 'Noto Color Emoji'`; g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl";
  const cx = c.width / 2, cy = c.height / 2 + (word ? 0 : S * 0.04);
  const tmp = document.createElement("canvas"); tmp.width = tmp.height = c.width; const tg = tmp.getContext("2d"); tg.font = g.font; tg.textAlign = "center"; tg.textBaseline = "middle"; tg.direction = "rtl";
  for (let a = 0; a < 40; a++) tg.fillText(content, cx + Math.cos((a / 40) * 6.283) * 20, cy + Math.sin((a / 40) * 6.283) * 20);
  tg.globalCompositeOperation = "source-in"; tg.fillStyle = "#ffffff"; tg.fillRect(0, 0, c.width, c.height);
  g.drawImage(tmp, 0, 0); g.fillStyle = word ? "#e8743b" : "#000"; g.fillText(content, cx, cy);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: canvasTex(c), transparent: true, alphaTest: 0.5, roughness: 0.35, side: THREE.DoubleSide }));
  m.castShadow = true; return m;
}

// ───────── 1. the dog print, stickers slapped on in time with the beat ─────────
function makeDog() {
  const T0 = B(24), T1 = B(27);
  const { scene, key } = makeStudio({ floorY: -1.9, reach: 5, keyPos: [-3, 10, 7] });
  const camera = persp(30);
  const holder = new THREE.Group(); holder.position.set(0.2, 0, 0); holder.rotation.set(-0.05, -0.18, 0.04); scene.add(holder);
  let card = null; const stk = [];
  const ready = loadImg("assets/img/dog_card.jpg").catch(() => null).then((img) => {
    card = photoCard(img, 3.0, 3.6, 0.14); holder.add(card.grp);
    [["😎", -0.02, 0.95, 0.85, 0, B(24.5)], ["⭐", -1.25, 1.35, 0.8, -0.3, B(25)], ["❤️", 1.28, 1.2, 0.85, 0.25, B(25.5)], ["🎉", -1.3, -1.1, 0.95, 0.2, B(26)], ["לייק!", 1.3, -1.25, 1.15, -0.18, B(26.5)], ["🔥", 1.1, 0.2, 0.7, 0.1, B(26.25)]]
      .forEach(([e, x, y, s, r, t]) => { const m = sticker(e, s, /[א-ת]/.test(e)); m.position.set(x, y, 0.05); holder.add(m); stk.push({ m, t, r, x, y }); });
  });
  function update(t) {
    const lt = t - T0;
    holder.position.y = 0.05 + Math.sin(lt * 2) * 0.02;
    stk.forEach(({ m, t: ts, r }) => { const k = seg(t, ts - 0.12, ts); const after = Math.max(0, t - ts);
      m.visible = t >= ts - 0.12; m.position.z = lerp(1.4, 0.03, E.inCubic(k)); const sq = after > 0 ? Math.exp(-after * 14) * 0.18 : 0;
      m.scale.set(1 + sq, 1 - sq, 1); m.rotation.z = r + (1 - k) * 0.5; });
    camera.position.set(lerp(-0.6, 0.5, seg(t, T0, T1)), 0.45, lerp(10.5, 9.4, E.outCubic(seg(t, T0, T1)))); camera.lookAt(0.1, 0.05, 0);
  }
  const post = (t) => studioPost({});
  return { scene, camera, update, post, ready };
}

// ───────── 2. black lacquer "יום הולדת שמח!" with a burst of monochrome + terracotta paper confetti ─────────
function makeParty() {
  const T0 = B(27), POP = B(27.5), T1 = B(29);
  const rnd = mkRnd(77);
  const { scene } = makeStudio({ floorY: -1.6, reach: 7, dark: true });
  const camera = persp(32);
  const lac = mats.ceramic(0xf3f3f1, { envMapIntensity: 0.9, clearcoat: 0.8, clearcoatRoughness: 0.15 }), side = mats.ceramic(0xe2e2e0);
  const l1 = chromeWord("יום הולדת", { size: 1.05, depth: 0.42, spacing: 1.06, mats: [lac, side] }), l2 = chromeWord("שמח!", { size: 1.05, depth: 0.42, spacing: 1.06, mats: [lac, side] });
  l1.group.position.set(0, 0.95, 0); l2.group.position.set(0, -0.45, 0);
  const word = new THREE.Group(); word.add(l1.group, l2.group); scene.add(word);
  [...l1.glyphs, ...l2.glyphs].forEach((g) => g.traverse((m) => { if (m.isMesh) m.castShadow = true; }));
  const glyphs = [...l1.glyphs, ...l2.glyphs];
  const N = 900; const pal = [0xf2f2f0, 0xe8743b, 0x9a9aa2, 0xf2f2f0, 0x3a3a40];
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.11, 0.24), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), N); conf.castShadow = true;
  const C = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i < N; i++) { const L = i % 2; const sp = 6 + rnd() * 9;
    C.push({ o: [L ? -3.6 : 3.6, -1.5, 0.6], v: [(L ? 1 : -1) * (0.2 + rnd() * 0.7) * sp, (1.0 + rnd() * 0.6) * sp, (rnd() - 0.4) * sp * 0.5], rs: [rnd() * 12, rnd() * 9, rnd() * 6], d: rnd() * 0.05 });
    conf.setColorAt(i, new THREE.Color(pal[i % pal.length])); }
  scene.add(conf);
  function update(t) {
    glyphs.forEach((g, i) => { const st = T0 + i * 0.03; const k = seg(t, st, st + 0.3); g.position.y = lerp(-2.5, 0, E.outBack(k)); g.rotation.x = lerp(1.2, 0, E.outCubic(k)); g.visible = t >= st; });
    word.rotation.y = Math.sin(t * 1.3) * 0.08; word.scale.setScalar(1 + (t > POP ? Math.exp(-(t - POP) * 9) * 0.05 : 0));
    for (let i = 0; i < N; i++) { const c = C[i]; const dt = Math.max(0, t - POP - c.d); const dr = (1 - Math.exp(-dt * 1.7)) / 1.7;
      p.set(c.o[0] + c.v[0] * dr, Math.max(-1.59, c.o[1] + c.v[1] * dr - 4.2 * dt * dt), c.o[2] + c.v[2] * dr); eu.set(c.rs[0] * dt, c.rs[1] * dt, c.rs[2] * dt); q.setFromEuler(eu); s.setScalar(dt > 0 ? 1 : 0.0001); m4.compose(p, q, s); conf.setMatrixAt(i, m4); }
    conf.instanceMatrix.needsUpdate = true;
    camera.position.set(Math.sin(t * 0.6) * 0.8, 0.9, lerp(11.5, 10.2, E.outCubic(seg(t, T0, T1)))); camera.lookAt(0, 0.25, 0);
  }
  const post = (t) => studioPost({});
  return { scene, camera, update, post };
}

// ───────── 3. the meme print bends like warm plastic, then the image tears into a glitch ─────────
function makeMeme() {
  const T0 = B(29), WARP = B(30.5), T1 = B(32);
  const { scene } = makeStudio({ floorY: -1.9, reach: 5, keyPos: [3, 10, 6] });
  const camera = persp(30);
  const W = 3.9, Hh = 2.94, SEGX = 60, SEGY = 46;
  const geo = new THREE.PlaneGeometry(W, Hh, SEGX, SEGY); const base = geo.attributes.position.array.slice();
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, time: { value: 0 }, glitch: { value: 0 } },
    vertexShader: "varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform sampler2D map; uniform float time, glitch; varying vec2 vUv; varying vec3 vN;
      float h(float x){ return fract(sin(x * 91.3) * 43758.5); }
      void main(){ vec2 uv = vUv; float band = floor(vUv.y * 30.0); float tr = h(band + floor(time * 24.0));
        uv.x += glitch * step(0.72, tr) * (h(band * 7.0 + floor(time * 24.0)) - 0.5) * 0.2;
        float sh = glitch * 0.018;
        vec3 c = vec3(texture2D(map, uv + vec2(sh, 0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(sh, 0.0)).b);
        float light = 0.78 + 0.22 * clamp(dot(vN, normalize(vec3(-0.3, 0.6, 0.8))), 0.0, 1.0);
        gl_FragColor = vec4(c * light, 1.0); }`,
  });
  const card = new THREE.Mesh(geo, mat); card.castShadow = true; scene.add(card);
  const ready = loadImg("assets/img/meme.jpg").then((img) => {
    const c = document.createElement("canvas"); c.width = 1168; c.height = 880; const g = c.getContext("2d"); g.drawImage(img, 0, 0, 1168, 880);
    g.font = "900 100px Heebo"; g.textAlign = "center"; g.direction = "rtl"; g.lineJoin = "round";
    [["כשקלוד ערך לי", 118], ["את הסרטון לבד", 826]].forEach(([s, y]) => { g.lineWidth = 16; g.strokeStyle = "#000"; g.strokeText(s, 584, y); g.fillStyle = "#fff"; g.fillText(s, 584, y); });
    g.strokeStyle = "#f5f4f1"; g.lineWidth = 36; g.strokeRect(0, 0, 1168, 880);
    mat.uniforms.map.value = canvasTex(c);
  });
  const pos = geo.attributes.position.array;
  function update(t) {
    const w = E.inOutCubic(seg(t, WARP, T1 - 0.05));
    for (let i = 0; i < pos.length; i += 3) { const x = base[i], y = base[i + 1];
      const droop = w * 0.9 * Math.pow(clamp((y + Hh / 2) / Hh), 1.2) * (0.6 + 0.4 * Math.cos(x * 1.6));
      pos[i] = x + Math.sin(y * 2.4 + t * 3) * 0.05 * w; pos[i + 1] = y - droop * 0.55; pos[i + 2] = Math.sin(x * 1.3 + t * 2.2) * 0.18 * w + droop * 0.6; }
    geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
    mat.uniforms.time.value = t; mat.uniforms.glitch.value = clamp(beatPulse(t, WARP, T1, 7) * 1.1 + w * 0.6);
    card.rotation.set(-0.04, lerp(0.2, -0.12, seg(t, T0, T1)), lerp(-0.04, 0.03, seg(t, T0, T1))); card.position.y = 0.15;
    card.scale.setScalar(E.outBack(seg(t, T0, T0 + 0.3)));
    camera.position.set(0, 0.35, lerp(9.6, 8.6, seg(t, T0, T1))); camera.lookAt(0, 0.1, 0);
  }
  const post = (t) => studioPost({ glitch: beatPulse(t, WARP, T1) * 0.3, chroma: 0.0012 + seg(t, WARP, T1) * 0.01 });
  return { scene, camera, update, post, ready };
}

export const SHOTS_FUN = [
  [B(24), makeDog, "whip", 0.26],
  [B(27), makeParty, "whipv", 0.28],
  [B(29), makeMeme, "zoom", 0.28],
];
