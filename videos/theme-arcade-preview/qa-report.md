# QA · theme-arcade-preview · theme `arcade`

**3/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.3 | >= 2.39 |
| ✗ | flat stretches | 15.7% | <= 15.0% |
| ✗ | actions / s | 0.35 events/s (GSAP 3.44 tweens/s) | 0.71–1.33 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 63% | >= 60% |
| ✗ | collisions | 5 collisions | 0 |
| ✗ | no placeholders | 6 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–6.8s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | collisions | rect. on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.0–0.2s | אם | no placeholders | svg: image with almost no detail (grey box?): use a real frame / screenshot |
| 0.1–2.9s | אם אתם רוצים לבנות אתרים שנראים טוב | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 2.9–6.6s | עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 3.5–4.0s | motion, | no placeholders | m1: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 4.2–6.2s | מעברים ומבנה כמו שצריך, | no placeholders | m1: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 4.8–5.2s | מעברים | no placeholders | pgB: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 6.6–9.9s | שצריך, אתם צריכים להתקין skill שנקרא Kowalski. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 7.0–7.8s | צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.0–7.5s | צריכים להתקין | no placeholders | hud2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.9–8.9s | skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.1–9.9s | Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.9–12.9s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 10.0–17.0s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. כל מה שאתם צריכים ל | collisions | rect. on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 10.0–14.2s | הסקיל הזה בעצם הופך את האתר שלכם למטורף. כל מה שאתם צריכים ל | collisions | svg. on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 12.2–13.0s | למטורף. | no placeholders | aft: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 14.5–17.2s | זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 14.5–17.2s | להגיב לי פה ואני שולח לכם את זה. | hero fill | fill 48%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |
| 14.5–15.5s | להגיב לי פה ואני שולח | collisions | svg. on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 16.2–16.8s | זה. | collisions | svg. on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |

_targets measured on the anchor (`themes/arcade/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
