"""Frame-difference metrics, measured the SAME way on an anchor reference and on a draft render.

All videos are decoded at 30 fps, 270x480 grey, so a 720p anchor and a 1080p draft are comparable.
  motion       mean absolute luma difference between consecutive frames (0-255 scale)
  flat %       share of time inside "flat stretches": runs >= FLAT_MIN_S where the frame difference stays < FLAT_THR
  events / s   "big moments": local peaks of the difference above max(EV_ABS, EV_REL x the 1-s rolling median),
               at least EV_GAP apart (a cut, a punch, a card landing, a layout change)
These constants are part of the contract: changing them invalidates every theme's QA targets (re-run anchor.py).
"""
import subprocess
import numpy as np

FPS, W, H = 30, 270, 480
FLAT_THR, FLAT_MIN_S = 1.0, 0.4
EV_ABS, EV_REL, EV_GAP = 3.0, 3.0, 0.2


def frames(path, start=None, dur=None):
    cmd = ["ffmpeg", "-loglevel", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", str(path)]
    if dur is not None:
        cmd += ["-t", str(dur)]
    cmd += ["-vf", f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=gray", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W)


def diff_signal(path):
    f = frames(path).astype(np.int16)
    return np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))  # d[i] = change from frame i to i+1


def flat_runs(d):
    runs, start = [], None
    for i, v in enumerate(list(d) + [FLAT_THR + 1]):
        if v < FLAT_THR and start is None:
            start = i
        elif v >= FLAT_THR and start is not None:
            if (i - start) / FPS >= FLAT_MIN_S:
                runs.append((start / FPS, i / FPS))
            start = None
    return runs


def events(d):
    k = FPS // 2
    pad = np.pad(d, k, mode="edge")
    med = np.array([np.median(pad[i:i + 2 * k + 1]) for i in range(len(d))])
    thr = np.maximum(EV_ABS, EV_REL * med)
    ev, last = [], -1e9
    for i in range(1, len(d) - 1):
        if d[i] > thr[i] and d[i] >= d[i - 1] and d[i] >= d[i + 1] and (i - last) / FPS >= EV_GAP:
            ev.append(i / FPS)
            last = i
    return ev


def metrics(path):
    d = diff_signal(path)
    dur = len(d) / FPS
    runs = flat_runs(d)
    ev = events(d)
    return {
        "duration": round(dur, 2),
        "motion": round(float(d.mean()), 2),
        "flat_pct": round(100 * sum(b - a for a, b in runs) / dur, 1),
        "flat_runs": [(round(a, 2), round(b, 2)) for a, b in runs],
        "events_per_s": round(len(ev) / dur, 2),
        "events": [round(e, 2) for e in ev],
    }


if __name__ == "__main__":
    import json, sys
    m = metrics(sys.argv[1])
    m.pop("events"); m.pop("flat_runs")
    print(json.dumps(m))
