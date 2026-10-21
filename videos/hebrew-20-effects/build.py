#!/usr/bin/env python3
"""Generates index.html for the Hebrew "20 video effects" reel from src/template.html + data/words.json.

Run: python3 tools/make_vo.py (once per take), then python3 build.py
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
sys.path.insert(0, str(ROOT / "tools"))
from timing import EFFECT_T, EFFECTS, CTA_T  # noqa: E402

RAW = json.loads((ROOT / "data/words.json").read_text(encoding="utf-8"))["words"]
DISPLAY = {"קלוד,": "Claude,", "בי-רול.": "B-Roll", "וצ'קליסט.": "וצ'קליסט"}
HIGHLIGHT = {"Claude", "עריכה", "AI", "ה-AI", "מקצועית", "תעקבו", "צמוד", "פרומפט", "הגולמי"}

WORDS = [{"t": DISPLAY.get(x["text"], x["text"]), "s": x["start"], "e": x["end"]} for x in RAW if x["text"] != "—"]
DURATION = float(json.loads((ROOT / "data/presenter.json").read_text())["duration"])


def clean(t):
    return re.sub(r"[.,:]$", "", t.strip('"'))


def captions():
    """One word on screen at a time (as in the original), held until the next word."""
    out = []
    for i, w in enumerate(WORDS):
        nxt = WORDS[i + 1]["s"] if i + 1 < len(WORDS) else w["e"] + 0.8
        e = min(nxt, w["e"] + 0.45)
        t = clean(w["t"])
        out.append({"t": t, "s": round(w["s"], 3), "e": round(e, 3), "hi": t in HIGHLIGHT})
    return out


CAPS = captions()
EFF_END = EFFECT_T[1:] + [CTA_T]


def build_captions():
    return "\n      ".join(
        f'<div class="clip cap" id="cap{i}" data-start="{c["s"]:.3f}" data-duration="{c["e"] - c["s"]:.3f}" data-track-index="20">'
        f'<span class="{"w hi" if c["hi"] else "w"}">{html.escape(c["t"])}</span></div>'
        for i, c in enumerate(CAPS))


def build_badges():
    out = []
    for k, (name, s, e) in enumerate(zip(EFFECTS, EFFECT_T, EFF_END)):
        out.append(f'<div class="clip badge" id="bd{k}" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="18">'
                   f'<span class="num">{k + 1:02d}</span><span class="nm">{html.escape(name)}</span></div>')
    return "\n      ".join(out)


def build_list(cls, ks):
    return "".join(f'<li class="{cls}" id="{cls}{k}"><i>{k + 1:02d}</i>{html.escape(EFFECTS[k])}</li>' for k in ks)


SFX_LEN = {"whoosh": 0.7, "impact": 0.9, "pop": 0.12, "riser": 1.6, "strike": 0.3}
SFX = [("impact", 0.0, 0.6), ("riser", 1.7, 0.35)]
for k, t in enumerate(EFFECT_T):
    SFX.append(("whoosh" if k % 2 == 0 else "strike", t - 0.08, 0.45))
SFX += [("pop", 10.75, 0.4), ("pop", 11.05, 0.4), ("pop", 11.35, 0.4),          # checklist pop
        ("impact", 13.0, 0.45), ("impact", 31.95, 0.5),                          # headline storm, zoom cut
        ("strike", 34.85, 0.6),                                                  # frame break
        ("riser", 39.6, 0.3), ("impact", CTA_T - 0.05, 0.6),
        ("whoosh", 43.6, 0.45), ("pop", 46.3, 0.4), ("pop", 48.0, 0.4), ("whoosh", 48.7, 0.45),
        ("pop", 51.6, 0.45), ("whoosh", 53.6, 0.45), ("pop", 57.2, 0.5)]


def build_sfx():
    return "\n      ".join(
        f'<audio id="sfx{k}" src="assets/audio/{n}.wav" data-start="{max(0, t):.3f}" data-duration="{SFX_LEN[n]}" data-track-index="{40 + k}" data-volume="{v}"></audio>'
        for k, (n, t, v) in enumerate(SFX))


# matted cut-outs exist only where an effect needs the subject alone: (start in the presenter clip, length)
CUT_SEGS = [(6.5, 2.2), (16.7, 4.3), (22.8, 6.8), (33.1, 1.7)]


def build_cut_videos():
    return "".join(
        f'<video id="fg{k}" class="clip" src="assets/video/fg{k}.webm" muted playsinline data-start="{s}" data-duration="{d}" data-track-index="9"></video>'
        for k, (s, d) in enumerate(CUT_SEGS))


page = (ROOT / "src/template.html").read_text(encoding="utf-8")
page = (page.replace("{{CUT_VIDEOS}}", build_cut_videos()).replace("{{CAPTIONS}}", build_captions()).replace("{{BADGES}}", build_badges())
        .replace("{{LIST_A1}}", build_list("la", range(10))).replace("{{LIST_A2}}", build_list("la", range(10, 20)))
        .replace("{{LIST_C1}}", build_list("lc", range(10))).replace("{{LIST_C2}}", build_list("lc", range(10, 20)))
        .replace("{{TAIL}}", f"{DURATION - 53.7:.2f}")
        .replace("{{SFX}}", build_sfx()).replace("{{DURATION}}", f"{DURATION:.2f}")
        .replace("{{EFFECT_T}}", json.dumps(EFFECT_T)).replace("{{CTA_T}}", str(CTA_T)))
assert "{{" not in page, re.findall(r"\{\{[^}]+\}\}", page)[:5]
(ROOT / "index.html").write_text(page, encoding="utf-8")
(ROOT / "data/captions.json").write_text(json.dumps(CAPS, ensure_ascii=False), encoding="utf-8")
print("index.html written:", len(page), "bytes; duration", DURATION)
