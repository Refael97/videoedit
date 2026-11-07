"""Look metrics: what makes a frame read as "expensive", measured the SAME way on an anchor and on a draft.

The timing checks (video_metrics / layers) say whether things move at the anchor's pace. These say whether the
frame itself is at the anchor's level: the footage, the size of the hero, how much real content it carries, how
often the face gets the whole frame, and what the graphics are made of. Every function runs on decoded frames
only (no DOM), so an anchor video and a draft render go through exactly the same code.

Frames are sampled at SAMPLE_FPS, 360x640 RGB. Per frame:
  layout   "face"    a face is found and its centre sits above FACE_SPLIT_Y (the speaker owns the frame); faces
                     smaller than MIN_FACE_H of the frame height are people inside graphics and are ignored
           "split"   a face is found below FACE_SPLIT_Y (speaker box at the bottom, graphics above)
           "graphic" no face (full-frame graphic)
  footage  around the face only: face luma, skin warmth (R - B on the face), background luma / saturation (a ring
           around the head, body columns excluded), contrast (p95 - p5 of the window), garment luma (below the chin)
  hero     the graphics zone (above the head in "split", the whole frame in "graphic"): 9px cells whose luma std
           > DETAIL_STD carry detail; hero box = 5th-95th percentile extent of those cells; width = box width / frame
           width; density = detailed cells / cells inside the box
  material inside the hero box: luma span (p95 - p5), highlight share (cells brighter than the box p98 + 25),
           glow (mean luma of a 4% ring just outside the box minus the zone's far background), accent saturation
           (median saturation of the 10% most saturated pixels)
These constants are part of the contract: changing them means re-running `anchor.py <theme> --look`.
"""
import subprocess
import numpy as np

SAMPLE_FPS = 2
W, H = 360, 640
FACE_SPLIT_Y = 0.60
CELL, DETAIL_STD = 9, 6.0
MIN_FACE_H = 0.07
_DET = None


def frames(path, fps=SAMPLE_FPS, start=None, dur=None):
    cmd = ["ffmpeg", "-loglevel", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    cmd += ["-i", str(path)]
    if dur is not None:
        cmd += ["-t", str(dur)]
    cmd += ["-vf", f"fps={fps},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=rgb24", "-f", "rawvideo", "-"]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)


def luma(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


def sat(rgb):
    mx, mn = rgb.max(-1).astype(float), rgb.min(-1).astype(float)
    return np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0) * 255


def face(rgb):
    global _DET
    import cv2
    if _DET is None:
        _DET = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    g = cv2.cvtColor(np.ascontiguousarray(rgb), cv2.COLOR_RGB2GRAY)
    f = _DET.detectMultiScale(g, 1.1, 6, minSize=(36, 36))
    if not len(f):
        return None
    b = max(f, key=lambda r: r[2] * r[3])
    # a face smaller than MIN_FACE_H of the frame is a person inside a graphic (a photo, a thumbnail), not the speaker
    return [int(v) for v in b] if b[3] >= MIN_FACE_H * H else None


def layout_of(fb):
    if fb is None:
        return "graphic"
    return "face" if (fb[1] + fb[3] / 2) < FACE_SPLIT_Y * H else "split"


def footage(rgb, fb):
    """footage numbers around the face (None if the face is too close to the edges to read a background)"""
    x, y, w, h = fb
    L, S = luma(rgb.astype(float)), sat(rgb)
    fx1, fy1, fx2, fy2 = x + int(0.2 * w), y + int(0.25 * h), x + int(0.8 * w), y + int(0.85 * h)
    face_px = rgb[fy1:fy2, fx1:fx2].reshape(-1, 3).astype(float)
    # window around the head: background ring = window minus the face (x1.15) and minus the body columns below the chin
    wx1, wx2, wy1, wy2 = max(0, x - int(0.9 * w)), min(W, x + int(1.9 * w)), max(0, y - int(0.5 * h)), min(H, y + int(1.2 * h))
    m = np.zeros((H, W), bool); m[wy1:wy2, wx1:wx2] = True
    m[max(0, y - int(0.08 * h)):y + int(1.08 * h), max(0, x - int(0.08 * w)):x + int(1.08 * w)] = False
    m[y + h:, max(0, x - int(0.25 * w)):x + int(1.25 * w)] = False
    if m.sum() < 400 or not len(face_px):
        return None
    gy1, gy2 = y + int(1.25 * h), min(H, y + int(1.9 * h))
    garment = float(L[gy1:gy2, x:x + w].mean()) if gy2 - gy1 > 4 else None
    win = L[wy1:wy2, wx1:wx2]
    return {"face_h": h / H, "face_luma": float(luma(face_px).mean()), "warmth": float((face_px[:, 0] - face_px[:, 2]).mean()),
            "bg_luma": float(L[m].mean()), "bg_sat": float(S[m].mean()), "contrast": float(np.percentile(win, 95) - np.percentile(win, 5)),
            "garment_luma": garment}


