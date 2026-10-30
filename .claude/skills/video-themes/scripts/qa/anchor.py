"""Measure a theme's QA targets on its anchor creator's videos (the same detector qa.py runs on drafts).

usage: python3 anchor.py <theme|all> [--look]
writes themes/<theme>/qa-targets.json and the "## QA targets" table in themes/<theme>/theme.md.
--look measures only the look targets (look.py: footage, hero scale and density, full-face rhythm, material) into
qa-targets.json["look"] and the "## Look targets" table, leaving the timing targets as they are.
Targets change ONLY by re-measuring the anchor (new anchor videos), never to make a draft pass.
  gfx_motion_min = 0.75 x anchor graphics motion · flat_max = anchor flat % (rounded up)
  events = anchor actions/s (frame events + camera moves) ±30% · footage motion = info only
"""
import json, math, pathlib, re, sys
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[4]
THEMES = HERE.parent.parent / "themes"
sys.path.insert(0, str(HERE))
import video_metrics as vm  # noqa: E402
import layers  # noqa: E402
import look as lk  # noqa: E402

A = json.loads((HERE / "anchors.json").read_text())


def measure(theme):
    vids = A[theme]
    per = {}
    for v in vids:
        m = vm.metrics(ROOT / v)
        g = layers.graphics_motion(ROOT / v)
        acts = layers.actions(m["events"], g["footage"])
        per[pathlib.Path(v).stem] = {"duration": m["duration"], "gfx_motion": g["gfx_motion"], "gfx_raw": g["gfx_raw"], "baseline": g["baseline"],
                                     "baseline_from": g["baseline_from"], "gfx_share": g["gfx_share"], "flat_pct": g["gfx_flat_pct"], "flat_full_frame": m["flat_pct"], "max_hold": g["max_hold"], "holds": [round(b - a, 2) for a, b in g["gfx_flat_runs"]],
                                     "actions_per_s": round(len(acts) / m["duration"], 2), "motion_all": m["motion"],
                                     "jitter_px": g["footage"]["jitter_px"], "punches": len(g["footage"]["punches"]), "drifts": len(g["footage"]["drifts"])}
        print(theme, v, per[pathlib.Path(v).stem])
    tot = sum(p["duration"] for p in per.values())
    avg = lambda k: sum(p[k] * p["duration"] for p in per.values()) / tot  # duration-weighted
    gm, fl, ev, jit = avg("gfx_motion"), avg("flat_pct"), avg("actions_per_s"), avg("jitter_px")
    cam_min = 60 * sum(p["punches"] + p["drifts"] for p in per.values()) / tot
    foot = f"jitter {jit:.2f} px/frame, {cam_min:.1f} camera moves/min"
    # longest static hold the language allows: the anchor's own 95th-percentile hold (one exceptional moment doesn't set it)
    allh = [h for p in per.values() for h in p["holds"]]
    hold = math.ceil(10 * float(np.percentile(allh, 95))) / 10 if allh else 1.0
    T = {"gfx_motion_min": round(0.75 * gm, 2), "flat_max": float(math.ceil(fl)), "max_hold": hold, "events_min": round(0.7 * ev, 2), "events_max": round(1.3 * ev, 2), "footage_info": foot}
    out = {"theme": theme, "anchor_videos": vids, "measured": per,
           "anchor": {"gfx_motion": round(gm, 2), "flat_pct": round(fl, 1), "max_hold": hold, "actions_per_s": round(ev, 2), "footage": foot},
           "targets": T, "detector": {"fps": vm.FPS, "size": [vm.W, vm.H], "flat_thr": vm.FLAT_THR, "flat_min_s": vm.FLAT_MIN_S, "ev_abs": vm.EV_ABS, "ev_rel": vm.EV_REL,
                                      "ev_gap": vm.EV_GAP, "edge_nogfx": layers.EDGE_NOGFX, "punch": layers.PUNCH, "drift": layers.DRIFT}}
    (THEMES / theme / "qa-targets.json").write_text(json.dumps(out, indent=1))
    rows = "\n".join(f"| {k} | {p['duration']} s | {p['gfx_motion']} ({p['gfx_raw']} − {p['baseline']}) | {p['flat_pct']}% | {p['max_hold']} s | {p['actions_per_s']} | {p['jitter_px']} px · {p['punches']}P {p['drifts']}D |" for k, p in per.items())
    sec = f"""## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
{rows}
| **anchor** | {round(tot, 1)} s | **{round(gm, 2)}** | **{round(fl, 1)}%** | **{hold} s** (95th pct) | **{round(ev, 2)}** | {foot} |

| check | target |
|---|---|
| graphics motion | >= {T['gfx_motion_min']} (0.75 x anchor) |
| flat stretches (graphics layer) | <= {T['flat_max']}% |
| max static hold (graphics layer) | <= {T['max_hold']} s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | {T['events_min']}–{T['events_max']} (anchor ±30%) |
| footage motion | reported, never failed |
"""
    md = THEMES / theme / "theme.md"
    s = md.read_text()
    s = re.sub(r"\n## QA targets\n.*?(?=\n## |\Z)", "", s, flags=re.S).rstrip() + "\n\n" + sec
    md.write_text(s)


