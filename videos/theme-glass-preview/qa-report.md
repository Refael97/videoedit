# QA · theme-glass-preview · theme `glass`

**5/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.44 | >= 0.7 |
| ✗ | flat stretches | 27.5% | <= 2.0% |
| ✗ | actions / s | 0.65 events/s (GSAP 3.93 tweens/s) | 0.33–0.6 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✗ | graphic overlaps | 1 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.12 px/frame, 6 punches, 4 drifts (anchor: jitter 0.40 px/frame, 27.0 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | actions / s | too busy: merge or drop events so each lands on a word |
| 0.2–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | graphic overlaps | span.l1 overlaps span.l2 (18% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–2.8s | את האפקטים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.0–5.0s | מסלול. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.3–8.8s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.8–10.6s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.0–12.9s | קופצת. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.8–14.5s | כותרות. | collisions | #side on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 13.9–15.0s | כותרות. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 18.0–18.5s | צמיחה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/glass/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 74/74 samples_
