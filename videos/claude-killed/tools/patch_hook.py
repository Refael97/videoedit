"""Adds the photo hook in front of the light scene. Run once from the project root: python3 tools/patch_hook.py <images-dir>"""
import sys
from PIL import Image

src = sys.argv[1]
for n, o in [("65", "chalk"), ("66", "cobweb"), ("67", "bowling"), ("68", "detective")]:
    im = Image.open(src + "/" + n + ".webp").convert("RGB"); print(o, im.size); im.save("assets/img/" + o + ".jpg", quality=93)

p = "index.html"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)

rep('data-duration="5.2" data-width', 'data-duration="7.4" data-width')
rep('data-start="0" data-duration="5.2" data-track-index="10"', 'data-start="0" data-duration="7.4" data-track-index="10"')
rep("    </style>", """      /* the hook: one photo that says it all */
      #hook { position: absolute; inset: 0; overflow: hidden; background: #2a1c2e; z-index: 30; }
      #hookI { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; transform-origin: 28% 17%; }
      #hookS { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(30, 14, 40, 0.55) 0, rgba(30, 14, 40, 0) 42%); }
      #hk { position: absolute; left: 640px; top: 70px; width: 860px; text-align: center; direction: rtl; color: #fff; }
      #hk1 { font-size: 86px; font-weight: 900; line-height: 1; white-space: nowrap; text-shadow: 0 6px 30px rgba(20, 8, 30, 0.6); }
      #hk1 span { display: inline-block; margin: 0 10px; } #hk1 .cl { direction: ltr; }
      #hk2 { margin-top: 14px; font-size: 124px; font-weight: 900; line-height: 1.05; white-space: nowrap; color: #ff8a4c; text-shadow: 0 8px 34px rgba(20, 8, 30, 0.65); }
      #white { position: absolute; inset: 0; background: #fff; z-index: 31; opacity: 0; pointer-events: none; }
    </style>""")
rep('      <div id="vig"></div>', """      <div id="vig"></div>
      <div id="hook"><img id="hookI" src="assets/img/detective.jpg" /><div id="hookS"></div><div id="hk"><div id="hk1"><span class="cl">Claude</span><span>הרג</span><span>את</span></div><div id="hk2">עורכי הווידאו</div></div></div>
      <div id="white"></div>""")
rep("const DUR = 5.2, SW = 2.85;", "const MD = 5.2, H0 = 2.2, DUR = MD + H0, SW = 2.85;")
rep("""      function draw(t) {
        t = clamp(t, 0, DUR);""", """      // the hook photo: a camera flash, the headline slams in, then the camera dives into Claude's head and out into the light scene
      function hookDraw(t) {
        const hook = $("#hook"), img = $("#hookI"), dive = seg(t, 1.86, 2.3), slam = seg(t, 0.62, 0.7) * (1 - seg(t, 0.7, 1.0));
        hook.style.display = t < H0 + 0.2 ? "block" : "none"; hook.style.opacity = 1 - seg(t, H0 - 0.02, H0 + 0.18);
        const z = 1.06 + 0.07 * seg(t, 0, 1.9) + 0.03 * slam + Math.pow(dive, 3) * 9;
        img.style.transform = "translate(" + (Math.sin(t * 47) * 5 * slam).toFixed(1) + "px," + (Math.cos(t * 53) * 5 * slam).toFixed(1) + "px) scale(" + z.toFixed(4) + ")"; img.style.filter = "blur(" + (dive * dive * 26).toFixed(1) + "px) brightness(" + (1 + 0.5 * dive).toFixed(3) + ")";
        $$("#hk1 span").forEach((sp, i) => { const q = outExpo(seg(t, 0.2 + i * 0.1, 0.55 + i * 0.1)); sp.style.opacity = q; sp.style.transform = "translateY(" + ((1 - q) * 40).toFixed(1) + "px)"; sp.style.filter = "blur(" + ((1 - q) * 12).toFixed(1) + "px)"; });
        const q2 = outExpo(seg(t, 0.6, 0.86)), h2 = $("#hk2"); h2.style.opacity = seg(t, 0.6, 0.66); h2.style.transform = "scale(" + (1 + 1.1 * (1 - q2)).toFixed(3) + ") rotate(" + ((1 - q2) * -4).toFixed(2) + "deg)";
        $("#hk").style.opacity = 1 - seg(t, 1.8, 1.98); $("#hk").style.transform = "scale(" + (1 + 0.5 * dive).toFixed(3) + ")";
        const flash = (1 - seg(t, 0.0, 0.22)) * 0.9 + seg(t, 0.6, 0.64) * (1 - seg(t, 0.64, 0.85)) * 0.35 + seg(t, 2.0, H0) * (1 - seg(t, H0, H0 + 0.5));
        $("#white").style.opacity = clamp(flash).toFixed(3);
      }
      function draw(T) { T = clamp(T, 0, DUR); hookDraw(T); mainDraw(T - H0); }
      function mainDraw(t) {
        t = clamp(t, 0, MD);""")
rep("const kick = seg(t, SW, SW + 0.08) * (1 - seg(t, SW + 0.08, SW + 0.45));", "const kick = seg(t, SW, SW + 0.08) * (1 - seg(t, SW + 0.08, SW + 0.45)), DUR = MD;")
open(p, "w", encoding="utf8").write(s)

m = open("tools/mixbed.py", encoding="utf8").read()
a = "DUR, SW = 5.2, 2.85"; assert m.count(a) == 1
m = m.replace(a, "H0 = 2.2\nDUR, SW = 5.2 + H0, 2.85 + H0")
a = 'ev = [("whoosh", 0.7, 0.5), ("impact", 0.78, 0.8), ("pop", 1.8, 0.4), ("pop", 1.95, 0.4), ("pop", 2.1, 0.4), ("pop", 2.32, 0.6),'; assert m.count(a) == 1
m = m.replace(a, 'ev = [("impact", 0.0, 0.7), ("impact", 0.62, 0.95), ("riser", 0.9, 0.35), ("whoosh", 1.9, 0.8), ("whoosh", 0.7 + H0, 0.4), ("pop", 1.8 + H0, 0.4), ("pop", 1.95 + H0, 0.4), ("pop", 2.1 + H0, 0.4), ("pop", 2.32 + H0, 0.6),')
open("tools/mixbed.py", "w", encoding="utf8").write(m)
print("ok")
