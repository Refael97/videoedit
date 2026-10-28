# QA · rafael-test-night · theme `night`

**8/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 0.89 | >= 0.79 |
| ✗ | flat stretches | 41.0% | <= 12.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 2.2 tweens/s) | 0.44–0.81 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 84%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 2 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.13 px/frame, 4 punches, 9 drifts (anchor: jitter 0.16 px/frame, 16.1 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–1.3s | אתם מכירים את זה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 3.2–5.3s | ואומרים לכם שערוך את זה עם קלוד? אבל אתם אומרים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.2–7.8s | עורך סרטון ברמה כזאת עם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 11.1–12.1s | הסוף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 25.7–26.7s | הסקיל תגיבו | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 35.5–36.9s | ולפי העיצובים האלה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 39.6–40.6s | גדולים משתמשים. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 44.2–45.6s | משלוש מאות ארבע מאות צפיות | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 47.6–48.6s | אלפים. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 55.4–56.9s | skill וזה בדרך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 60.2–61.3s | בצורה מקצועית עם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.0–66.2s | כנסו אליי לאתר. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 67.0–68.5s | קורסים בדיוק בשבילכם, אל | no placeholders | prof10: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 67.0–68.5s | קורסים בדיוק בשבילכם, אל | no placeholders | div: image with almost no detail (grey box?): use a real frame / screenshot |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
