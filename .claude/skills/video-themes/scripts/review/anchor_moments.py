"""Anchor moment library for the eye review: key frames of the anchor creator's videos, classified the way look.py
classifies a draft frame (face / split / graphic + hero box), so every draft moment can be shown next to the anchor's
moment of the same kind.

usage: python3 anchor_moments.py <theme|all>
writes references/_analysis/<theme>/moments/*.jpg (540x960) + index.json. references/ stays private: nothing from it
ships inside a theme.
"""
import json, pathlib, subprocess, sys
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "qa"))
import look as lk  # noqa: E402
import nodeenv  # noqa: E402

ROOT = nodeenv.ROOT
A = json.loads((HERE.parent / "qa/anchors.json").read_text())
PER = {"face": 10, "split": 24, "graphic": 14}


def build(theme):
    out = ROOT / "references/_analysis" / theme / "moments"
    out.mkdir(parents=True, exist_ok=True)
    for f in out.glob("*.jpg"):
        f.unlink()
    cand = {k: [] for k in PER}
    for v in A[theme]:
        r = lk.analyse(ROOT / v, fps=1)
        for rec in r["records"]:
            rec["src"] = v
            if rec["layout"] != "face" and not (rec.get("hero") and rec["hero"].get("box")):
                continue
            cand[rec["layout"]].append(rec)
    idx = []
    for lay, recs in cand.items():
        # spread over the whole set: every k-th sample, so one long beat doesn't fill the library
        k = max(1, len(recs) // PER[lay])
        for rec in recs[::k][:PER[lay]]:
            name = f"{lay}-{pathlib.Path(rec['src']).stem}-{rec['t']:06.2f}.jpg"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", str(rec["t"]), "-i", str(ROOT / rec["src"]), "-frames:v", "1",
                            "-vf", "scale=540:960:force_original_aspect_ratio=increase,crop=540:960", "-q:v", "3", str(out / name)], check=True)
            h = rec.get("hero") or {}
            idx.append({"file": name, "layout": lay, "src": rec["src"], "t": rec["t"], "hero_width": h.get("width"), "hero_density": h.get("density"),
                        "hero_box": h.get("box"), "face": rec.get("face")})
    (out / "index.json").write_text(json.dumps(idx, indent=1))
    print(theme, {l: sum(1 for i in idx if i["layout"] == l) for l in PER}, "→", out)


if __name__ == "__main__":
    for t in (A if sys.argv[1] == "all" else [sys.argv[1]]):
        if not t.startswith("_"):
            build(t)
