// 14.13–17.84s: "בין אם אתם עורכים בשביל הכיף..." — dog + sticker pops, birthday confetti, a meme that glitches out
import { THREE, seg, lerp, E, mkRnd, clamp, B, beatPulse, textCanvas, canvasTex, canvasPlane, rr, dotTex, hudText } from "./core.js";

const persp = (fov = 38) => new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 400);
const loadTex = (url) => new Promise((res) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; res(t); }));

// candy backdrop: soft blobs on a saturated gradient, drawn once
function candy(c1, c2, blobs) {
  const c = document.createElement("canvas"); c.width = 1920; c.height = 1080; const g = c.getContext("2d");
  const gr = g.createLinearGradient(0, 0, 1920, 1080); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  blobs.forEach(([x, y, r, cc]) => { const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, cc); rg.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = rg; g.fillRect(0, 0, 1920, 1080); });
  // halftone dots for print texture
  g.fillStyle = "rgba(255,255,255,.12)"; for (let y = 0; y < 1080; y += 26) for (let x = (y / 26) % 2 ? 13 : 0; x < 1920; x += 26) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); }
  return c;
}
// a die-cut sticker: emoji or word with a thick white border and a soft drop shadow
function sticker(content, size = 190, emoji = true) {
  const c = document.createElement("canvas"); const pad = 46; c.width = c.height = size + pad * 2; const g = c.getContext("2d");
  g.font = emoji ? `${size * 0.82}px 'Noto Color Emoji'` : `900 ${size * 0.42}px Heebo`; g.textAlign = "center"; g.textBaseline = "middle"; g.direction = "rtl";
  const cx = c.width / 2, cy = c.height / 2 + (emoji ? size * 0.04 : 0);
  // white border = the glyph stamped in a ring of offsets
  const tmp = document.createElement("canvas"); tmp.width = c.width; tmp.height = c.height; const tg = tmp.getContext("2d"); tg.font = g.font; tg.textAlign = "center"; tg.textBaseline = "middle"; tg.direction = "rtl";
  for (let a = 0; a < 32; a++) { const r = 14; tg.fillStyle = "#fff"; tg.fillText(content, cx + Math.cos((a / 32) * 6.283) * r, cy + Math.sin((a / 32) * 6.283) * r); }
  tg.globalCompositeOperation = "source-in"; tg.fillStyle = "#fff"; tg.fillRect(0, 0, c.width, c.height);
  g.shadowColor = "rgba(40,0,60,.35)"; g.shadowBlur = 18; g.shadowOffsetY = 10; g.drawImage(tmp, 0, 0); g.shadowColor = "transparent";
  g.fillStyle = emoji ? "#000" : "#ff2d87"; g.fillText(content, cx, cy);
  return c;
}

// ───────────── 1. dog + sticker pops ─────────────
function makeDog() {
  const T0 = B(24), T1 = B(27);
  const scene = new THREE.Scene(); const camera = persp(36); camera.position.set(0, 0, 12);
  const bg = canvasPlane(candy("#ff5fa2", "#ffb347", [[400, 300, 600, "rgba(255,240,120,.7)"], [1500, 800, 700, "rgba(160,90,255,.5)"]]), 13.6); bg.position.z = -6; scene.add(bg);
  const dog = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false })); scene.add(dog);
  const shadow = canvasPlane((() => { const k = document.createElement("canvas"); k.width = 256; k.height = 64; const q = k.getContext("2d"); const gr = q.createRadialGradient(128, 32, 0, 128, 32, 128); gr.addColorStop(0, "rgba(60,0,40,.45)"); gr.addColorStop(1, "rgba(60,0,40,0)"); q.fillStyle = gr; q.fillRect(0, 0, 256, 64); return k; })(), 1.2); shadow.position.set(0, -3.75, -0.1); scene.add(shadow);
  const ready = loadTex("assets/img/dog.png").then((tx) => { dog.material.map = tx; dog.material.needsUpdate = true; const a = tx.image.width / tx.image.height; dog.scale.set(7.4 * a, 7.4, 1); });
  // stickers land on the beats, each with a squash-and-stretch pop
  const defs = [["😎", -0.05, 2.05, 1.3, 0, B(24.5)], ["⭐", -4.4, 2.1, 1.5, -0.3, B(25)], ["❤️", 4.3, 1.9, 1.6, 0.25, B(25.5)], ["🎉", -4.2, -1.7, 1.7, 0.2, B(26)], ["לייק!", 4.4, -1.5, 2.1, -0.18, B(26.5)], ["🔥", -1.9, 3.1, 1.1, 0.1, B(26.25)]];
  const st = defs.map(([e, x, y, s, r, t]) => { const m = canvasPlane(sticker(e, 190, !/[א-ת]/.test(e)), s * 1.5); m.position.set(x, y, 0.5); m.rotation.z = r; scene.add(m); return { m, s, t, r }; });
  function update(t) {
    const lt = t - T0;
    const hop = Math.abs(Math.sin((t - T0) * Math.PI / 0.4645)) * 0.35; // dog bounces on the beat
    dog.position.set(0, 0.0 + hop, 0); dog.rotation.z = Math.sin(lt * 7) * 0.04;
    shadow.scale.setScalar(1.6 - hop);
    st.forEach(({ m, s, t: ts, r }) => { const k = seg(t, ts, ts + 0.32); m.visible = t >= ts; const sq = E.outElastic(k); m.scale.set(sq * (1 + 0.2 * Math.sin(k * 9) * (1 - k)), sq, 1); m.rotation.z = r + (1 - k) * 0.6; });
    camera.position.set(Math.sin(lt * 1.5) * 0.3, 0, lerp(12.6, 11.4, E.outCubic(seg(t, T0, T1)))); camera.lookAt(0, 0, 0);
  }
  const post = () => ({ bloom: [0.25, 0.4, 0.9], tone: "neutral", chroma: 0.002, grain: 0.03, vig: 0.4 });
  return { scene, camera, update, post, ready };
}

