# Theme QA (`qa <project>`)

A draft is checked by code before anyone looks at it. The checker does not judge taste ("does it look like the
anchor?") — that stays an eye review. It makes sure the known mistakes don't come back.

```
.claude/skills/video-themes/scripts/qa/qa videos/<project>            # renders renders/qa-draft.mp4, then checks
.claude/skills/video-themes/scripts/qa/qa videos/<project> --reuse-draft
python3 .claude/skills/video-themes/scripts/qa/anchor.py <theme|all>  # (re)measure a theme's targets on its anchor
```
Needs: ffmpeg, node + Playwright (pre-installed), `numpy`, `opencv-python-headless<5` (face box).
Output: `<project>/qa-report.md`, `<project>/qa.json` (score N/9, checks, FIX LIST). Exit code 0 only at 9/9.

## The 9 checks

| # | check | how it is measured | pass |
|---|---|---|---|
| 1 | motion | mean abs luma difference between frames of the draft (30 fps, 270×480 grey) | ≥ 0.75 × anchor |
| 2 | flat stretches | share of time in runs ≥ 0.4 s whose frame difference stays < 1.0; each run listed with its words | ≤ anchor % |
| 3 | actions / s | "big moments": peaks of the frame difference above max(3, 3 × 1-s median), ≥ 0.2 s apart — the same detector on the anchor and the draft (the anchor has no GSAP timeline). GSAP tweens / s is reported beside it | anchor ± 30% |
| 4 | payoff lands | every `[data-qa-payoff="word"]`: its text stops changing within ±0.15 s of the word, stays visible ≥ 0.8 s, `data-qa-stamp` appears after it. A number that changes on screen without the mark fails | all true |
| 5 | min text | Playwright seeks every 0.25 s; every visible text: computed font-size × cumulative transform scale ≥ 26 px (for ≥ 0.5 s) | 0 items |
| 6 | hero fill | the visible scene's cards / media / svg content (incl. parts not revealed yet), union box ÷ the free area between the title and the caption / face box | ≥ 60% (full-face beats exempt) |
| 7 | collisions | caption text over a card (> 15% of the caption); a caption or card on top of the eyes–mouth core of the face (Haar face box in the source footage mapped through the video's on-screen box, `elementFromPoint` on a 5×5 grid) | 0 |
| 8 | no placeholders | in the draft frames: a panel with luma std < 5, a ≥ 250×250 panel with < 20% detailed cells, an image with std < 8; a chart (svg with *axis/chart/curve/graph/plot*) with no digit near it | 0 |
| 9 | hook visual | in the first 3 s a non-text visual (media / svg / card ≥ 150 px) on screen ≥ 0.5 s | yes |

Conventions the probe relies on: captions have a class containing `cap` (or `data-qa="caption"`); the speaker video is
`data-qa="face"`, an id containing `face`, or track 0; full-frame backgrounds are ignored (or `data-qa="bg"`);
`data-qa="chart"` / `"not-chart"` override chart detection.

## Targets
`themes/<theme>/qa-targets.json` + the "QA targets" table in `theme.md`, written by `anchor.py` from the anchor
creator's videos (`anchors.json`). Detector constants live in `video_metrics.py`; changing them means re-running
`anchor.py all`. **A target never changes to let a draft pass.**

Known limits: footage itself moves the metrics (a handheld anchor is never flat; a tripod draft must move its
graphics instead), so the FIX LIST asks for motion in the graphics, not in the footage.
