#!/usr/bin/env python3
"""index.html = src/template.html + narration word times + caption groups.

assets/vo.mp3 is the assembled take (5 paragraphs, 1.09x, -16 LUFS); data/words.json is its scribe
transcript, so word times are used as-is. Captions: groups of up to 4 words, broken after punctuation.
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent
DURATION = 54.5

words = json.loads((ROOT / "data/words.json").read_text(encoding="utf-8"))["words"]
W = [round(w["start"], 3) for w in words]

groups, cur = [], []
for i, w in enumerate(words):
    cur.append(i)
    if len(cur) == 4 or w["text"][-1] in ".,?!" or i == len(words) - 1:
        groups.append(cur)
        cur = []

cap_html, cap_data = [], []
for g, idx in enumerate(groups):
    spans = "".join(f'<span id="cw{i}">{html.escape(words[i]["text"].rstrip(".,"))}</span> ' for i in idx)
    cap_html.append(f'<div class="capg" id="cg{g}">{spans.strip()}</div>')
    end = W[groups[g + 1][0]] if g + 1 < len(groups) else words[idx[-1]]["end"] + 0.5
    cap_data.append([idx, W[idx[0]], round(end, 3)])

page = (ROOT / "src/template.html").read_text(encoding="utf-8")
page = (page.replace("{{W}}", json.dumps(W)).replace("{{CAPS}}", "\n        ".join(cap_html))
        .replace("{{CAPDATA}}", json.dumps(cap_data)).replace("{{DURATION}}", str(DURATION)))
assert "{{" not in page
(ROOT / "index.html").write_text(page, encoding="utf-8")
print(f"index.html written: {len(words)} words, {len(groups)} caption groups")
