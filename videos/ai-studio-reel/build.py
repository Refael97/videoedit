#!/usr/bin/env python3
"""Generates index.html for the AI-studio reel from data/captions.json + scene markup.

Run: python3 build.py
"""
import json
import html
from pathlib import Path

from tools.timing import load_words, build_captions as phrase_captions, warp_points, make_warp

ROOT = Path(__file__).parent
# Authored times below refer to take v1; they are warped onto the current take (data/words.json).
WORDS_V1 = load_words("words-v1.json")
WORDS = load_words("words.json") if (ROOT / "data/words.json").exists() else WORDS_V1
WARP_PTS = warp_points(WORDS_V1, WORDS)
W = make_warp(WARP_PTS)
CAPS = phrase_captions(WORDS)
(ROOT / "data/captions.json").write_text(json.dumps(CAPS, ensure_ascii=False), encoding="utf-8")
DURATION = round(WORDS[-1]["e"] + 1.52, 2)
CLIP_LEN = 5.04

# Scene windows (global seconds), aligned to the voiceover word timings.
SCENES = {
    "s01": (0.0, 5.95),
    "s02": (5.95, 8.95),
    "s03": (8.95, 15.0),
    "s04": (15.0, 19.25),
    "s05a": (19.25, 20.62),
    "s05": (20.62, 25.75),
    "s06": (25.75, 34.5),
    "s07a": (34.5, 36.62),
    "s07": (36.62, 44.2),
    "s08": (44.2, 49.45),
    "s09": (49.45, 61.85),
    "s10": (61.85, 67.8),
    "s10b": (67.8, 71.65),
    "s11": (71.65, 80.0),
}
SCENES = {k: (round(W(a), 3), round(W(b), 3)) for k, (a, b) in SCENES.items()}
SCENES["s11"] = (SCENES["s11"][0], DURATION)

# b-roll: (id, file, scene, playback rate)
BROLL = [
    ("v01", "assets/video/b01-studio-dark.mp4", "s01", 0.85),
    ("v02", "assets/video/b02-generic-ai.mp4", "s02", 1.0),
    ("v03", "assets/video/b03-voice-wave.mp4", "s05", 1.0),
    ("v04", "assets/video/b04-holo-head.mp4", "s06", 0.58),
    ("v05", "assets/video/b05-screens.mp4", "s07", 0.68),
    ("v06", "assets/video/b06-control-room.mp4", "s08", 0.97),
    ("v07", "assets/video/b07-relax.mp4", "s10b", 1.0),
]


def scene_attrs(sid, track=2):
    s, e = SCENES[sid]
    return f'id="{sid}" class="clip scene" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="{track}"'


ICON = {
    "camera": '<svg viewBox="0 0 64 64"><rect x="6" y="18" width="38" height="30" rx="6"/><path d="M44 28l14-8v26l-14-8z"/><circle cx="25" cy="33" r="7"/></svg>',
    "user": '<svg viewBox="0 0 64 64"><circle cx="32" cy="22" r="11"/><path d="M12 56c2-12 10-18 20-18s18 6 20 18"/></svg>',
    "mic": '<svg viewBox="0 0 64 64"><rect x="24" y="6" width="16" height="30" rx="8"/><path d="M14 30c0 10 8 18 18 18s18-8 18-18M32 48v10M22 58h20"/></svg>',
    "cut": '<svg viewBox="0 0 64 64"><circle cx="16" cy="46" r="8"/><circle cx="48" cy="46" r="8"/><path d="M22 40L50 8M42 40L14 8"/></svg>',
    "spark": '<svg viewBox="0 0 64 64"><path d="M32 4l6 20 20 8-20 8-6 20-6-20-20-8 20-8z"/></svg>',
    "check": '<svg viewBox="0 0 64 64"><path d="M12 34l13 13 27-29"/></svg>',
    "doc": '<svg viewBox="0 0 64 64"><path d="M14 6h26l12 12v40H14z"/><path d="M40 6v12h12M22 30h20M22 40h20M22 50h12"/></svg>',
}


def chip(icon, label, cid):
    return f'<div class="chip" id="{cid}"><span class="chip-ic">{ICON[icon]}</span><span class="chip-t">{html.escape(label)}</span></div>'


def build_captions():
    out = []
    for i, g in enumerate(CAPS):
        s, e = g["s"], g["e"]
        spans = []
        for j, w in enumerate(g["w"]):
            cls = "w hi" if w["hi"] else "w"
            spans.append(f'<span class="{cls}" id="c{i}w{j}">{html.escape(w["t"])}</span>')
        out.append(
            f'<div class="clip cap" id="cap{i}" data-start="{s:.3f}" data-duration="{e - s:.3f}" data-track-index="6">'
            f'{" ".join(spans)}</div>'
        )
    return "\n      ".join(out)


