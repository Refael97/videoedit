#!/usr/bin/env python3
"""Builds assets/video/phone-clips.mp4: one clip per effect, retimed to its spoken-name slot.

Source: a clean (no header/badges/captions) render of videos/hebrew-20-effects, where effect k runs
EFFECT_T[k] → EFFECT_T[k+1]. Each window is sped up to fill slot k of data/slots.json.
Usage: python3 tools/make_clips.py <source.mp4>
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent / "hebrew-20-effects/tools"))
from timing import EFFECT_T, CTA_T  # noqa: E402

src = sys.argv[1]
slots = json.loads((ROOT / "data/slots.json").read_text())
ends = EFFECT_T[1:] + [CTA_T]
parts = []
for k in range(20):
    a, b = EFFECT_T[k], ends[k]
    # skip the first 0.15 s of each window (transition debris), keep the effect itself
    a = a + 0.15
    target = slots[k + 1] - slots[k]
    f = (b - a) / target
    parts.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=(PTS-STARTPTS)/{f:.4f},fps=30,scale=540:960[v{k}]")
graph = ";".join(parts) + ";" + "".join(f"[v{k}]" for k in range(20)) + "concat=n=20:v=1:a=0[out]"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-filter_complex", graph, "-map", "[out]",
                "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-g", "30",
                str(ROOT / "assets/video/phone-clips.mp4")], check=True)
print("phone-clips.mp4 written")
