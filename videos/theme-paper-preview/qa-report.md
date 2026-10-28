# QA · theme-paper-preview · theme `paper`

**8/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 0.78 | >= 0.69 |
| ✓ | flat stretches | 17.1% | <= 19.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 2.97 tweens/s) | 0.36–0.66 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 80%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 2 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.17 px/frame, 0 punches, 1 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 7.2–8.2s | להתקין skill | no placeholders | term2: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 11.5–13.5s | האתר שלכם למטורף. כל מה | graphic overlaps | svg. overlaps svg. (25% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.8–13.5s | שלכם למטורף. כל מה | graphic overlaps | #sc2 overlaps svg. (26% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
