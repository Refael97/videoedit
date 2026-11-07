"""The eye-review loop: every scene is built, looked at next to the anchor, fixed and looked at again until it is at the
anchor's level. Code measures what it can (look.py); Claude must LOOK at every round sheet and fill the checklist.

usage:
  review.py <project> scenes                      map the scenes (review/scenes.json) and print them
  review.py <project> scene <id|next|all>         a round for one scene: review/<scene>/round-N.jpg + round-N.md
  review.py <project> polish                      a polish round over the whole video (after every scene passes)
  review.py <project> film                        the whole-video pass on the QA draft (after polish passes)
  review.py <project> verdict <scene|_polish|_film> <key>=PASS "<key>=FIX: what and how" … [--fix "next-round fix"]
                                                  write verdicts into the latest round's checklist (keys: scale density
                                                  material contrast type footage framing spacing motion action payoff level …)
  review.py <project> gate                        exit 0 only when every scene, the polish and the film pass
  review.py <project> status                      rounds and verdicts so far

A round sheet puts each key moment of the draft (left) next to the anchor's moment of the same kind (right), and adds
8-frame motion strips around the scene's entrances. The checklist (round-N.md) is filled by the reviewer: every row
PASS or FIX + what exactly. Nothing moves on while a row says FIX or is left empty. There is no round limit; when one
row fails 3 rounds in a row, tell the user what fails and why instead of sending a draft silently.
"""
import argparse, json, pathlib, re, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
SK = HERE.parent
sys.path.insert(0, str(SK / "qa"))
import look as lk  # noqa: E402
import nodeenv  # noqa: E402

ROOT = nodeenv.ROOT
HF = ["npx", "--yes", "hyperframes@0.8.150"]

SCENE_ITEMS = [
    ("scale", "Hero scale", "is the hero as big in the frame as the anchor's (look at the pair, not the number alone)?"),
    ("density", "Real, dense content", "real content from the script, readable, filling the element — no empty panel, no single bubble in a big window"),
    ("material", "Material & light", "the theme's material (gradient, highlight, glow, shadow) — not flat fills"),
    ("contrast", "Contrast", "every text reads at reel size against what is behind it"),
    ("type", "Typography", "the theme's faces, no slanted Hebrew, no foreign-face digits, balanced line breaks"),
    ("footage", "Footage", "the speaker looks like the anchor's world (grade, background, size); nothing pasted-on"),
    ("framing", "Framing & safe zones", "face position like the anchor, nothing on eyes/mouth, nothing important in the top 220 / bottom 380 px"),
    ("spacing", "Spacing & alignment", "one margin system, elements aligned, nothing crowding an edge or another element"),
    ("motion", "Motion (strips)", "eased in and out, small overshoot, no pops, no linear slides, exits faster than entrances"),
    ("action", "Activation & action", "an agent acts on the element (cursor, typing, tick) several times while it is on screen"),
    ("payoff", "Payoff", "the payoff is the biggest thing in its card, lands on its word, holds >= 0.8 s"),
    ("level", "Same level as the anchor", "side by side, would this frame pass as the anchor creator's? If not, say what differs"),
]
POLISH_ITEMS = [
    ("depth", "Depth", "soft contact shadow under every card / window (the theme's shadow), the stage reads in layers"),
    ("edges", "Edges", "clean 1px edge or inner highlight on cards, no aliasing (.aa on transformed elements), no hairline gaps"),
    ("ease", "Easing", "every entrance eases out with a small overshoot (<= 4%); exits are faster; nothing linear"),
    ("secondary", "Secondary motion", "something alive during every hold (caret, cursor drift, subtle float, glow breathing)"),
    ("captions", "Captions", "each word on its word (±2 frames), never over a card, the theme's caption style everywhere"),
    ("sfx", "Sound per event", "an SFX on every event and none on nothing; music bed ≈0.3 under the voice"),
    ("colour", "Colour consistency", "the accent is one hex in every scene; the footage grade is stable across cuts"),
    ("lines", "Line breaks", "balanced lines, no single-word widow, numbers aligned"),
    ("transitions", "Transitions", "one family, directions matched (RTL flips), no card pops in or out"),
    ("opening", "Opening frame", "t = 0.0 is a strong thumbnail: the result / the thing itself, readable at a glance"),
    ("ending", "Last frame", "the video ends on a clean, composed frame"),
]
FILM_ITEMS = [
    ("rhythm", "Rhythm", "layouts alternate like the anchor's (face / split / full graphic); no stretch feels the same"),
    ("consistency", "Consistency", "every scene speaks the same language: materials, sizes, type, motion"),
    ("deadair", "Dead air", "no pause > 0.6 s without a reason; no visual hold that outlives its words"),
    ("hook", "Hook", "the first 3 s carry the strongest image and the promise"),
    ("audio", "Audio", "integrated loudness -14 LUFS ±1, true peak <= -1 dBTP, voice always on top of the music"),
    ("level", "Same level as the anchor", "watch it straight after the anchor: does it hold up? If not, say where it drops"),
]


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        sys.exit(" ".join(map(str, cmd[:5])) + " …\n" + (r.stdout + r.stderr)[-2000:])
    return r


