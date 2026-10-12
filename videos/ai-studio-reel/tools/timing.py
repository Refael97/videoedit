"""Word timing helpers: caption phrases and an old→new time warp between voiceover takes.

The composition was authored against take v1 (data/words-v1.json). A new take
(data/words.json) keeps the same script, so every authored time is re-mapped
piecewise-linearly between matching word starts.
"""
import json
import re
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

DISPLAY = {
    "קלוד": "Claude",
    "לקלוד": "ל-Claude",
    "לאילבן": "ל-ElevenLabs",
    "לאבס,": None,  # merged into the previous token
    "להייג'ן": "ל-HeyGen",
    "להיגספילד": "ל-Higgsfield",
    "הייפרפריימס.": "HyperFrames.",
}

PHRASES = """היום אתם יכולים
ליצור סרטון שלם שלכם,
בלי לפתוח מצלמה
אפילו פעם אחת.
ולא,
אני לא מדבר על
סרטון AI גנרי.
אני מדבר על סרטון
שאתם מופיעים בו,
מדברים בקול שלכם,
עם עריכה מקצועית,
אפקטים והכול.
והחלק הכי מטורף?
Claude יכול לנהל לכם
את כל התהליך.
איך עושים את זה?
קודם כול, מחברים את Claude
ל-ElevenLabs
ושם יוצרים שכפול AI
של הקול שלכם.
אחר כך נכנסים ל-HeyGen
ויוצרים אווטאר AI
שנראה כמוכם,
מדבר כמוכם,
ואפילו מחקה
את תנועות הפנים שלכם.
עכשיו מגיע
החלק המעניין.
מחברים את Claude ל-Higgsfield
כדי ליצור את הוויזואלים
והסצנות של הסרטון,
ומוסיפים סקיל עריכה
של HyperFrames.
וזהו.
בניתם לעצמכם
אולפן תוכן שלם
שמופעל באמצעות AI.
מכאן אתם פשוט נותנים ל-Claude
את הנושא
שעליו אתם רוצים לדבר,
מגדירים את סגנון העריכה,
והוא יכול לתזמר
את כל התהליך
מהתסריט,
דרך הקריינות והווידאו,
ועד לעריכה.
תחשבו על זה רגע.
במקום להעמיד מצלמה,
להתארגן לצילומים
ולשבת שעות על עריכה,
אתם יכולים לייצר תוכן
כשאתם בכלל לא מול המצלמה.
רוצים את המדריך המלא,
כולל החיבורים והסקילים שצריך?
תגיבו פה "אני",
ואשלח לכם הכול.""".split("\n")

HIGHLIGHT = {
    "מצלמה", "גנרי.", "בקול", "מקצועית,", "מטורף?", "Claude", "התהליך.", "ל-ElevenLabs",
    "ל-HeyGen", "אווטאר", "ל-Higgsfield", "HyperFrames.", "אולפן", "הנושא", "לעריכה.", "רגע.",
    '"אני",', "המצלמה.", "המדריך", "הקול", "תוכן", "ל-Claude", "סגנון", "מהתסריט,", "הקריינות",
    "והווידאו,", "שעות", "שכפול", "כמוכם,", "הפנים", "המעניין.", "לא",
}


def load_words(name):
    raw = json.loads((DATA / name).read_text(encoding="utf-8"))["words"]
    raw = [x for x in raw if x.get("type", "word") == "word" and not x["text"].startswith("[") and x["text"] != "—"]
    words = []
    for x in raw:
        t = x["text"]
        if t in DISPLAY:
            if DISPLAY[t] is None:
                words[-1]["e"] = round(x["end"], 3)
                continue
            t = DISPLAY[t]
        words.append({"t": t, "s": round(x["start"], 3), "e": round(x["end"], 3)})
    return words


def build_captions(words):
    out, i = [], 0
    for p in PHRASES:
        g = []
        for tok in p.split():
            assert words[i]["t"].strip(",") == tok.strip(","), (i, words[i]["t"], tok)
            g.append(words[i])
            i += 1
        out.append({
            "s": g[0]["s"], "e": g[-1]["e"],
            "w": [{"t": re.sub(r",$", "", x["t"]), "s": x["s"],
                   "hi": x["t"] in HIGHLIGHT or re.sub(r",$", "", x["t"]) in HIGHLIGHT} for x in g],
        })
    assert i == len(words), (i, len(words))
    for k, g in enumerate(out):
        nxt = out[k + 1]["s"] if k + 1 < len(out) else g["e"] + 0.9
        g["e"] = round(min(nxt - 0.02, g["e"] + 0.5), 3)
    return out


def warp_points(old, new):
    """Monotonic (old, new) anchor pairs from matching word starts and ends."""
    assert len(old) == len(new)
    pts = [(0.0, 0.0)]
    for a, b in zip(old, new):
        if a["s"] > pts[-1][0] and b["s"] > pts[-1][1]:
            pts.append((a["s"], b["s"]))
    pts.append((old[-1]["e"], new[-1]["e"]))
    return pts


def make_warp(pts):
    def w(t):
        if t <= pts[0][0]:
            return t
        for (a0, b0), (a1, b1) in zip(pts, pts[1:]):
            if t <= a1:
                return b0 + (t - a0) * (b1 - b0) / (a1 - a0)
        a, b = pts[-1]
        return b + (t - a)
    return w
