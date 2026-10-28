# QA · rafael-test-night · theme `night`

**9/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.03 | >= 0.79 |
| ✗ | flat stretches | 30.9% | <= 12.0% |
| ✓ | actions / s | 0.59 events/s (GSAP 2.3 tweens/s) | 0.44–0.81 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 84%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.14 px/frame, 4 punches, 10 drifts (anchor: jitter 0.16 px/frame, 16.1 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 6.9–7.8s | ברמה כזאת עם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.0–8.8s | קלוד? | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.6–10.3s | הולך לספר לכם, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 19.8–20.6s | לקלוד. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 26.9–27.8s | פה את המילה סקיל. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 36.9–38.4s | קלוד יודע איך לערוך לכם את זה ברמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 38.4–39.4s | ברמה שעורכי התוכן הכי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 43.4–44.2s | הצפיות משלוש | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 44.4–45.3s | משלוש מאות ארבע מאות | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 47.6–48.5s | אלפים. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 60.2–61.0s | בצורה מקצועית | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.0–66.1s | כנסו אליי לאתר. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
