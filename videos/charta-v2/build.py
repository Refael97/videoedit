# builds index.html from source/src.html: typing schedules, every audio clip (music, keystrokes, sfx cues), inlined 3D font
import json, random

random.seed(11)
B = lambda n: 2.98 + 0.4645 * n  # music beat grid (the track starts on the shatter)
audio, n_id = [], [0]

CLIPS = []
def clip(src, t, dur, vol, track):
    CLIPS.append((src, t, dur, vol))
    n_id[0] += 1
    audio.append(f'      <audio id="a{n_id[0]}" src="assets/{src}" data-start="{t:.3f}" data-duration="{dur:.3f}" data-track-index="{track}" data-volume="{vol}"></audio>')

def typing(lines, t0, gap, typo=None):
    """lines: [(line_no, text)] typed one after another; typo=(line_no, index) mistypes 'נ' there, then backspaces"""
    ev, t = [], t0
    for ln, text in lines:
        cur = ""
        for i, ch in enumerate(text):
            if typo and typo == (ln, i):
                cur += "נ"; ev.append((t, ln, cur, "k")); t += 0.20
                cur = cur[:-1]; ev.append((t, ln, cur, "bs")); t += 0.11
            cur += ch; ev.append((t, ln, cur, "k"))
            t += gap * random.uniform(0.6, 1.5) + (0.06 if ch == " " else 0)
        t = max(t, 2.02) if ln == 1 and t0 < 1 else t + 0.15
    return ev

L1 = "Claude לא יודע לערוך סרטונים."
type1 = typing([(1, L1)], 0.45, 0.034, typo=(1, L1.index("ם"))) + typing([(2, "...זה סתם חארטה.")], 2.02, 0.040)
type2 = typing([(3, "...טוב. אולי לא חארטה.")], 33.22, 0.036)
for i, (t, l, s, kind) in enumerate(type1 + type2):
    clip("k4.wav" if kind == "bs" else f"k{1 + i % 3}.wav", t, 0.16, 0.75 if kind == "bs" else round(random.uniform(0.45, 0.7), 2), 20 + i % 8)

clip("crt.wav", 0, 2.4, 0.55, 10)
clip("boom.wav", 2.98, 1.42, 1, 11)
clip("music.mp3", 2.98, 29.6, 0.8, 1)
clip("crt.wav", 33.0, 1.6, 0.35, 10)
clip("sfx/crt_off.wav", 34.5, 0.5, 0.7, 12)

