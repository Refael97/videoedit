# builds index.html: typing schedule (with a typo + backspace), one keystroke <audio> per key, inlined 3D font
import json, random
random.seed(11)
events, audio = [], []
def type_line(line, text, t, gap=0.052, typo_at=None):
    cur = ""
    for i, ch in enumerate(text):
        if typo_at is not None and i == typo_at:
            cur += "נ"; events.append((t, line, cur, "k")); t += 0.20          # wrong key, beat of hesitation
            cur = cur[:-1]; events.append((t, line, cur, "bs")); t += 0.11    # backspace
        cur += ch; events.append((t, line, cur, "k"))
        t += gap * random.uniform(0.6, 1.5) + (0.06 if ch == " " else 0)
    return t
L1 = "Claude לא יודע לערוך סרטונים."
type_line(1, L1, 0.45, gap=0.034, typo_at=L1.index("ם"))
type_line(2, "...זה סתם חארטה.", 2.02, gap=0.040)
TYPE = [{"t": round(t, 3), "line": l, "text": s} for t, l, s, _ in events]
for i, (t, l, s, kind) in enumerate(events):
    k = "k4" if kind == "bs" else f"k{1 + i % 3}"
    vol = 0.75 if kind == "bs" else round(random.uniform(0.45, 0.7), 2)
    audio.append(f'      <audio id="key{i}" src="assets/{k}.wav" data-start="{t:.3f}" data-duration="0.16" data-track-index="{20 + i % 4}" data-volume="{vol}"></audio>')
print("last key at", events[-1][0])
s = open("source/src.html").read()
s = s.replace("__KEYAUDIO__", "\n".join(audio)).replace("__FONT__", open("assets/heebo900.json").read()).replace("__TYPE__", json.dumps(TYPE, ensure_ascii=False))
open("index.html", "w").write(s)
