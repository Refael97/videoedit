// timeline + compositor: every shot renders into its own target, a mix pass handles the transitions
// (liquid melt, whip pan, glitch blocks, zoom-through, flash), then bloom → tone map → lens/grain/glitch pass
import { THREE, W, H, renderer, hudCam, seg, clamp, B, beatPulse } from "./core.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { makeOpening, makeLoop } from "./s_open.js";
import { SHOTS_MONTAGE } from "./s_montage.js";
import { SHOTS_FUN } from "./s_fun.js";
import { SHOTS_BIZ } from "./s_biz.js";
import { SHOTS_CRESC } from "./s_cresc.js";
import { SHOTS_CTA, makeCaptions } from "./s_cta.js";

const END = 35.0;
// [start, factory, transition-in type, transition duration]
const TIMELINE = [
  [0, makeOpening, "cut", 0],
  ...SHOTS_MONTAGE, ...SHOTS_FUN, ...SHOTS_BIZ, ...SHOTS_CRESC, ...SHOTS_CTA,
  [33.0, makeLoop, "glitch", 0.22],
];
let shots = [], captions = null; // built once the fonts are in, so every canvas is drawn with the real faces
const MODES = { cut: 0, liquid: 1, whip: 2, glitch: 3, zoom: 4, flash: 5, whipv: 6 };

const NOISE = `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
  float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }`;

