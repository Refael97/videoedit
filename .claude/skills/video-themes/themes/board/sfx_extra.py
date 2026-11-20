"""board theme sound set. Reuses scripts/synth_sfx.py (shared) and adds the board's own sounds.
usage: python3 sfx_extra.py [out_dir]   (default: ./sfx next to this file)"""
import sys, pathlib
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent / "scripts"))
import synth_sfx as S  # noqa: E402

SR = S.SR


def thock():
    # a card landing on the board: a soft low knock + a tiny paper slap
    d = 0.16
    x = S.t(d)
    f = 150 + 120 * np.exp(-x / 0.02)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * S.env(len(x), 0.001, 0.045)
    slap = S.highpass(S.rng.standard_normal(len(x)), 1500) * S.env(len(x), 0.0005, 0.008) * 0.5
    return body + slap


def hop():
    # the crab hops: a short soft square-ish upward chirp (8-bit flavour, rounded)
    d = 0.14
    x = S.t(d)
    f = 380 + 900 * (x / d) ** 1.3
    ph = np.cumsum(f) / SR
    sq = np.tanh(4 * np.sin(2 * np.pi * ph)) * 0.6
    return S.lowpass(sq, 3500) * S.env(len(x), 0.002, 0.05)


def snap():
    # claws: two tiny clicks
    n = int(0.12 * SR)
    out = np.zeros(n)
    for k in (0, int(0.07 * SR)):
        m = int(0.02 * SR)
        out[k:k + m] += S.highpass(S.rng.standard_normal(m), 2500) * S.env(m, 0.0003, 0.003)
    return out


def pixels():
    # pixel dissolve: a fast granular burst of tiny blips, rising then falling
    d = 0.55
    n = int(d * SR)
    out = np.zeros(n)
    for i in range(34):
        st = int(S.rng.uniform(0, d - 0.03) * SR)
        m = int(0.018 * SR)
        fr = S.rng.uniform(900, 2600)
        out[st:st + m] += np.sign(np.sin(2 * np.pi * fr * np.arange(m) / SR)) * S.env(m, 0.0005, 0.005)
    return S.lowpass(out, 6000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7


def iris():
    # the circle wipe: a quick airy swell
    d = 0.4
    n = int(d * SR)
    x = S.lowpass(S.rng.standard_normal(n), 2500)
    return S.highpass(x, 200) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.7) ** 2


if __name__ == "__main__":
    out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else HERE / "sfx")
    out.mkdir(parents=True, exist_ok=True)
    for name in ["click", "pop", "tick", "ding", "whoosh", "key"]:
        S.save(str(out / f"{name}.wav"), getattr(S, name)())
    for fn in [thock, hop, snap, pixels, iris]:
        S.save(str(out / f"{fn.__name__}.wav"), fn())
    print("board sfx ->", out, sorted(p.name for p in out.glob("*.wav")))
