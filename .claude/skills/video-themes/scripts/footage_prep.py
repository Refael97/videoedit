"""Stage 0 of every video: bring the footage into the anchor's world before anything is designed on top of it.

usage: python3 footage_prep.py <project> [--theme NAME] [--src assets/video/face.mp4] [--matte assets/video/matte.webm]
                               [--no-crop] [--wire]
Measures the source with look.py (the code that measured the anchor), then loops: grade -> measure -> correct, at most
4 passes, until the footage is inside the theme's look bands (themes/<t>/qa-targets.json["look"]).
  * a global grade (curves on luma from two anchor points: face and background, contrast, saturation, warmth) when a
    monotonic curve can reach both the face and the background targets
  * otherwise, with a cut-out matte: the background and the speaker are graded separately and recombined (a bright
    wall on a dark theme, clothes melting into the wall)
  * crop to the anchor's full-face face height (zoom <= 1.35, the face keeps its place); the matte gets the same crop
writes  assets/video/face_prep.mp4 (+ matte_prep.webm when a matte exists), assets/audio/vo_prep.wav (the voice at
        -16 LUFS, so the mix lands near -14), data/footage.json (before / after / verdict),
        footage-report.md, and re-tracks the face into data/face.json.
--wire  points the project's speaker <video> (src/template.html or index.html) and matte at the prepared files.
Verdict: READY (inside every band) · GRADED (inside after prep) · RESHOOT (still outside: the report carries the theme's
"How to shoot for this theme" — send it to the user before editing; the edit may continue on the best grade).
"""
import argparse, json, pathlib, re, subprocess, sys
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
THEMES = HERE.parent / "themes"
sys.path.insert(0, str(HERE / "qa"))
import look as lk  # noqa: E402

KEYS = (("face_luma", "face luma"), ("bg_luma", "background luma"), ("bg_sat", "background saturation"), ("warmth", "skin warmth"))
MAX_ZOOM = 1.35


def run(*a):
    r = subprocess.run(a, capture_output=True, text=True)
    if r.returncode:
        sys.exit(" ".join(map(str, a[:6])) + " …\n" + r.stderr[-1500:])
    return r


def probe(path):
    o = json.loads(run("ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate:format=duration", "-of", "json", str(path)).stdout)
    st = o["streams"][0]; n, d = st["r_frame_rate"].split("/")
    return int(st["width"]), int(st["height"]), float(n) / float(d), float(o["format"]["duration"])


def measure(path, fps=1.0):
    """footage numbers of a full-frame speaker clip (median over 1 fps samples), plus the median face box"""
    F = lk.frames(path, fps)
    foot, boxes = [], []
    for rgb in F:
        fb = lk.face(rgb)
        if fb is None:
            continue
        f = lk.footage(rgb, fb)
        if f:
            foot.append(f); boxes.append(fb)
    if not foot:
        sys.exit("no face found in the footage")
    m = {k: float(np.median([f[k] for f in foot if f[k] is not None])) for k in ("face_h", "face_luma", "warmth", "bg_luma", "bg_sat", "contrast")}
    g = [abs(f["garment_luma"] - f["bg_luma"]) for f in foot if f["garment_luma"] is not None]
    m["garment_vs_bg"] = float(np.median(g)) if g else None
    gl = [f["garment_luma"] for f in foot if f["garment_luma"] is not None]
    m["garment_luma"] = float(np.median(gl)) if gl else None
    m["box"] = [float(np.median([b[i] for b in boxes])) for i in range(4)]  # in look.py's 360x640 frame
    return {k: (round(v, 3) if isinstance(v, float) else v) for k, v in m.items()}


def misses(m, T):
    out = []
    for k, lab in KEYS:
        b = T.get(k)
        if b and not (b[0] <= m[k] <= b[1]):
            out.append(f"{lab} {m[k]:.0f} (anchor {b[0]}–{b[1]})")
    if T.get("contrast_min") and m["contrast"] < T["contrast_min"]:
        out.append(f"contrast {m['contrast']:.0f} (>= {T['contrast_min']})")
    if m.get("garment_vs_bg") is not None and m["garment_vs_bg"] < T.get("garment_vs_bg_min", 25):
        out.append(f"garment vs background {m['garment_vs_bg']:.0f} (>= {T.get('garment_vs_bg_min', 25)})")
    return out


