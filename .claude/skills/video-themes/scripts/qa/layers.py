"""Split a video's motion into the GRAPHICS layer and the FOOTAGE (camera) layer.

Anchor (one flat video): graphics motion = frame difference after removing the camera's global move (similarity
transform from tracked corners, RANSAC) and masking out the speaker (body box from the face), averaged over the
windows that carry graphics, minus the same residual in windows without graphics (the footage's own baseline).
Draft (we have the layers): graphics motion = the same measurement on a render with the footage blacked out
(`qa` renders it), masked with the speaker box found in the full draft. Same function, same constants, both sides.

Footage motion (info only): camera jitter (px/frame at 270 wide) and deliberate camera moves — punches (scale jump
>= PUNCH within 4 frames) and drifts (steady zoom/pan >= DRIFT over >= 1 s). Camera moves count as theme actions.
"""
import numpy as np
import cv2

from video_metrics import FPS, W, H, frames

EDGE_THR = 300.0       # Sobel magnitude of a "hard" synthetic edge at 270x480
EDGE_NOGFX = 0.012     # a 1-s window is "no graphics" when < 1.2% of the pixels outside the speaker are hard edges
PUNCH, DRIFT = 0.04, 0.03
_face = None


def _detector():
    global _face
    if _face is None:
        _face = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    return _face


def person_masks(F, every=6):
    """True = speaker (excluded). Body box from the face: 1 face-width each side, from just above the head down."""
    det, masks, last, last_i = _detector(), [], None, -999
    for i, f in enumerate(F):
        if i % every == 0:
            fc = det.detectMultiScale(f, 1.1, 5, minSize=(24, 24))
            if len(fc):
                last, last_i = max(fc, key=lambda b: b[2] * b[3]), i
        m = np.zeros((H, W), bool)
        if last is not None and i - last_i <= FPS:
            x, y, w, h = last
            m[max(0, int(y - 0.6 * h)):, max(0, int(x - 2 * w)):min(W, int(x + 3 * w))] = True
        masks.append(m)
    return masks


def camera(F):
    """per pair: (scale, tx, ty, ok) of the global similarity transform prev -> next"""
    out = []
    for a, b in zip(F[:-1], F[1:]):
        p = cv2.goodFeaturesToTrack(a, 200, 0.01, 8)
        ok, M = False, None
        if p is not None and len(p) >= 20:
            q, st, _ = cv2.calcOpticalFlowPyrLK(a, b, p, None)
            good = st.ravel() == 1
            if good.sum() >= 20:
                M, inl = cv2.estimateAffinePartial2D(p[good], q[good], method=cv2.RANSAC, ransacReprojThreshold=1.5)
                ok = M is not None and inl is not None and inl.sum() >= 15
        if ok:
            out.append((float(np.hypot(M[0, 0], M[1, 0])), float(M[0, 2]), float(M[1, 2]), True, M))
        else:
            out.append((1.0, 0.0, 0.0, False, None))
    return out


def edges_outside(f, m):
    gx, gy = cv2.Sobel(f, cv2.CV_32F, 1, 0), cv2.Sobel(f, cv2.CV_32F, 0, 1)
    e = np.hypot(gx, gy) > EDGE_THR
    keep = ~m
    return float(e[keep].mean()) if keep.any() else 0.0


def camera_moves(cam):
    """deliberate camera moves (times): punches and drifts; jitter = median translation per frame"""
    s = np.array([c[0] for c in cam]); tx = np.array([c[1] for c in cam]); ok = np.array([c[3] for c in cam])
    ls = np.where(ok, np.log(s), 0.0)
    punches, drifts, i = [], [], 0
    while i < len(ls) - 4:
        if abs(ls[i:i + 4].sum()) >= PUNCH:
            punches.append(i / FPS); i += 8; continue
        i += 1
    win = FPS
    i = 0
    while i < len(ls) - win:
        z, px = ls[i:i + win], tx[i:i + win]
        steady_zoom = abs(z.sum()) >= DRIFT and (np.sign(z[ok[i:i + win]]) == np.sign(z.sum())).mean() > 0.7
        steady_pan = abs(px.sum()) >= DRIFT * W and (np.sign(px[ok[i:i + win]]) == np.sign(px.sum())).mean() > 0.7
        if steady_zoom or steady_pan:
            drifts.append(i / FPS); i += 2 * win; continue
        i += win // 3
    jitter = float(np.median(np.hypot(tx[ok], np.array([c[2] for c in cam])[ok]))) if ok.any() else 0.0
    return {"jitter_px": round(jitter, 2), "punches": [round(t, 2) for t in punches], "drifts": [round(t, 2) for t in drifts]}


def graphics_motion(diff_src, mask_src=None, compensate=True):
    """returns dict: gfx_motion, baseline, gfx_share, footage {jitter, punches, drifts}, per-window classes"""
    G = frames(diff_src)
    Fm = G if mask_src is None else frames(mask_src)
    n = min(len(G), len(Fm))
    G, Fm = G[:n], Fm[:n]
    masks = person_masks(Fm)
    cam = camera(Fm)
    res, edg = [], []
    for i in range(n - 1):
        a, b, m = G[i], G[i + 1], masks[i] | masks[i + 1]
        if compensate and cam[i][3]:
            a = cv2.warpAffine(a, cam[i][4], (W, H), borderMode=cv2.BORDER_REPLICATE)
            # pixels shifted in from outside the frame carry no information
            valid = cv2.warpAffine(np.ones((H, W), np.uint8), cam[i][4], (W, H)) > 0
            m = m | ~valid
        d = np.abs(b.astype(np.int16) - a.astype(np.int16))
        keep = ~m
        res.append(float(d[keep].mean()) if keep.mean() > 0.05 else float(d.mean()))
        edg.append(edges_outside(b, m) if i % 3 == 0 else (edg[-1] if edg else 0.0))
    res, edg = np.array(res), np.array(edg)
    nw = len(res) // FPS
    gfx_w = [bool(np.median(edg[k * FPS:(k + 1) * FPS]) >= EDGE_NOGFX) for k in range(nw)]
    win = lambda k: res[k * FPS:(k + 1) * FPS]
    g = [win(k).mean() for k in range(nw) if gfx_w[k]]
    o = [win(k).mean() for k in range(nw) if not gfx_w[k]]
    # baseline = the footage's own residual (grain, compression, speaker spill, leftover camera) in windows without
    # graphics; when the video has < 3 s of such windows, the quietest 10% of windows stand in for it
    allw = [win(k).mean() for k in range(nw)]
    base = float(np.mean(o)) if len(o) >= 3 else (float(np.percentile(allw, 10)) if allw else 0.0)
    gm = max(0.0, float(np.mean(g)) - base) if g else 0.0
    return {"gfx_motion": round(gm, 2), "gfx_raw": round(float(np.mean(g)), 2) if g else 0.0, "baseline": round(base, 2), "baseline_s": len(o), "baseline_from": "no-graphics windows" if len(o) >= 3 else "quietest 10% of windows", "gfx_share": round(len(g) / max(1, nw), 2),
            "footage": camera_moves(cam)}


def actions(events, footage, near=0.5):
    """theme actions = frame-difference events + deliberate camera moves (drifts/punches) not already counted"""
    acts = list(events)
    for t in footage["drifts"] + footage["punches"]:
        if all(abs(t - e) > near for e in acts):
            acts.append(t)
    return sorted(acts)
