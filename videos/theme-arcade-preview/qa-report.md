# QA · theme-arcade-preview · theme `arcade`

**9/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.02 | >= 0.91 |
| ✓ | flat stretches | 10.7% | <= 15.0% |
| ✓ | actions / s | 1.05 events/s (GSAP 4.48 tweens/s) | 0.74–1.37 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 70%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 5 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.24 px/frame, 8 punches, 2 drifts (anchor: jitter 0.14 px/frame, 16.2 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 1.0–2.2s | לבנות אתרים שנראים טוב | graphic overlaps | svg. overlaps svg. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.2–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #m1 overlaps #pgA (80% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.2–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #m1 overlaps div.h (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 12.2–13.0s | למטורף. | graphic overlaps | div.h overlaps svg. (57% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 12.5–13.0s | למטורף. | graphic overlaps | div.serif overlaps svg. (52% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/arcade/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
