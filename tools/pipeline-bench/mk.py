# writes a self-contained HyperFrames project dir for the bench shot: mk.py <dir> <W> <H> <fps> <frames>
import sys, os
d, W, H, fps, frames = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
os.makedirs(d, exist_ok=True)
for n in ("assets", "scene.js"):
    p = os.path.join(d, n)
    if not os.path.lexists(p): os.symlink(os.path.join("..", n), p)
open(os.path.join(d, "index.html"), "w").write(f"""<!doctype html>
<html lang="he"><head><meta charset="UTF-8" /><meta name="viewport" content="width={W}, height={H}" />
<style>
@font-face {{ font-family: "Heebo"; font-weight: 800; src: url("assets/heebo-hebrew-800-normal.woff2") format("woff2"); unicode-range: U+0590-05FF; }}
@font-face {{ font-family: "Heebo"; font-weight: 500; src: url("assets/heebo-hebrew-500-normal.woff2") format("woff2"); unicode-range: U+0590-05FF; }}
@font-face {{ font-family: "JBM"; font-weight: 500; src: url("assets/jetbrains-mono-latin-500-normal.woff2") format("woff2"); }}
html, body {{ width: {W}px; height: {H}px; margin: 0; overflow: hidden; background: #000; }}
#root {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; }}
#gl {{ position: absolute; left: 0; top: 0; width: {W}px; height: {H}px; display: block; }}
</style>
<script type="importmap">{{ "imports": {{ "three": "./assets/vendor/three/three.module.js", "three/addons/": "./assets/vendor/three/addons/" }} }}</script>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{frames / fps}" data-fps="{fps}" data-width="{W}" data-height="{H}" data-no-timeline>
  <canvas id="gl" width="{W}" height="{H}"></canvas>
  <div id="hud" style="display:none; position:absolute; inset:0; pointer-events:none; --s:calc({W}px / 1080);">
    <div style="position:absolute; left:calc(60*var(--s)); right:calc(60*var(--s)); top:calc(72*var(--s)); display:flex; justify-content:space-between; font:500 calc(26*var(--s)) JBM, monospace; color:rgba(18,18,20,.55);"><span>HOW A STUDIO SHOT IS BUILT</span><span>02 / 04</span></div>
    <div style="position:absolute; left:calc(60*var(--s)); right:calc(60*var(--s)); top:calc(120*var(--s)); height:calc(2*var(--s)); background:rgba(18,18,20,.55);"></div>
    <div dir="rtl" style="position:absolute; right:calc(60*var(--s)); bottom:calc(220*var(--s)); text-align:right; color:#121214;"><div style="font:800 calc(120*var(--s))/1.1 Heebo;">סטודיו אחד</div><div style="font:500 calc(40*var(--s))/1.6 Heebo; color:#55555c;">חומר אחד, אור אחד, צבע הדגשה אחד.</div></div>
  </div>
</div>
<script type="module">
import {{ createShot }} from "./scene.js";
const FPS = {fps}, FRAMES = {frames};
window.__stats = {{ seeks: 0, renders: 0, frames: new Set(), renderMs: 0 }};
let shot = null; const PX = new Uint8Array(4); window.__stats.scriptAt = performance.now(); if (new URLSearchParams(location.search).get('htmlHud')) document.getElementById('hud').style.display = 'block';
const built = Promise.all([document.fonts.load("800 100px Heebo", "אב"), document.fonts.load("500 20px Heebo", "אב"), document.fonts.load("500 20px JBM")])
  .then(() => {{ shot = createShot({{ canvas: document.getElementById("gl"), W: {W}, H: {H}, fps: FPS, frames: FRAMES, scale: {W}/1080, opts: Object.fromEntries(new URLSearchParams(location.search).entries()) }}); window.__stats.buildMs = shot.buildMs; window.__stats.builtAt = performance.now(); }});
const draw = (f) => {{ const t0 = performance.now(); shot.renderFrame(f); {{ const g = shot.renderer.getContext(); g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, PX); }} window.__stats.renderMs += performance.now() - t0; window.__stats.renders++; window.__stats.frames.add(f); }};
window.__hf = window.__hf || {{}}; window.__hf.buildReady = window.__hf.buildReady || {{}}; window.__hf.buildReady["bench"] = built;
built.then(() => draw(0));
const fOf = (t) => Math.min(FRAMES - 1, Math.round(t * FPS));
window.addEventListener("hf-seek", (e) => {{ window.__stats.seeks++; if (shot) draw(fOf(e.detail.time)); else built.then(() => draw(fOf(e.detail.time))); }});
window.__renderFrame = (f) => built.then(() => draw(f));
window.__profile = (f) => built.then(() => shot.profileFrame(f));
</script>
</body></html>
""")