// ───────────── 2. birthday confetti burst ─────────────
function makeParty() {
  const T0 = B(27), T1 = B(29), POP = B(27.5);
  const rnd = mkRnd(77);
  const scene = new THREE.Scene(); const camera = persp(40); camera.position.set(0, 0, 14);
  const bg = canvasPlane(candy("#6a3dff", "#ff4fd8", [[960, 540, 800, "rgba(255,210,120,.55)"]]), 15.2); bg.position.z = -8; scene.add(bg);
  scene.add(new THREE.AmbientLight(0xffffff, 1.4)); const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(3, 5, 8); scene.add(dl);
  const title = canvasPlane(textCanvas(["יום הולדת", "שמח!"], { font: "900 210px Heebo", lineH: 1.0, stroke: 16, strokeColor: "#fff", gradient: ["#ff2d87", "#ff8a00"], shadow: 30, shadowColor: "rgba(60,0,80,.45)" }).canvas, 5.4);
  title.position.z = 0.5; scene.add(title);
  // instanced confetti: flat ribbons + discs tumbling under gravity and drag
  const N = 1000; const cols = [0xffd60a, 0xff2d87, 0x2bd8ff, 0x2bff9e, 0xffffff, 0xff8a00];
  const conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.16, 0.34), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.5, metalness: 0.3 }), N);
  const C = []; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < N; i++) {
    const a = rnd() * Math.PI * 2, el = (rnd() - 0.25) * 1.8, sp = 7 + rnd() * 16; const fromL = i % 2;
    C.push({ o: [fromL ? -6 : 6, -5.2, -1.5], v: [(fromL ? 1 : -1) * (0.15 + rnd() * 0.75) * sp, (1.0 + rnd() * 0.5) * sp, -rnd() * sp * 0.25], rs: [rnd() * 12, rnd() * 9, rnd() * 6], d: rnd() * 0.06 });
    conf.setColorAt(i, new THREE.Color(cols[i % cols.length]));
  }
  scene.add(conf);
  function update(t) {
    const pk = seg(t, POP, POP + 0.35); title.scale.setScalar(E.outElastic(seg(t, T0, T0 + 0.5)) * (1 + 0.12 * Math.exp(-Math.max(0, t - POP) * 8) * (t > POP ? 1 : 0)));
    title.rotation.z = Math.sin(t * 6) * 0.03;
    for (let i = 0; i < N; i++) {
      const c = C[i]; const dt = Math.max(0, t - POP - c.d); const drag = (1 - Math.exp(-dt * 1.6)) / 1.6;
      p.set(c.o[0] + c.v[0] * drag, c.o[1] + c.v[1] * drag - 4.5 * dt * dt, c.o[2] + c.v[2] * drag);
      e.set(c.rs[0] * dt, c.rs[1] * dt, c.rs[2] * dt); q.setFromEuler(e); s.setScalar(dt > 0 ? 1 : 0.0001);
      m4.compose(p, q, s); conf.setMatrixAt(i, m4);
    }
    conf.instanceMatrix.needsUpdate = true;
    camera.position.set(0, 0, 14 - E.outCubic(seg(t, T0, T1)) * 1.5 + (t > POP ? Math.exp(-(t - POP) * 10) * 0.5 : 0)); camera.lookAt(0, 0, 0);
  }
  const post = (t) => ({ bloom: [0.3, 0.4, 0.85], tone: "neutral", chroma: 0.003, grain: 0.03, vig: 0.4, flash: t > POP ? 0.25 * Math.exp(-(t - POP) * 16) : 0 });
  return { scene, camera, update, post };
}

