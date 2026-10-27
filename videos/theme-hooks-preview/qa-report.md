# QA · theme-hooks-preview · theme `hooks`

**8/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.42 | >= 2.49 |
| ✓ | flat stretches | 23.9% | <= 34.0% |
| ✓ | actions / s | 0.7 events/s (GSAP 2.56 tweens/s) | 0.39–0.72 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 83%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |

_targets measured on the anchor (`themes/hooks/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
