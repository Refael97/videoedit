"""Theme QA: checks a draft against the theme's measured anchor targets and the known-mistake rules.

usage: qa <project> [--theme NAME] [--reuse-draft] [--step 0.25]
writes <project>/qa.json and <project>/qa-report.md, prints "N/9 READY|NOT READY"; exit code 0 only when 9/9.
The draft is rendered at 30 fps, draft quality, to <project>/renders/qa-draft.mp4 (the renderer has no 540p preset;
analysis runs at 270x480 / 540x960 anyway).
"""
import argparse, json, math, pathlib, re, subprocess, sys
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
THEMES = HERE.parent.parent / "themes"
sys.path.insert(0, str(HERE))
import video_metrics as vm  # noqa: E402
import layers  # noqa: E402

HF = ["npx", "--yes", "hyperframes@0.8.150"]
VW, VH = 1080, 1920
MIN_TEXT = 26
HERO_MIN = 0.60
PAYOFF_TOL, PAYOFF_HOLD = 0.15, 0.8

CHECKS = [
    ("motion", "graphics motion"), ("flat", "flat stretches"), ("hold", "max static hold"), ("actions", "actions / s"), ("payoff", "payoff lands"),
    ("text", "min text"), ("hero", "hero fill"), ("collide", "collisions"), ("overlap", "graphic overlaps"), ("placeholder", "no placeholders"), ("facts", "facts on screen"), ("fx", "signature effects"), ("hook", "hook visual"),
]
FIX = {
    "motion": "more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics)",
    "flat": "add a build-up event, secondary motion or a camera move (push / punch) here",
    "actions_low": "nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s",
    "actions_high": "too busy: merge or drop events so each lands on a word",
    "payoff_end": "retime the count so it ends ON the payoff word (start it on the set-up word)",
    "payoff_hold": "hold the final value >= 0.8 s before any exit or cut",
    "payoff_stamp": "move the stamp / check after the number lands",
    "payoff_unmarked": "a number changes on screen: mark the payoff element with data-qa-payoff=\"<word>\" (and data-qa-stamp)",
    "text": "enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content)",
    "hero": "make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space",
    "hero_empty": "the stage is empty here: put the hero on it or switch to the face layout",
    "cap_card": "move the caption off the card (card bottom >= 60px above the caption) or move the card",
    "face": "keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space",
    "uniform": "uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content",
    "flat_img": "image with almost no detail (grey box?): use a real frame / screenshot",
    "chart": "a chart needs real numbers: add axis values / the measured figures, or drop the chart",
    "overlap": "move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container",
    "facts": "take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it",
    "hook": "open on a visual (the result, the thing itself, real thumbnails), not text alone",
}


def words_between(words, a, b):
    return " ".join(w["text"] for w in words if w["end"] > a and w["start"] < b)


def rect_inter(a, b):
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    return max(0, x2 - x1) * max(0, y2 - y1)


def group_times(ts, step, minlen=1):
    """[t...] -> [(a, b)] runs of consecutive samples, keeping runs of >= minlen samples"""
    runs, cur = [], []
    for t in sorted(set(ts)):
        if cur and t - cur[-1] > step * 1.5:
            runs.append(cur); cur = []
        cur.append(t)
    if cur:
        runs.append(cur)
    return [(r[0], r[-1] + step) for r in runs if len(r) >= minlen]


