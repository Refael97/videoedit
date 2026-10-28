"""hooks sound set: the shared synth_sfx sounds + four of its own (glow, glint, toggle, hit).

usage: python3 sfx_extra.py [out_dir]   (default: ./sfx next to this file)
"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, "..", "..", "scripts"))
import numpy as np
from synth_sfx import SR, t, env, lowpass, highpass, save, rng, click, pop, tick, ding, whoosh, key, swish


def glow():
    # a glow word igniting: a soft low hit + a bright shimmer swell that blooms and fades (.45 s)
    d = 0.45
    x = t(d)
    n = len(x)
    hit = np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-x / 0.03)) / SR) * env(n, 0.002, 0.07)
    sh = sum(np.sin(2 * np.pi * f * x + p) for f, p in [(1760, 0), (2217, 1), (2637, 2), (3520, 3)]) / 4
    sh = sh * (np.sin(np.pi * np.minimum(x / 0.3, 1)) ** 2) * np.exp(-x / 0.25) * 0.35
    air = highpass(rng.standard_normal(n), 4000) * env(n, 0.03, 0.08) * 0.15
    return hit + sh + air


def glint():
    # a view-count pill catching the light: a quick high sparkle sweep
    d = 0.3
    x = t(d)
    f = 3000 + 3000 * x / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.005, 0.06) * 0.6 + highpass(rng.standard_normal(len(x)), 6000) * env(len(x), 0.002, 0.03) * 0.3


def toggle():
    # a settings switch flipping: two tiny clicks 40 ms apart, the second brighter
    n = int(0.09 * SR)
    out = np.zeros(n)
    for at, f, g in [(0.0, 900, 0.6), (0.04, 1700, 1.0)]:
        i = int(at * SR); m = int(0.03 * SR)
        out[i:i + m] += (np.sin(2 * np.pi * f * t(0.03)) * env(m, 0.0003, 0.006) + highpass(rng.standard_normal(m), 2500) * env(m, 0.0003, 0.003) * 0.5) * g
    return out


def hit():
    # the cut into the void: a short punchy low hit with a little air
    d = 0.35
    x = t(d)
    body = np.sin(2 * np.pi * np.cumsum(50 + 140 * np.exp(-x / 0.04)) / SR) * env(len(x), 0.001, 0.09)
    snap = lowpass(highpass(rng.standard_normal(len(x)), 300), 3000) * env(len(x), 0.0005, 0.015) * 0.5
    return body + snap


NAMES = ["click", "pop", "tick", "ding", "whoosh", "key", "swish", "glow", "glint", "toggle", "hit"]

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "sfx")
    os.makedirs(out, exist_ok=True)
    for name in NAMES:
        save(os.path.join(out, name + ".wav"), globals()[name]())
        print("wrote", name)
