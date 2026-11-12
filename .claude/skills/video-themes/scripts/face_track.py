"""Track the speaker's face box through a clip, so a theme can place things relative to the face, not at fixed pixels.

usage: python3 face_track.py <video> <out.json> [--fps 10]
writes {"fps", "size": [w, h], "boxes": [[t, x, y, w, h], ...]} in source-video pixels, one box per sample.
A missed detection holds the last box (up to 1 s), then the nearest later one; boxes are median-smoothed over 5
samples so captions and cards don't jitter with the detector. Face-relative anchors used by the themes:
  chin   = y + h          eyes  = y + 0.4 h        shoulders = y + h + 0.55 h        face height = h
"""
import argparse, json
import numpy as np
import cv2


def track(path, fps=10):
    cap = cv2.VideoCapture(str(path))
    vfps = cap.get(cv2.CAP_PROP_FPS) or 30
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    size = [int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))]
    det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    scale = 480 / max(size)
    raw, step = [], max(1, round(vfps / fps))
    for i in range(0, n, step):
        for _ in range(step - 1 if i else 0):  # decode sequentially: seeking every sample is ~10x slower
            cap.grab()
        ok, fr = cap.read()
        if not ok:
            break
        g = cv2.cvtColor(cv2.resize(fr, None, fx=scale, fy=scale), cv2.COLOR_BGR2GRAY)
        f = det.detectMultiScale(g, 1.1, 5, minSize=(int(40 * scale * 2), int(40 * scale * 2)))
        b = max(f, key=lambda r: r[2] * r[3]) / scale if len(f) else None
        raw.append((i / vfps, b))
    # fill gaps: hold the last box for <= 1 s, else take the next found one
    out, last, last_t = [], None, -9
    for k, (t, b) in enumerate(raw):
        if b is None and last is not None and t - last_t <= 1.0:
            b = last
        if b is None:
            b = next((bb for tt, bb in raw[k + 1:] if bb is not None), last)
        if b is not None and raw[k][1] is not None:
            last, last_t = b, t
        out.append((t, b))
    arr = np.array([b if b is not None else [np.nan] * 4 for _, b in out], float)
    sm = np.array([np.nanmedian(arr[max(0, k - 2):k + 3], axis=0) for k in range(len(arr))])
    boxes = [[round(t, 3)] + [round(float(v), 1) for v in sm[k]] for k, (t, _) in enumerate(out) if np.isfinite(sm[k]).all()]
    return {"fps": fps, "size": size, "boxes": boxes}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=10)
    a = ap.parse_args()
    r = track(a.video, a.fps)
    with open(a.out, "w") as fh:
        json.dump(r, fh)
    h = [b[4] for b in r["boxes"]]
    print(f"{len(r['boxes'])} boxes, face height median {np.median(h):.0f}px of {r['size'][1]}")
