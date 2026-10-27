# QA · theme-paper-preview · theme `paper`

**7/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.92 | >= 2.22 |
| ✓ | flat stretches | 17.1% | <= 19.0% |
| ✓ | actions / s | 0.47 events/s (GSAP 2.97 tweens/s) | 0.32–0.6 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 80%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 7.2–8.2s | להתקין skill | no placeholders | term2: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
