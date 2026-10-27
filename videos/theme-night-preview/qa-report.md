# QA · theme-night-preview · theme `night`

**8/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 0.95 | >= 0.79 |
| ✗ | flat stretches | 21.9% | <= 12.0% |
| ✓ | actions / s | 0.64 events/s (GSAP 4.02 tweens/s) | 0.44–0.81 |
| ✓ | payoff lands | 4 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 74%, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.2 px/frame, 2 punches, 3 drifts (anchor: jitter 0.16 px/frame, 16.1 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 2.0–2.8s | שנראים טוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 4.1–4.7s | מעברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.9–7.4s | צריכים להתקין | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.2–9.8s | Kowalski. | hero fill | fill 5%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 10.0–11.1s | הסקיל הזה בעצם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.2–12.9s | למטורף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
