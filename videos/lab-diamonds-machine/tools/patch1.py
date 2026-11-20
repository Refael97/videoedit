"""One-off fixes after the first frame review. Run from the project root: python3 tools/patch1.py"""
p = "film.js"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)
# the two domes stay hidden until they drop
rep('[["q1L", 4.5], ["q1R", 4.72]].forEach(([id, a]) => T($(id), 0, lerp(-900, 0, bounce(seg(t, a, a + 0.9))), 0));',
    '[["q1L", 4.5], ["q1R", 4.72]].forEach(([id, a]) => { T($(id), 0, lerp(-700, 0, bounce(seg(t, a, a + 0.9))), 0); show($(id), t >= a ? 1 : 0); });')
# the seed arm is clipped to the glass dome
rep("""+ '<g id="s3arm"><rect x="524" y="-200\"""", """+ '<g clip-path="url(#s3clip)"><g id="s3arm"><rect x="524" y="-200\"""")
rep("""stroke-linecap="round" stroke-linejoin="round"/></g>';
  h += '<g id="s3plate">""", """stroke-linecap="round" stroke-linejoin="round"/></g></g>';
  h += '<g id="s3plate">""")
# press: the piston sits behind the top beam and its readout
rep("rr(232, 380, 76, 790, 10, TEAL2) + rr(772, 380, 76, 790, 10, TEAL2) + body(190, 280, 700, 150, 40) + body(190, 1120, 700, 150, 40) + flange(540, 276);",
    "rr(232, 380, 76, 790, 10, TEAL2) + rr(772, 380, 76, 790, 10, TEAL2) + body(190, 1120, 700, 150, 40);")
i = s.index("""  h += '<g id="p4top">"""); j = s.index("\n", i) + 1; top = s[i:j]; s = s[:i] + s[j:]
disp = """  h += '<rect x="300" y="322" width="480" height="72" rx="16" fill="#16222a\""""
assert s.count(disp) == 1
s = s.replace(disp, top + "  h += body(190, 280, 700, 150, 40) + flange(540, 276);\n" + disp)
rep('<g id="p4e" transform="translate(830,790)"', '<g id="p4e" transform="translate(790,590)"')
open(p, "w", encoding="utf8").write(s)
h = open("index.html", encoding="utf8").read()
k = '<clipPath id="hop2">'; assert h.count(k) == 1
open("index.html", "w", encoding="utf8").write(h.replace(k, '<clipPath id="s3clip"><rect x="254" y="404" width="572" height="540" /></clipPath>\n          ' + k))
print("ok")
