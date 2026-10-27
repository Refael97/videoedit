"""Measure a theme's QA targets on its anchor creator's videos (the same detector qa.py runs on drafts).

usage: python3 anchor.py <theme|all>
writes themes/<theme>/qa-targets.json and the "## QA targets" table in themes/<theme>/theme.md.
Targets change ONLY by re-measuring the anchor (new anchor videos), never to make a draft pass.
  gfx_motion_min = 0.75 x anchor graphics motion · flat_max = anchor flat % (rounded up)
  events = anchor actions/s (frame events + camera moves) ±30% · footage motion = info only
"""
import json, math, pathlib, re, sys
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[4]
THEMES = HERE.parent.parent / "themes"
sys.path.insert(0, str(HERE))
import video_metrics as vm  # noqa: E402
import layers  # noqa: E402

A = json.loads((HERE / "anchors.json").read_text())


def measure(theme):
    vids = A[theme]
    per = {}
    for v in vids:
        m = vm.metrics(ROOT / v)
        g = layers.graphics_motion(ROOT / v)
        acts = layers.actions(m["events"], g["footage"])
        per[pathlib.Path(v).stem] = {"duration": m["duration"], "gfx_motion": g["gfx_motion"], "gfx_raw": g["gfx_raw"], "baseline": g["baseline"],
                                     "baseline_from": g["baseline_from"], "gfx_share": g["gfx_share"], "flat_pct": m["flat_pct"],
                                     "actions_per_s": round(len(acts) / m["duration"], 2), "motion_all": m["motion"],
                                     "jitter_px": g["footage"]["jitter_px"], "punches": len(g["footage"]["punches"]), "drifts": len(g["footage"]["drifts"])}
        print(theme, v, per[pathlib.Path(v).stem])
    tot = sum(p["duration"] for p in per.values())
    avg = lambda k: sum(p[k] * p["duration"] for p in per.values()) / tot  # duration-weighted
    gm, fl, ev, jit = avg("gfx_motion"), avg("flat_pct"), avg("actions_per_s"), avg("jitter_px")
    cam_min = 60 * sum(p["punches"] + p["drifts"] for p in per.values()) / tot
    foot = f"jitter {jit:.2f} px/frame, {cam_min:.1f} camera moves/min"
    T = {"gfx_motion_min": round(0.75 * gm, 2), "flat_max": float(math.ceil(fl)), "events_min": round(0.7 * ev, 2), "events_max": round(1.3 * ev, 2), "footage_info": foot}
    out = {"theme": theme, "anchor_videos": vids, "measured": per,
           "anchor": {"gfx_motion": round(gm, 2), "flat_pct": round(fl, 1), "actions_per_s": round(ev, 2), "footage": foot},
           "targets": T, "detector": {"fps": vm.FPS, "size": [vm.W, vm.H], "flat_thr": vm.FLAT_THR, "flat_min_s": vm.FLAT_MIN_S, "ev_abs": vm.EV_ABS, "ev_rel": vm.EV_REL,
                                      "ev_gap": vm.EV_GAP, "edge_nogfx": layers.EDGE_NOGFX, "punch": layers.PUNCH, "drift": layers.DRIFT}}
    (THEMES / theme / "qa-targets.json").write_text(json.dumps(out, indent=1))
    rows = "\n".join(f"| {k} | {p['duration']} s | {p['gfx_motion']} ({p['gfx_raw']} − {p['baseline']}) | {p['flat_pct']}% | {p['actions_per_s']} | {p['jitter_px']} px · {p['punches']}P {p['drifts']}D |" for k, p in per.items())
    sec = f"""## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Footage = info only.

| video | length | graphics motion (raw − baseline) | flat % | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|
{rows}
| **anchor** | {round(tot, 1)} s | **{round(gm, 2)}** | **{round(fl, 1)}%** | **{round(ev, 2)}** | {foot} |

| check | target |
|---|---|
| graphics motion | >= {T['gfx_motion_min']} (0.75 x anchor) |
| flat stretches | <= {T['flat_max']}% |
| actions / s (events + camera moves) | {T['events_min']}–{T['events_max']} (anchor ±30%) |
| footage motion | reported, never failed |
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
