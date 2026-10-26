"""Synthesize a theme's UI sound set from scratch (no samples, so it is free to redistribute).

usage: python3 synth_sfx.py <out_dir>
writes click.wav, pop.wav, tick.wav, ding.wav, whoosh.wav, zoom.wav (48 kHz mono, peak -3 dBFS)
"""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, d):
    """attack seconds, exponential decay time constant seconds"""
    x = np.arange(n) / SR
    e = np.exp(-np.maximum(x - a, 0) / d)
    e[x < a] = x[x < a] / a if a > 0 else 1
    return e


def lowpass(x, cut):
    k = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - k) * v + k * acc
        y[i] = acc
    return y


def highpass(x, cut):
    return x - lowpass(x, cut)


def save(path, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-3 / 20)
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


def click():
    # soft trackpad click: short band-limited noise tick + a tiny body tone
    n = int(0.05 * SR)
    noise = highpass(rng.standard_normal(n), 1800) * env(n, 0.0005, 0.004)
    body = np.sin(2 * np.pi * 1300 * t(0.05)) * env(n, 0.0005, 0.008) * 0.35
    return noise + body


def pop():
    # bubbly UI pop: sine with a fast downward pitch glide
    d = 0.12
    x = t(d)
    f = 520 + 900 * np.exp(-x / 0.018)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(len(x), 0.002, 0.035)


def tick():
    # counter tick: very short high blip
    d = 0.03
    x = t(d)
    return np.sin(2 * np.pi * 2600 * x) * env(len(x), 0.0005, 0.006)


def ding():
    # success ding: two soft partials, bell-like decay
    d = 0.7
    x = t(d)
    e = env(len(x), 0.003, 0.22)
    return (np.sin(2 * np.pi * 1318.5 * x) + 0.5 * np.sin(2 * np.pi * 1975.5 * x) + 0.15 * np.sin(2 * np.pi * 3951 * x)) * e


def whoosh():
    # airy whoosh: noise through a sweeping lowpass, swelling then fading
    d = 0.55
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.empty(n)
    acc = 0.0
    for i in range(n):
        p = i / n
        cut = 400 + 5200 * np.sin(np.pi * p) ** 2
        k = np.exp(-2 * np.pi * cut / SR)
        acc = (1 - k) * x[i] + k * acc
        out[i] = acc
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return highpass(out, 150) * shape


def zoom():
    # punch-in swoosh: short, low and quiet, sits under the voice
    d = 0.22
    n = int(d * SR)
    x = lowpass(rng.standard_normal(n), 1400)
    shape = np.sin(np.pi * np.linspace(0, 1, n) ** 0.6) ** 2
    thump = np.sin(2 * np.pi * 90 * t(d)) * env(n, 0.01, 0.05) * 0.6
    return x * shape + thump


if __name__ == "__main__":
    out = sys.argv[1]
    for name, fn in [("click", click), ("pop", pop), ("tick", tick), ("ding", ding), ("whoosh", whoosh), ("zoom", zoom)]:
        save(f"{out}/{name}.wav", fn())
        print("wrote", name)