def look_targets(S):
    """targets from the anchor's look summary. Bands are wide on purpose: they catch a different world, not taste."""
    g = lambda k: S.get(k)
    T = {"face_h": [round(g("face_h") * 0.85, 3), round(g("face_h") * 1.15, 3)] if g("face_h") else None,
         "face_h_full": g("face_h_full"),  # face height in full-face beats: footage_prep crops the source to it
         "face_luma": [round(g("face_luma") - 25), round(g("face_luma") + 25)] if g("face_luma") is not None else None,
         "warmth": [round(g("warmth") - 12), round(g("warmth") + 12)] if g("warmth") is not None else None,
         "bg_luma": [round(g("bg_luma") - 28), round(g("bg_luma") + 28)] if g("bg_luma") is not None else None,
         "bg_sat": [max(0, round(g("bg_sat") - 25)), round(g("bg_sat") + 25)] if g("bg_sat") is not None else None,
         "contrast_min": round(0.8 * g("contrast")) if g("contrast") else None,
         "garment_vs_bg_min": round(max(25, 0.6 * g("garment_vs_bg")), 1) if g("garment_vs_bg") else 25,
         "hero_width_min": round(0.85 * g("hero_width"), 3) if g("hero_width") else None,
         "hero_width_weak": round(0.7 * g("hero_width"), 3) if g("hero_width") else None,
         "hero_density_min": round(0.75 * g("hero_density"), 3) if g("hero_density") else None,
         "hero_density_weak": round(0.55 * g("hero_density"), 3) if g("hero_density") else None,
         "full_face_share_min": round(0.6 * g("full_face_share"), 3) if g("full_face_share") >= 0.05 else None,
         "full_face_max_gap": round(1.5 * g("full_face_max_gap"), 1) if g("full_face_share") >= 0.05 else None,
         "span_min": round(0.7 * g("span")) if g("span") else None,
         "glow_min": round(0.5 * g("glow"), 1) if (g("glow") or 0) > 8 else None,
         "accent_sat_min": round(0.7 * g("accent_sat")) if (g("accent_sat") or 0) > 60 else None}
    return T


