# QA · theme-neon-studio-preview · theme `neon-studio`

**9/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 1.15 | >= 1.38 |
| ✓ | flat stretches | 17.7% | <= 19.0% |
| ✓ | actions / s | 0.93 events/s (GSAP 2.39 tweens/s) | 0.79–1.48 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 78%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.34 px/frame, 3 punches, 5 drifts (anchor: jitter 0.17 px/frame, 34.6 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |

_targets measured on the anchor (`themes/neon-studio/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
