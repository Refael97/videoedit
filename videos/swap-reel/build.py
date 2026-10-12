#!/usr/bin/env python3
"""Generates index.html for the character-swap reel from src/template.html + data/words.json.

Run: python3 build.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
RAW = json.loads((ROOT / "data/words.json").read_text(encoding="utf-8"))["words"]

DISPLAY = {"להיגספילד,": "ל-Higgsfield,", "ג'נג'וטסו,": "Genjutsu,", "ג'נג'וטסו": "Genjutsu",
           "בסידאנס": "ב-Seedance", "בקאפקאט": "ב-CapCut"}
WORDS = []
for x in RAW:
    if x["text"] == "—":
        continue
    WORDS.append({"t": DISPLAY.get(x["text"], x["text"]), "s": round(x["start"], 3), "e": round(x["end"], 3)})

PHRASES = """אנשים כבר עושים כסף
מהחלפת דמויות
בסרטונים ויראליים
ואתם עדיין יושבים
על הגדר?!
תראו את זה.
אותו סרטון,
אותה תנועה,
אותה מצלמה
רק דמות אחרת לגמרי.
וזה לוקח בערך
רבע שעה.
צריך רק שני דברים:
סרטון ויראלי,
ותמונה של דמות.
יוצרים דף דמות
חזית, צד וגב.
דמות מוגזמת
עובדת הכי טוב.
נכנסים ל-Higgsfield,
בוחרים Genjutsu,
מעלים את הסרטון
ואת התמונה,
וכותבים בפרומפט
מי יוצא ומי נכנס.
טיפ חשוב:
אל תנסו את זה ב-Seedance
עם פנים אמיתיות
זה נחסם.
Genjutsu עבד לנו
בכל ריצה,
בערך שבעה קרדיטים
לשנייה.
מחזירים את הסאונד
המקורי ב-CapCut
ויש לכם סרטון
שעוצר את הגלילה!
רק דמויות מקוריות,
ופנים של אנשים אמיתיים
רק באישור שלהם.
רוצים את תבנית
הפרומפט המדויקת?
כתבו בתגובות "פרומפט",
ואני שולח לכם אותה.""".split("\n")

HIGHLIGHT = {"כסף", "ויראליים", "הגדר?!", "אחרת", "לגמרי.", "רבע", "שעה.", "שני", "דף", "מוגזמת",
             "ל-Higgsfield,", "Genjutsu,", "Genjutsu", "יוצא", "נכנס.", "ב-Seedance", "נחסם.", "שבעה",
             "ב-CapCut", "הגלילה!", "מקוריות,", "באישור", '"פרומפט",', "חזית,", "צד", "וגב."}


def captions():
    out, i = [], 0
    for p in PHRASES:
        g = []
        for tok in p.split():
            assert WORDS[i]["t"].strip(",") == tok.strip(","), (i, WORDS[i]["t"], tok)
            g.append(WORDS[i])
            i += 1
        out.append({"s": g[0]["s"], "e": g[-1]["e"],
                    "w": [{"t": re.sub(r",$", "", x["t"]), "s": x["s"], "hi": x["t"] in HIGHLIGHT} for x in g]})
    assert i == len(WORDS), (i, len(WORDS))
    for k, g in enumerate(out):
        nxt = out[k + 1]["s"] if k + 1 < len(out) else g["e"] + 1.2
        g["e"] = round(min(nxt - 0.02, g["e"] + 0.45), 3)
    return out


CAPS = captions()
DURATION = round(WORDS[-1]["e"] + 1.6, 2)

SCENES = {
    "s01": (0.0, 5.6),     # hook montage
    "s02": (5.6, 11.32),   # same video, different character (wipe)
    "s03": (11.32, 13.2),  # 15 minutes
    "s04": (13.2, 17.05),  # two things
    "s05": (17.05, 22.34), # character sheet
    "s06": (22.34, 29.62), # Genjutsu UI
    "s07": (29.62, 38.1),  # tip: Seedance vs Genjutsu
    "s08": (38.1, 42.66),  # sound back, haircut reveal
    "s09": (42.66, 47.05), # rules
    "s10": (47.05, DURATION),  # CTA
}

# timed videos: (id, src, start, duration, media_start, css class)
H = [0.0, 0.62, 1.24, 1.86, 2.48, 3.1, 3.72, 4.34, 4.96, 5.6]
HOOK_SRC = ["metro-ai", "street-ai", "boxer-ai", "haircut-ai", "metro-ai", "street-ai", "boxer-ai", "haircut-ai", "street-ai"]
HOOK_OFF = [2.0, 1.0, 4.0, 8.0, 7.0, 6.0, 9.0, 9.5, 8.0]
VIDEOS = [(f"vh{k}", f"assets/video/{HOOK_SRC[k]}.mp4", H[k], round(H[k + 1] - H[k], 3), HOOK_OFF[k], "full") for k in range(9)]
s, e = SCENES["s02"]
VIDEOS += [("v2a", "assets/video/street.mp4", s, e - s, 3.0, "full"), ("v2b", "assets/video/street-ai.mp4", s, e - s, 3.0, "full wipe")]
s, e = SCENES["s03"]
VIDEOS += [("v3", "assets/video/metro-ai.mp4", s, e - s, 6.0, "full dim")]
s, e = SCENES["s04"]
VIDEOS += [("v4a", "assets/video/boxer.mp4", s, e - s, 4.0, "card card-a"), ("v4b", "assets/video/boxer-ai.mp4", s, e - s, 4.0, "card card-b")]
s, e = SCENES["s07"]
VIDEOS += [("v7", "assets/video/boxer-ai.mp4", s, e - s, 6.0, "full blur")]
s, e = SCENES["s08"]
VIDEOS += [("v8a", "assets/video/haircut.mp4", s, 2.2, 1.0, "full"), ("v8b", "assets/video/haircut-ai.mp4", s, e - s, 1.0, "full reveal")]
s, e = SCENES["s09"]
VIDEOS += [("v9", "assets/video/metro-ai.mp4", s, e - s, 9.0, "full")]
s, e = SCENES["s10"]
for k, n in enumerate(["metro-ai", "street-ai", "boxer-ai", "haircut-ai"]):
    VIDEOS.append((f"v10{k}", f"assets/video/{n}.mp4", s, e - s, 1.0, f"quad q{k}"))

SFX_LEN = {"whoosh": 0.7, "impact": 0.9, "pop": 0.12, "riser": 1.6, "strike": 0.3}
SFX = [("impact", 0.0, 0.7)] + [("whoosh", t - 0.05, 0.35) for t in H[1:9]] + [
    ("impact", 4.9, 0.8), ("whoosh", 5.55, 0.5), ("pop", 8.1, 0.4), ("pop", 8.88, 0.4), ("pop", 10.0, 0.45),
    ("riser", 9.8, 0.4), ("impact", 11.3, 0.7), ("whoosh", 13.15, 0.5), ("pop", 14.84, 0.4), ("pop", 15.88, 0.4),
    ("whoosh", 17.0, 0.5), ("pop", 18.48, 0.4), ("pop", 19.12, 0.4), ("pop", 19.36, 0.4), ("impact", 20.56, 0.6),
    ("whoosh", 22.3, 0.5), ("pop", 25.4, 0.4), ("pop", 26.19, 0.4), ("whoosh", 29.6, 0.5), ("strike", 33.3, 0.6),
    ("pop", 34.2, 0.45), ("riser", 38.1, 0.35), ("impact", 40.29, 0.75), ("whoosh", 42.62, 0.5), ("pop", 43.44, 0.4),
    ("pop", 45.96, 0.4), ("whoosh", 47.0, 0.5), ("impact", 50.0, 0.7),
]


def scene_attrs(sid):
    a, b = SCENES[sid]
    return f'id="{sid}" class="clip scene" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="2"'


def build_videos():
    out = []
    for vid, src, start, dur, ms, cls in VIDEOS:
        out.append(f'<div class="vwrap {cls}" id="{vid}w"><video id="{vid}" class="clip bg-video" src="{src}" muted playsinline '
                   f'data-start="{start:.3f}" data-duration="{dur:.3f}" data-media-start="{ms}" data-track-index="0"></video></div>')
    return "\n      ".join(out)


def build_captions():
    out = []
    for i, g in enumerate(CAPS):
        spans = [f'<span class="{"w hi" if w["hi"] else "w"}" id="c{i}w{j}">{html.escape(w["t"])}</span>' for j, w in enumerate(g["w"])]
        out.append(f'<div class="clip cap" id="cap{i}" data-start="{g["s"]:.3f}" data-duration="{g["e"] - g["s"]:.3f}" data-track-index="6">{" ".join(spans)}</div>')
    return "\n      ".join(out)


def build_sfx():
    return "\n      ".join(
        f'<audio id="sfx{k}" src="assets/audio/{n}.wav" data-start="{max(0, t):.3f}" data-duration="{SFX_LEN[n]}" data-track-index="{10 + k % 3}" data-volume="{v}"></audio>'
        for k, (n, t, v) in enumerate(SFX))


page = (ROOT / "src/template.html").read_text(encoding="utf-8")
page = (page.replace("{{VIDEOS}}", build_videos()).replace("{{CAPTIONS}}", build_captions())
        .replace("{{SFX}}", build_sfx()).replace("{{DURATION}}", f"{DURATION:.2f}")
        .replace("{{CAP_DATA}}", json.dumps([{"s": g["s"], "w": [{"s": w["s"], "hi": w["hi"]} for w in g["w"]]} for g in CAPS]))
        .replace("{{HOOK_CUTS}}", json.dumps(H)))
for sid in SCENES:
    page = page.replace("{{SCENE:" + sid + "}}", scene_attrs(sid))
assert "{{" not in page, re.findall(r"\{\{[^}]+\}\}", page)[:5]
(ROOT / "index.html").write_text(page, encoding="utf-8")
(ROOT / "data/captions.json").write_text(json.dumps(CAPS, ensure_ascii=False), encoding="utf-8")
print("index.html written:", len(page), "bytes; duration", DURATION)
