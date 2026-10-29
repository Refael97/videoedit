# Theme QA (`qa <project>`)

A draft is checked by code before anyone looks at it. The checker does not judge taste ("does it look like the
anchor?") — that stays an eye review. It makes sure the known mistakes don't come back.

```
.claude/skills/video-themes/scripts/qa/qa videos/<project>            # renders renders/qa-draft.mp4, then checks
.claude/skills/video-themes/scripts/qa/qa videos/<project> --reuse-draft
python3 .claude/skills/video-themes/scripts/qa/anchor.py <theme|all>  # (re)measure a theme's targets on its anchor
```
Needs: ffmpeg, node + Playwright (pre-installed), `numpy`, `opencv-python-headless<5` (face box).
Output: `<project>/qa-report.md`, `<project>/qa.json` (score N/12, checks, FIX LIST). Exit code 0 only at 12/12.

## The 12 checks (+ footage motion, reported only)

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
| 12 | hook visual | in the first 3 s a non-text visual (media / svg / card ≥ 150 px) on screen ≥ 0.5 s | yes |

Conventions the probe relies on: captions have a class containing `cap` (or `data-qa="caption"`); the speaker video is
`data-qa="face"`, an id containing `face`, or track 0; full-frame backgrounds are ignored (or `data-qa="bg"`);
`data-qa="chart"` / `"not-chart"` override chart detection; `data-qa-stack` marks a group whose members may overlap (only where the theme's language.md allows stacking).

## Targets
`themes/<theme>/qa-targets.json` + the "QA targets" table in `theme.md`, written by `anchor.py` from the anchor
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
