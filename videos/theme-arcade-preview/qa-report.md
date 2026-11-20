# QA · theme-arcade-preview · theme `arcade`

**10/10 checks passed — READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.44 | >= 0.91 |
| ✓ | flat stretches | 10.7% | <= 15.0% |
| ✓ | actions / s | 1.05 events/s (GSAP 4.48 tweens/s) | 0.74–1.37 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 70%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.24 px/frame, 8 punches, 2 drifts (anchor: jitter 0.14 px/frame, 16.2 camera moves/min)

## FIX LIST

nothing to fix

_targets measured on the anchor (`themes/arcade/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