def font(n):
    for p in ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/Helvetica.ttc", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"):
        if pathlib.Path(p).exists():
            return ImageFont.truetype(p, n)
    return ImageFont.load_default()


def theme_of(proj):
    return json.loads((proj / "meta.json").read_text())["theme"]


def scenes(proj, refresh=False):
    p = proj / "review/scenes.json"
    if refresh or not p.exists() or p.stat().st_mtime < (proj / "index.html").stat().st_mtime:
        p.parent.mkdir(parents=True, exist_ok=True)
        run(["node", str(HERE / "scenes.cjs"), str(proj / "index.html"), str(p)], env=nodeenv.env())
    return json.loads(p.read_text())


def snapshot(proj, times, tag):
    out = proj / "review/_snap" / tag
    if out.exists():
        shutil.rmtree(out)
    ts = ",".join(f"{t:.3f}" for t in times)
    run(HF + ["snapshot", "--at", ts, "--no-end", "--describe", "false", "-o", str(out), "."], cwd=proj)
    files = sorted(out.glob("frame-*.png"), key=lambda f: int(re.search(r"frame-(\d+)", f.name).group(1)))
    if len(files) != len(times):
        sys.exit(f"snapshot returned {len(files)} frames for {len(times)} times")
    return files


def classify(png):
    rgb = np.asarray(Image.open(png).convert("RGB").resize((lk.W, lk.H), Image.LANCZOS))
    fb = lk.face(rgb)
    return {"layout": lk.layout_of(fb), "face": fb, "hero": lk.hero(rgb, fb), "footage": lk.footage(rgb, fb) if fb else None}


def pair(theme, m):
    d = ROOT / "references/_analysis" / theme / "moments"
    if not (d / "index.json").exists():
        run(["python3", str(HERE / "anchor_moments.py"), theme])
    idx = json.loads((d / "index.json").read_text())
    same = [i for i in idx if i["layout"] == m["layout"]] or idx
    h = m.get("hero") or {}
    def score(i):
        s = 0.0
        if h.get("box") and i.get("hero_box"):
            s += abs((h["box"][1] + h["box"][3] / 2) - (i["hero_box"][1] + i["hero_box"][3] / 2)) / lk.H
            s += 0.5 * abs(h["box"][3] - i["hero_box"][3]) / lk.H
        return s
    best = min(same, key=score)
    return d / best["file"], best