def distance(m, T):
    """how far the footage sits outside the bands (0 = inside every band); the loop keeps the closest pass"""
    d = 0.0
    for k, _ in KEYS:
        b = T.get(k)
        if b and m.get(k) is not None:
            w = max(1.0, (b[1] - b[0]) / 2)
            d += max(0.0, b[0] - m[k], m[k] - b[1]) / w
    if T.get("contrast_min") and m.get("contrast") is not None:
        d += max(0.0, T["contrast_min"] - m["contrast"]) / 30
    return d


def mid(b):
    return (b[0] + b[1]) / 2 if b else None


def curve_for(src_face, src_bg, dst_face, dst_bg):
    """a monotonic luma curve through (face -> dst_face) and (bg -> dst_bg); None when no monotonic curve exists"""
    pts = sorted([(0, 0), (src_face, dst_face), (src_bg, dst_bg), (255, 255)])
    if any(b[1] < a[1] for a, b in zip(pts, pts[1:])) or abs(src_face - src_bg) < 12 and abs(dst_face - dst_bg) > 25:
        return None
    # keep the ends inside the frame of the two anchor points (no crushed blacks / clipped whites)
    lo = min(dst_face, dst_bg) * min(src_face, src_bg) / max(1, min(src_face, src_bg)) if min(src_face, src_bg) > 0 else 0
    pts[0] = (0, max(0, min(lo * 0.15, 12)))
    return " ".join(f"{x / 255:.3f}/{min(1, y / 255):.3f}" for x, y in pts)


def gfix(g, measured, target):
    """eq gamma that moves `measured` luma to `target` (eq maps x -> x^(1/g) on 0-1)"""
    m, t = min(0.98, max(0.02, measured / 255)), min(0.98, max(0.02, target / 255))
    return max(0.1, min(4.0, g * np.log(m) / np.log(t)))


