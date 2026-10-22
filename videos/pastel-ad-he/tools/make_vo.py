#!/usr/bin/env python3
"""Lays the Hebrew take onto the reference ad's sentence grid.

Each sentence of assets/vo-take1.mp3 is cut out and placed at the time the matching English sentence
starts in the reference (or right after the previous one, if the Hebrew runs longer).
Writes assets/vo.mp3, data/words.json (retimed words) and data/segments.json (name -> start/end).
Run from the project root: python3 tools/make_vo.py
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
GAP = 0.22
PAD = (0.05, 0.14)
# name, first word, last word, reference start (s)
SEGS = [("hook", 0, 6, 2.84), ("editor", 7, 11, 5.14), ("no1", 12, 13, 7.24), ("no2", 14, 15, 8.30), ("no3", 16, 17, 9.28),
        ("prompt", 18, 21, 10.58), ("opened", 22, 31, 13.16), ("built", 32, 36, 17.08), ("losing", 37, 44, 19.00),
        ("describe", 45, 51, 22.70), ("writes", 52, 59, 24.88), ("land", 60, 60, 28.66), ("roof", 61, 62, 29.54),
        ("plumb", 63, 63, 30.06), ("real", 64, 70, 31.20), ("frame", 71, 77, 35.48), ("know", 78, 79, 39.72),
        ("believe", 80, 83, 40.52), ("want", 84, 85, 42.04), ("follow", 86, 91, 42.92), ("send", 92, 96, 45.86),
        ("first", 97, 101, 47.56), ("paid", 102, 105, 50.06)]

def load(path):
    pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, dtype=np.float32)


words = json.loads((ROOT / "data/words-take1.json").read_text(encoding="utf-8"))["words"]
src = load("assets/vo-take1.mp3")
# The trades line was re-recorded (lawyers / marketing agencies / fitness coaches): its three segments come from
# assets/vo-trades.mp3. Word slots 60-63 keep their indices: 60 עורכי(דין), 61 סוכנויות, 62 שיווק, 63 מאמני(כושר).
TRADES = {"land": [("עורכי", 3.60, 3.92), ("דין.", 4.08, 4.32)],
          "roof": [("סוכנויות", 4.56, 4.96), ("שיווק.", 5.20, 5.52)],
          "plumb": [("מאמני", 5.68, 6.00), ("כושר.", 6.08, 6.72)]}
SLOTS = {"land": [60], "roof": [61, 62], "plumb": [63]}
src2 = load("assets/vo-trades.mp3")

placed, out_words, segs, prev_end = [], [], {}, 0.0
for name, a, b, target in SEGS:
    if name in TRADES:
        ws = TRADES[name]
        first, last = ws[0][1], ws[-1][2]
        d0 = max(target, prev_end + GAP)
        off = d0 - first
        placed.append((src2, first - PAD[0], last + PAD[1], first - PAD[0] + off))
        # one output word per original slot so later word indices stay put
        slot_words = ws if len(SLOTS[name]) == len(ws) else [(" ".join(x[0] for x in ws), first, last)]
        for t, s_, e_ in slot_words:
            out_words.append({"text": t, "start": round(s_ + off, 3), "end": round(e_ + off, 3), "seg": name})
        segs[name] = {"start": round(d0, 3), "end": round(last + off, 3)}
        prev_end = last + off
        continue
    s0, s1 = max(0.0, words[a]["start"] - PAD[0]), words[b]["end"] + PAD[1]
    d0 = max(target, prev_end + GAP)
    off = d0 - words[a]["start"]
    placed.append((src, s0, s1, s0 + off))
    for w in words[a:b + 1]:
        out_words.append({"text": w["text"], "start": round(w["start"] + off, 3), "end": round(w["end"] + off, 3), "seg": name})
    segs[name] = {"start": round(d0, 3), "end": round(words[b]["end"] + off, 3)}
    prev_end = words[b]["end"] + off

end = placed[-1][3] + (placed[-1][2] - placed[-1][1]) + 0.5
out = np.zeros(int(end * SR), dtype=np.float32)
F = int(0.012 * SR)
ramp = np.linspace(0, 1, F, dtype=np.float32)
for buf, s0, s1, d in placed:
    c = buf[int(s0 * SR):int(s1 * SR)].copy()
    c[:F] *= ramp
    c[-F:] *= ramp[::-1]
    o = int(d * SR)
    out[o:o + len(c)] += c
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-af", "loudnorm=I=-16:TP=-1.5:LRA=7",
                "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", str(ROOT / "assets/vo.mp3")], input=out.tobytes(), check=True)
(ROOT / "data/words.json").write_text(json.dumps({"words": out_words}, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "data/segments.json").write_text(json.dumps(segs, ensure_ascii=False, indent=1), encoding="utf-8")
for k, v in segs.items():
    print(f"{k:9s} {v['start']:6.2f} {v['end']:6.2f}")
