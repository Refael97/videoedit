"""Synthesised sound effects for the Fable showcase: clicks, typing, whooshes, impacts, risers, shimmers.
Writes one stereo 48 kHz stem (sfx_synth.wav) with every hit placed on the picture's timeline. Deterministic."""
import sys, wave
import numpy as np

SR, DUR = 48000, 30.2
rng = np.random.default_rng(7)
out = np.zeros((int(SR * DUR) + SR, 2))

def env(n, a=0.005, r=0.2, curve=2.0):
    t = np.arange(n) / SR; d = n / SR
    return np.clip(t / a, 0, 1) * np.clip((d - t) / r, 0, 1) ** curve

def lowpass(x, fc):
    y = np.zeros_like(x); k = 1 - np.exp(-2 * np.pi * np.asarray(fc) / SR); k = np.broadcast_to(k, x.shape); acc = 0.0
    for i in range(len(x)): acc += k[i] * (x[i] - acc); y[i] = acc
    return y

def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); n = len(sig); l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    out[i:i + n, 0] += sig * gain * l * 1.414; out[i:i + n, 1] += sig * gain * r * 1.414

def click(t, f=2200, gain=0.5, pan=0.0, d=0.035):
    n = int(SR * d); tt = np.arange(n) / SR
    place((np.sin(2 * np.pi * f * tt) * 0.6 + rng.standard_normal(n) * 0.5) * np.exp(-tt * 190), t, gain, pan)

def tick(t, gain=0.3, pan=0.0):  # soft UI pop
    n = int(SR * 0.09); tt = np.arange(n) / SR
    place(np.sin(2 * np.pi * (900 * np.exp(-tt * 18) + 420) * tt) * np.exp(-tt * 55), t, gain, pan)

def whoosh(t, d=0.5, f0=400, f1=5000, gain=0.5, pan0=-0.5, pan1=0.5):
    n = int(SR * d); x = rng.standard_normal(n); k = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** np.sin(np.pi * k); sig = lowpass(x, fc) - lowpass(x, fc * 0.25)
    sig *= np.sin(np.pi * k) ** 1.6; i = int(t * SR); pan = np.linspace(pan0, pan1, n)
    out[i:i + n, 0] += sig * gain * np.sqrt((1 - pan) / 2) * 1.414; out[i:i + n, 1] += sig * gain * np.sqrt((1 + pan) / 2) * 1.414

def impact(t, gain=0.9, f=58, d=1.1):
    n = int(SR * d); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * (f * (1 + 2.2 * np.exp(-tt * 26))) * tt) * np.exp(-tt * 4.2)
    crack = lowpass(rng.standard_normal(n), np.full(n, 1800.0)) * np.exp(-tt * 34) * 0.5
    place(np.tanh((body + crack) * 1.6), t, gain)

def riser(t, d=1.0, gain=0.4, f0=180, f1=1900):
    n = int(SR * d); k = np.linspace(0, 1, n); x = rng.standard_normal(n)
    noise = (lowpass(x, 600 + 7000 * k ** 2) - lowpass(x, 300 + 2000 * k ** 2)) * k ** 2
    ph = 2 * np.pi * np.cumsum(f0 * (f1 / f0) ** k) / SR
    place((noise * 0.8 + np.sin(ph) * 0.18 * k ** 2) * np.clip((1 - k) / 0.02, 0, 1), t, gain)

def shimmer(t, d=1.2, gain=0.25, base=1320, pan=0.0):
    n = int(SR * d); tt = np.arange(n) / SR; sig = np.zeros(n)
    for j, m in enumerate([1, 1.5, 2, 2.5, 3, 4]):
        st = int(j * 0.045 * SR); sig[st:] += np.sin(2 * np.pi * base * m * tt[:n - st]) * np.exp(-tt[:n - st] * (3.5 + j)) / (1 + j * 0.6)
    place(sig * env(n, 0.01, 0.3), t, gain, pan)

def sub_swell(t, d=2.0, gain=0.35, f=46):
    n = int(SR * d); tt = np.arange(n) / SR
    place(np.sin(2 * np.pi * f * tt) * np.sin(np.pi * tt / (n / SR)) ** 2, t, gain)

T2 = 6.4
# scene 1: the prompt window
click(0.95, 1700, 0.35); click(1.55, 2300, 0.4)
def key(t, gain=0.5, pan=0.0):  # a mechanical key: a hard bright tick on the way down, a wooden body, a lighter tick on release
    n = int(SR * 0.03); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    tickd = (x - lowpass(x, np.full(n, 3500.0))) * np.exp(-tt * 1400)
    body = np.sin(2 * np.pi * rng.uniform(190, 260) * tt) * np.exp(-tt * 150) * 0.55
    place(tickd * 1.3 + body, t, gain, pan)
    m = int(SR * 0.012); t2 = np.arange(m) / SR; y = rng.standard_normal(m)
    place((y - lowpass(y, np.full(m, 4500.0))) * np.exp(-t2 * 1700), t + 0.016, gain * 0.5, pan)
