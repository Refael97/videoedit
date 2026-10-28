# per-frame (60 fps) audio features for the orb: low / mid / high band energy + overall level,
# with fast attack and slow release so the motion breathes instead of flickering
import json, subprocess, numpy as np, sys
SR, FPS, OFFSET, DUR = 22050, 60, 0.6, 7.0
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", "assets/voice.wav", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
n = int(DUR * FPS); win = 2048; hann = np.hanning(win); fr = np.fft.rfftfreq(win, 1 / SR)
bands = {"low": (60, 300), "mid": (300, 2500), "high": (2500, 9000)}
out = {k: [] for k in list(bands) + ["lvl"]}
for i in range(n):
    c = int((i / FPS - OFFSET) * SR)
    seg = a[c - win // 2: c + win // 2] if c - win // 2 >= 0 and c + win // 2 <= len(a) else np.zeros(win)
    sp = np.abs(np.fft.rfft(seg * hann))
    for k, (lo, hi) in bands.items(): out[k].append(float(np.sqrt(np.mean(sp[(fr >= lo) & (fr < hi)] ** 2))))
    out["lvl"].append(float(np.sqrt(np.mean(seg ** 2))))
res = {}
for k, v in out.items():
    v = np.array(v); v = v / (np.percentile(v, 97) + 1e-9); v = np.clip(v, 0, 1.3)
    s, sm = 0.0, []
    for x in v: s = s + (x - s) * (0.55 if x > s else 0.09); sm.append(round(float(s), 4))
    res[k] = sm
json.dump(res, open("data/audio.json", "w"))
print({k: (min(v), max(v)) for k, v in res.items()})
