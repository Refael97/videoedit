# Theme QA (`qa <project>`)

A draft is checked by code before the film pass. Checks 1-13 cover timing and layout; 14-20 cover the look, measured with
`look.py` — the same code that measured the anchor (footage, hero scale, content density, full-face rhythm, material,
contrast, Hebrew typography). The checker still does not replace the eye: every scene also goes through the review loop
(`scripts/review/README.md`), where Claude looks at the draft next to the anchor's frame.

```
.claude/skills/video-themes/scripts/qa/qa videos/<project>            # renders renders/qa-draft.mp4, then checks
.claude/skills/video-themes/scripts/qa/qa videos/<project> --reuse-draft
python3 .claude/skills/video-themes/scripts/qa/anchor.py <theme|all>  # (re)measure a theme's targets on its anchor
python3 .claude/skills/video-themes/scripts/qa/anchor.py <theme> --look # only the look targets (+ language.md material block)
```
Needs: ffmpeg, node + Playwright (pre-installed), `numpy`, `opencv-python-headless<5` (face box).
Output: `<project>/qa-report.md`, `<project>/qa.json` (score N/20, checks, FIX LIST). Exit code 0 only at 20/20.
Node helpers find Playwright through `nodeenv.py` (global npm root, a `node_modules` in the repo, or `~/.cache/video-themes-node`).

## The 20 checks (+ footage motion, reported only)

