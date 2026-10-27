# QA · theme-board-preview · theme `board`

**8/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.55 | >= 0.67 |
| ✓ | flat stretches | 45.0% | <= 46.0% |
| ✓ | actions / s | 0.7 events/s (GSAP 4.89 tweens/s) | 0.51–0.96 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 71%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 2 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.01 px/frame, 2 punches, 0 drifts (anchor: jitter 0.08 px/frame, 10.5 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #aft3 overlaps #bef3 (24% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #bef3 overlaps h3. (43% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/board/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
