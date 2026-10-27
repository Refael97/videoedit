# QA · theme-headline-preview · theme `headline`

**6/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.67 | >= 2.8 |
| ✓ | flat stretches | 11.3% | <= 16.0% |
| ✓ | actions / s | 0.41 events/s (GSAP 3.44 tweens/s) | 0.35–0.65 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 80%, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | no placeholders | 2 found | 0 |
| ✓ | hook visual | visual on screen 2.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 7.0–9.0s | צריכים להתקין skill שנקרא Kowalski. | no placeholders | w2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.0–10.5s | הסקיל הזה | hero fill | fill 27%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 10.2–10.8s | הסקיל הזה בעצם | no placeholders | site plain: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