def label(img, text, sub=""):
    W_ = img.width
    bar = Image.new("RGB", (W_, 58), (18, 18, 20)); g = ImageDraw.Draw(bar)
    g.text((12, 6), text, fill=(255, 255, 255), font=font(24)); g.text((12, 34), sub, fill=(170, 170, 178), font=font(17))
    out = Image.new("RGB", (W_, img.height + 58)); out.paste(bar, (0, 0)); out.paste(img, (0, 58)); return out


def fmt(v, nd=2):
    return "—" if v is None else (f"{v:.{nd}f}" if isinstance(v, float) else str(v))


def targets(theme):
    J = json.loads((SK.parent / "themes" / theme / "qa-targets.json").read_text())
    return J.get("look", {}).get("targets", {})


def next_round(d):
    n = [int(m.group(1)) for f in d.glob("round-*.md") if (m := re.match(r"round-(\d+)\.md", f.name))]
    return max(n, default=0) + 1


def checklist(items):
    rows = "\n".join(f"| {i} | {name} | {what} | ☐ | |" for i, (_, name, what) in enumerate(items, 1))
    return "| # | item | what to look at | verdict (PASS / FIX) | note — what exactly, and the fix |\n|---|---|---|---|---|\n" + rows


def verdicts(md):
    """rows of the checklist table: [(item, verdict)]"""
    s = md.read_text()
    part = s.split("## Eye checklist", 1)[-1].split("\n## ", 1)[0]
    out = []
    for line in part.splitlines():
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(c) >= 4 and c[0].isdigit():
            out.append((c[1], c[3].upper()))
    return out


def words_between(proj, a, b):
    p = proj / "data/words.json"
    if not p.exists():
        return ""
    return " ".join(w["text"] for w in json.loads(p.read_text()) if w["end"] > a and w["start"] < b)


