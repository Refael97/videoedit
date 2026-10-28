# builds index.html: the prompt's typing schedule + one soft key click per character
import json, random
random.seed(5)
TEXT = "תבנה לי אפליקציה למעקב הרגלים."
t, ev, audio = 0.42, [], []
for i, ch in enumerate(TEXT):
    ev.append({"t": round(t, 3), "text": TEXT[: i + 1]})
    if ch != " ":
        audio.append(f'      <audio id="k{i}" src="assets/k{1 + i % 3}.wav" data-start="{t:.3f}" data-duration="0.14" data-track-index="{20 + i % 6}" data-volume="{round(random.uniform(0.18, 0.28), 2)}"></audio>')
    t += 0.043 * random.uniform(0.7, 1.35) + (0.05 if ch == " " else 0)
audio += ['      <audio id="send" src="assets/click-soft.mp3" data-start="1.900" data-duration="0.37" data-track-index="10" data-volume="0.8"></audio>',
          '      <audio id="spark" src="assets/sparkle.mp3" data-start="1.950" data-duration="1.2" data-track-index="11" data-volume="0.35"></audio>',
          '      <audio id="whip" src="assets/whoosh-short.mp3" data-start="2.500" data-duration="0.7" data-track-index="12" data-volume="0.7"></audio>']
s = open("source/src.html").read().replace("__AUDIO__", "\n".join(audio)).replace("__TYPE__", json.dumps(ev, ensure_ascii=False))
open("index.html", "w").write(s)
print("typing ends", ev[-1]["t"])