| # | check | how it is measured | pass |
|---|---|---|---|
| 1 | graphics motion | the **graphics layer only**. Draft: a second draft with the footage blacked out (`renders/qa-gfx-draft.mp4`), measured directly over the same area as the anchor (outside the speaker box found in the full draft; unmasked if the speaker fills every frame), graphics windows only. Anchor: frame difference after removing the camera's global move (tracked corners → similarity transform, RANSAC) and masking the speaker (body box from the face), in windows that carry graphics, minus the footage's own residual in windows without graphics (grain, compression, speaker spill; if < 3 s of those exist, the quietest 10% of windows). Same function both sides (`layers.py`) | ≥ 0.75 × anchor |
| – | footage motion | camera jitter (px/frame), punches (scale jump ≥ 4% in 4 frames) and drifts (steady zoom/pan ≥ 3% over 1 s). **Never fails.** Camera moves count as theme actions in #3 | info |
| 2 | flat stretches | on the **graphics layer** (same measurement as #1): share of graphics time in runs ≥ 0.4 s whose residual stays < 0.3 above the footage baseline; each run listed with its words. The full-frame value is shown beside it | ≤ anchor % |
| 3 | max static hold | the longest of those runs; a marked payoff's hold (0.8 s+) is exempt | ≤ the anchor's 95th-percentile hold |
| 4 | actions / s | "big moments" (peaks of the frame difference above max(3, 3 × 1-s median), ≥ 0.2 s apart) + deliberate camera moves not already counted — the same detectors on the anchor and the draft (the anchor has no GSAP timeline). GSAP tweens / s is reported beside it | anchor ± 30% |
| 5 | payoff lands | every `[data-qa-payoff="word"]`: its text stops changing within ±0.15 s of the word, stays visible ≥ 0.8 s, `data-qa-stamp` appears after it. A number that changes on screen without the mark fails | all true |
| 6 | min text | Playwright seeks every 0.25 s; every visible text: computed font-size × cumulative transform scale ≥ 26 px (for ≥ 0.5 s) | 0 items |
| 7 | hero fill | the visible scene's cards / media / svg content (incl. parts not revealed yet), union box ÷ the free area between the title and the caption / face box | ≥ 60% (full-face beats exempt) |
| 8 | collisions | caption text over a card (> 15% of the caption); a caption or card on top of the eyes–mouth core of the face (the face box of that very moment — from `data/face.json` (`scripts/face_track.py`) when the project has it, else Haar on the source footage — mapped through the video's on-screen box, `elementFromPoint` on a 5×5 grid) | 0 |
| 9 | graphic overlaps | two major graphics (cards ≥ 160×100, media, svg content, titles ≥ 40 px) overlap by > 4% of the smaller one for ≥ 0.5 s — unless one contains the other or both sit inside the same `[data-qa-stack]` container (stacking the theme's language allows, e.g. cards on cards). Small marks (tags, stamps, cursors, icons < 160×100) may sit on things | 0 |
| 10 | no placeholders | in the draft frames: a panel with luma std < 5, a ≥ 250×250 panel whose detailed 12px cells span < 40% of it (content bounding box), an image with std < 8; a chart (svg with *axis/chart/curve/graph/plot*) with no digit near it | 0 |
| 11 | facts on screen | every number, URL and price visible ≥ 0.5 s (not captions) must appear in `data/facts.yaml` or in the transcript; a lone 1–12 used as a step / row number is free. Counters pass through unlisted values only while moving | 0 unsourced |
| 12 | signature effects | `effects/README.md`: letters of a word behind the head ≥ 70% visible against the real cut-out (`matte.webm` alpha, decoded with libvpx, mapped through the cut-out's on-screen box) in every sample, one letter may dip ≤ 0.5 s; a risen shoulder card ≤ 50% hidden. Passes trivially when the video uses no effect | all true |
| 13 | hook visual | in the first 3 s a non-text visual (media / svg / card ≥ 150 px) on screen ≥ 0.5 s | yes |
| 14 | footage match | `look.py` around the face, every 0.5 s of the draft: face height, face luma, skin warmth (R−B), background luma and saturation (a ring around the head), contrast (p95−p5), garment vs background. Bands from the anchor (`theme.md` → Look targets) | all inside |
| 15 | hero scale | the graphics zone (above the head in a split, the whole frame without a face): 9px cells with luma std > 6; hero box = their 5th–95th percentile extent; width share of the frame | median ≥ 0.85 × anchor, never < 0.7 × for 1 s |
| 16 | content density | detailed cells ÷ cells inside the hero box (an empty window with one bubble fails) | median ≥ 0.75 × anchor, never < 0.55 × for 1 s |
| 17 | full-face rhythm | share of samples where the speaker owns the frame (face centre above 60% of the height) and the longest stretch without one | ≥ 0.6 × anchor share, gap ≤ 1.5 × anchor (no target when the anchor keeps the speaker boxed) |
| 18 | material & light | inside the hero box: luma span (p95−p5), glow (a 4% ring outside the box vs the far background), accent saturation (top 10%) | ≥ 0.7 × / 0.5 × / 0.7 × anchor (glow and accent only when the anchor has them) |
| 19 | text contrast | every readable text (≥ 26 px, opacity ≥ 0.9, not `data-qa-decor`, not blurred, not covered at its centre by a veil / card / clip): p92 vs p8 luma inside its box on the draft, as a WCAG ratio | ≥ 4.5:1 (≥ 3:1 from 48 px) |
| 20 | Hebrew typography | DOM: Hebrew text with `font-style: italic/oblique` or a skew in its transform chain; a digit run (≤ 8 chars) inside a Hebrew line set in another face or style (a Latin word in a display face is allowed) | 0 |

Conventions the probe relies on: captions have a class containing `cap` (or `data-qa="caption"`); the speaker video is
`data-qa="face"`, an id containing `face`, or track 0; full-frame backgrounds are ignored (or `data-qa="bg"`);
`data-qa="chart"` / `"not-chart"` override chart detection; `data-qa-ui` marks a running UI counter (a recording timer, a
progress percentage) that is interface, not a payoff; `data-qa-stack` marks a group whose members may overlap (only where the theme's language.md allows stacking).

## Targets
`themes/<theme>/qa-targets.json` (+ `["look"]`) and the "QA targets" / "Look targets" tables in `theme.md`, written by `anchor.py` from the anchor
creator's videos (`anchors.json`). Detector constants live in `video_metrics.py`; changing them means re-running
`anchor.py all`. **A target never changes to let a draft pass.**

Known limits: flat stretches (#2) still measure the full frame, so a handheld anchor's flat % includes its camera.
The anchor's graphics motion is an estimate (global-move removal also removes whole-stage pushes, and the speaker mask
is a box); the draft side is exact. Captions count as graphics on both sides.

## facts.yaml (one per video, `data/facts.yaml`)
Everything factual the video shows, confirmed by the user — the edit reads it, the checker enforces it:
```yaml
numbers: {views_before: "300–400", views_after: "10K"}
urls: [refael-ai.com]
names: {person: רפאל לוי, handle: "@refaelleviii", file: IMG_5381.mov}
prices: []
ui: ["100%"]        # interface states shown as-is (progress, timers' final value), not claims
```
