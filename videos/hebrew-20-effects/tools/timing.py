"""Re-timing of the narration take onto the reel's grid.

The take (data/words-take1.json, assets/audio/vo-take1.mp3) reads the 20 effect names back to back.
The reel gives every effect its own ~1.9s beat (same grid as the English original), so the take is
cut into segments and each one is placed at its slot: intro at 0, effect k at EFFECT_T[k] + SPEAK_LAG,
the CTA after the checklist.
"""
import json
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "data"

# Effect label times in the reel (seconds) - the original's beat grid.
EFFECT_T = [3.34, 4.76, 6.62, 8.64, 10.6, 12.76, 14.82, 16.82, 18.8, 20.92,
            22.88, 25.08, 27.26, 29.56, 31.72, 33.2, 34.7, 36.22, 37.84, 39.66]
EFFECTS = ["מסלול", "השתלטות צ'אט", "בריחה מהפריים", "זום חד", "רשימה קופצת", "סערת כותרות",
           "פורטל זום", "עקומת צמיחה", "חשיפת אולפן", "שכבת B-Roll", "גזיר נייר", "דולי זום",
           "שער מגזין", "זכוכית נוזלית", "חיתוך זום", "מסך ירוק", "שבירת פריים", "זום דיגיטלי",
           "מוקאפ טלפון", "צ'קליסט"]
EFFECT_WORDS = [1] + [2] * 18 + [1]
SPEAK_LAG = 0.3     # the name is heard just after its label lands
CTA_T = 41.7        # CTA sentence start in the reel
PAD = (0.06, 0.12)  # audio kept before the first / after the last word of a segment


def load_take():
    raw = json.loads((DATA / "words-take1.json").read_text(encoding="utf-8"))["words"]
    return [x for x in raw if x.get("type", "word") == "word"]


def segments(words):
    """[(src_start, src_end, dst_start, word_slice)] covering the whole take."""
    out = [(0.0, words[8]["end"] + PAD[1], 0.0, slice(0, 9))]
    i = 9
    for k, n in enumerate(EFFECT_WORDS):
        a, b = words[i], words[i + n - 1]
        dst = EFFECT_T[k] + SPEAK_LAG
        out.append((a["start"] - PAD[0], b["end"] + PAD[1], dst - PAD[0], slice(i, i + n)))
        i += n
    out.append((words[i]["start"] - PAD[0], words[-1]["end"] + 0.3, CTA_T - PAD[0], slice(i, len(words))))
    return out


def retimed_words():
    words = load_take()
    res = []
    for s0, _, d0, sl in segments(words):
        for x in words[sl]:
            res.append({"text": x["text"], "start": round(x["start"] - s0 + d0, 3), "end": round(x["end"] - s0 + d0, 3)})
    return res
