#!/usr/bin/env python3
"""index.html = src/template.html + narration word times.

assets/vo.mp3 is the take with a 0.3 s lead-in, so every word time is shifted by LEAD.
Phone clips: render fx/ (20 motion-graphic effects, 540x960, one per slot) and copy it to
assets/video/phone-clips.mp4. Then: python3 build.py
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).parent
LEAD = 0.3
DURATION = 38.7
NAMES = ["מסלול", "השתלטות צ'אט", "בריחה מהפריים", "זום חד", "רשימה קופצת", "סערת כותרות", "פורטל זום",
         "עקומת צמיחה", "חשיפת אולפן", "שכבת B-Roll", "גזיר נייר", "דולי זום", "שער מגזין", "זכוכית נוזלית",
         "חיתוך זום", "מסך ירוק", "שבירת פריים", "זום דיגיטלי", "מוקאפ טלפון", "צ'קליסט"]
# first narration word of every effect name
NAME_WORD = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37]

words = json.loads((ROOT / "data/words-take1.json").read_text(encoding="utf-8"))["words"]
WD = [round(w["start"] + LEAD, 3) for w in words]
SLOTS = [WD[i] for i in NAME_WORD] + [round(words[37]["end"] + LEAD + 0.15, 3)]
json.dumps(SLOTS)
(ROOT / "data/slots.json").write_text(json.dumps(SLOTS), encoding="utf-8")


def col(ks):
    return "".join(f'<li id="li{k}"><i>{k + 1:02d}</i>{html.escape(NAMES[k])}</li>' for k in ks)


page = (ROOT / "src/template.html").read_text(encoding="utf-8")
page = (page.replace("{{WD}}", json.dumps(WD)).replace("{{SLOTS}}", json.dumps(SLOTS))
        .replace("{{COL_A}}", col(range(10))).replace("{{COL_B}}", col(range(10, 20)))
        .replace("{{DURATION}}", str(DURATION)).replace("{{CLIPS_DUR}}", f"{SLOTS[-1] - SLOTS[0]:.3f}")
        .replace("{{CLIPS_START}}", f"{SLOTS[0]:.3f}").replace("{{CLIPS_END}}", f"{SLOTS[-1] + 0.4:.3f}"))
assert "{{" not in page
(ROOT / "index.html").write_text(page, encoding="utf-8")
print("index.html written; slots", SLOTS[0], "→", SLOTS[-1])
