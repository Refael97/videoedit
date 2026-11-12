"""headline theme sounds: the shared synth set + two extras (air, roll). Free to redistribute (synthesized).

usage: python3 sfx_extra.py [out_dir]   (default: ./sfx next to this file)
"""
import os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "scripts"))
import synth_sfx as s  # noqa: E402


def air():
    # soft blur-in "shh": band-limited noise, quick swell, short tail; sits far under the voice
    d = 0.38
    n = int(d * s.SR)
    x = s.lowpass(s.highpass(s.rng.standard_normal(n), 900), 6000)
    shape = np.sin(np.pi * np.linspace(0, 1, n) ** 0.7) ** 2
    return x * shape


def roll():
    # odometer roll: a train of soft ticks that slows down, then a final click
    d = 0.9
    out = np.zeros(int(d * s.SR))
    t, gap = 0.0, 0.03
    while t < d - 0.08:
        k = s.tick() * 0.6
        i = int(t * s.SR)
        out[i:i + len(k)] += k[: len(out) - i]
        t += gap
        gap *= 1.12
    c = s.click()
    i = int((d - 0.06) * s.SR)
    out[i:i + len(c)] += c[: len(out) - i]
    return out


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "sfx")
    for name in ["click", "pop", "tick", "ding", "whoosh", "swish", "key"]:
        s.save(f"{out}/{name}.wav", getattr(s, name)())
    for name, fn in [("air", air), ("roll", roll)]:
        s.save(f"{out}/{name}.wav", fn())
    print("wrote", sorted(os.listdir(out)))