def build_broll():
    out = []
    for vid, src, sid, _ in BROLL:
        s, e = SCENES[sid]
        rate = round(min(1.0, (CLIP_LEN - 0.05) / (e - s)), 3)
        out.append(
            f'<div class="vwrap" id="{vid}w"><video id="{vid}" class="clip bg-video" src="{src}" muted playsinline '
            f'data-start="{s:.3f}" data-duration="{e - s:.3f}" data-playback-rate="{rate}" data-track-index="0"></video></div>'
        )
    return "\n      ".join(out)


SFX_LEN = {"whoosh": 0.7, "impact": 0.9, "pop": 0.12, "riser": 1.6, "strike": 0.3}
SFX = [
    # (id, file, start, volume)
    ("sfx-whoosh-1", "assets/audio/whoosh.wav", 5.85, 0.55),
    ("sfx-impact-1", "assets/audio/impact.wav", 8.08, 0.7),
    ("sfx-whoosh-2", "assets/audio/whoosh.wav", 8.9, 0.45),
    ("sfx-pop-1", "assets/audio/pop.wav", 10.5, 0.45),
    ("sfx-pop-2", "assets/audio/pop.wav", 12.0, 0.45),
    ("sfx-pop-3", "assets/audio/pop.wav", 12.95, 0.45),
    ("sfx-pop-4", "assets/audio/pop.wav", 13.85, 0.45),
    ("sfx-riser-1", "assets/audio/riser.wav", 15.0, 0.5),
    ("sfx-impact-2", "assets/audio/impact.wav", 17.02, 0.75),
    ("sfx-whoosh-3", "assets/audio/whoosh.wav", 20.55, 0.5),
    ("sfx-whoosh-4", "assets/audio/whoosh.wav", 25.68, 0.5),
    ("sfx-pop-5", "assets/audio/pop.wav", 29.7, 0.4),
    ("sfx-pop-6", "assets/audio/pop.wav", 31.1, 0.4),
    ("sfx-pop-7", "assets/audio/pop.wav", 33.0, 0.4),
    ("sfx-riser-2", "assets/audio/riser.wav", 34.5, 0.5),
    ("sfx-impact-3", "assets/audio/impact.wav", 36.6, 0.6),
    ("sfx-whoosh-5", "assets/audio/whoosh.wav", 41.4, 0.5),
    ("sfx-impact-4", "assets/audio/impact.wav", 44.3, 0.75),
    ("sfx-whoosh-6", "assets/audio/whoosh.wav", 49.4, 0.45),
    ("sfx-pop-8", "assets/audio/pop.wav", 51.16, 0.35),
    ("sfx-pop-9", "assets/audio/pop.wav", 54.16, 0.35),
    ("sfx-pop-10", "assets/audio/pop.wav", 57.72, 0.35),
    ("sfx-pop-11", "assets/audio/pop.wav", 58.86, 0.35),
    ("sfx-pop-12", "assets/audio/pop.wav", 59.6, 0.35),
    ("sfx-pop-13", "assets/audio/pop.wav", 60.84, 0.4),
    ("sfx-scratch-1", "assets/audio/strike.wav", 64.55, 0.45),
    ("sfx-scratch-2", "assets/audio/strike.wav", 65.95, 0.45),
    ("sfx-scratch-3", "assets/audio/strike.wav", 67.4, 0.45),
    ("sfx-whoosh-7", "assets/audio/whoosh.wav", 71.6, 0.5),
    ("sfx-impact-5", "assets/audio/impact.wav", 76.45, 0.7),
]


def build_sfx():
    out = []
    for k, (sid, src, s, vol) in enumerate(SFX):
        d = SFX_LEN[Path(src).stem]
        s = W(s)
        out.append(
            f'<audio id="{sid}" src="{src}" data-start="{s:.3f}" data-duration="{d}" data-track-index="{10 + k % 2}" data-volume="{vol}"></audio>'
        )
    return "\n      ".join(out)


TEMPLATE = (ROOT / "src/template.html").read_text(encoding="utf-8")
CAP_DATA = json.dumps(
    [{"s": g["s"], "w": [{"s": w["s"], "hi": w["hi"]} for w in g["w"]]} for g in CAPS]
)

page = (
    TEMPLATE.replace("{{BROLL}}", build_broll())
    .replace("{{CAPTIONS}}", build_captions())
    .replace("{{SFX}}", build_sfx())
    .replace("{{CAP_DATA}}", CAP_DATA)
    .replace("{{DURATION}}", f"{DURATION:.2f}")
    .replace("{{WARP}}", json.dumps(WARP_PTS))
)
for sid in SCENES:
    page = page.replace("{{SCENE:" + sid + "}}", scene_attrs(sid))
for name, svg in ICON.items():
    page = page.replace("{{ICON:" + name + "}}", svg)
# chips: {{CHIP:icon:label:id}}
import re

page = re.sub(r"\{\{CHIP:(\w+):([^:}]+):([\w-]+)\}\}", lambda m: chip(m.group(1), m.group(2), m.group(3)), page)
assert "{{" not in page, re.findall(r"\{\{[^}]+\}\}", page)[:5]
(ROOT / "index.html").write_text(page, encoding="utf-8")
print("index.html written:", len(page), "bytes")
