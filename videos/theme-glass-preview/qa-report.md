# QA · theme-glass-preview · theme `glass`

**5/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.78 | >= 3.36 |
| ✗ | flat stretches | 34.3% | <= 2.0% |
| ✗ | actions / s | 0.48 events/s (GSAP 3.72 tweens/s) | 0.17–0.32 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | n/a | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | no placeholders | 0 found | 0 |
| ✗ | hook visual | visual on screen 0.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | actions / s | too busy: merge or drop events so each lands on a word |
| 0.0–3.0s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: | hook visual | open on a visual (the result, the thing itself, real thumbnails), not text alone |
| 0.9–1.3s | את הסרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 2.2–2.8s | את האפקטים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 3.9–5.0s | מסלול. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.3–8.8s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.5–10.8s | חד. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 11.8–13.0s | קופצת. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.9–15.0s | כותרות. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 18.0–18.5s | צמיחה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/glass/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 74/74 samples_
