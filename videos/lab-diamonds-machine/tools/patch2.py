"""Second round of fixes: the cutting station gets a back panel and labels. Run from the project root: python3 tools/patch2.py"""
p = "film.js"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)
rep("""let h = gear("c6g", 960, 560, 66, 12, 18, MUST) + flange(540, 330)""",
    """let h = gear("c6g", 960, 470, 66, 12, 18, MUST) + '<rect x="30" y="462" width="1020" height="340" rx="46" fill="' + INK + '"/>' + rr(30, 446, 1020, 340, 46, "#fbe2b6", 8) + rivet(76, 492) + rivet(1004, 492) + rivet(76, 740) + rivet(1004, 740) + flange(540, 330)""")
rep("""+ '<g id="c6star" transform="translate(600,860)">""", """+ pill("c6t1", 180, 800, "לייזר", { fs: 54, fill: "#c9f5d9" }) + pill("c6t2", 250, 1130, "ליטוש", { fs: 58, fill: MUST }) + '<g id="c6star" transform="translate(600,860)">""")
rep("""A($("c6wheel"), "transform", "rotate(" + (t * 900).toFixed(1) + ")");""", """A($("c6wheel"), "transform", "rotate(" + (t * 900).toFixed(1) + ")"); pop("c6t1", t, 40.15, 41.4); pop("c6t2", t, 41.5);""")
rep("""pill("p5m", 800, 330, "שיטה 2\"""", """pill("p5m", 310, 392, "שיטה 2\"""")
open(p, "w", encoding="utf8").write(s); print("ok")
