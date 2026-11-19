"""Builds index.html for the lab-grown-diamonds reel (9:16, 1080x1920) from the scene list and the narration's word times.
Run from the project root: python3 build.py"""
import json

W, H, VO0 = 1080, 1920, 0.3          # the narration starts 0.3 s into the film
words = json.load(open("data/words.json", encoding="utf8"))["words"]
DUR = 48.8

# scene: (start on the narration clock, image, focus x%, focus y%, zoom from, zoom to, step number, step title)
S = [
    (-0.3, "01", 50, 48, 1.22, 1.06, 0, ""),
    (5.38, "02", 50, 46, 1.05, 1.2, 1, "הזרע"),
    (9.86, "03", 50, 44, 1.04, 1.16, 2, "לחץ וחום"),
    (12.34, "04", 50, 47, 1.02, 1.2, 2, "לחץ וחום"),
    (16.84, "11", 50, 74, 1.02, 1.22, 2, "לחץ וחום"),
    (20.98, "05", 50, 45, 1.04, 1.18, 3, "גז"),
    (24.5, "06", 50, 55, 1.03, 1.14, 3, "גז"),
    (30.14, "07", 50, 68, 1.05, 1.2, 4, "חיתוך וליטוש"),
    (32.92, "08", 50, 66, 1.18, 1.05, 4, "חיתוך וליטוש"),
    (34.2, "09", 50, 50, 1.04, 1.18, 4, "חיתוך וליטוש"),
    (36.28, "12", 50, 50, 1.16, 1.04, 5, "התוצאה"),
    (42.28, "10", 50, 62, 1.04, 1.14, 5, "התוצאה"),
]
ends = [s[0] for s in S[1:]] + [DUR - VO0]

# captions: short chunks that never straddle a sentence
chunks, cur = [], []
for w in words:
    cur.append(w)
    if w["text"][-1] in ".?:," or len(cur) == 3:
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
ACC = {"מעבדה,", "שבועות.", "בזרע:", "וחום.", "אטמוספרות,", "מעלות,", "גז.", "לפלזמה", "שכבה.", "גולמי.", "הברק.", "אמיתי", "פחמן,", "מבנה,", "קשיות.", "אין־ספור", "שנים."}

scenes_html = "".join(
    '<div class="sc" id="sc%d"><img src="assets/img/%s.jpg" style="transform-origin:%d%% %d%%" /></div>' % (i, s[1], s[2], s[3]) for i, s in enumerate(S))
caps_html = "".join(
    '<div class="cap" id="cp%d">%s</div>' % (i, " ".join('<span class="w%s">%s</span>' % (" a" if w["text"] in ACC else "", w["text"].rstrip(",:")) for w in c))
    for i, c in enumerate(chunks))

js_scenes = json.dumps([[round(s[0] + VO0, 3), round(e + VO0, 3), s[4], s[5], s[6], s[7]] for s, e in zip(S, ends)], ensure_ascii=False)
js_chunks = json.dumps([[round(c[0]["start"] + VO0, 3), [round(w["start"] + VO0, 3) for w in c]] for c in chunks])

html = open("template.html", encoding="utf8").read()
for k, v in [("__SCENES__", scenes_html), ("__CAPS__", caps_html), ("__JS_SCENES__", js_scenes), ("__JS_CHUNKS__", js_chunks), ("__DUR__", str(DUR)), ("__VO0__", str(VO0))]:
    assert k in html, k
    html = html.replace(k, v)
open("index.html", "w", encoding="utf8").write(html)
print("index.html written:", len(S), "scenes,", len(chunks), "caption chunks")
