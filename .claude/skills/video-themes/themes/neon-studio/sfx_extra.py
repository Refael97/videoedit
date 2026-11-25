"""neon-studio sound set: the shared synth_sfx sounds + three of its own (air, blip, coin).
usage: python3 sfx_extra.py [out_dir]   (default: ./sfx next to this file)"""
import sys, pathlib
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent.parent / "scripts"))
import synth_sfx as s


def air():
    # the blur-in "lens pull": a very short, soft, dark noise swell
    d = 0.2
    n = int(d * s.SR)
    x = s.lowpass(s.rng.standard_normal(n), 2200)
    return s.highpass(x, 180) * np.sin(np.pi * np.linspace(0, 1, n) ** 0.7) ** 2


def square(f, d, decay):
    x = s.t(d)
    return np.sign(np.sin(2 * np.pi * f * x)) * s.env(len(x), 0.001, decay)


def blip():
    # a pixel sprite lands: two quick square-wave steps up
    return np.concatenate([square(660, 0.04, 0.03), square(990, 0.07, 0.04)]) * 0.5


def coin():
    # done / unlocked in pixel terms: B5 -> E6
    return np.concatenate([square(988, 0.07, 0.05), square(1319, 0.32, 0.12)]) * 0.5


if __name__ == "__main__":
    out = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else HERE / "sfx"
    out.mkdir(exist_ok=True)
    for name in ["click", "pop", "tick", "ding", "whoosh", "key"]:
        s.save(str(out / f"{name}.wav"), getattr(s, name)())
    for name, fn in [("air", air), ("blip", blip), ("coin", coin)]:
        s.save(str(out / f"{name}.wav"), fn())
    print("wrote", sorted(p.name for p in out.glob("*.wav")))
