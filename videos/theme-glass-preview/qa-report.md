# QA · theme-glass-preview · theme `glass`

**5/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.97 | >= 3.36 |
| ✗ | flat stretches | 27.5% | <= 2.0% |
| ✗ | actions / s | 0.48 events/s (GSAP 3.93 tweens/s) | 0.17–0.32 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | actions / s | too busy: merge or drop events so each lands on a word |
| 2.2–2.8s | את האפקטים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.0–5.0s | מסלול. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.3–8.8s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.8–10.6s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.0–12.9s | קופצת. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.8–14.5s | כותרות. | collisions | #side on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 13.9–15.0s | כותרות. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 18.0–18.5s | צמיחה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/glass/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 74/74 samples_
