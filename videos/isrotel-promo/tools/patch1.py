"""Fixes after the first frame review: wider guests field, cursor inside the 3D world so clicks land, push aimed at the button."""
p = "index.html"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)
rep('id="f1" style="left:1240px;top:470px;width:420px"', 'id="f1" style="left:1300px;top:470px;width:420px"')
rep('id="f2" style="left:820px;top:470px;width:400px"', 'id="f2" style="left:880px;top:470px;width:400px"')
rep('id="f3" style="left:420px;top:470px;width:380px"', 'id="f3" style="left:440px;top:470px;width:420px"')
rep('id="btn" style="left:180px;top:470px;width:220px"', 'id="btn" style="left:200px;top:470px;width:220px"')
rep('id="sug" style="left:1240px;top:596px;width:420px;height:132px"', 'id="sug" style="left:1260px;top:596px;width:460px;height:132px"')
rep('id="cal" style="left:800px;top:596px;width:440px;height:392px"', 'id="cal" style="left:860px;top:596px;width:440px;height:392px"')
rep('#sug .x { margin-right: auto; font: 400 18px "Heebo";', '#sug .x { margin-right: auto; white-space: nowrap; font: 400 16px "Heebo";')
# the cursor lives inside the world
i = s.index('      <svg id="cur"'); j = s.index("</svg>", i) + len("</svg>\n"); cur = s[i:j]; s = s[:i] + s[j:]
rep('      </div>\n      <div id="wh"></div>', "  " + cur + '      </div>\n      <div id="wh"></div>')
rep("const CP = [[1.9, 1500, 900], [2.45, 1560, 530], [3.3, 1560, 540], [3.75, 1050, 526], [4.2, 1012, 868], [4.55, 1012, 868], [4.8, 884, 868], [5.1, 884, 868], [5.55, 300, 530], [6.2, 296, 526]];",
    "const CP = [[1.9, 1560, 940], [2.45, 1500, 524], [3.3, 1500, 530], [3.75, 1070, 524], [4.2, 1236, 896], [4.55, 1236, 896], [4.8, 1127, 896], [5.1, 1127, 896], [5.55, 306, 524], [6.2, 306, 524]];")
rep('lerp(50, 15.1, push) + "% " + lerp(50, 48.3, push) + "%"', 'lerp(50, 16.1, push) + "% " + lerp(50, 48.3, push) + "%"')
rep('cur.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) scale(" + (1 - 0.22 * pr).toFixed(3) + ")";', 'cur.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,170px) scale(" + (1 - 0.22 * pr).toFixed(3) + ")";')
open(p, "w", encoding="utf8").write(s); print("ok")