def scene_round(proj, sc, theme):
    d = proj / "review" / re.sub(r"[^\w@.-]+", "_", sc["id"]); d.mkdir(parents=True, exist_ok=True)
    n = next_round(d)
    a, b = sc["start"], sc["end"]
    if sc["kind"] == "face":
        keys = [round((a + b) / 2, 2)]
    else:
        first = (sc["entrances"][0] + 0.6) if sc["entrances"] else a + 0.5
        keys = sorted({round(min(max(a + 0.3, first), b - 0.3), 2), round((a + b) / 2, 2), round(max(a + 0.3, b - 0.3), 2)})
    strips = [[round(e + k * 2 / 30, 3) for k in range(8)] for e in sc["entrances"][:2] if a <= e < b]
    files = snapshot(proj, keys + [t for s in strips for t in s], f"{d.name}-r{n}")
    kf, sf = files[:len(keys)], files[len(keys):]
    T = targets(theme)
    rows, panels = [], []
    for t, f in zip(keys, kf):
        m = classify(f)
        af, ai = pair(theme, m)
        h = m.get("hero") or {}
        ok_w = "✓" if not T.get("hero_width_weak") or m["layout"] == "face" or (h.get("width") or 0) >= T["hero_width_weak"] else "✗"
        ok_d = "✓" if not T.get("hero_density_weak") or m["layout"] == "face" or (h.get("density") or 0) >= T["hero_density_weak"] else "✗"
        rows.append(f"| {t:.2f} s | {m['layout']} | {fmt(h.get('width'))} {ok_w} | {fmt(h.get('density'))} {ok_d} | {fmt(h.get('span'), 0)} | {fmt(h.get('glow'), 1)} | "
                    f"{ai['src'].split('/')[-1]} @ {ai['t']} s ({ai['layout']}, w {fmt(ai.get('hero_width'))}, d {fmt(ai.get('hero_density'))}) |")
        L = label(Image.open(f).convert("RGB").resize((405, 720), Image.LANCZOS), f"DRAFT  {t:.2f}s", f"{m['layout']} · hero w {fmt(h.get('width'))} · density {fmt(h.get('density'))}")
        R = label(Image.open(af).convert("RGB").resize((405, 720), Image.LANCZOS), "ANCHOR", f"{ai['layout']} · hero w {fmt(ai.get('hero_width'))} · density {fmt(ai.get('hero_density'))}")
        p = Image.new("RGB", (830, L.height), (40, 40, 44)); p.paste(L, (0, 0)); p.paste(R, (425, 0)); panels.append(p)
    srows = []
    for i, s in enumerate(strips):
        fr = sf[i * 8:(i + 1) * 8]
        row = Image.new("RGB", (8 * 135 + 7 * 4, 240 + 40), (40, 40, 44)); g = ImageDraw.Draw(row)
        g.text((6, 8), f"MOTION  entrance at {s[0]:.2f}s  (every 2 frames)", fill=(255, 255, 255), font=font(20))
        for k, f in enumerate(fr):
            row.paste(Image.open(f).convert("RGB").resize((135, 240), Image.LANCZOS), (k * 139, 40))
        srows.append(row)
    Wd = max([p.width for p in panels] + [r.width for r in srows] + [830])
    cols = 2 if len(panels) > 1 else 1
    ph = panels[0].height
    gridh = ((len(panels) + cols - 1) // cols) * (ph + 16)
    sheet = Image.new("RGB", (max(Wd, cols * 846), gridh + sum(r.height + 16 for r in srows) + 70), (24, 24, 27))
    g = ImageDraw.Draw(sheet)
    g.text((16, 18), f"{proj.name} · {sc['id']} · {a:.1f}–{b:.1f} s · round {n}", fill=(255, 255, 255), font=font(30))
    for i, p in enumerate(panels):
        sheet.paste(p, (16 + (i % cols) * 846, 70 + (i // cols) * (ph + 16)))
    y = 70 + gridh
    for r in srows:
        sheet.paste(r, (16, y)); y += r.height + 16
    img = d / f"round-{n}.jpg"; sheet.save(img, quality=88)
    prev = d / f"round-{n - 1}.md"
    carry = ""
    if prev.exists():
        fixes = prev.read_text().split("## Fixes for the next round", 1)[-1].strip()
        carry = f"\n## What round {n - 1} asked to fix\n\n{fixes}\n"
    md = f"""# Review · {sc['id']} · round {n}

`{proj.name}` · theme `{theme}` · {a:.2f}–{b:.2f} s · words: "{words_between(proj, a, b)[:160]}"
Sheet: `{img.relative_to(proj)}` — LOOK at it before filling anything. Left = draft, right = the anchor's moment of the same kind.
{carry}
## Measured (look.py on the stills)

| moment | layout | hero width (weak < {fmt(T.get('hero_width_weak'))}) | density (weak < {fmt(T.get('hero_density_weak'))}) | luma span | glow | paired anchor moment |
|---|---|---|---|---|---|---|
{chr(10).join(rows)}

## Eye checklist

PASS only when the draft holds up next to the anchor frame. FIX = say exactly what and how.

{checklist(SCENE_ITEMS)}

## Fixes for the next round

-
"""
    (d / f"round-{n}.md").write_text(md)
    status(proj, sc["id"], n, img)
    print(f"{sc['id']}: round {n} → {img.relative_to(proj)} + round-{n}.md")
    return d / f"round-{n}.md"


def status(proj, key, n, img):
    p = proj / "review/status.json"
    S = json.loads(p.read_text()) if p.exists() else {}
    S.setdefault(key, []).append({"round": n, "sheet": str(img.relative_to(proj))})
    p.write_text(json.dumps(S, indent=1))


def latest(d):
    n = next_round(d) - 1
    return (d / f"round-{n}.md") if n > 0 else None


def passed(md):
    v = verdicts(md) if md and md.exists() else []
    return bool(v) and all(x == "PASS" for _, x in v), v


def polish_round(proj, theme):
    d = proj / "review/_polish"; d.mkdir(parents=True, exist_ok=True)
    n = next_round(d)
    S = scenes(proj)
    times = [0.0] + [round((s["start"] + s["end"]) / 2, 2) for s in S["scenes"]] + [round(S["duration"] - 0.1, 2)]
    files = snapshot(proj, times, f"polish-r{n}")
    cols = 6
    th = [Image.open(f).convert("RGB").resize((270, 480), Image.LANCZOS) for f in files]
    sheet = Image.new("RGB", (cols * 274 + 4, ((len(th) + cols - 1) // cols) * 514 + 70), (24, 24, 27)); g = ImageDraw.Draw(sheet)
    g.text((12, 18), f"{proj.name} · polish round {n} · t = 0, every scene's middle, last frame", fill=(255, 255, 255), font=font(28))
    for i, (im, t) in enumerate(zip(th, times)):
        x, y = 4 + (i % cols) * 274, 70 + (i // cols) * 514
        sheet.paste(im, (x, y)); g.text((x + 4, y + 484), f"{t:.2f}s", fill=(200, 200, 205), font=font(20))
    img = d / f"round-{n}.jpg"; sheet.save(img, quality=88)
    (d / f"round-{n}.md").write_text(f"""# Polish · round {n}

`{proj.name}` · theme `{theme}` · sheet `{img.relative_to(proj)}`. Errors are fixed already (every scene passed); this round takes
the video from good to great. Watch the QA draft once, look at the sheet, then fill every row.

## Eye checklist

{checklist(POLISH_ITEMS)}

## Fixes for the next round

-
""")
    status(proj, "_polish", n, img)
    print(f"polish round {n} → {img.relative_to(proj)}")


def film_round(proj, theme):
    d = proj / "review/_film"; d.mkdir(parents=True, exist_ok=True)
    n = next_round(d)
    draft = proj / "renders/qa-draft.mp4"
    if not draft.exists():
        sys.exit("no QA draft: run scripts/qa/qa <project> first (the film pass reviews the same draft the checks read)")
    dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(draft)]).stdout)
    sheet = d / f"round-{n}.jpg"
    cols = 10; rows = int(np.ceil(dur / cols))
    run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(draft), "-vf", f"fps=1,scale=162:288,tile={cols}x{rows}:padding=3", "-frames:v", "1", "-q:v", "3", str(sheet)])
    A = json.loads((SK / "qa/anchors.json").read_text())[theme][0]
    asheet = d / "anchor.jpg"
    if not asheet.exists():
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(ROOT / A), "-vf", f"fps=1,scale=162:288:force_original_aspect_ratio=increase,crop=162:288,tile={cols}x{rows}:padding=3", "-frames:v", "1", "-q:v", "3", str(asheet)])
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(draft), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", r); TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", r)
    loud = f"integrated {I[-1] if I else '?'} LUFS, true peak {TP[-1] if TP else '?'} dBFS"
    qa = json.loads((proj / "qa.json").read_text()) if (proj / "qa.json").exists() else {}
    (d / f"round-{n}.md").write_text(f"""# Film · round {n}

`{proj.name}` · theme `{theme}` · draft {dur:.1f} s at 1 fps: `{sheet.relative_to(proj)}` · anchor at 1 fps: `{asheet.relative_to(proj)}`
QA: {qa.get('score', 'not run')} · audio: {loud}

## Eye checklist

{checklist(FILM_ITEMS)}

## Fixes for the next round

-
""")
    status(proj, "_film", n, sheet)
    print(f"film round {n} → {sheet.relative_to(proj)} ({loud})")


