"""Builds index.html from src.html: pastes the proven engine blocks (neon trail, dust, headlines) from reference/bit.html,
recoloured for Sonol. Edit src.html, then run from the project root: python3 tools/build_index.py"""
import re

bit = open("reference/bit.html", encoding="utf8").read()
def block(a, b):
    i = bit.index(a); j = bit.index(b, i) + len(b); return bit[i:j]

trail = block("      // ---------- neon trail", '714,894 L714,830";')
dust = block("      // ---------- dust", 'tl.set("#dustL", { opacity: 1 }, 0);')
heads = block("      // ---------- headlines", "{ scale: 1.7, opacity: 0, duration: 0.42 }] }, at);")

for old, new in [("rgba(22,196,210,0.6)", "rgba(226,31,38,0.6)"), ("#39edf6", "#ff4750"), ("rgba(30,200,215,0.8)", "rgba(255,60,70,0.8)"), ("#f0ffff", "#fff3f1")]:
    trail = trail.replace(old, new)

src = open("src.html", encoding="utf8").read()
for key, val in [("/*__TRAIL__*/", trail), ("/*__DUST__*/", dust), ("/*__HEADLINES__*/", heads)]:
    assert src.count(key) == 1, key
    src = src.replace(key, val)
open("index.html", "w", encoding="utf8").write(src)
print("index.html written", len(src))
