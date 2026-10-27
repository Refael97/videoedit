# QA · theme-hooks-preview · theme `hooks`

**3/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.0 | >= 2.49 |
| ✗ | flat stretches | 38.4% | <= 34.0% |
| ✗ | actions / s | 0.29 events/s (GSAP 1.92 tweens/s) | 0.39–0.72 |
| ✗ | payoff lands | 0 marked, 1 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | n/a | >= 60% |
| ✗ | collisions | 5 collisions | 0 |
| ✗ | no placeholders | 4 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–2.9s | אם אתם רוצים לבנות אתרים שנראים טוב | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | payoff lands | pc1#3 changes ['0%', '33%', '66%']: a number changes on screen: mark the payoff element with data-qa-payoff="<word>" (and data-qa-stamp) |
| 0.2–6.8s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | collisions | #s1 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.2–5.0s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים | collisions | #bar1 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.5–3.0s | אתם רוצים לבנות אתרים שנראים טוב עם | no placeholders | th1: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 0.5–3.0s | אתם רוצים לבנות אתרים שנראים טוב עם | no placeholders | th2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 0.8–3.0s | רוצים לבנות אתרים שנראים טוב עם | no placeholders | th3: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 2.9–6.6s | עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 2.9–4.6s | עם motion, מעברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.6–5.6s | מעברים ומבנה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 5.0–6.8s | מעברים ומבנה כמו שצריך, אתם | collisions | #fill1 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 5.6–6.6s | ומבנה כמו שצריך, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.6–9.9s | שצריך, אתם צריכים להתקין skill שנקרא Kowalski. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 6.8–17.0s | אתם צריכים להתקין skill שנקרא Kowalski. הסקיל הזה בעצם הופך  | collisions | div.row on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 6.8–17.0s | אתם צריכים להתקין skill שנקרא Kowalski. הסקיל הזה בעצם הופך  | collisions | #s2 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 6.8–7.8s | אתם צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | no placeholders | scr2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.9–9.3s | skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.4–9.9s | Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.9–17.2s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/hooks/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
