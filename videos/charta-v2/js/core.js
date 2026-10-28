// shared renderer, maths, text + chrome helpers for every shot
import * as THREE from "three";
import { Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export { THREE };
export const W = 1920, H = 1080;
export const DATA = JSON.parse(document.getElementById("data").textContent);

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x) => (x === 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
  outBack: (x) => { const c1 = 1.8, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  outElastic: (x) => (x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1),
};
export function mkRnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// music grid: the track starts on the shatter (2.98s) at 129.2 bpm
export const B = (n) => 2.98 + 0.4645 * n;
// pulse that fires on every beat between a and b
export function beatPulse(t, a, b, decay = 9) {
  if (t < a || t > b) return 0;
  const n = Math.floor((t - 2.98) / 0.4645); const tb = B(n);
  return tb < a ? 0 : Math.exp(-(t - tb) * decay);
}

export const canvas = document.getElementById("gl");
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const pmrem = new THREE.PMREMGenerator(renderer);
export const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

export const hudCam = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -2000, 2000);

export const font3d = new Font(DATA.font);
export const chromeMat = () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6 });
export const chromeSideMat = () => new THREE.MeshPhysicalMaterial({ color: 0xd8dde6, metalness: 1, roughness: 0.18, envMapIntensity: 1.3 });
const isHeb = (s) => /[֐-׿]/.test(s);

// extruded word, one holder group per glyph (so glyphs can fly independently), laid out in visual order
export function chromeWord(text, { size = 1.85, depth = 0.75, spacing = 1.1, mats } = {}) {
  const res = font3d.data.resolution; const group = new THREE.Group(); const glyphs = [];
  const m = mats || [chromeMat(), chromeSideMat()];
  let x = 0; const chars = [...text]; if (isHeb(text)) chars.reverse();
  chars.forEach((ch) => {
    const gd = font3d.data.glyphs[ch]; if (!gd) { x += size * 0.32; return; } // spaces / missing glyphs just advance
    const adv = (gd.ha / res) * size;
    const geo = new TextGeometry(ch, { font: font3d, size, depth, curveSegments: 14, bevelEnabled: true, bevelThickness: size * 0.06, bevelSize: size * 0.032, bevelSegments: 6 });
    geo.computeBoundingBox(); const cx = (geo.boundingBox.min.x + geo.boundingBox.max.x) / 2;
    geo.translate(-cx, -size * 0.36, -depth / 2);
    const holder = new THREE.Group(); holder.add(new THREE.Mesh(geo, m)); holder.userData.x = x + cx;
    glyphs.push(holder); group.add(holder); x += adv * spacing;
  });
  glyphs.forEach((h) => { h.position.x = h.userData.x - x / 2; h.userData.x = h.position.x; });
  group.userData.width = x;
  return { group, glyphs };
}

// 2D type drawn into a canvas (proper Hebrew shaping, real fonts), returned as a texture
export function textCanvas(lines, o = {}) {
  const { font = "900 120px Heebo", color = "#fff", lineH = 1.15, pad = 40, stroke = 0, strokeColor = "#000", shadow = 0, shadowColor = "rgba(0,0,0,.5)", gradient = null, dir = "rtl", align = "center" } = o;
  lines = Array.isArray(lines) ? lines : [lines];
  const c = document.createElement("canvas"); let g = c.getContext("2d"); g.font = font;
  const px = parseFloat(font.match(/(\d+(\.\d+)?)px/)[1]);
  const widths = lines.map((l) => g.measureText(l).width); const w = Math.ceil(Math.max(...widths) + pad * 2 + stroke * 2);
  const h = Math.ceil(px * lineH * lines.length + pad * 2);
  c.width = w; c.height = h; g = c.getContext("2d");
  g.font = font; g.direction = dir; g.textBaseline = "middle"; g.textAlign = align;
  const ax = align === "center" ? w / 2 : align === "right" ? w - pad : pad;
  lines.forEach((l, i) => {
    const y = pad + px * lineH * (i + 0.5);
    if (shadow) { g.shadowColor = shadowColor; g.shadowBlur = shadow; g.shadowOffsetY = shadow * 0.25; }
    if (stroke) { g.lineJoin = "round"; g.lineWidth = stroke * 2; g.strokeStyle = strokeColor; g.strokeText(l, ax, y); g.shadowBlur = 0; g.shadowOffsetY = 0; }
    if (gradient) { const gr = g.createLinearGradient(0, 0, w, 0); gradient.forEach((cs, k) => gr.addColorStop(k / (gradient.length - 1), cs)); g.fillStyle = gr; } else g.fillStyle = color;
    g.fillText(l, ax, y); g.shadowBlur = 0;
  });
  return { canvas: c, w, h };
}
export function canvasTex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

// a flat card carrying a canvas, sized in world units (height given), anchored at its centre
export function canvasPlane(c, height, matOpts = {}) {
  const tex = canvasTex(c);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, ...matOpts });
  const m = new THREE.Mesh(new THREE.PlaneGeometry((height * c.width) / c.height, height), mat);
  return m;
}
// HUD text in pixel units
export function hudText(lines, o = {}) {
  const { canvas: c, w, h } = textCanvas(lines, o);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
  m.userData.w = w; m.userData.h = h; return m;
}

// sample n points from the filled pixels of a canvas → array of [x,y] centred, in canvas pixels
export function samplePoints(c, n, rnd = Math.random, step = 2) {
  const g = c.getContext("2d"); const d = g.getImageData(0, 0, c.width, c.height).data; const pts = [];
  for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) if (d[(y * c.width + x) * 4 + 3] > 128) pts.push([x - c.width / 2, c.height / 2 - y]);
  const out = []; for (let i = 0; i < n; i++) { const p = pts[Math.floor(rnd() * pts.length)]; out.push([p[0] + (rnd() - 0.5) * step, p[1] + (rnd() - 0.5) * step]); }
  return out;
}

// soft round sprite for points
export const dotTex = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();

// rounded rect path helper for canvas UI drawing
export function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