def verdict(proj, key, items, fixes):
    d = proj / "review" / re.sub(r"[^\w@.-]+", "_", key)
    md = latest(d) if d.exists() else None
    if not md:
        sys.exit(f"no round for '{key}' yet")
    keys = {k: name for k, name, _ in SCENE_ITEMS + POLISH_ITEMS + FILM_ITEMS}
    s = md.read_text()
    for it in items:
        k, v = it.split("=", 1)
        if k not in keys:
            sys.exit(f"unknown item '{k}': " + ", ".join(keys))
        word, _, note = v.partition(":")
        word = word.strip().upper()
        if word not in ("PASS", "FIX"):
            sys.exit("verdict must be PASS or FIX[: note]")
        pat = re.compile(r"^(\| \d+ \| " + re.escape(keys[k]) + r" \| [^|]*\|) [^|]* \|[^\n]*$", re.M)
        if not pat.search(s):
            continue  # this checklist has no such row (scene vs polish vs film)
        s = pat.sub(lambda m: f"{m.group(1)} {word} | {note.strip()} |", s)
    if fixes:
        head, _, _ = s.partition("## Fixes for the next round")
        s = head + "## Fixes for the next round\n\n" + "\n".join(f"- {f}" for f in fixes) + "\n"
    md.write_text(s)
    ok, v = passed(md)
    print(f"{key} {md.name}: " + ("PASS" if ok else "open: " + ", ".join(i for i, x in v if x != "PASS")))


