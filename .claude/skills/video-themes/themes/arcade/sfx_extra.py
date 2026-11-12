"""arcade theme sounds: 8-bit square-wave UI blips (synthesized, free to redistribute).
usage: python3 sfx_extra.py <out_dir>   (also writes the shared whoosh/pop/key from scripts/synth_sfx.py)"""
import sys, pathlib
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "scripts"))
import synth_sfx as S

SR = S.SR


def sq(freqs, dur, duty=0.5, decay=None, vol=1.0):
    """square wave following a frequency array (or a constant)"""
    n = int(SR * dur)
    f = np.full(n, freqs) if np.isscalar(freqs) else np.interp(np.linspace(0, 1, n), np.linspace(0, 1, len(freqs)), freqs)
    ph = np.cumsum(f) / SR % 1.0
    x = np.where(ph < duty, 1.0, -1.0)
    e = np.ones(n) if decay is None else np.exp(-np.arange(n) / SR / decay)
    fade = min(n, int(0.003 * SR)); e[-fade:] *= np.linspace(1, 0, fade)
    return x * e * vol


def blip():   # a menu select: one short square note
    return sq(1320, 0.06, 0.25, 0.04)


def coin():   # two-note pickup (B5 -> E6)
    return np.concatenate([sq(988, 0.07, 0.5), sq(1319, 0.28, 0.5, 0.09)])


def jump():   # rising sweep: something enters / goes up
    return sq(np.linspace(300, 1200, 50), 0.16, 0.5, 0.12)


def spawn():  # a creature appears: quick down-up chirp
    return sq([900, 500, 1100], 0.09, 0.25, 0.08)


def powerup():  # arpeggio: unlock / level up / payoff
    notes = [523, 659, 784, 1047, 1319]
    return np.concatenate([sq(f, 0.06, 0.5, 0.2) for f in notes[:-1]] + [sq(notes[-1], 0.3, 0.5, 0.12)])


def hit():    # 8-bit noise burst: a strike, a defeat
    n = int(SR * 0.18)
    step = 24  # sample-and-hold noise = the NES noise channel sound
    noise = np.repeat(S.rng.uniform(-1, 1, n // step + 1), step)[:n]
    return noise * np.exp(-np.arange(n) / SR / 0.05)


def pen():    # marker on paper: scratchy band-passed noise with a stroke envelope
    n = int(SR * 0.3)
    x = S.lowpass(S.highpass(S.rng.standard_normal(n), 1500), 5000)
    shape = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7 * (0.7 + 0.3 * np.sin(np.linspace(0, 40, n)))
    return x * shape


if __name__ == "__main__":
    out = sys.argv[1]
    for name in ["blip", "coin", "jump", "spawn", "powerup", "hit", "pen"]:
        S.save(f"{out}/{name}.wav", globals()[name]()); print("wrote", name)
    for name in ["whoosh", "pop", "key"]:
        S.save(f"{out}/{name}.wav", getattr(S, name)()); print("wrote", name)
