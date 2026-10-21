#!/usr/bin/env python3
"""Builds assets/audio/vo.mp3 (gapped narration) and data/words.json from the raw take.

Run from the project root: python3 tools/make_vo.py
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from timing import load_take, segments, retimed_words  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
FADE = int(0.012 * SR)

pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(ROOT / "assets/audio/vo-take1.mp3"),
                      "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
src = np.frombuffer(pcm, dtype=np.float32)

segs = segments(load_take())
end = max(d + (b - a) for a, b, d, _ in segs) + 0.4
out = np.zeros(int(end * SR), dtype=np.float32)
ramp = np.linspace(0, 1, FADE, dtype=np.float32)
for a, b, d, _ in segs:
    chunk = src[int(a * SR):int(b * SR)].copy()
    chunk[:FADE] *= ramp
    chunk[-FADE:] *= ramp[::-1]
    o = int(d * SR)
    out[o:o + len(chunk)] += chunk

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-",
                "-c:a", "libmp3lame", "-b:a", "192k", str(ROOT / "assets/audio/vo.mp3")], input=out.tobytes(), check=True)
(ROOT / "data/words.json").write_text(json.dumps({"words": retimed_words()}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"vo.mp3 {len(out) / SR:.2f}s, {len(segs)} segments")
