# QA · theme-editorial-preview · theme `editorial`

**8/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.65 | >= 5.0 |
| ✓ | flat stretches | 0.0% | <= 2.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 2.62 tweens/s) | 0.37–0.69 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.2s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |

_targets measured on the anchor (`themes/editorial/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