// ───────────── 3. meme that warps into a glitch ─────────────
function makeMeme() {
  const T0 = B(29), T1 = B(32), WARP = B(30.5);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111111); const camera = persp(36); camera.position.set(0, 0, 12);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, cap: { value: null }, time: { value: 0 }, warp: { value: 0 }, glitch: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform sampler2D map, cap; uniform float time, warp, glitch; varying vec2 vUv;
      float h(float x){ return fract(sin(x * 91.3) * 43758.5); }
      void main(){
        vec2 uv = vUv;
        // bulge onto the cat's eyes, then a swirl as it melts down
        vec2 eye = vec2(0.5, 0.62); vec2 d = uv - eye; float r = length(d);
        uv = eye + d * mix(1.0, 0.35 + 0.65 * smoothstep(0.0, 0.32, r), warp);
        float ang = warp * 2.2 * smoothstep(0.55, 0.0, r);
        uv = eye + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * (uv - eye);
        float band = floor(vUv.y * 30.0); float tr = h(band + floor(time * 24.0));
        uv.x += glitch * step(0.7, tr) * (h(band * 7.0 + floor(time * 24.0)) - 0.5) * 0.25;
        // pixel-sort-ish smear on the torn bands
        if (glitch > 0.2 && tr > 0.85) uv.y = floor(uv.y * 12.0) / 12.0;
        float sh = glitch * 0.02;
        vec3 c = vec3(texture2D(map, uv + vec2(sh, 0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(sh, 0.0)).b);
        vec4 t = texture2D(cap, vUv);
        c = mix(c, t.rgb, t.a);
        c = mix(c, floor(c * 4.0) / 4.0, step(0.5, glitch) * 0.6);
        gl_FragColor = vec4(c, 1.0); }`,
  });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 6.03), mat); scene.add(card);
  // classic meme caption, Hebrew in heavy white with a black outline
  const cc = document.createElement("canvas"); cc.width = 1168; cc.height = 880; const g = cc.getContext("2d");
  g.font = "900 104px Heebo"; g.textAlign = "center"; g.direction = "rtl"; g.lineJoin = "round";
  [["כשקלוד ערך לי", 120], ["את הסרטון לבד", 820]].forEach(([s, y]) => { g.lineWidth = 18; g.strokeStyle = "#000"; g.strokeText(s, 584, y); g.fillStyle = "#fff"; g.fillText(s, 584, y); });
  mat.uniforms.cap.value = canvasTex(cc);
  const ready = loadTex("assets/img/meme.jpg").then((tx) => { mat.uniforms.map.value = tx; });
  function update(t) {
    const lt = t - T0; const w = E.inOutCubic(seg(t, WARP, T1 - 0.1));
    mat.uniforms.time.value = t; mat.uniforms.warp.value = w; mat.uniforms.glitch.value = clamp(beatPulse(t, WARP, T1, 7) * 1.2 + w * 0.7);
    card.rotation.z = lerp(-0.05, 0.03, seg(t, T0, T1)) + Math.sin(t * 40) * 0.01 * w; card.scale.setScalar(E.outBack(seg(t, T0, T0 + 0.3)) * (1 + w * 0.15));
    camera.position.set(0, 0, 11.2 - lt * 0.35);
  }
  const post = (t) => { const w = seg(t, WARP, T1); return { bloom: [0.3, 0.4, 0.85], tone: "neutral", chroma: 0.003 + w * 0.02, glitch: beatPulse(t, WARP, T1) * 0.6, grain: 0.05 }; };
  return { scene, camera, update, post, ready };
}

export const SHOTS_FUN = [
  [B(24), makeDog, "glitch", 0.24],
  [B(27), makeParty, "whip", 0.3],
  [B(29), makeMeme, "liquid", 0.36],
];
