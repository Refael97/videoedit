"""Camera now zooms into each element in its turn (destination field, calendar), pulls back, then pushes into the button."""
p = "index.html"; s = open(p, encoding="utf8").read()
i = s.index("        const push = inCubic(seg(t, 5.62, 6.15))"); j = s.index('        $("#wh").style.opacity', i)
new = """        const push = inCubic(seg(t, 5.62, 6.15));
        // camera keys: [time, focus x, focus y, zoom]; it eases from each key to the next
        const KEYS = [[0, 960, 540, 0.97], [2.4, 960, 540, 1.0], [2.95, 1440, 600, 1.5], [3.6, 1440, 612, 1.58], [4.1, 1085, 735, 1.42], [5.15, 1085, 748, 1.5], [5.58, 960, 540, 1.03], [9, 960, 540, 1.03]];
        let ki = 0; while (ki < KEYS.length - 2 && t > KEYS[ki + 1][0]) ki++; const ka = KEYS[ki], kb = KEYS[ki + 1], kk = inOut(seg(t, ka[0], kb[0]));
        const fx = lerp(lerp(ka[1], kb[1], kk), 310, push), fy = lerp(lerp(ka[2], kb[2], kk), 522, push), zm = lerp(ka[3], kb[3], kk) + push * 5, tilt = (1 - push) / (1 + (zm - 1) * 1.6), k = inOut(seg(t, 1.5, 5.6));
        $("#world").style.transformOrigin = "50% 50%";
        T3($("#world"), (960 - fx) * zm, (540 - fy) * zm, 0, zm, lerp(9, 3, k) * tilt, lerp(-7, 5, k) * tilt);
"""
s = s[:i] + new + s[j:]
open(p, "w", encoding="utf8").write(s)
m = open("tools/mixbed.py", encoding="utf8").read()
a = '("click", 5.62, 0.9), ("whoosh", 5.6, 0.7)]'; assert m.count(a) == 1
open("tools/mixbed.py", "w", encoding="utf8").write(m.replace(a, '("click", 5.62, 0.9), ("whoosh", 5.6, 0.7), ("whoosh", 2.45, 0.35), ("whoosh", 3.65, 0.35), ("whoosh", 5.15, 0.35)]'))
print("ok")
