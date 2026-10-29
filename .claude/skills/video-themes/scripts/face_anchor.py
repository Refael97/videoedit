"""Turn a theme's fixed full-face positions into face-relative rules, measured on its anchor creator's videos.

usage: python3 face_anchor.py <theme|all>
For every anchor video (scripts/qa/anchors.json), at 2 fps: the face box (Haar) and the caption band (the densest
band of hard edges in the middle of the frame, outside the face). Per framing (face high = full face, face low/small =
split or seated low) the caption centre is expressed as   chin + dy x face_height   (median and IQR).
Writes themes/<theme>/face-rules.json and the "## Face-relative placement" section of themes/<theme>/theme.md.
"""
import json, pathlib, re, subprocess, sys
import numpy as np
import cv2

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[3]
THEMES = HERE.parent / "themes"
A = json.loads((HERE / "qa/anchors.json").read_text())
W, H = 360, 640


def faces(path):
    """per sampled frame: face box and the caption band centre (both in 1080x1920 px)"""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-vf", f"fps=2,scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
    det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    out = []
    for f in F:
        d = det.detectMultiScale(f, 1.1, 5, minSize=(30, 30))
        if not len(d):
            continue
        x, y, w, h = max(d, key=lambda b: b[2] * b[3])
        # caption band: the densest 26-px row band of hard edges in the middle 70% of the width, outside the face box
        e = np.hypot(cv2.Sobel(f, cv2.CV_32F, 1, 0), cv2.Sobel(f, cv2.CV_32F, 0, 1)) > 300
        e[:, :int(0.15 * W)] = False; e[:, int(0.85 * W):] = False
        e[max(0, y - h // 3):y + h + h // 6, :] = False      # the face itself (and hair) is not a caption
        e[:int(0.08 * H), :] = False; e[int(0.94 * H):, :] = False  # status / UI bars
        rows = e.sum(axis=1).astype(float)
        band = np.convolve(rows, np.ones(9), "same")
        cy = int(np.argmax(band)) if band.max() >= 0.08 * W * 9 else None
        k = 1920 / H
        out.append({"box": [v * k for v in (x, y, w, h)], "cap": cy * k if cy is not None else None})
    return out


def measure(theme):
    S_ = [r for v in A[theme] for r in faces(ROOT / v)]
    rules = {"theme": theme, "samples": len(S_)}
    # two framings: the face high in the frame (full face) and low / small (a face box, a split, a seated low shot)
    groups = {"full_face": [r for r in S_ if r["box"][1] + r["box"][3] / 2 < 0.55 * 1920 and r["box"][3] >= 0.09 * 1920],
              "low_face": [r for r in S_ if r["box"][1] + r["box"][3] / 2 >= 0.55 * 1920]}
    for g, rs in groups.items():
        caps = [((r["cap"] - (r["box"][1] + r["box"][3])) / r["box"][3]) for r in rs if r["cap"] is not None]
        if len(rs) < 10 or len(caps) < 8:
            rules[g] = {"samples": len(rs), "note": "too few samples"}
            continue
        chin = float(np.median([r["box"][1] + r["box"][3] for r in rs])); h = float(np.median([r["box"][3] for r in rs]))
        q1, med, q3 = np.percentile(caps, [25, 50, 75])
        rules[g] = {"samples": len(rs), "chin_y": round(chin), "face_h": round(h), "center_x": round(float(np.median([r["box"][0] + r["box"][2] / 2 for r in rs]))),
                    "caption": {"at": "chin", "dy": round(float(med), 2), "iqr": [round(float(q1), 2), round(float(q3), 2)], "n": len(caps)}}
    rules["card_beside_face"] = {"at": "eyes", "side": "free", "gap": 0.4}
    rules["safe_core"] = "eyes to mouth (x 18-82%, y 22-92% of the face box) is never covered"
    (THEMES / theme / "face-rules.json").write_text(json.dumps(rules, indent=1, ensure_ascii=False))
    sec = "## Face-relative placement\n\nMeasured on the anchor by `scripts/face_anchor.py` (face box + caption band at 2 fps). Place things by the\n" \
          "speaker's face, not at fixed pixels (runtime `effects/face.js`, data `scripts/face_track.py`). dy is in face heights below the chin\n" \
          "(negative = above the chin); a wide IQR means the anchor's captions do not follow the face.\n\n| framing | samples | anchor face (1080×1920) | caption centre | IQR |\n|---|---|---|---|---|\n"
    for g in ("full_face", "low_face"):
        r = rules[g]
        if "caption" in r:
            sec += f"| {g.replace('_', ' ')} | {r['samples']} | chin {r['chin_y']}, h {r['face_h']} | **chin + {r['caption']['dy']} × h** | {r['caption']['iqr'][0]} … {r['caption']['iqr'][1]} |\n"
        else:
            sec += f"| {g.replace('_', ' ')} | {r['samples']} | — | {r['note']} | — |\n"
    sec += "\nCards next to the speaker: eye level, the free side, 0.4 × h from the face. Never covered: eyes to mouth.\n"
    md = THEMES / theme / "theme.md"
    s = md.read_text()
    s = re.sub(r"\n## Face-relative placement\n.*?(?=\n## |\Z)", "", s, flags=re.S).rstrip() + "\n\n" + sec
    md.write_text(s)
    print(theme, json.dumps({g: rules[g].get("caption", rules[g]) for g in ("full_face", "low_face")}, ensure_ascii=False))


if __name__ == "__main__":
    for t in (A if sys.argv[1] == "all" else [sys.argv[1]]):
        if not t.startswith("_"):
            measure(t)
