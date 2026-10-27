"""Measure a theme's QA targets on its anchor creator's videos (the same detector qa.py runs on drafts).

usage: python3 anchor.py <theme|all>
writes themes/<theme>/qa-targets.json and the "## QA targets" table in themes/<theme>/theme.md.
Targets change ONLY by re-measuring the anchor (new anchor videos), never to make a draft pass.
  motion_min = 0.75 x anchor motion · flat_max = anchor flat % (rounded up) · events = anchor events/s ±30%
"""
import json, math, pathlib, re, sys
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[4]
THEMES = HERE.parent.parent / "themes"
sys.path.insert(0, str(HERE))
import video_metrics as vm  # noqa: E402

A = json.loads((HERE / "anchors.json").read_text())


def measure(theme):
    vids = A[theme]
    per = {}
    for v in vids:
        m = vm.metrics(ROOT / v)
        per[pathlib.Path(v).stem] = {k: m[k] for k in ("duration", "motion", "flat_pct", "events_per_s")}
        print(theme, v, per[pathlib.Path(v).stem])
    tot = sum(p["duration"] for p in per.values())
    avg = lambda k: sum(p[k] * p["duration"] for p in per.values()) / tot  # duration-weighted
    mo, fl, ev = avg("motion"), avg("flat_pct"), avg("events_per_s")
    T = {"motion_min": round(0.75 * mo, 2), "flat_max": float(math.ceil(fl)), "events_min": round(0.7 * ev, 2), "events_max": round(1.3 * ev, 2)}
    out = {"theme": theme, "anchor_videos": vids, "measured": per, "anchor": {"motion": round(mo, 2), "flat_pct": round(fl, 1), "events_per_s": round(ev, 2)},
           "targets": T, "detector": {"fps": vm.FPS, "size": [vm.W, vm.H], "flat_thr": vm.FLAT_THR, "flat_min_s": vm.FLAT_MIN_S, "ev_abs": vm.EV_ABS, "ev_rel": vm.EV_REL, "ev_gap": vm.EV_GAP}}
    (THEMES / theme / "qa-targets.json").write_text(json.dumps(out, indent=1))
    rows = "\n".join(f"| {k} | {p['duration']} s | {p['motion']} | {p['flat_pct']}% | {p['events_per_s']} |" for k, p in per.items())
    sec = f"""## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detector `qa` runs on drafts). Change only by re-measuring the anchor.

| video | length | motion | flat % | events / s |
|---|---|---|---|---|
{rows}
| **anchor** | {round(tot, 1)} s | **{round(mo, 2)}** | **{round(fl, 1)}%** | **{round(ev, 2)}** |

| check | target |
|---|---|
| motion | >= {T['motion_min']} (0.75 x anchor) |
| flat stretches | <= {T['flat_max']}% |
| actions / s (big moments) | {T['events_min']}–{T['events_max']} (anchor ±30%) |
"""
    md = THEMES / theme / "theme.md"
    s = md.read_text()
    s = re.sub(r"\n## QA targets\n.*?(?=\n## |\Z)", "", s, flags=re.S).rstrip() + "\n\n" + sec
    md.write_text(s)


if __name__ == "__main__":
    for t in (A if sys.argv[1] == "all" else [sys.argv[1]]):
        if t.startswith("_"):
            continue
        measure(t)
