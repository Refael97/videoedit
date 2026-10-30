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
const FPS = 60, SUB = 8;
// shutter opens up to 330° on the whip moves (icon out + phone rise, spin, exit) for a heavier motion-blur feel
const WHIPS = [[4.9, 5.8], [8.0, 9.5], [10.05, 10.7], [16.75, 17.45], [20.15, 20.9]];
const shutterAt = (t) => { let k = 0; WHIPS.forEach(([a, b]) => { k = Math.max(k, Math.sin(Math.PI * seg(t, a, b))); }); return (0.5 + 0.42 * k) / FPS; };

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
      const ts = this.t + (SUB > 1 ? (i / (SUB - 1) - 0.5) * shutterAt(this.t) : 0);
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
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.18, 0.45, 1.12); composer.addPass(bloom);
composer.addPass(new OutputPass());
const fx = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.022 }, vig: { value: 0.32 } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, grain, vig; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){ vec2 d = vUv - 0.5; float r2 = dot(d * vec2(0.8, 1.0), d * vec2(0.8, 1.0));
      vec2 ca = d * r2 * 0.006;                                   // faint lens fringing toward the corners
      vec3 c = vec3(texture2D(tDiffuse, vUv + ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - ca).b);
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      c = mix(c, c * vec3(0.975, 0.99, 1.025), smoothstep(0.6, 0.15, l));   // cool, rich shadows
      c = mix(c, c * vec3(1.012, 1.004, 0.99), smoothstep(0.55, 0.95, l));  // a touch of warmth in the highlights
      c = (c - 0.5) * 1.04 + 0.5;
      c *= mix(1.0, mix(0.66, 1.0, smoothstep(1.05, 0.3, length(d * vec2(0.8, 1.0)))), vig);
      c += (hash(floor(vUv * vec2(${W}.0, ${H}.0)) + fract(time * 7.13)) - 0.5) * grain;
      gl_FragColor = vec4(c, 1.0); }`,
});
composer.addPass(fx);

// ── titles (HTML): every value is set from t, nothing animates on its own ──
const words = [...document.querySelectorAll(".title .w")].map((w) => ({ w, at: parseFloat(w.dataset.at), out: parseFloat(w.closest(".title").dataset.out || "1e9") }));
const sheens = [...document.querySelectorAll(".sheen")].map((el) => ({ el, at: parseFloat(el.dataset.at) }));
function titles(t) {
  words.forEach(({ w, at, out }) => {
    const e = E.outCubic(seg(t, at, at + 0.55)), o = E.outCubic(seg(t, out, out + 0.35)), k = e * (1 - o);
    const tr = E.outQuint(seg(t, at, at + 0.9));
    w.style.opacity = k; w.style.filter = `blur(${((1 - e) * 22 + o * 18).toFixed(2)}px)`;
    w.style.transform = `translateY(${((1 - e) * 26 - o * 18).toFixed(2)}px) scale(${(1.06 - 0.06 * E.outCubic(seg(t, at, at + 0.7))).toFixed(4)})`;
    w.style.letterSpacing = `${((1 - tr) * 0.09).toFixed(4)}em`;
    if (w.classList.contains("k")) w.style.setProperty("--u", (E.inOutCubic(seg(t, at + 0.3, at + 0.85)) * (1 - o)).toFixed(4));
  });
  // the wheel: words roll through a fixed line like an odometer; each step snaps on its beat with a little overshoot
  const pos = wheelPos(t), vel = (wheelPos(t + 0.01) - wheelPos(t - 0.01)) / 0.02;
  const wy = lerp(850, 1250, E.inOutCubic(seg(t, 1.35, 2.05))), wo = E.outCubic(seg(t, 4.95, 5.3)), wi = 1;
  wheel.style.top = `${wy.toFixed(1)}px`; const cl = E.inOutCubic(seg(t, 1.3, 1.9)); wheel.style.clipPath = `inset(${(-320 * (1 - cl)).toFixed(1)}px -300px ${(-320 * (1 - cl)).toFixed(1)}px -300px)`; wheel.style.opacity = (wi * (1 - wo)).toFixed(3); wheel.style.filter = `blur(${(wo * 18 + (1 - wi) * 16).toFixed(2)}px)`;
  wls.forEach((el, i) => { const d = i - pos, a = d * 0.55; const vis = Math.abs(d) < 1.6;
    el.style.visibility = vis ? "visible" : "hidden"; if (!vis) return;
    el.style.transform = `translateY(${(Math.sin(a) * 270).toFixed(2)}px) translateZ(${((Math.cos(a) - 1) * 280).toFixed(2)}px) rotateX(${(-a * 57.3).toFixed(2)}deg)`;
    el.style.opacity = (Math.max(0, 1 - Math.abs(d) * 0.72) * (Math.abs(d) > 0.5 ? 1 - cl : 1)).toFixed(3); el.style.textShadow = Math.abs(d) < 0.5 ? `0 0 ${(40 * (1 - Math.abs(d) * 2)).toFixed(1)}px rgba(26,174,229,0.35)` : 'none'; el.style.filter = `blur(${Math.min(14, Math.abs(vel) * 2.2 + Math.abs(d) * 4).toFixed(2)}px)`; });
  pills.forEach(({ el, at }, i) => { const e = E.outCubic(seg(t, at - 0.3, at + 0.1)), o = E.outCubic(seg(t, 13.3, 13.65)); const nxt = pills[i + 1];
    const on = t >= at && (!nxt || t < nxt.at) ? 1 : 0, lit = E.outCubic(seg(t, at, at + 0.15)) * (nxt ? 1 - seg(t, nxt.at, nxt.at + 0.2) : 1);
    el.style.opacity = (e * (1 - o)).toFixed(3); el.style.filter = `blur(${((1 - e) * 14 + o * 14).toFixed(2)}px)`; el.style.transform = `translateY(${((1 - e) * 30).toFixed(1)}px) scale(${(1 + 0.08 * lit).toFixed(3)})`;
    el.style.background = lit > 0.01 ? `rgba(11,134,189,${(0.95 * lit).toFixed(3)})` : "rgba(255,255,255,0.55)"; el.style.color = lit > 0.5 ? "#fff" : "#0c0c0e";
    el.style.borderColor = lit > 0.01 ? "rgba(26,174,229,0.9)" : "rgba(12,12,14,0.18)"; el.style.boxShadow = `0 10px 30px rgba(20,30,45,0.08), 0 0 ${(40 * lit).toFixed(1)}px rgba(26,174,229,${(0.55 * lit).toFixed(3)})`; void on; });
  rings.forEach(({ el, at }) => el.style.strokeDashoffset = (1 - E.inOutCubic(seg(t, at, at + 0.5))).toFixed(4));
  sheens.forEach(({ el, at }) => { const k = seg(t, at, at + 1.0); el.style.opacity = k > 0 && k < 1 ? 1 : 0; el.style.backgroundPosition = `${(lerpN(130, -30, E.inOutSine(k))).toFixed(2)}% 0`; });
}
const lerpN = (a, b, k) => a + (b - a) * k, lerp = lerpN;
const wheel = document.getElementById("wheel"), wls = [...wheel.querySelectorAll(".wl")];
const WT = [0.55, 1.05, 1.55, 2.05, 2.75, 3.75];   // each wheel step lands here
const backOut = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const wheelPos = (t) => WT.reduce((s, at, i) => s + backOut(seg(t, at - (i >= 4 ? 0.5 : 0.3), at)), 0);
const lblEls = [document.getElementById("lblB")];
const pills = [...document.querySelectorAll("#pills .pill")].map((el) => ({ el, at: parseFloat(el.dataset.at) }));
const rings = [...document.querySelectorAll("[data-ring]")].map((w) => ({ el: w.querySelector("ellipse"), at: parseFloat(w.dataset.ring) }));

let shot = null;
function renderAt(t) {
  t = clamp(t + OFF, 0, END - 1e-4);
  accum.shot = shot; accum.t = t;
  const po = shot.post(t); bloom.strength = po.bloom[0]; bloom.radius = po.bloom[1]; bloom.threshold = po.bloom[2];
  fx.uniforms.time.value = Math.floor(t * FPS) / FPS; fx.uniforms.grain.value = po.grain; fx.uniforms.vig.value = po.vig;
  composer.render(); titles(t);
  shot.labels(t).forEach((L, i) => { const el = lblEls[i]; el.style.left = `${L.x.toFixed(1)}px`; el.style.top = `${L.y.toFixed(1)}px`; el.style.opacity = L.k.toFixed(3);
    el.style.filter = `blur(${((1 - L.k) * 10).toFixed(2)}px)`; el.style.visibility = L.k > 0.001 ? "visible" : "hidden"; });
}

let ready = false;
const built = Promise.all([
  document.fonts.load("800 100px 'Noto Sans Hebrew'", "אבג"), document.fonts.load("500 40px 'Noto Sans Hebrew'", "אבג"), document.fonts.load("300 100px 'Noto Sans Hebrew'", "אבג"),
]).then(() => makeFilm()).then((f) => { shot = f; ready = true; });
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady["hopon"] = built;
built.then(() => renderAt(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => { if (ready) renderAt(e.detail.time); else built.then(() => renderAt(e.detail.time)); });
window.__renderAt = renderAt;