def gate(proj):
    S = scenes(proj)
    bad = []
    for sc in S["scenes"]:
        d = proj / "review" / re.sub(r"[^\w@.-]+", "_", sc["id"])
        ok, v = passed(latest(d) if d.exists() else None)
        if not ok:
            bad.append(f"{sc['id']}: " + (", ".join(f"{i} {x or '☐'}" for i, x in v if x != "PASS") or "no review round yet"))
    for key, name in (("_polish", "polish"), ("_film", "film")):
        ok, v = passed(latest(proj / "review" / key) if (proj / "review" / key).exists() else None)
        if not ok:
            bad.append(f"{name}: " + (", ".join(f"{i} {x or '☐'}" for i, x in v if x != "PASS") or "no round yet"))
    if bad:
        print("NOT READY\n" + "\n".join("  " + b for b in bad)); sys.exit(1)
    print("READY: every scene, the polish and the film passed the eye review"); sys.exit(0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("cmd", choices=["scenes", "scene", "polish", "film", "verdict", "gate", "status"]); ap.add_argument("which", nargs="?")
    ap.add_argument("items", nargs="*"); ap.add_argument("--fix", action="append", default=[])
    a = ap.parse_args()
    proj = pathlib.Path(a.project).resolve(); theme = theme_of(proj)
    if a.cmd == "scenes":
        S = scenes(proj, refresh=True)
        for s in S["scenes"]:
            print(f"{s['id']:>14}  {s['start']:6.2f}–{s['end']:6.2f}  {s['kind']:8}  entrances {s['entrances']}")
    elif a.cmd == "scene":
        S = scenes(proj)["scenes"]
        if a.which == "all":
            todo = S
        elif a.which in (None, "next"):
            todo = [s for s in S if not passed(latest(proj / "review" / re.sub(r"[^\w@.-]+", "_", s["id"])))[0]][:1]
            if not todo:
                print("every scene passed: run `polish`"); return
        else:
            todo = [s for s in S if s["id"] == a.which]
            if not todo:
                sys.exit(f"no scene '{a.which}': " + ", ".join(s["id"] for s in S))
        for sc in todo:
            scene_round(proj, sc, theme)
    elif a.cmd == "polish":
        polish_round(proj, theme)
    elif a.cmd == "film":
        film_round(proj, theme)
    elif a.cmd == "verdict":
        verdict(proj, a.which, a.items, a.fix)
    elif a.cmd == "gate":
        gate(proj)
    else:
        p = proj / "review/status.json"
        S = json.loads(p.read_text()) if p.exists() else {}
        for k, rs in S.items():
            ok, v = passed(latest(proj / "review" / re.sub(r"[^\w@.-]+", "_", k)))
            print(f"{k:>14}  {len(rs)} rounds  {'PASS' if ok else 'open: ' + ', '.join(i for i, x in v if x != 'PASS')}")


if __name__ == "__main__":
    main()
