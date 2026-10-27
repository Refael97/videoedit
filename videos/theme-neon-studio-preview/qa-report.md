# QA · theme-neon-studio-preview · theme `neon-studio`

**3/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 2.29 | >= 4.05 |
| ✗ | flat stretches | 21.0% | <= 19.0% |
| ✗ | actions / s | 0.47 events/s (GSAP 1.22 tweens/s) | 0.73–1.35 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 74%, 1 weak ranges | >= 60% |
| ✗ | collisions | 6 collisions | 0 |
| ✗ | no placeholders | 10 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 1.5–3.0s | אתרים שנראים טוב עם | no placeholders | med0: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 1.5–3.0s | אתרים שנראים טוב עם | no placeholders | site warm: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 1.5–3.0s | אתרים שנראים טוב עם | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 2.3–2.8s | טוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 2.9–6.6s | עם motion, מעברים ומבנה כמו שצריך, | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 3.2–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | hero fill | fill 15%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 6.6–9.9s | שצריך, אתם צריכים להתקין skill שנקרא Kowalski. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 7.0–8.5s | צריכים להתקין skill שנקרא | collisions | div.s-prog on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | collisions | #card2 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | collisions | div.s-page on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 7.0–10.0s | צריכים להתקין skill שנקרא Kowalski. הסקיל | no placeholders | card2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.2–7.8s | להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.9–8.3s | skill | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.3–8.7s | שנקרא | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.5–9.0s | שנקרא Kowalski. | collisions | #bar2 on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 8.8–9.9s | Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.2–11.2s | הסקיל הזה בעצם הופך | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.2–11.2s | הסקיל הזה בעצם הופך | no placeholders | med3a: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 10.2–11.2s | הסקיל הזה בעצם הופך | no placeholders | site plain: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.5–13.0s | האתר שלכם למטורף. | no placeholders | img: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.5–13.0s | האתר שלכם למטורף. | no placeholders | med3b: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.5–13.0s | האתר שלכם למטורף. | no placeholders | site bold: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 12.2–13.0s | למטורף. | collisions | caption 'למטורף' on seam: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 12.4–12.9s | למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.0–13.5s | כל מה | collisions | caption span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 13.3–17.2s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח לכם את זה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/neon-studio/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
