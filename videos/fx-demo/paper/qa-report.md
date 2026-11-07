# QA · paper · theme `paper`

**9/13 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.61 | >= 0.69 |
| ✓ | flat stretches | 0.0% (full frame 0.0%) | <= 20.0% |
| ✓ | max static hold | 0.00 s | <= 0.9 s |
| ✗ | actions / s | 0.2 events/s (GSAP 0.7 tweens/s) | 0.36–0.66 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | full face, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | facts on screen | 0 unsourced | 0 |
| ✓ | signature effects | min letter visible 70%, max risen card hidden 50% | letters >= 70% (1 may dip <= 0.5 s), cards <= 50% hidden |
| ✗ | hook visual | visual on screen 0.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.49 px/frame, 0 punches, 2 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–20.0s | הסקיל הזה מאפשר לקלוד לערוך לכם את הסרטון ברמה מטורפת. בתוך  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.0–3.0s | הסקיל הזה מאפשר לקלוד לערוך לכם את הסרטון | hook visual | open on a visual (the result, the thing itself, real thumbnails), not text alone |
| 0.3–5.0s | הסקיל הזה מאפשר לקלוד לערוך לכם את הסרטון ברמה מטורפת. בתוך  | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 5.0–14.7s | יצרתי עשרות סוגי עיצובים ולפי העיצובים האלה קלוד יודע איך לע | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 5.5–12.2s | יצרתי עשרות סוגי עיצובים ולפי העיצובים האלה קלוד יודע איך לע | hero fill | fill 21%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 14.7–20.0s | וזה הקפיץ לי את הצפיות משלוש מאות ארבע מאות צפיות לסרטון לעש | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 79/79 samples_
