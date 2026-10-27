# QA · theme-board-preview · theme `board`

**8/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | motion | 1.99 | >= 1.83 |
| ✓ | flat stretches | 45.0% | <= 46.0% |
| ✓ | actions / s | 0.7 events/s (GSAP 4.89 tweens/s) | 0.47–0.88 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 71%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 7.0–8.2s | צריכים להתקין skill | no placeholders | term2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |

_targets measured on the anchor (`themes/board/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
