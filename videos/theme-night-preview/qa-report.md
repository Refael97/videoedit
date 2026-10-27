# QA · theme-night-preview · theme `night`

**4/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.66 | >= 2.02 |
| ✗ | flat stretches | 58.4% | <= 12.0% |
| ✓ | actions / s | 0.58 events/s (GSAP 3.15 tweens/s) | 0.38–0.7 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 67% | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✗ | no placeholders | 5 found | 0 |
| ✓ | hook visual | visual on screen 2.2s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.2–1.0s | אם אתם רוצים לבנות | hero fill | fill 54%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |
| 1.0–3.0s | לבנות אתרים שנראים טוב עם | no placeholders | th1: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 1.2–3.0s | אתרים שנראים טוב עם | no placeholders | th2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 1.4–2.9s | אתרים שנראים טוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 1.5–3.0s | אתרים שנראים טוב עם | no placeholders | th3: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 2.9–3.4s | עם motion, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 3.0–6.8s | עם motion, מעברים ומבנה כמו שצריך, אתם | hero fill | fill 49%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |
| 3.5–4.7s | motion, מעברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.8–5.6s | מעברים ומבנה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.8–8.8s | אתם צריכים להתקין skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | no placeholders | doc2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 9.0–9.8s | Kowalski. | collisions | caption 'Kowalski' on doc2: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 9.1–9.6s | Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.0–12.9s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.0–13.0s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. | no placeholders | chart3: a chart needs real numbers: add axis values / the measured figures, or drop the chart |
| 16.7–17.2s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 16.8–17.2s |  | hero fill | fill 55%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
