# QA · theme-headline-preview · theme `headline`

**7/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 1.06 | >= 1.19 |
| ✓ | flat stretches | 11.3% | <= 16.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 3.44 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 80%, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 2 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 1.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.37 px/frame, 3 punches, 5 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 10.0–10.5s | הסקיל הזה | hero fill | fill 27%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 12.2–13.0s | למטורף. | graphic overlaps | #b3 overlaps #w3b (72% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 15.0–17.2s | פה ואני שולח לכם את זה. | graphic overlaps | #ctaK overlaps span.w (20% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
