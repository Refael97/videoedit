# QA · theme-neon-studio-preview · theme `neon-studio`

**8/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.46 | >= 4.05 |
| ✓ | flat stretches | 17.7% | <= 19.0% |
| ✓ | actions / s | 0.82 events/s (GSAP 2.39 tweens/s) | 0.73–1.35 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 78%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |

_targets measured on the anchor (`themes/neon-studio/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
