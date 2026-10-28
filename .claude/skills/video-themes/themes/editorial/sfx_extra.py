"""editorial sound set: the shared synth_sfx sounds + three of its own (shutter, thud, slide).

usage: python3 sfx_extra.py [out_dir]   (default: ./sfx next to this file)
"""
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(here, "..", "..", "scripts"))
import numpy as np
from synth_sfx import SR, t, env, lowpass, highpass, save, rng, click, key, tick, ding, swish, whoosh


def shutter():
    # camera shutter for photo / cover inserts: two short mechanical clacks 45 ms apart
    n = int(0.16 * SR)
    out = np.zeros(n)
    for at, g in [(0.0, 1.0), (0.045, 0.7)]:
        i = int(at * SR)
        m = int(0.03 * SR)
        burst = lowpass(highpass(rng.standard_normal(m), 1200), 6000) * env(m, 0.0003, 0.005)
        body = np.sin(2 * np.pi * 900 * t(0.03)) * env(m, 0.0005, 0.006) * 0.4
        out[i:i + m] += (burst + body) * g
    return out


def thud():
    # a heavy title landing: soft low knock, no tail
    d = 0.22
    x = t(d)
    f = 70 + 80 * np.exp(-x / 0.03)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, 0.06)
    knock = lowpass(rng.standard_normal(len(x)), 700) * env(len(x), 0.001, 0.012) * 0.6
    return body + knock


def slide():
    # paper card sliding in: short filtered noise sweep, quieter than whoosh
    d = 0.3
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        cut = 900 + 3500 * (i / n)
        k = np.exp(-2 * np.pi * cut / SR)
        acc = (1 - k) * x[i] + k * acc
        out[i] = acc
    return highpass(out, 300) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "sfx")
    for f in [click, key, tick, ding, swish, whoosh, shutter, thud, slide]:
        save(os.path.join(out, f.__name__ + ".wav"), f())
        print("wrote", f.__name__)