class MixPass extends Pass {
  constructor() {
    super();
    const o = { type: THREE.HalfFloatType, samples: 4 };
    this.rtA = new THREE.WebGLRenderTarget(W, H, o); this.rtB = new THREE.WebGLRenderTarget(W, H, o);
    this.mat = new THREE.ShaderMaterial({
      uniforms: { tA: { value: this.rtA.texture }, tB: { value: this.rtB.texture }, p: { value: 0 }, mode: { value: 0 }, time: { value: 0 }, vel: { value: new THREE.Vector2() } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `uniform sampler2D tA, tB; uniform float p, time; uniform int mode; uniform vec2 vel; varying vec2 vUv; ${NOISE}
        vec4 blurA(vec2 uv, vec2 d){ vec4 c = vec4(0.0); for (int i = 0; i < 12; i++){ c += texture2D(tA, uv + d * (float(i)/11.0 - 0.5)); } return c / 12.0; }
        vec4 blurB(vec2 uv, vec2 d){ vec4 c = vec4(0.0); for (int i = 0; i < 12; i++){ c += texture2D(tB, uv + d * (float(i)/11.0 - 0.5)); } return c / 12.0; }
        void main(){
          vec2 uv = vUv;
          if (mode == 0) { gl_FragColor = length(vel) > 0.0005 ? blurA(uv, vel) : texture2D(tA, uv); return; }
          if (mode == 1) { // liquid melt: the old frame drips away along a noisy front, the new one wells up through it
            float n = fbm(uv * vec2(3.0, 2.2) + vec2(0.0, time * 0.4));
            float f = 0.55 * (1.0 - uv.y) + 0.45 * n;            // front sweeps top → bottom
            float front = p * 1.25 - 0.1;
            float amp = sin(p * 3.14159);
            vec2 dA = vec2((n - 0.5) * 0.06, 0.12 * smoothstep(front - 0.3, front, f) * amp);
            vec2 dB = vec2((0.5 - n) * 0.05 * amp, -0.05 * amp * (1.0 - p));
            vec4 a = texture2D(tA, uv + dA), b = texture2D(tB, uv + dB);
            float m = smoothstep(front + 0.04, front - 0.04, f);
            float rim = exp(-pow((f - front) / 0.018, 2.0)) * amp;
            vec4 c = mix(a, b, m);
            c.rgb += rim * vec3(0.5, 0.45, 0.7);
            gl_FragColor = c; return; }
          if (mode == 2 || mode == 6) { // whip pan with heavy directional blur
            vec2 dir = mode == 2 ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            float s = sin(p * 3.14159); float k = smoothstep(0.0, 1.0, p);
            vec4 a = blurA(uv + dir * k * 0.9, dir * s * 0.35), b = blurB(uv - dir * (1.0 - k) * 0.9, dir * s * 0.35);
            gl_FragColor = mix(a, b, smoothstep(0.42, 0.58, p)); return; }
          if (mode == 3) { // glitch blocks + channel tear
            vec2 blk = floor(uv * vec2(10.0, 28.0)); float r = hash(blk + floor(time * 40.0));
            float row = hash(vec2(floor(uv.y * 40.0), floor(time * 50.0)));
            vec2 off = vec2((row - 0.5) * 0.12 * sin(p * 3.14159), 0.0);
            bool useB = r < p;
            vec4 c = useB ? texture2D(tB, uv + off) : texture2D(tA, uv + off);
            float sh = 0.02 * sin(p * 3.14159);
            vec4 cr = useB ? texture2D(tB, uv + off + vec2(sh, 0.0)) : texture2D(tA, uv + off + vec2(sh, 0.0));
            vec4 cb = useB ? texture2D(tB, uv + off - vec2(sh, 0.0)) : texture2D(tA, uv + off - vec2(sh, 0.0));
            gl_FragColor = vec4(cr.r, c.g, cb.b, 1.0); return; }
          if (mode == 4) { // zoom through: radial streak into the centre, new shot lands from behind
            vec2 c0 = uv - 0.5; float s = sin(p * 3.14159);
            vec4 a = vec4(0.0), b = vec4(0.0);
            for (int i = 0; i < 12; i++){ float f = float(i) / 11.0;
              a += texture2D(tA, 0.5 + c0 / (1.0 + p * 2.5 + f * s * 0.5));
              b += texture2D(tB, 0.5 + c0 * (1.0 + (1.0 - p) * 0.8 + f * s * 0.3)); }
            vec4 c = mix(a / 12.0, b / 12.0, smoothstep(0.35, 0.65, p));
            c.rgb += s * s * 0.35;
            gl_FragColor = c; return; }
          if (mode == 5) { vec4 c = mix(texture2D(tA, uv), texture2D(tB, uv), step(0.5, p)); c.rgb += sin(p * 3.14159) * 3.0; gl_FragColor = c; return; }
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.mat);
    this.a = null; this.b = null;
  }
  renderShot(renderer, s, rt) {
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 1); renderer.clear();
    renderer.render(s.scene, s.camera);
    if (s.hud) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(s.hud, hudCam); renderer.autoClear = true; }
  }
  render(renderer, writeBuffer) {
    this.renderShot(renderer, this.a, this.rtA);
    if (this.b) this.renderShot(renderer, this.b, this.rtB);
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); renderer.clear();
    this.quad.render(renderer);
    // global captions ride above everything, inside the post chain
    if (captions.active) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(captions.scene, hudCam); renderer.autoClear = true; }
  }
}

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
composer.setPixelRatio(1); composer.setSize(W, H);
const mix = new MixPass(); composer.addPass(mix);
const bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.8, 0.6, 0.55); composer.addPass(bloom);
composer.addPass(new OutputPass());
const fx = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, chroma: { value: 0 }, time: { value: 0 }, glitch: { value: 0 }, flash: { value: 0 }, black: { value: 0 }, grain: { value: 0.04 }, vig: { value: 1 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; uniform float chroma, time, glitch, flash, black, grain, vig; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + time * 61.7) * 43758.5453); }
    float h1(float x){ return fract(sin(x * 91.17) * 43758.5453); }
    void main(){
      vec2 uv = vUv;
      // beat glitch: a few torn horizontal bands
      float band = floor(uv.y * 24.0); float tr = h1(band + floor(time * 30.0) * 7.0);
      uv.x += glitch * step(0.8, tr) * (h1(band * 3.1 + floor(time * 30.0)) - 0.5) * 0.18;
      vec2 d = (uv - 0.5) * (chroma + glitch * 0.04);
      vec3 c = vec3(texture2D(tDiffuse, uv + d).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - d).b);
      c *= mix(1.0, mix(0.55, 1.0, smoothstep(1.0, 0.35, length((vUv - 0.5) * vec2(1.0, 0.8)))), vig);
      c += (hash(floor(vUv * vec2(1920.0, 1080.0))) - 0.5) * grain;
      c = mix(c, vec3(1.0), clamp(flash, 0.0, 1.0));
      c *= 1.0 - black;
      gl_FragColor = vec4(c, 1.0); }`,
});
composer.addPass(fx);

const TONE = { aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping, agx: THREE.AgXToneMapping };
// segment renders set data-off on the root so a short composition can render any window of the film
const OFF = parseFloat(document.getElementById("root").dataset.off || "0");
function renderAt(t) {
  t = clamp(t + OFF, 0, END - 1e-4);
  let i = shots.findIndex((s) => t >= s.t0 && t < s.t1); if (i < 0) i = shots.length - 1;
  let A = shots[i], Bs = null, p = 0, mode = 0;
  // a transition straddles the boundary at the start of shot i (or of shot i+1)
  const nx = shots[i + 1];
  if (nx && nx.td > 0 && t >= nx.t0 - nx.td / 2) { Bs = nx; p = seg(t, nx.t0 - nx.td / 2, nx.t0 + nx.td / 2); mode = MODES[nx.tr]; }
  else if (A.td > 0 && t < A.t0 + A.td / 2 && i > 0) { Bs = A; A = shots[i - 1]; p = seg(t, Bs.t0 - Bs.td / 2, Bs.t0 + Bs.td / 2); mode = MODES[Bs.tr]; }
  A.update(t); if (Bs) Bs.update(t);
  const lead = Bs && p >= 0.5 ? Bs : A; const po = lead.post ? lead.post(t) : {};
  mix.a = A; mix.b = Bs; mix.mat.uniforms.mode.value = Bs ? mode : 0; mix.mat.uniforms.p.value = p; mix.mat.uniforms.time.value = t;
  const v = po.mblur || [0, 0]; mix.mat.uniforms.vel.value.set(v[0], v[1]);
  captions.update(t);
  const bl = po.bloom || [0.6, 0.5, 0.7]; bloom.strength = bl[0]; bloom.radius = bl[1]; bloom.threshold = bl[2];
  renderer.toneMapping = TONE[po.tone || "aces"]; renderer.toneMappingExposure = po.exposure || 1;
  const u = fx.uniforms;
  u.time.value = Math.floor(t * 60) / 60; u.chroma.value = po.chroma ?? 0.003; u.glitch.value = po.glitch || 0;
  u.flash.value = po.flash || 0; u.black.value = po.black || 0; u.grain.value = po.grain ?? 0.04; u.vig.value = po.vig ?? 1;
  composer.render();
}

let ready = false;
const built = Promise.all([
  document.fonts.load("700 22px Heebo"), document.fonts.load("500 11px Heebo"), document.fonts.load("900 100px Heebo"), document.fonts.load("800 100px Heebo"),
  document.fonts.load("700 100px Karantina"), document.fonts.load("500 20px JBM"), document.fonts.load("700 20px JBM"), document.fonts.load("800 100px Heebo", "אבג"), document.fonts.load("900 100px Heebo", "אבג"), document.fonts.load("100px 'Noto Color Emoji'"),
]).then(() => {
  shots = TIMELINE.map(([t0, make, tr, td], i) => ({ t0, t1: i + 1 < TIMELINE.length ? TIMELINE[i + 1][0] : END, tr, td, ...make() }));
  captions = makeCaptions();
  return Promise.all([...shots.map((s) => s.ready || Promise.resolve()), captions.ready || Promise.resolve()]);
}).then(() => { ready = true; });
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady["charta"] = built;
built.then(() => renderAt(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => { if (ready) renderAt(e.detail.time); else built.then(() => renderAt(e.detail.time)); });
window.__renderAt = renderAt; window.__beat = { B, beatPulse };
