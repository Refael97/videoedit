"""Swaps in the current Isrotel logo (traced wordmark) and gives it a draw-on entrance: contour rings, outline, fill."""
p = "index.html"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)
def cut(a, b, new):
    global s
    i = s.index(a); j = s.index(b, i); s = s[:i] + new + s[j:]

rep('        <div id="sun"></div>\n        <img id="logo" src="assets/img/logo.svg" />',
    '        <div id="rings"></div>\n        <svg id="logo" xmlns="http://www.w3.org/2000/svg"></svg>')
cut("      #logo { position: absolute;", "      #tagline {",
    """      #logo { position: absolute; left: 660px; top: 356px; width: 600px; height: 354px; overflow: visible; transform-origin: 50% 50%; }
      #logo path { fill: #002d74; fill-rule: evenodd; stroke: #002d74; stroke-width: 1.6; stroke-linejoin: round; }
      #rings { position: absolute; left: 960px; top: 520px; width: 0; height: 0; transform-style: preserve-3d; }
      #rings i { position: absolute; border-radius: 50%; border: 2.5px solid #002d74; }
""")
rep('<script src="assets/vendor/gsap.min.js"></script>', '<script src="assets/vendor/gsap.min.js"></script>\n    <script src="assets/img/logo_paths.js"></script>')
rep("      // cursor path: [time, x, y]", """      // the logo: one path per letter, so the outline can draw before the fill arrives
      const LG = $("#logo"), NSV = "http://www.w3.org/2000/svg", B = LOGO.box; LG.setAttribute("viewBox", (B[0] - 6) + " " + (B[1] - 6) + " " + (B[2] + 12) + " " + (B[3] + 12));
      const letters = [...LOGO.top.map((d, i) => [d, 0, i]), ...LOGO.bot.map((d, i) => [d, 1, i])].map(([d, row, i]) => { const e = document.createElementNS(NSV, "path"); e.setAttribute("d", d); LG.appendChild(e); const L = e.getTotalLength(); e.style.strokeDasharray = L; return { e, L, row, i }; });
      const rings = []; for (let i = 0; i < 7; i++) { const r = document.createElement("i"), w = 520 + i * 70, h = 150 + i * 46; r.style.cssText = "width:" + w + "px;height:" + h + "px;left:" + -w / 2 + "px;top:" + -h / 2 + "px"; $("#rings").appendChild(r); rings.push(r); }
      // cursor path: [time, x, y]""")
cut("        // 1. logo:", "        // 2. headline",
    """        // 1. logo: contour rings spin in and tighten, the outline draws letter by letter, the fill lands, then it flies to the corner
        const out = inOut(seg(t, 1.5, 2.05)), settle = outBack(seg(t, 0.95, 1.35));
        rings.forEach((r, i) => { const q = seg(t, 0.0 + i * 0.03, 1.0 + i * 0.03), e = outCubic(q); r.style.opacity = (seg(t, 0, 0.12) * (1 - seg(q, 0.62, 1)) * (0.9 - i * 0.09)).toFixed(3);
          r.style.transform = "rotateX(" + (lerp(78, 0, e) + i * 3).toFixed(1) + "deg) rotateY(" + (lerp(-60 + i * 22, 0, e)).toFixed(1) + "deg) rotateZ(" + (lerp(i * 40, 0, e) + t * 30).toFixed(1) + "deg) scale(" + lerp(1.5 - i * 0.05, 0.55, e).toFixed(3) + ")"; });
        letters.forEach((l) => { const a = l.row ? 1.0 + l.i * 0.05 : 0.28 + l.i * 0.075, d = seg(t, a, a + (l.row ? 0.3 : 0.55)), f = seg(t, a + (l.row ? 0.12 : 0.4), a + (l.row ? 0.34 : 0.7));
          l.e.style.strokeDashoffset = (l.L * (1 - inOut(d))).toFixed(1); l.e.style.fillOpacity = f.toFixed(3); l.e.style.opacity = d > 0 ? 1 : 0;
          l.e.style.transform = "translateY(" + ((1 - outCubic(seg(t, a, a + 0.4))) * (l.row ? 14 : -10)).toFixed(1) + "px)"; });
        LG.style.transform = "translate3d(" + lerp(0, 736, out).toFixed(1) + "px," + lerp(0, -432, out).toFixed(1) + "px," + (70 * (1 - out)).toFixed(1) + "px) scale(" + ((0.94 + 0.06 * settle) * lerp(1, 0.3, out)).toFixed(4) + ")";
        const tg = $("#tagline"); tg.style.opacity = seg(t, 1.05, 1.35) * (1 - seg(t, 1.45, 1.62)); tg.style.transform = "translateY(" + ((1 - outCubic(seg(t, 1.05, 1.4))) * 24 + 40).toFixed(1) + "px)";
""")
# everything after the logo starts a little later
for a, b in [("seg(t, 1.5 + i * 0.09, 2.0 + i * 0.09)", "seg(t, 1.7 + i * 0.09, 2.2 + i * 0.09)"), ('[["#f1", 1.6, 70], ["#f2", 1.72, 40], ["#f3", 1.84, 20], ["#btn", 1.96, 90]]', '[["#f1", 1.8, 70], ["#f2", 1.92, 40], ["#f3", 2.04, 20], ["#btn", 2.16, 90]]'), ("inOut(seg(t, 1.4, 5.6))", "inOut(seg(t, 1.5, 5.6))"),
             ("const CP = [[1.9, 1560, 940], [2.45, 1500, 524],", "const CP = [[2.1, 1560, 940], [2.47, 1500, 524],"), ("cur.style.opacity = seg(t, 1.9, 2.1)", "cur.style.opacity = seg(t, 2.1, 2.3)")]:
    rep(a, b)
open(p, "w", encoding="utf8").write(s)
m = open("tools/mixbed.py", encoding="utf8").read()
a = '("impact", 0.1, 0.5), ("pop", 0.38, 0.5), ("whoosh", 1.3, 0.5), ("pop", 1.6, 0.4), ("pop", 1.72, 0.4), ("pop", 1.84, 0.4), ("pop", 1.96, 0.5),'; assert m.count(a) == 1
open("tools/mixbed.py", "w", encoding="utf8").write(m.replace(a, '("whoosh", 0.0, 0.5), ("impact", 1.0, 0.5), ("whoosh", 1.45, 0.5), ("pop", 1.8, 0.4), ("pop", 1.92, 0.4), ("pop", 2.04, 0.4), ("pop", 2.16, 0.5),'))
print("ok")
