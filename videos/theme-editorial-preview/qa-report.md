# QA · theme-editorial-preview · theme `editorial`

**5/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.36 | >= 5.0 |
| ✓ | flat stretches | 0.0% | <= 2.0% |
| ✗ | actions / s | 0.29 events/s (GSAP 2.45 tweens/s) | 0.37–0.69 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | no placeholders | 3 found | 0 |
| ✗ | hook visual | visual on screen 0.2s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–2.9s | אם אתם רוצים לבנות אתרים שנראים טוב | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 0.0–3.0s | אם אתם רוצים לבנות אתרים שנראים טוב עם | hook visual | open on a visual (the result, the thing itself, real thumbnails), not text alone |
| 2.9–6.6s | טוב עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 3.0–4.8s | עם motion, מעברים | no placeholders | sl2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 3.0–5.5s | עם motion, מעברים ומבנה | no placeholders | sl3: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 6.6–8.7s | שצריך, אתם צריכים להתקין skill שנקרא | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 10.0–12.9s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 10.2–11.2s | הסקיל הזה בעצם הופך | no placeholders | card4: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 12.9–17.2s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/editorial/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
