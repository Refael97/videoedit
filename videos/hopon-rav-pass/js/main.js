// compositor: the shot renders in HDR with 4×MSAA; SUB sub-frames across a 180° shutter are averaged for
// real motion blur, then gentle bloom → tone map → grain + vignette. Titles are HTML above the canvas.
import { THREE, W, H, renderer, seg, clamp, E } from "./core.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { makeFilm } from "./film.js";

const END = parseFloat(document.getElementById("root").dataset.duration);
const OFF = parseFloat(document.getElementById("root").dataset.off || "0");
const FPS = 60, SUB = 8, SHUTTER = 0.5 / FPS;

class AccumPass extends Pass {
  constructor() {
    super();
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    this.quad = new FullScreenQuad(new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: this.rt.texture }, w: { value: 1 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: "uniform sampler2D tSrc; uniform float w; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb * w, 1.0); }",
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true }));
    this.shot = null; this.t = 0;
  }
  render(r, writeBuffer) {
    // autoClear off: every quad draw would otherwise wipe the sub-frames already summed into writeBuffer
    const tm = r.toneMapping, ac = r.autoClear; r.toneMapping = THREE.NoToneMapping; r.autoClear = false;
    r.setRenderTarget(writeBuffer); r.setClearColor(0x000000, 1); r.clear();
    for (let i = 0; i < SUB; i++) {
      const ts = this.t + (SUB > 1 ? (i / (SUB - 1) - 0.5) * SHUTTER : 0);
      this.shot.update(ts);
      r.setRenderTarget(this.rt); r.clear(); r.render(this.shot.scene, this.shot.camera);
      this.quad.material.uniforms.w.value = 1 / SUB;
      r.setRenderTarget(writeBuffer); this.quad.render(r);
    }
    r.toneMapping = tm; r.autoClear = ac;
  }
}

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
const accum = new AccumPass(); composer.addPass(accum);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.1, 0.3, 0.98); composer.addPass(bloom);
composer.addPass(new OutputPass());
const fx = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.022 }, vig: { value: 0.32 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, grain, vig; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
      c *= mix(1.0, mix(0.72, 1.0, smoothstep(1.05, 0.35, length((vUv - 0.5) * vec2(0.8, 1.0)))), vig);
      c += (hash(floor(vUv * vec2(${W}.0, ${H}.0)) + fract(time * 7.13)) - 0.5) * grain;
      gl_FragColor = vec4(c, 1.0); }`,
});
composer.addPass(fx);

// ── titles (HTML): every value is set from t, nothing animates on its own ──
const words = [...document.querySelectorAll(".title .w")].map((w) => ({ w, at: parseFloat(w.dataset.at), out: parseFloat(w.closest(".title").dataset.out || "1e9") }));
function titles(t) {
  words.forEach(({ w, at, out }) => {
    const e = E.outCubic(seg(t, at, at + 0.55)), o = E.outCubic(seg(t, out, out + 0.35)), k = e * (1 - o);
    w.style.opacity = k; w.style.filter = `blur(${((1 - e) * 22 + o * 18).toFixed(2)}px)`;
    w.style.transform = `translateY(${((1 - e) * 26 - o * 18).toFixed(2)}px)`;
  });
}

let shot = null;
function renderAt(t) {
  t = clamp(t + OFF, 0, END - 1e-4);
  accum.shot = shot; accum.t = t;
  const po = shot.post(t); bloom.strength = po.bloom[0]; bloom.radius = po.bloom[1]; bloom.threshold = po.bloom[2];
  fx.uniforms.time.value = Math.floor(t * FPS) / FPS; fx.uniforms.grain.value = po.grain; fx.uniforms.vig.value = po.vig;
  composer.render(); titles(t);
}

let ready = false;
const built = Promise.all([
  document.fonts.load("800 100px 'Noto Sans Hebrew'", "אבג"), document.fonts.load("500 40px 'Noto Sans Hebrew'", "אבג"),
]).then(() => makeFilm()).then((f) => { shot = f; ready = true; });
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady["hopon"] = built;
built.then(() => renderAt(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => { if (ready) renderAt(e.detail.time); else built.then(() => renderAt(e.detail.time)); });
window.__renderAt = renderAt;