def face_boxes(src, times):
    try:
        import cv2
        cv2.CascadeClassifier  # OpenCV 5 dropped it: needs opencv-python-headless<5
    except (ImportError, AttributeError):
        print("! opencv missing: pip install \"opencv-python-headless<5\"  (face checks skipped)")
        return {}, None
    cap = cv2.VideoCapture(str(src))
    size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))
    det = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    found = {}
    for t in times:
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
        ok, fr = cap.read()
        if not ok:
            continue
        g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        f = det.detectMultiScale(g, 1.1, 6, minSize=(size[0] // 8, size[0] // 8))
        if len(f):
            found[t] = [int(v) for v in max(f, key=lambda b: b[2] * b[3])]
    # one box per shot: fill gaps from the nearest detection within 1 s
    out = {}
    for t in times:
        near = [k for k in found if abs(k - t) <= 1.0]
        if near:
            out[f"{t:.2f}"] = found[min(near, key=lambda k: abs(k - t))]
    return out, size


def render_graphics_only(proj, html, draft, dur, reuse):
    """the same composition with the footage blacked out (face video -> black, matte -> transparent), drafted like the
    main draft: a mirror project in renders/qa-gfx/ whose files are symlinks except index.html"""
    import os, shutil
    out = proj / "renders/qa-gfx-draft.mp4"
    if reuse and out.exists() and out.stat().st_mtime > (proj / "index.html").stat().st_mtime:
        return out
    mir = proj / "renders/qa-gfx"
    if mir.exists():
        shutil.rmtree(mir)
    mir.mkdir(parents=True)
    for e in proj.iterdir():
        if e.name not in ("index.html", "renders", "node_modules", ".hyperframes"):
            os.symlink(e, mir / e.name)
    black, clear = mir / "qa-black.mp4", mir / "qa-clear.webm"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", f"color=black:s=1080x1920:r=30:d={dur + 1}", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(black)], check=True)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", f"color=black@0.0:s=360x640:r=30:d={dur + 1},format=yuva420p", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", str(clear)], check=True)
    def swap(m):
        tag = m.group(0)
        if re.search(r'matte', tag, re.I):
            return re.sub(r'src="[^"]+"', 'src="qa-clear.webm"', tag)
        if re.search(r'data-qa="face"|id="[^"]*face[^"]*"|data-track-index="0"', tag, re.I):
            return re.sub(r'src="[^"]+"', 'src="qa-black.mp4"', tag)
        return tag
    (mir / "index.html").write_text(re.sub(r"<video\b[^>]*>", swap, html))
    print("rendering graphics-only draft (footage blacked out)…")
    r = subprocess.run(HF + ["render", "--fps", "30", "-q", "draft", "-o", str(out)], cwd=mir, capture_output=True, text=True)
    if r.returncode:
        sys.exit("graphics-only render failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    return out


def draft_frames(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-vf", "fps=30,scale=540:960,format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, 960, 540)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--theme")
    ap.add_argument("--reuse-draft", action="store_true")
    ap.add_argument("--step", type=float, default=0.25)
    a = ap.parse_args()
    proj = pathlib.Path(a.project).resolve()
    meta = json.loads((proj / "meta.json").read_text()) if (proj / "meta.json").exists() else {}
    theme = a.theme or meta.get("theme")
    tpath = THEMES / theme / "qa-targets.json"
    if not tpath.exists():
        sys.exit(f"no QA targets for theme '{theme}': run  python3 {HERE}/anchor.py {theme}")
    T = json.loads(tpath.read_text())["targets"]
    words = json.loads((proj / "data/words.json").read_text()) if (proj / "data/words.json").exists() else []
    html = (proj / "index.html").read_text()

    # ---- 1. draft ----
    draft = proj / "renders/qa-draft.mp4"
    if not (a.reuse_draft and draft.exists() and draft.stat().st_mtime > (proj / "index.html").stat().st_mtime):
        print("rendering draft (30 fps, draft quality)…")
        r = subprocess.run(HF + ["render", "--fps", "30", "-q", "draft", "-o", str(draft)], cwd=proj, capture_output=True, text=True)
        if r.returncode:
            sys.exit("draft render failed:\n" + r.stdout[-2000:] + r.stderr[-2000:])
    M = vm.metrics(draft)
    dur = M["duration"]
    gfx = render_graphics_only(proj, html, draft, dur, a.reuse_draft)
    # the graphics layer itself (no camera, no footage residual), read over the same area as the anchor: outside the speaker
    GL = layers.graphics_motion(gfx, mask_src=draft, compensate=False, footage=False)
    Lfoot = layers.camera_moves(layers.camera(vm.frames(draft)))  # footage / camera layer of the full draft (info)
    acts = layers.actions(M["events"], Lfoot)

    # ---- 2. faces (source footage) ----
    m = re.search(r'<video[^>]*(?:data-qa="face"|id="[^"]*face[^"]*"|data-track-index="0")[^>]*>', html, re.I)
    src = re.search(r'src="([^"]+)"', m.group(0)).group(1) if m else None
    times = [round(i * a.step, 2) for i in range(int(dur / a.step))]
    fj = proj / "data/face.json"
    if fj.exists():  # the same per-frame, smoothed face track the edit placed things by (scripts/face_track.py)
        FJ = json.loads(fj.read_text()); B = FJ["boxes"]; fsize = FJ["size"]; faces = {}
        for t in times:
            near = min(B, key=lambda b: abs(b[0] - t)) if B else None
            if near and abs(near[0] - t) <= 1.0:
                faces[f"{t:.2f}"] = [int(v) for v in near[1:]]
    else:
        faces, fsize = face_boxes(proj / src, times) if src and (proj / src).exists() else ({}, None)

    # ---- 3. DOM probe ----
    pin, pout = proj / "renders/qa-probe-in.json", proj / "renders/qa-probe.json"
    pin.write_text(json.dumps({"step": a.step, "faces": faces, "faceSize": fsize, "words": words}))
    r = subprocess.run(["node", str(HERE / "probe.cjs"), str(proj / "index.html"), str(pin), str(pout)], capture_output=True, text=True)
    if r.returncode:
        sys.exit("probe failed:\n" + r.stderr[-3000:])
    P = json.loads(pout.read_text())
    S = P["samples"]
    step = a.step
    res, fixes = {}, []

    def fix(t0, t1, check, msg):
        fixes.append({"t": f"{t0:.1f}–{t1:.1f}s", "t0": round(t0, 2), "words": words_between(words, t0, t1), "check": check, "fix": msg})

    # C1 graphics motion (the footage layer is reported, never failed)
    ok = GL["gfx_motion"] >= T["gfx_motion_min"]
    res["motion"] = {"value": GL["gfx_motion"], "target": f">= {T['gfx_motion_min']}", "pass": ok,
                     "footage": f"camera jitter {Lfoot['jitter_px']} px/frame, {len(Lfoot['punches'])} punches, {len(Lfoot['drifts'])} drifts (anchor: {T.get('footage_info', 'n/a')})"}
    if not ok:
        fix(0, dur, "motion", FIX["motion"])
    # C2 flat stretches + C2b longest static hold, both on the graphics layer (a marked payoff's hold is exempt)
    pay_ends = [p_["end"] for p_ in P["payoffs"] if p_.get("end") is not None]
    exempt = lambda a_, b_: any(e - 0.15 <= a_ <= e + 0.4 for e in pay_ends)
    gruns = [(a_, b_) for a_, b_ in GL["gfx_flat_runs"] if not exempt(a_, b_)]
    ok = GL["gfx_flat_pct"] <= T["flat_max"]
    res["flat"] = {"value": f"{GL['gfx_flat_pct']}% (full frame {M['flat_pct']}%)", "target": f"<= {T['flat_max']}%", "pass": ok}
    if not ok:
        for x, y in sorted(gruns, key=lambda r: r[1] - r[0], reverse=True)[:12]:
            fix(x, y, "flat stretches", FIX["flat"])
    longest = max([b_ - a_ for a_, b_ in gruns], default=0.0)
    ok = longest <= T["max_hold"] + 1e-6
    res["hold"] = {"value": f"{longest:.2f} s", "target": f"<= {T['max_hold']} s", "pass": ok}
    for x, y in gruns:
        if y - x > T["max_hold"]:
            fix(x, y, "max static hold", f"held still {y - x:.1f} s (anchor never holds > {T['max_hold']} s): " + FIX["flat"])
    # C3 actions / s (video events, same detector as the anchor) + GSAP diagnostics
    ev = round(len(acts) / dur, 2)
    lo, hi = T["events_min"], T["events_max"]
    ok = lo <= ev <= hi
    tw = [t for t in P["tweens"] if t["dom"] and not t["cap"]]
    gsap_rate = round(len(tw) / dur, 2)
    res["actions"] = {"value": f"{ev} events/s (GSAP {gsap_rate} tweens/s)", "target": f"{lo}–{hi}", "pass": ok}
    if ev < lo:
        e = [0.0] + acts + [dur]
        for x, y in zip(e, e[1:]):
            if y - x >= 2.0:
                fix(x, y, "actions / s", FIX["actions_low"])
    elif ev > hi:
        fix(0, dur, "actions / s", FIX["actions_high"])
    # C4 payoff
    bad = []
    for p in P["payoffs"]:
        if p.get("wordStart") is None:
            bad.append((0, dur, f"payoff word '{p['word']}' not found in words.json"))
            continue
        if p.get("end") is None:
            bad.append((p["wordStart"] - 1, p["wordStart"] + 1, f"{p['sel']}: no change found around '{p['word']}'"))
            continue
        if abs(p["end"] - p["wordStart"]) > PAYOFF_TOL:
            bad.append((p["end"] - 0.5, p["end"] + 0.5, f"{p['sel']} lands at {p['end']:.2f}s, word at {p['wordStart']:.2f}s: " + FIX["payoff_end"]))
        if p["hold"] < PAYOFF_HOLD - 0.05 and p["untilEnd"] >= PAYOFF_HOLD:
            bad.append((p["end"], p["end"] + 1, f"{p['sel']} holds {p['hold']}s: " + FIX["payoff_hold"]))
        if p.get("stamp") and (p.get("stampAt") is None or p["stampAt"] < p["end"] - 0.02):
            bad.append((p["end"] - 0.5, p["end"] + 0.5, f"stamp {p['stamp']} at {p.get('stampAt')}: " + FIX["payoff_stamp"]))
    for c in P["changingDigits"]:
        bad.append((0, dur, f"{c['key'].split('|')[0]} changes {c['values']}: " + FIX["payoff_unmarked"]))
    res["payoff"] = {"value": f"{len(P['payoffs'])} marked, {len(bad)} problems", "target": "ends on word ±0.15, holds 0.8, stamp after", "pass": not bad}
    for x, y, msg in bad:
        fix(max(0, x), min(dur, y), "payoff lands", msg)

    # C5 min text (persisting >= 2 samples)
    small = {}
    for s in S:
        for tx in s["texts"]:
            if tx["op"] > 0.3 and tx["fs"] < MIN_TEXT:
                small.setdefault((tx["id"], tx["tx"]), []).append((s["t"], tx["fs"]))
    nbad = 0
    for (eid, txt), occ in small.items():
        for x, y in group_times([t for t, _ in occ], step, 2):
            nbad += 1
            fix(x, y, "min text", f"'{txt}' ({min(f for _, f in occ):.0f}px): " + FIX["text"])
    res["text"] = {"value": f"{nbad} items < {MIN_TEXT}px", "target": f">= {MIN_TEXT}px", "pass": nbad == 0}

    # C6 hero fill
    low, empty, fills = [], [], []
    for s in S:
        f = s["face"]
        frect = None
        if f and f["op"] > 0.5:
            c = f["clip"]; r = f["rect"]
            fx1, fy1 = max(c[0], r[0]), max(c[1], r[1]); fx2, fy2 = min(c[2], r[0] + r[2]), min(c[3], r[1] + r[3])
            if fx2 > fx1 and fy2 > fy1:
                frect = [fx1, fy1, fx2 - fx1, fy2 - fy1]
        if frect and frect[2] * frect[3] >= 0.8 * VW * VH:
            # full face: a card over the face may be smaller, but the hero still reads (>= 35% of the width)
            over = [b["r"] for b in s["boxes"] + s["media"] if b["op"] >= 0.5]
            if over and max(r[2] for r in over) < 0.35 * VW:
                low.append((s["t"], max(r[2] for r in over) / VW))
            continue
        # the composition's planned extent: elements of the visible scene, including ones not revealed yet
        gfx = [b["r"] for b in s["boxes"] + s["media"] if b.get("po", b["op"]) >= 0.5]
        boxes = [b["r"] for b in s["boxes"]]
        titles = [tx["r"] for tx in s["texts"] if not tx["cap"] and tx["op"] > 0.5 and tx["r"][1] < 0.3 * VH and not any(rect_inter(tx["r"], b) > 0 for b in boxes)]
        top = max([r[1] + r[3] for r in titles], default=40) + 20
        caps = [tx["r"][1] for tx in s["texts"] if tx["cap"] and tx["op"] > 0.5]
        bottom = min(caps + ([frect[1]] if frect and frect[1] > 0.4 * VH else []) + [VH - 40]) - 20
        surf = [40, top, VW - 80, max(1, bottom - top)]
        if not gfx:
            empty.append(s["t"]); continue
        clipped = []
        for g in gfx:
            x1, y1 = max(g[0], surf[0]), max(g[1], surf[1]); x2, y2 = min(g[0] + g[2], surf[0] + surf[2]), min(g[1] + g[3], surf[1] + surf[3])
            if x2 > x1 and y2 > y1:
                clipped.append((x1, y1, x2, y2))
        if not clipped:
            empty.append(s["t"]); continue
        ux1, uy1 = min(c[0] for c in clipped), min(c[1] for c in clipped); ux2, uy2 = max(c[2] for c in clipped), max(c[3] for c in clipped)
        fill = (ux2 - ux1) * (uy2 - uy1) / (surf[2] * surf[3])
        fills.append(fill)
        if fill < HERO_MIN:
            low.append((s["t"], fill))
    for x, y in group_times(empty, step, 2):
        fix(x, y, "hero fill", FIX["hero_empty"])
    for x, y in group_times([t for t, _ in low], step, 2):
        fv = min(f for t, f in low if x <= t < y)
        fix(x, y, "hero fill", f"fill {fv:.0%}: " + FIX["hero"] + " (over the full face: the hero >= 35% of the width)")
    nh = len(group_times(empty, step, 2)) + len(group_times([t for t, _ in low], step, 2))
    res["hero"] = {"value": (f"median {np.median(fills):.0%}" if fills else "full face") + f", {nh} weak ranges", "target": f">= {HERO_MIN:.0%}", "pass": nh == 0}

    # C7 collisions
    cc, fc = {}, {}
    for s in S:
        caps = [tx for tx in s["texts"] if tx["cap"] and tx["op"] > 0.5]
        for c in caps:
            for b in s["boxes"]:
                if b["op"] > 0.5 and rect_inter(c["r"], b["r"]) > 0.15 * c["r"][2] * c["r"][3]:
                    cc.setdefault((c["tx"], b["id"] or b["cls"]), []).append(s["t"])
        if s["face"] and s["face"].get("covered"):
            for k, n in s["face"]["covered"].items():
                if n >= 3:
                    fc.setdefault(k, []).append(s["t"])
    nc = 0
    for (cap, box), ts in cc.items():
        for x, y in group_times(ts, step, 1):
            nc += 1; fix(x, y, "collisions", f"caption '{cap}' on {box}: " + FIX["cap_card"])
    for k, ts in fc.items():
        for x, y in group_times(ts, step, 2):
            nc += 1; fix(x, y, "collisions", f"{k} on the eyes/mouth: " + FIX["face"])
    res["collide"] = {"value": f"{nc} collisions", "target": "0", "pass": nc == 0, "faces_detected": len(faces)}

    # C8 graphic-on-graphic overlaps (persisting >= 0.5 s)
    ov = {}
    for s in S:
        for o in s.get("overlaps", []):
            ov.setdefault(tuple(sorted((o["a"], o["b"]))), []).append((s["t"], o["share"]))
    no = 0
    for (x_, y_), occ in ov.items():
        for x, y in group_times([t for t, _ in occ], step, 2):
            no += 1
            sh = max(v for t, v in occ if x <= t < y)
            fix(x, y, "graphic overlaps", f"{x_} overlaps {y_} ({sh:.0%} of the smaller): " + FIX["overlap"])
    res["overlap"] = {"value": f"{no} overlaps", "target": "0 (unless in one data-qa-stack)", "pass": no == 0}

    # C9 placeholders (pixels of the draft + charts without digits)
    F = draft_frames(draft)
    uni, flatimg, nochart = {}, {}, {}
    prev_r = {}
    for s in S:
        i = min(len(F) - 1, int(round(s["t"] * 30)))
        fr = F[i]
        for kind, items in (("box", s["boxes"]), ("media", s["media"])):
            for b in items:
                x, y, w, h = b["r"]
                if b["op"] < 0.8 or w < 150 or h < 100:
                    continue
                x1, y1, x2, y2 = max(0, x + 10) // 2, max(0, y + 10) // 2, min(VW, x + w - 10) // 2, min(VH, y + h - 10) // 2
                if x2 - x1 < 20 or y2 - y1 < 20:
                    continue
                crop = fr[y1:y2, x1:x2]
                sd = float(crop.std())
                key = b["id"] or b.get("cls") or b.get("tag")
                pr = prev_r.get((kind, key)); prev_r[(kind, key)] = b["r"]
                if pr is None or max(abs(u - v) for u, v in zip(pr, b["r"])) > 8:
                    continue  # moving / just arrived: a placeholder is something that sits still
                # a big panel is "mostly empty" when < 20% of its 12px cells carry any detail
                ch, cw = (y2 - y1) // 6, (x2 - x1) // 6
                cells = crop[:ch * 6, :cw * 6].reshape(ch, 6, cw, 6).std(axis=(1, 3)) if ch and cw else np.zeros(1)
                # content extent: bounding box of the 12px cells that carry detail, as a share of the panel
                bc = np.argwhere(cells > 6)
                extent = ((np.ptp(bc[:, 0]) + 1) * (np.ptp(bc[:, 1]) + 1) / cells.size) if len(bc) else 0.0
                if kind == "box" and (sd < 5 or (w >= 250 and h >= 250 and extent < 0.4)):
                    uni.setdefault(key, []).append(s["t"])
                if kind == "media" and sd < 8:
                    flatimg.setdefault(key, []).append(s["t"])
        for c in s["charts"]:
            if not c["digits"]:
                nochart.setdefault(c["id"] or "svg", []).append(s["t"])
    npl = 0
    for d, msgk in ((uni, "uniform"), (flatimg, "flat_img"), (nochart, "chart")):
        for k, ts in d.items():
            for x, y in group_times(ts, step, 2):
                npl += 1; fix(x, y, "no placeholders", f"{k}: " + FIX[msgk])
    res["placeholder"] = {"value": f"{npl} found", "target": "0", "pass": npl == 0}

    # C11 facts on screen: every number / URL / price shown (and held >= 0.5 s) must come from data/facts.yaml or the
    # transcript. Enumerations (a lone 1-12 as a step / row number) are free. Counters' in-between values are not held.
    import yaml
    fpath = proj / "data/facts.yaml"
    facts = yaml.safe_load(fpath.read_text()) if fpath.exists() else None
    def flat_vals(o):
        if isinstance(o, dict):
            return [v for x in o.values() for v in flat_vals(x)]
        if isinstance(o, list):
            return [v for x in o for v in flat_vals(x)]
        return [] if o is None else [str(o)]
    norm = lambda x: re.sub(r"[\s,]", "", x.lower()).strip(".:;!?()\"'״׳")
    allowed = {norm(v) for v in flat_vals(facts)} | {norm(w["text"]) for w in words}
    TOK = re.compile(r"(?:https?://)?(?:[a-z0-9-]+\.)+(?:com|co\.il|io|ai|net|org|dev|app|me)(?:/[\w./-]*)?|[₪$€]\s?\d[\d,.]*[kKmM]?|\d[\d,.:]*\s?(?:[kKmM]\b|%|₪)?", re.I)
    # a counter (an element whose number changes >= 3 times: a timer, a count-up) is judged by its final value only
    vals = {}
    for s in S:
        for tx in s["texts"]:
            if not tx["cap"] and re.search(r"\d", tx["tx"]):
                vals.setdefault(tx.get("k"), []).append((s["t"], tx["tx"]))
    final = {k: v[-1][1] for k, v in vals.items() if len({x for _, x in v}) >= 3}
    seen = {}
    for s in S:
        for tx in s["texts"]:
            if tx["cap"] or tx["op"] <= 0.5:
                continue
            if tx.get("k") in final and tx["tx"] != final[tx.get("k")]:
                continue  # a counter on its way
            for m in TOK.finditer(tx["tx"]):
                tok = m.group(0).strip()
                if re.fullmatch(r"0?\d|1[0-2]", tok.rstrip(".)")) and (len(tx["tx"].strip()) <= 4 or re.search(r"שלב|step|level|רמה|#\s?\d|^\s*\d{1,2}[.)]", tx["tx"], re.I)):
                    continue  # an enumeration: "1", "02", "שלב 3.", "2) ..."
                n_ = norm(tok)
                if n_ in allowed or any(n_ and n_ in a_ for a_ in allowed if len(n_) >= 3):
                    continue
                seen.setdefault(tok, []).append(s["t"])
    nf = 0
    for tok, ts in seen.items():
        for x, y in group_times(ts, step, 2):
            nf += 1
            fix(x, y, "facts on screen", f"'{tok}' is not in data/facts.yaml or the transcript: " + FIX["facts"])
    if facts is None and nf:
        fix(0, dur, "facts on screen", "no data/facts.yaml: list every number, name, URL and price the video shows")
    res["facts"] = {"value": f"{nf} unsourced" + ("" if facts is not None else " (no facts.yaml)"), "target": "0", "pass": nf == 0}

    # C12 signature effects self-check (effects/README.md): letters of a word behind the head >= 70% visible against
    # the real cut-out (one letter may dip for <= 0.5 s); a shoulder card, once risen, never more than 50% hidden
    fxs = [s for s in S if s.get("fx")]
    fx_bad, worst_letter, worst_card = [], 1.0, 0.0
    if fxs:
        mm = re.search(r'<video[^>]*(?:data-fx-matte|id="[^"]*matte[^"]*")[^>]*>', html, re.I)
        msrc = re.search(r'src="([^"]+)"', mm.group(0)).group(1) if mm else None
        A_ = None
        if msrc and (proj / msrc).exists():
            raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-c:v", "libvpx-vp9", "-i", str(proj / msrc), "-vf", "fps=30,alphaextract,scale=270:480", "-f", "rawvideo", "-pix_fmt", "gray", "-"], capture_output=True).stdout
            if raw:
                A_ = np.frombuffer(raw, np.uint8).reshape(-1, 480, 270)
        def hidden(s, r):
            m = s.get("matte")
            if A_ is None or not m or m["op"] <= 0.5:
                return 0.0
            i = int(round((s["t"] - m["start"] + m["mstart"]) * 30))
            if i < 0 or i >= len(A_):
                return 0.0
            mx, my, mw, mh = m["r"]; c = m["clip"]
            x1, y1, x2, y2 = max(r[0], c[0]), max(r[1], c[1]), min(r[0] + r[2], c[2]), min(r[1] + r[3], c[3])
            if x2 - x1 < 2 or y2 - y1 < 2:
                return 0.0
            u1, u2 = int((x1 - mx) / mw * 270), int((x2 - mx) / mw * 270); v1, v2 = int((y1 - my) / mh * 480), int((y2 - my) / mh * 480)
            u1, u2, v1, v2 = max(0, u1), min(270, u2), max(0, v1), min(480, v2)
            if u2 - u1 < 1 or v2 - v1 < 1:
                return 0.0
            covered = float((A_[i][v1:v2, u1:u2] > 128).mean())
            return covered * (x2 - x1) * (y2 - y1) / max(1.0, r[2] * r[3])
        low_run = {}
        for s in fxs:
            for e in s["fx"]:
                key = e["name"] + "#" + (e["id"] or "")
                if e.get("letters") and e["op"] > 0.5:
                    lows = []
                    for j, l in enumerate(e["letters"]):
                        if l["op"] < 0.9 or l["r"][2] < 4:
                            continue
                        v = 1 - hidden(s, l["r"]); worst_letter = min(worst_letter, v)
                        if v < 0.7:
                            lows.append(j)
                    for j in range(len(e["letters"])):
                        low_run[(key, j)] = low_run.get((key, j), 0) + 1 if j in lows else 0
                        if low_run[(key, j)] > 2:
                            fx_bad.append((s["t"], f"{key}: letter {j + 1} under 70% visible for > 0.5 s"))
                    if len(lows) >= 2:
                        fx_bad.append((s["t"], f"{key}: {len(lows)} letters under 70% visible at once"))
                if e["name"] == "shoulderCards" and e["state"] == "up" and e["op"] > 0.5:
                    hdn = hidden(s, e["r"]); worst_card = max(worst_card, hdn)
                    if hdn > 0.5:
                        fx_bad.append((s["t"], f"{key}: risen card {hdn:.0%} hidden"))
        groups_ = {}
        for t_, msg in fx_bad:
            groups_.setdefault(msg.split(":")[0] + ":" + msg.split(":")[1][:12], []).append((t_, msg))
        for k_, occ in groups_.items():
            for x, y in group_times([t_ for t_, _ in occ], step, 1):
                fix(x, y, "signature effects", occ[0][1] + ": lift the word / move the card off the speaker (effects/README.md)")
        res["fx"] = {"value": f"min letter visible {worst_letter:.0%}, max risen card hidden {worst_card:.0%}" + ("" if A_ is not None else " (no matte to measure)"),
                     "target": "letters >= 70% (1 may dip <= 0.5 s), cards <= 50% hidden", "pass": not fx_bad}
    else:
        res["fx"] = {"value": "no signature effects", "target": "—", "pass": True}

    # C13 hook visual
    vis = [s["t"] for s in S if s["t"] < 3 and (any(m_["op"] > 0.5 and m_["r"][2] >= 120 and m_["r"][3] >= 120 for m_ in s["media"]) or any(b["op"] > 0.5 and b["r"][2] >= 150 and b["r"][3] >= 150 for b in s["boxes"]))]
    ok = len(vis) * step >= 0.5
    res["hook"] = {"value": f"visual on screen {len(vis) * step:.1f}s of the first 3s", "target": ">= 0.5s", "pass": ok}
    if not ok:
        fix(0, 3, "hook visual", FIX["hook"])

    # ---- report ----
    score = sum(1 for k, _ in CHECKS if res[k]["pass"])
    ready = score == len(CHECKS)
    fixes.sort(key=lambda f: f["t0"])
    out = {"project": proj.name, "theme": theme, "score": f"{score}/{len(CHECKS)}", "ready": ready, "checks": res, "metrics": {**{k: M[k] for k in ("duration", "motion", "flat_pct", "events_per_s")}, "graphics": GL, "footage": Lfoot, "actions_per_s": round(len(acts) / dur, 2)}, "targets": T, "fix_list": fixes}
    (proj / "qa.json").write_text(json.dumps(out, ensure_ascii=False, indent=1, default=lambda o: o.item() if hasattr(o, "item") else str(o)))
    L = [f"# QA · {proj.name} · theme `{theme}`", "", f"**{score}/{len(CHECKS)} checks passed — {'READY' if ready else 'NOT READY'}**", "",
         "| | check | value | target |", "|---|---|---|---|"]
    for k, name in CHECKS:
        L.append(f"| {'✓' if res[k]['pass'] else '✗'} | {name} | {res[k]['value']} | {res[k]['target']} |")
    L += ["", f"footage motion (info, not scored): {res['motion']['footage']}", "", "## FIX LIST", ""]
    if fixes:
        L += ["| time | words | check | fix |", "|---|---|---|---|"]
        L += [f"| {f['t']} | {f['words'][:60]} | {f['check']} | {f['fix']} |" for f in fixes]
    else:
        L.append("nothing to fix")
    L += ["", f"_targets measured on the anchor (`themes/{theme}/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in {len(faces)}/{len(times)} samples_"]
    (proj / "qa-report.md").write_text("\n".join(L) + "\n")
    print(f"{score}/{len(CHECKS)} {'READY' if ready else 'NOT READY'}  ({len(fixes)} fixes) → {proj / 'qa-report.md'}")
    sys.exit(0 if ready else 1)


if __name__ == "__main__":
    main()
