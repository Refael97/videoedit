// shared renderer + maths for every hopon shot. 9:16 story, everything is a pure function of t.
import * as THREE from "three";

export { THREE };
export const W = 1080, H = 1920;

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const E = {
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  outExpo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) => (x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
export function mkRnd(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// music grid: 120 bpm, beat n lands at n * 0.5s
export const BEAT = 0.5;
export const B = (n) => n * BEAT;

export const canvas = document.getElementById("gl");
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;

// rounded polygon in app-icon pixel space (512², y down) → THREE.Shape in world units.
// r is one radius or one per corner; corners are true quarter-circle beziers.
export const ICON_PX = 512;
export function iconShape(pts, r, size) {
  const s = size / ICON_PX, P = pts.map(([x, y]) => new THREE.Vector2((x - 256) * s, (256 - y) * s));
  const R = Array.isArray(r) ? r : pts.map(() => r);
  const shape = new THREE.Shape(); const K = 0.5523;
  P.forEach((p1, i) => {
    const p0 = P[(i - 1 + P.length) % P.length], p2 = P[(i + 1) % P.length];
    const rr = Math.min(R[i] * s, p0.distanceTo(p1) / 2, p2.distanceTo(p1) / 2);
    const a = p1.clone().add(p0.clone().sub(p1).normalize().multiplyScalar(rr));
    const b = p1.clone().add(p2.clone().sub(p1).normalize().multiplyScalar(rr));
    if (i === 0) shape.moveTo(a.x, a.y); else shape.lineTo(a.x, a.y);
    const c1 = a.clone().lerp(p1, K), c2 = b.clone().lerp(p1, K);
    shape.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
  });
  shape.closePath(); return shape;
}
export const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
