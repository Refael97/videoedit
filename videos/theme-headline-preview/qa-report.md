# QA · theme-headline-preview · theme `headline`

**3/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.16 | >= 2.8 |
| ✗ | flat stretches | 31.8% | <= 16.0% |
| ✗ | actions / s | 0.29 events/s (GSAP 2.27 tweens/s) | 0.35–0.65 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✗ | min text | 1 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✗ | collisions | 2 collisions | 0 |
| ✗ | no placeholders | 6 found | 0 |
| ✓ | hook visual | visual on screen 2.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–2.9s | אם אתם רוצים לבנות אתרים שנראים טוב | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 1.2–3.0s | אתרים שנראים טוב עם | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 2.9–6.6s | עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 6.6–9.9s | שצריך, אתם צריכים להתקין skill שנקרא Kowalski. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 6.6–7.8s | אתם צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.8–10.0s | אתם צריכים להתקין skill שנקרא Kowalski. הסקיל | min text | 'claude — my-site' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | no placeholders | w2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.9–9.9s | skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.9–12.1s | הסקיל הזה בעצם הופך את האתר שלכם | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 10.0–10.5s | הסקיל הזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.6–11.1s | הזה בעצם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.8–11.2s | בעצם הופך | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.8–11.2s | בעצם הופך | no placeholders | w3a: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.8–11.2s | בעצם הופך | no placeholders | site plain: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.4–12.1s | את האתר שלכם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 11.5–13.0s | האתר שלכם למטורף. | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.8–12.5s | שלכם למטורף. | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 12.2–13.5s | למטורף. כל מה | collisions | caption span.h-acc on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 12.3–12.9s | למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.9–17.2s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