# sound for every hit: (file, time, duration, volume)
CUES = [
    ("whoosh-cinematic.mp3", B(5.4), 1.6, 0.6), ("impact-bass-1.mp3", B(8), 2.0, 0.8),
    ("whoosh.mp3", B(9) - 0.18, 0.8, 0.6), ("whoosh-short.mp3", B(12) - 0.2, 0.8, 0.7),
    ("glitch-3.mp3", B(12), 0.6, 0.45), ("glitch-3.mp3", B(13.5), 0.6, 0.45), ("impact-bass-1.mp3", B(15), 1.8, 0.75), ("glitch-1.mp3", B(15), 0.8, 0.4),
    ("glitch-1.mp3", B(17) - 0.08, 0.9, 0.55), ("sparkle.mp3", B(17.5), 1.6, 0.45),
    ("whoosh-cinematic.mp3", B(20) - 0.15, 1.4, 0.65), ("whoosh-short.mp3", B(22) - 0.32, 0.6, 0.6), ("impact-bass-1.mp3", B(22) + 0.18, 1.8, 0.9), ("impact-bass-1.mp3", B(23), 1.2, 0.6),
    ("glitch-2.mp3", B(24) - 0.12, 0.7, 0.45),
    ("pop.mp3", B(24.5), 0.5, 0.6), ("pop.mp3", B(25), 0.5, 0.6), ("pop.mp3", B(25.5), 0.5, 0.6), ("pop.mp3", B(26), 0.5, 0.6), ("pop.mp3", B(26.25), 0.5, 0.5), ("pop.mp3", B(26.5), 0.5, 0.65),
    ("whoosh-short.mp3", B(27) - 0.18, 0.6, 0.6), ("pop.mp3", B(27.5), 0.6, 0.9), ("sparkle.mp3", B(27.5), 1.5, 0.6),
    ("whoosh.mp3", B(29) - 0.22, 0.8, 0.5), ("glitch-2.mp3", B(30.5), 1.6, 0.5),
    ("glitch-1.mp3", B(32) - 0.12, 0.8, 0.6), ("whoosh.mp3", B(33), 1.0, 0.45), ("sparkle.mp3", B(34.5), 1.2, 0.35),
    ("whoosh-short.mp3", B(38) - 0.3, 0.5, 0.5), ("impact-bass-1.mp3", B(38), 1.5, 0.75), ("click.mp3", B(38), 0.37, 0.6),
    ("whoosh-cinematic.mp3", B(40) - 0.1, 1.4, 0.5), ("chime.mp3", B(41.5), 1.6, 0.55),
    ("impact-bass-1.mp3", B(43), 1.6, 0.8), ("whoosh-short.mp3", B(44) - 0.1, 0.5, 0.35), ("whoosh-short.mp3", B(45) - 0.1, 0.5, 0.35),
    ("whoosh-cinematic.mp3", B(47) - 0.15, 1.8, 0.6), ("whoosh.mp3", B(51) - 0.22, 0.8, 0.55), ("sparkle.mp3", B(51), 1.4, 0.55),
    ("impact-bass-1.mp3", B(53), 2.0, 1.0), ("sparkle.mp3", B(53), 2.0, 0.6),
    ("whoosh-short.mp3", B(56) - 0.2, 0.6, 0.5), ("impact-bass-1.mp3", B(60), 1.8, 0.9), ("sparkle.mp3", B(60), 1.5, 0.45),
    ("whoosh-short.mp3", B(61) - 0.25, 0.5, 0.4), ("notification.mp3", B(61) + 1.25, 1.4, 0.5),
    ("glitch-1.mp3", 32.88, 0.7, 0.6),
] + [("key-press.mp3", B(56) + i * 0.2, 0.3, 0.3) for i in range(6)] + [("key-press.mp3", B(61) + 0.15 + i * 0.1875, 0.3, 0.55) for i in range(4)]
ends = {}  # greedy lanes so no two cues share a track while overlapping
for f, t, d, v in sorted(CUES, key=lambda c: c[1]):
    lane = next(k for k in range(30, 80) if ends.get(k, -1) <= t)
    ends[lane] = t + d; clip(f"sfx/{f}", t, d, v, lane)

data = {"type1": [{"t": round(t, 3), "line": l, "text": s} for t, l, s, _ in type1],
        "type2": [{"t": round(t, 3), "line": l, "text": s} for t, l, s, _ in type2],
        "font": json.load(open("assets/heebo900x.json"))}
s = open("source/src.html").read()
s = s.replace("__AUDIO__", "\n".join(audio)).replace("__DATA__", json.dumps(data, ensure_ascii=False))
open("index.html", "w").write(s)
print("type1 ends", type1[-1][0], "type2 ends", type2[-1][0], "clips", len(audio))

# ---- segment projects (silent) for chunked rendering + the full audio mix as a cue list ----
import os, shutil
SEGS = [(5.5, 11.5), (11.5, 17.5), (17.5, 23.5), (23.5, 29.3)]
for i, (a, b) in enumerate(SEGS):
    d = f"segs/s{i}"; os.makedirs(d, exist_ok=True)
    for name in ("assets", "js"):
        if not os.path.exists(f"{d}/{name}"): os.symlink(f"../../{name}", f"{d}/{name}")
    for f in ("hyperframes.json", "package.json"): shutil.copy(f, d)
    seg = open("source/src.html").read().replace("__AUDIO__", "").replace("__DATA__", json.dumps(data, ensure_ascii=False))
    seg = seg.replace('data-duration="35"', f'data-duration="{b - a:.3f}" data-off="{a:.3f}"')
    open(f"{d}/index.html", "w").write(seg)
json.dump(CLIPS, open("segs/clips.json", "w"))