def measure_look(theme):
    recs = []
    for v in A[theme]:
        r = lk.analyse(ROOT / v)
        print(theme, v, r["summary"])
        recs += r["records"]
    S = lk.summarise(recs)
    T = look_targets(S)
    tp = THEMES / theme / "qa-targets.json"
    J = json.loads(tp.read_text()) if tp.exists() else {"theme": theme}
    J["look"] = {"anchor": S, "targets": T, "detector": {"fps": lk.SAMPLE_FPS, "size": [lk.W, lk.H], "face_split_y": lk.FACE_SPLIT_Y, "min_face_h": lk.MIN_FACE_H, "cell": lk.CELL, "detail_std": lk.DETAIL_STD}}
    tp.write_text(json.dumps(J, indent=1))
    f = lambda v: "—" if v is None else (f"{v[0]}–{v[1]}" if isinstance(v, list) else str(v))
    sec = f"""## Look targets

Measured on the anchor by `scripts/qa/anchor.py {theme} --look` (`look.py`, the same code `qa` runs on drafts, 2 fps, 360x640).
Footage is read around the face; the hero is the graphics zone (above the head in a split, the whole frame without a face).

| | anchor | target |
|---|---|---|
| face height (share of frame) | {S['face_h']} | {f(T['face_h'])} |
| face luma | {S['face_luma']} | {f(T['face_luma'])} |
| skin warmth (R − B) | {S['warmth']} | {f(T['warmth'])} |
| background luma | {S['bg_luma']} | {f(T['bg_luma'])} |
| background saturation | {S['bg_sat']} | {f(T['bg_sat'])} |
| footage contrast (p95 − p5) | {S['contrast']} | >= {f(T['contrast_min'])} |
| garment vs background (luma) | {S['garment_vs_bg']} | >= {f(T['garment_vs_bg_min'])} |
| hero width (share of frame) | {S['hero_width']} | median >= {f(T['hero_width_min'])}, never < {f(T['hero_width_weak'])} for 1 s |
| hero content density | {S['hero_density']} | median >= {f(T['hero_density_min'])}, never < {f(T['hero_density_weak'])} for 1 s |
| full-face share of time | {S['full_face_share']} | >= {f(T['full_face_share_min'])} |
| longest stretch without a full-face beat | {S['full_face_max_gap']} s | <= {f(T['full_face_max_gap'])} s |
| material: luma span inside the hero | {S['span']} | >= {f(T['span_min'])} |
| material: highlight share | {S['highlight']} | (eye review) |
| material: glow around the hero | {S['glow']} | >= {f(T['glow_min'])} |
| material: accent saturation | {S['accent_sat']} | >= {f(T['accent_sat_min'])} |
"""
    md = THEMES / theme / "theme.md"
    s = md.read_text()
    s = re.sub(r"\n## Look targets\n.*?(?=\n## |\Z)", "", s, flags=re.S).rstrip() + "\n\n" + sec
    md.write_text(s)
    write_material(theme, S, T)


def write_material(theme, S, T):
    """language.md §1 gets a measured 'material & light' block: what the anchor's surfaces are made of, in numbers the
    draft is checked against (qa check 'material & light') and the eye review reads"""
    dark = (S.get("bg_luma") or 128) < 80
    if S.get("span") is None or S.get("hero_width") is None:
        lines = ["- The anchor has no graphics zone to measure (the speaker owns every frame): materials come from the cards over the face — check by eye.",
                 "- **Hebrew emphasis:** Hebrew has no italic: use weight, the accent colour or the theme's box — never a slant or skew."]
        return _put_material(theme, lines)
    lines = [f"- **Light inside the hero:** luma span p95−p5 = {S['span']} on the anchor → a new element needs ≥ {T['span_min']}: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails."]
    if T.get("glow_min"):
        lines.append(f"- **Glow:** the anchor's hero lifts the stage around it by {S['glow']} luma → ≥ {T['glow_min']}: a soft halo / bloom of the accent behind the hero, not a hard outline only.")
    else:
        lines.append(f"- **Glow:** none to speak of on the anchor ({S['glow']}): depth comes from shadow and layering, not halos.")
    if T.get("accent_sat_min"):
        lines.append(f"- **Accent:** median saturation of the hero's most saturated 10% = {S['accent_sat']} → ≥ {T['accent_sat_min']}: the accent is a real, saturated colour, never a greyed tint.")
    lines.append(f"- **Highlights:** {(S.get('highlight') or 0):.1%} of the hero is specular highlight on the anchor ({'lacquer / neon edges' if dark else 'white edges, paper sheen, selection fills'}) — check by eye.")
    lines.append(f"- **Size and fill:** the hero spans {S['hero_width']:.0%} of the frame width and {S['hero_density']:.0%} of its cells carry detail → ≥ {T['hero_width_min']:.0%} wide, ≥ {T['hero_density_min']:.0%} detailed.")
    lines.append("- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.")
    return _put_material(theme, lines)


def _put_material(theme, lines):
    block = f"### Measured material & light (`anchor.py {theme} --look`)\n\n" + "\n".join(lines) + "\n"
    p = THEMES / theme / "language.md"
    s = p.read_text()
    s = re.sub(r"\n### Measured material & light.*?(?=\n## )", "\n", s, flags=re.S)
    m = re.search(r"\n## 2\.", s)
    if m:
        s = s[:m.start()].rstrip() + "\n\n" + block + s[m.start():]
    else:
        s = s.rstrip() + "\n\n" + block
    p.write_text(s)


if __name__ == "__main__":
    only_look = "--look" in sys.argv
    for t in (A if sys.argv[1] == "all" else [sys.argv[1]]):
        if t.startswith("_"):
            continue
        if not only_look:
            measure(t)
        measure_look(t)
