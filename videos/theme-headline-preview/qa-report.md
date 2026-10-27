# QA · theme-headline-preview · theme `headline`

**3/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.16 | >= 2.8 |
| ✗ | flat stretches | 31.8% | <= 16.0% |
| ✗ | actions / s | 0.29 events/s (GSAP 2.27 tweens/s) | 0.35–0.65 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✗ | min text | 1 items < 26px | >= 26px |
| ✓ | hero fill | n/a | >= 60% |
| ✗ | collisions | 36 collisions | 0 |
| ✗ | no placeholders | 7 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–2.9s | אם אתם רוצים לבנות אתרים שנראים טוב | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 0.0–0.5s | אם אתם | collisions | caption div.h-cap on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.0–6.8s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | no placeholders | air: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 0.2–16.8s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | collisions | caption span.h-acc on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.2–13.0s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | collisions | #ctaK on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.2–1.2s | אם אתם רוצים לבנות אתרים | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.5–1.0s | אתם רוצים לבנות | collisions | caption 'אם' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 0.5–1.0s | אתם רוצים לבנות | collisions | caption 'אתם' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 0.8–1.0s | רוצים לבנות | collisions | caption 'רוצים' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 1.0–2.2s | לבנות אתרים שנראים טוב | collisions | caption 'לבנות' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 1.0–1.8s | לבנות אתרים שנראים | collisions | #ctaL on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 1.2–2.2s | אתרים שנראים טוב | collisions | caption 'אתרים' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 1.2–3.0s | אתרים שנראים טוב עם | collisions | #s0 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 1.2–3.0s | אתרים שנראים טוב עם | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 1.8–2.2s | שנראים טוב | collisions | caption 'שנראים' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 2.0–4.5s | שנראים טוב עם motion, מעברים | collisions | #ctaL on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 2.5–4.5s | טוב עם motion, מעברים | collisions | caption 'טוב' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 2.9–6.6s | עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 3.0–4.5s | עם motion, מעברים | collisions | caption 'עם' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 3.0–4.0s | עם motion, | collisions | #s1 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 3.2–4.5s | motion, מעברים | collisions | caption 'motion' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 4.2–6.0s | מעברים ומבנה | collisions | #s1 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 4.5–7.2s | מעברים ומבנה כמו שצריך, אתם צריכים להתקין | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 4.8–6.2s | מעברים ומבנה כמו שצריך, | collisions | caption 'מעברים' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 5.5–6.2s | ומבנה כמו שצריך, | collisions | caption 'ומבנה' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 6.2–6.8s | שצריך, אתם | collisions | caption 'שצריך' on air: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 6.6–9.9s | שצריך, אתם צריכים להתקין skill שנקרא Kowalski. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 6.6–7.8s | אתם צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.8–10.0s | אתם צריכים להתקין skill שנקרא Kowalski. הסקיל | min text | 'claude — my-site' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 6.8–7.5s | אתם צריכים להתקין | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | no placeholders | w2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.2–7.8s | להתקין | collisions | #ctaL on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.8–8.5s | skill שנקרא | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.9–9.9s | skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.0–8.8s | skill שנקרא | collisions | #ctaL on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 8.8–9.8s | Kowalski. | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 8.8–10.2s | Kowalski. הסקיל | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 9.9–12.1s | הסקיל הזה בעצם הופך את האתר שלכם | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 10.0–10.5s | הסקיל הזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.0–10.8s | הסקיל הזה בעצם | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 10.5–11.0s | הזה בעצם | collisions | caption div.h-cap on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 10.6–11.1s | הזה בעצם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.8–11.8s | בעצם הופך את האתר | collisions | #ctaL on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 10.8–11.2s | בעצם הופך | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.8–11.2s | בעצם הופך | no placeholders | w3a: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.8–11.2s | בעצם הופך | no placeholders | site plain: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.4–12.1s | את האתר שלכם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 11.5–13.0s | האתר שלכם למטורף. | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 11.5–13.0s | האתר שלכם למטורף. | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.8–12.5s | שלכם למטורף. | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 12.3–12.9s | למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.8–17.0s | למטורף. כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם | collisions | #page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 12.9–17.2s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 13.0–17.0s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | collisions | #lab3b on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 13.2–17.0s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | collisions | caption div.h-cap on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