def grade_filter(p):
    """ffmpeg filter for one grade: luma curve (or plain eq), saturation, warmth"""
    f = []
    if p.get("curve"):
        f.append(f"curves=all='{p['curve']}'")
    f.append(f"eq=contrast={p['contrast']:.3f}:saturation={p['saturation']:.3f}:gamma={p['gamma']:.3f}")
    if abs(p["warm"]) > 0.005:
        f.append(f"colorbalance=rm={p['warm']:.3f}:bm={-p['warm']:.3f}:rh={p['warm'] / 2:.3f}:bh={-p['warm'] / 2:.3f}")
    return ",".join(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--theme")
    ap.add_argument("--src", default="assets/video/face.mp4")
    ap.add_argument("--matte", default="assets/video/matte.webm")
    ap.add_argument("--vo", default="assets/audio/vo.mp3")
    ap.add_argument("--no-crop", action="store_true")
    ap.add_argument("--wire", action="store_true")
    a = ap.parse_args()
    proj = pathlib.Path(a.project).resolve()
    meta = json.loads((proj / "meta.json").read_text()) if (proj / "meta.json").exists() else {}
    theme = a.theme or meta.get("theme")
    J = json.loads((THEMES / theme / "qa-targets.json").read_text())
    if "look" not in J:
        sys.exit(f"theme '{theme}' has no look targets: python3 {HERE}/qa/anchor.py {theme} --look")
    T, AS = J["look"]["targets"], J["look"]["anchor"]
    src, matte = proj / a.src, proj / a.matte
    W, H, fps, dur = probe(src)
    tmp = proj / "renders/prep"; tmp.mkdir(parents=True, exist_ok=True)

    before = measure(src)
    print("before:", {k: before[k] for k in ("face_h", "face_luma", "bg_luma", "bg_sat", "warmth", "contrast", "garment_vs_bg")})

    # ---- crop to the anchor's full-face face height (in the 360x640 analysis frame; same share at any size) ----
    zoom = 1.0
    target_h = T.get("face_h_full") or AS.get("face_h_full") or mid(T.get("face_h"))
    notes = []
    if target_h and not a.no_crop and before["face_h"] < target_h * 0.95:
        want = target_h / before["face_h"]
        zoom = min(MAX_ZOOM, want)
        if want > MAX_ZOOM:
            notes.append(f"the face fills {before['face_h']:.0%} of the frame, the anchor {target_h:.0%}: shoot closer (crop capped at {MAX_ZOOM}x)")
    bx, by, bw, bh = before["box"]
    cx, cy = (bx + bw / 2) / lk.W, (by + bh / 2) / lk.H
    cw, ch = W / zoom, H / zoom
    ox = min(max(0, cx * W - cw / 2), W - cw); oy = min(max(0, cy * H - ch * cy), H - ch)  # the face keeps its relative height
    crop = f"crop={int(cw) // 2 * 2}:{int(ch) // 2 * 2}:{int(ox)}:{int(oy)},scale={W}:{H}:flags=lanczos" if zoom > 1.001 else ""

    # ---- closed-loop grade ----
    dst_face = mid(T.get("face_luma")) or before["face_luma"]
    dst_bg = mid(T.get("bg_luma")) or before["bg_luma"]
    curve = curve_for(before["face_luma"], before["bg_luma"], dst_face, dst_bg)
    # a separate background grade only when it can reach something a global curve can't: a background the curve
    # can't get to, or clothes that melt into the wall AND a background brightness inside the anchor's band that
    # would separate them (a white top on a white-wall theme can't be separated: that is a reshoot, not a matte job)
    need = T.get("garment_vs_bg_min", 25)
    sep_possible = bool(T.get("bg_luma")) and before.get("garment_luma") is not None and max(abs(T["bg_luma"][0] - before["garment_luma"]), abs(T["bg_luma"][1] - before["garment_luma"])) >= need
    melt = before.get("garment_vs_bg") is not None and before["garment_vs_bg"] < need
    split = curve is None or (melt and sep_possible)
    if melt and not sep_possible:
        notes.append(f"the top ({before['garment_luma']:.0f} luma) and the theme's wall ({T['bg_luma'][0]}–{T['bg_luma'][1]}) can't be {need:.0f} apart: wear a top of the opposite brightness (see How to shoot)")
    has_matte = matte.exists()
    if split and not has_matte:
        notes.append("the background needs its own grade (a different brightness than the face can reach with one curve, or clothes that melt into the wall) and there is no cut-out matte: make one (assets/video/matte.webm) or reshoot")
        split = False
        curve = curve or curve_for(before["face_luma"], before["face_luma"] + (dst_bg - dst_face), dst_face, dst_bg)
    P = {"curve": None if split else curve, "contrast": 1.0, "saturation": 1.0, "gamma": 1.0, "warm": 0.0}
    B = {"curve": None, "contrast": 1.0, "saturation": 1.0, "gamma": 1.0, "warm": 0.0, "blur": 0.0}  # background side (split only)
    if split:
        P["curve"] = curve_for(before["face_luma"], before["face_luma"] + 1, dst_face, dst_face + 1)
        B["gamma"] = gfix(1.0, before["bg_luma"], dst_bg)
        B["blur"] = 6.0 if AS.get("bg_luma", 128) < 70 else 2.0  # a dark stage reads as depth: soften the room

    out_v, out_m = tmp / "face_prep.mp4", tmp / "matte_prep.webm"
    hist, done, best = [], False, None
    for it in range(4):
        vf = ",".join(x for x in (crop, grade_filter(P)) if x)
        if split:
            bg = ",".join(x for x in (crop, grade_filter(B), f"gblur=sigma={B['blur']}" if B["blur"] else "") if x)
            mcrop = ",".join(x for x in (f"scale={W}:{H}", crop) if x)
            # the matte is softened (feathered alpha) so a moving head never leaves a hard rim of the other grade
            fc = (f"[0:v]split[s][b];[s]{vf},format=rgba[fg];[b]{bg}[bgg];"
                  f"[1:v]{mcrop},format=yuva420p,alphaextract,gblur=sigma=2.5[al];[fg][al]alphamerge[cut];[bgg][cut]overlay=shortest=1:format=auto,format=yuv420p[o]")
            cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-c:v", "libvpx-vp9", "-i", str(matte), "-filter_complex", fc, "-map", "[o]"]
        else:
            cmd = ["ffmpeg", "-loglevel", "error", "-y", "-i", str(src), "-vf", vf + ",format=yuv420p", "-map", "0:v"]
        # passes grade a 12 s probe until it sits inside the bands (or 3 tries); then one pass writes the whole clip
        final = it == 3 or done
        if final and best and not done:
            P, B = dict(best[1]), dict(best[2])  # the whole clip gets the closest probe pass, not the last one
        run(*cmd[:4], *([] if final else ["-t", "12"]), *cmd[4:], *(["-t", "12"] if not final else []), "-map", "0:a?", "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-c:a", "copy", str(out_v))
        m = measure(out_v)
        hist.append({"pass": it + 1, "params": {"fg": dict(P), "bg": dict(B) if split else None}, "measured": {k: m[k] for k in ("face_luma", "bg_luma", "bg_sat", "warmth", "contrast", "garment_vs_bg")}})
        print(f"pass {it + 1}:", hist[-1]["measured"])
        if final:
            break
        dist = distance(m, T)
        if best is None or dist < best[0]:
            best = (dist, dict(P), dict(B))
        if not misses(m, T):
            done = True  # inside the bands on the probe: the next pass writes the whole clip with these settings
            continue
        # correct toward the band centres (eq gamma: out = in^(1/g), so g scales by ln(measured)/ln(target))
        if T.get("face_luma"):
            P["gamma"] = (P["gamma"] + gfix(P["gamma"], m["face_luma"], dst_face)) / 2
        if T.get("bg_sat"):
            side = B if split else P
            side["saturation"] = max(0.4, min(1.8, side["saturation"] * ((mid(T["bg_sat"]) + 1) / (m["bg_sat"] + 1)) ** 0.5))
        if T.get("warmth"):
            P["warm"] = max(-0.3, min(0.3, P["warm"] + (mid(T["warmth"]) - m["warmth"]) / 400))
        if split and T.get("bg_luma"):
            B["gamma"] = (B["gamma"] + gfix(B["gamma"], m["bg_luma"], dst_bg)) / 2
        if T.get("contrast_min") and m["contrast"] < T["contrast_min"]:
            P["contrast"] = min(1.5, P["contrast"] * 1.08)

    after = measure(out_v)
    left = misses(after, T)
    if has_matte and zoom > 1.001:
        run("ffmpeg", "-loglevel", "error", "-y", "-c:v", "libvpx-vp9", "-i", str(matte), "-vf", f"scale={W}:{H},{crop},scale=720:-2", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-b:v", "2M", str(out_m))
    dest_v = proj / "assets/video/face_prep.mp4"; dest_v.parent.mkdir(parents=True, exist_ok=True)
    out_v.replace(dest_v)
    dest_m = None
    if out_m.exists():
        dest_m = proj / "assets/video/matte_prep.webm"; out_m.replace(dest_m)
    # the edit places captions and cards by the face track: re-track on the prepared clip
    (proj / "data").mkdir(exist_ok=True)
    run("python3", str(HERE / "face_track.py"), str(dest_v), str(proj / "data/face.json"))

    verdict = "READY" if not misses(before, T) and zoom == 1.0 else ("GRADED" if not left else "RESHOOT")
    rep = {"theme": theme, "verdict": verdict, "zoom": round(zoom, 3), "split_grade": split, "before": before, "after": after,
           "targets": T, "left": left, "notes": notes, "passes": hist, "outputs": {"video": str(dest_v.relative_to(proj)), "matte": str(dest_m.relative_to(proj)) if dest_m else None}}
    (proj / "data/footage.json").write_text(json.dumps(rep, indent=1, ensure_ascii=False))
    readme = (THEMES / theme / "README.md").read_text()
    shoot = re.search(r"\n#+ [^\n]*How to shoot[^\n]*\n.*?(?=\n#{1,2} |\Z)", readme, re.S)
    rows = "\n".join(f"| {lab} | {before[k]:.0f} | {after[k]:.0f} | {T[k][0]}–{T[k][1]} |" for k, lab in KEYS if T.get(k))
    L = [f"# Footage prep · {proj.name} · theme `{theme}`", "", f"**{verdict}** — crop {zoom:.2f}x, {'background graded separately through the matte' if split else 'one global grade'}", "",
         "| | before | after | anchor band |", "|---|---|---|---|", rows,
         f"| face height | {before['face_h']:.2f} | {after['face_h']:.2f} | full-face {target_h} |",
         f"| contrast | {before['contrast']:.0f} | {after['contrast']:.0f} | >= {T.get('contrast_min')} |",
         f"| garment vs background | {before.get('garment_vs_bg') or 0:.0f} | {after.get('garment_vs_bg') or 0:.0f} | >= {T.get('garment_vs_bg_min', 25)} |", ""]
    if left:
        L += ["Still outside the anchor's world:", ""] + [f"- {x}" for x in left] + [""]
    if notes:
        L += ["Notes:", ""] + [f"- {x}" for x in notes] + [""]
    if verdict == "RESHOOT" and shoot:
        L += ["## Send this to the user before editing", shoot.group(0).strip(), ""]
    (proj / "footage-report.md").write_text("\n".join(L))

    # the voice: a reel is delivered around -14 LUFS integrated. With a music bed the voice sits at -16 so the bed and
    # the SFX fit on top; a voice-led theme (no bed: the README says "almost no music") takes the voice to -14 itself
    vo = proj / a.vo
    if vo.exists():
        r = subprocess.run(["ffmpeg", "-nostats", "-i", str(vo), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
        lu = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)
        vi = float(lu[-1]) if lu else None
        out_a = proj / "assets/audio/vo_prep.wav"
        readme_ = (THEMES / theme / "README.md").read_text().lower()
        # measured: the HyperFrames render mixes the voice ~2 dB under its file level (-14 in → -16.1 out), so the
        # voice-led target is -12 to land the film on -14; under a bed the voice stays at -16 and the bed adds the rest
        target = -12 if re.search(r"almost no music|no music|voice first", readme_) else -16
        run("ffmpeg", "-loglevel", "error", "-y", "-i", str(vo), "-af", f"loudnorm=I={target}:TP=-1.5:LRA=9", "-ar", "48000", str(out_a))
        L.insert(3, f"Voice: {vi} LUFS → {target} LUFS (`assets/audio/vo_prep.wav`); the mix lands near -14 with music and SFX.")
        (proj / "footage-report.md").write_text("\n".join(L))
        rep["voice"] = {"before_lufs": vi, "after_lufs": target, "file": str(out_a.relative_to(proj))}
        (proj / "data/footage.json").write_text(json.dumps(rep, indent=1, ensure_ascii=False))

    if a.wire:
        for f in [proj / "src/template.html", proj / "index.html"]:
            if not f.exists():
                continue
            s = f.read_text()
            s2 = s.replace(a.src, "assets/video/face_prep.mp4")
            if vo.exists():
                s2 = s2.replace(f'src="{a.vo}"', 'src="assets/audio/vo_prep.wav"')
            if dest_m:
                s2 = s2.replace(a.matte, "assets/video/matte_prep.webm")
            if s2 != s:
                f.write_text(s2); print("wired", f.relative_to(proj))
    print(f"{verdict}: {len(left)} outside the bands → {proj / 'footage-report.md'}")


if __name__ == "__main__":
    main()