def hero(rgb, fb):
    """hero box, width share, density and material numbers of the graphics zone (None when the zone is empty)"""
    L = luma(rgb.astype(float))
    top, bot = 0, H
    if fb is not None:
        if layout_of(fb) == "face":
            return None  # full-face beat: no graphics zone
        bot = max(0, fb[1] - int(0.35 * fb[3]))
    if bot - top < 5 * CELL:
        return None
    Z = L[top:bot]
    ch, cw = Z.shape[0] // CELL, W // CELL
    cells = Z[:ch * CELL, :cw * CELL].reshape(ch, CELL, cw, CELL).std(axis=(1, 3))
    det = np.argwhere(cells > DETAIL_STD)
    if len(det) < 6:
        return {"width": 0.0, "density": 0.0, "box": None}
    r1, r2 = np.percentile(det[:, 0], [5, 95]).astype(int); c1, c2 = np.percentile(det[:, 1], [5, 95]).astype(int)
    r2, c2 = max(r2, r1), max(c2, c1)
    inside = cells[r1:r2 + 1, c1:c2 + 1]
    box = [int(c1 * CELL), int(top + r1 * CELL), int((c2 - c1 + 1) * CELL), int((r2 - r1 + 1) * CELL)]
    out = {"width": box[2] / W, "density": float((inside > DETAIL_STD).mean()), "box": box}
    # material
    bx, by, bw, bh = box
    hb = L[by:by + bh, bx:bx + bw]; hrgb = rgb[by:by + bh, bx:bx + bw]
    if hb.size > 200:
        out["span"] = float(np.percentile(hb, 95) - np.percentile(hb, 5))
        out["highlight"] = float((hb > min(250, np.percentile(L[top:bot], 98) + 25)).mean())
        pad = max(4, int(0.04 * W))
        ring = np.zeros_like(L, bool); ring[max(top, by - pad):min(bot, by + bh + pad), max(0, bx - pad):min(W, bx + bw + pad)] = True
        ring[by:by + bh, bx:bx + bw] = False
        far = np.ones_like(L, bool); far[:top] = False; far[bot:] = False
        far[max(top, by - 3 * pad):min(bot, by + bh + 3 * pad), max(0, bx - 3 * pad):min(W, bx + bw + 3 * pad)] = False
        if ring.sum() > 50 and far.sum() > 50:
            out["glow"] = float(L[ring].mean() - np.median(L[far]))
        s = sat(hrgb).ravel()
        out["accent_sat"] = float(np.median(np.sort(s)[-max(1, len(s) // 10):]))
    return out


def analyse(path, fps=SAMPLE_FPS, start=None, dur=None):
    """per-sample records + summary for one video"""
    F = frames(path, fps, start, dur)
    recs = []
    for i, rgb in enumerate(F):
        fb = face(rgb)
        r = {"t": round((start or 0) + i / fps, 2), "layout": layout_of(fb), "face": fb}
        if fb is not None:
            r["footage"] = footage(rgb, fb)
        r["hero"] = hero(rgb, fb)
        recs.append(r)
    return {"records": recs, "summary": summarise(recs, fps)}


def _med(vals):
    v = [x for x in vals if x is not None]
    return round(float(np.median(v)), 3) if v else None


def summarise(recs, fps=SAMPLE_FPS):
    foot = [r["footage"] for r in recs if r.get("footage")]
    heroes = [r["hero"] for r in recs if r.get("hero") and r["hero"].get("box")]
    lay = [r["layout"] for r in recs]
    gaps, run = [], 0
    for l in lay + ["face"]:
        if l == "face":
            if run:
                gaps.append(run / fps)
            run = 0
        else:
            run += 1
    return {
        "samples": len(recs), "full_face_share": round(lay.count("face") / max(1, len(lay)), 3),
        "full_face_max_gap": round(max(gaps, default=0.0), 2),
        "face_h": _med([f["face_h"] for f in foot]), "face_h_full": _med([r["footage"]["face_h"] for r in recs if r["layout"] == "face" and r.get("footage")]),
        "face_luma": _med([f["face_luma"] for f in foot]),
        "warmth": _med([f["warmth"] for f in foot]), "bg_luma": _med([f["bg_luma"] for f in foot]), "bg_sat": _med([f["bg_sat"] for f in foot]),
        "contrast": _med([f["contrast"] for f in foot]), "garment_vs_bg": _med([abs(f["garment_luma"] - f["bg_luma"]) for f in foot if f["garment_luma"] is not None]),
        "hero_width": _med([h["width"] for h in heroes]), "hero_density": _med([h["density"] for h in heroes]),
        "span": _med([h.get("span") for h in heroes]), "highlight": _med([h.get("highlight") for h in heroes]),
        "glow": _med([h.get("glow") for h in heroes]), "accent_sat": _med([h.get("accent_sat") for h in heroes]),
    }


if __name__ == "__main__":
    import json, sys
    print(json.dumps(analyse(sys.argv[1])["summary"], indent=1))