for i in range(37): key(2.0 + i * 0.034 + rng.uniform(-0.004, 0.004), 0.42 + rng.uniform(0, 0.16), rng.uniform(-0.3, 0.3))
click(3.24, 1500, 0.5); tick(3.26, 0.4)
whoosh(3.3, 0.7, 500, 7000, 0.4, 0.3, -0.2); shimmer(3.45, 1.6, 0.3, 1568); sub_swell(3.7, 2.2, 0.28, 52)
# the burst into scene 2
riser(T2 - 0.45, 0.6, 0.35); impact(T2 + 0.14, 0.95); whoosh(T2 + 0.1, 0.9, 300, 9000, 0.55, 0.0, 0.0); shimmer(T2 + 0.5, 1.3, 0.22, 1760)
tick(T2 + 0.8, 0.45); click(T2 + 1.5, 1900, 0.5); tick(T2 + 1.52, 0.35)
for t, p in [(T2 + 1.62, 1), (T2 + 2.62, 1), (T2 + 3.75, -1)]:   # camera whips across the board
    whoosh(t - 0.03, 0.42, 350, 6500, 0.5, -0.7 * p, 0.7 * p)
for i in range(6): tick(T2 + 1.98 + i * 0.07, 0.2, rng.uniform(-0.5, 0.5))
for i in range(7): tick(T2 + 2.95 + i * 0.075, 0.18, rng.uniform(-0.5, 0.5))
tick(T2 + 4.2, 0.25, -0.3); tick(T2 + 4.3, 0.22, 0.3)
whoosh(T2 + 4.6, 1.0, 200, 3500, 0.5, 0.0, 0.0); sub_swell(T2 + 4.7, 1.6, 0.4, 48)   # the push into the phone
shimmer(T2 + 5.7, 1.8, 0.3, 1175); sub_swell(T2 + 5.6, 2.4, 0.3, 55)                    # VFX rises over the limb
# the flight, the letters, the white-out
whoosh(13.3, 1.4, 200, 2600, 0.35, 0.0, 0.0); whoosh(13.75, 0.6, 600, 8000, 0.3, 0.0, 0.0)
sub_swell(15.4, 2.2, 0.32, 44); shimmer(15.7, 2.0, 0.2, 988)                             # sunrise, letters surface
riser(18.3, 1.0, 0.5, 150, 2400); impact(19.3, 0.75, 70, 0.9); whoosh(19.0, 0.7, 500, 10000, 0.5, 0.0, 0.0)
# wind and sea under the whole flight (13.2 - 19.4): low rolling water plus an airy wind band, swelling as the drone speeds up
def flight(t0, t1):
    n = int(SR * (t1 - t0)); k = np.linspace(0, 1, n); tt = np.arange(n) / SR
    for pan, seed in [(-0.6, 1), (0.6, 2)]:
        x = np.random.default_rng(seed).standard_normal(n)
        sea = lowpass(x, 500 + 250 * np.sin(2 * np.pi * 0.45 * tt + seed)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.31 * tt + seed * 2)) * 2.2
        wind = (lowpass(x, 2600 + 1800 * k) - lowpass(x, 900 + 400 * k)) * (0.35 + 0.65 * k)
        place((sea + wind) * np.clip(k / 0.12, 0, 1) * np.clip((1 - k) / 0.04, 0, 1) * (0.5 + 0.5 * k), t0, 0.5, pan)
flight(13.2, 19.4)
# the filmed shots: cut accents and the slow-motion beat
whoosh(21.22, 0.22, 800, 6000, 0.25, -0.3, 0.3); whoosh(21.7, 0.5, 900, 200, 0.4, 0.0, 0.0); sub_swell(21.75, 1.2, 0.4, 42)
whoosh(22.8, 0.28, 300, 5000, 0.3, 0.0, 0.0); whoosh(23.26, 0.22, 800, 6000, 0.25, 0.3, -0.3)
# the ending
click(25.5, 900, 0.5, 0, 0.06); impact(25.5, 0.45, 80, 0.5); whoosh(25.72, 0.95, 5000, 300, 0.45, 0.0, 0.0)
for i, t in enumerate([25.85, 26.05, 26.25, 26.37]): tick(t, 0.25, [-0.3, 0.3, -0.2, 0.2][i])
whoosh(27.7, 0.9, 250, 4000, 0.4, 0.0, 0.0); shimmer(28.1, 2.0, 0.32, 1320); sub_swell(27.9, 2.2, 0.35, 49)

# the last chord, on the credit: D-flat lydian stacked wide (Db - Ab - F - C - Eb - G), a bright unresolved colour instead of a plain major ending
def chord(t, d=2.6, gain=0.5):
    n = int(SR * d); tt = np.arange(n) / SR; L = np.zeros(n); R = np.zeros(n)
    for j, f in enumerate([69.30, 103.83, 174.61, 261.63, 311.13, 392.00, 783.99]):
        st = int(j * 0.022 * SR); x = tt[: n - st]; a = 1.0 / (1 + j * 0.35)
        pluck = sum(np.sin(2 * np.pi * f * h * x) * np.exp(-x * (1.6 + h * 1.1)) / h ** 1.4 for h in range(1, 7))      # felt-piano strike
        pad = (np.sin(2 * np.pi * f * 1.003 * x) + np.sin(2 * np.pi * f * 0.997 * x)) * np.clip(x / 0.5, 0, 1) * 0.35  # slow string bloom
        v = (pluck + pad) * a; pan = [-0.1, 0.1, -0.5, 0.5, -0.3, 0.35, 0.0][j]
        L[st:] += v * np.sqrt((1 - pan) / 2); R[st:] += v * np.sqrt((1 + pan) / 2)
    e = np.clip((d - tt) / 1.3, 0, 1) ** 1.5; i = int(t * SR)
    out[i:i + n, 0] += L * e * gain * 0.5; out[i:i + n, 1] += R * e * gain * 0.5
chord(28.2)

out = out[: int(SR * DUR)]; out /= max(1.0, np.abs(out).max() / 0.95)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype("<i2").tobytes())
print("ok", sys.argv[1])
