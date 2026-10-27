# QA · theme-paper-preview · theme `paper`

**5/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.84 | >= 2.22 |
| ✗ | flat stretches | 27.2% | <= 19.0% |
| ✓ | actions / s | 0.41 events/s (GSAP 2.91 tweens/s) | 0.32–0.6 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 77% | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✗ | no placeholders | 3 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–17.0s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | collisions | #flash on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 0.0–0.2s | אם | no placeholders | svg: image with almost no detail (grey box?): use a real frame / screenshot |
| 3.4–3.8s | motion, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.8–5.8s | מעברים ומבנה | no placeholders | scr1: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 5.4–5.9s | ומבנה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.9–7.8s | צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.0–9.2s | צריכים להתקין skill שנקרא Kowalski. | no placeholders | term2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 7.9–9.0s | skill שנקרא Kowalski. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 10.3–11.1s | הסקיל הזה בעצם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.4–13.3s | למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
