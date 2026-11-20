"""Writes caps.js (caption chunks with word times) from the narration's word list. Run: python3 build.py"""
import json
VO0 = 7.19
words = json.load(open("../lab-diamonds/data/words.json", encoding="utf8"))["words"]
chunks, cur = [], []
for w in words:
    cur.append(w)
    if w["text"][-1] in ".?:," or len(cur) == 3:
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
ACC = {"זולים.", "טבעי?", "במעבדה,", "שבועות.", "בזרע:", "אמיתי.", "וחום.", "אטמוספרות,", "מעלות,", "האדמה.", "גז.", "לפלזמה", "שכבה.", "גולמי.", "הברק.", "אמיתי", "פחמן,", "מבנה,", "קשיות.", "המקור.", "אין־ספור", "בהרבה."}
out = [[round(c[0]["start"] + VO0, 2), [round(w["start"] + VO0, 2) for w in c], [w["text"].rstrip(",:") for w in c], [1 if w["text"] in ACC else 0 for w in c]] for c in chunks]
open("caps.js", "w", encoding="utf8").write("window.CAPS = " + json.dumps(out, ensure_ascii=False) + ";\n")
print(len(out), "chunks")
