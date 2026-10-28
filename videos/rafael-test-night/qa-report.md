# QA · rafael-test-night · theme `night`

**6/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.73 | >= 0.79 |
| ✗ | flat stretches | 61.1% | <= 12.0% |
| ✓ | actions / s | 0.44 events/s (GSAP 2.1 tweens/s) | 0.44–0.81 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 76%, 2 weak ranges | >= 60% |
| ✗ | collisions | 3 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.11 px/frame, 4 punches, 5 drifts (anchor: jitter 0.16 px/frame, 16.1 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.0–0.8s | אתם | hero fill | fill 55%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 2.7–5.3s | ברשתות ואומרים לכם שערוך את זה עם קלוד? אבל אתם אומרים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 5.5–7.8s | לעזאזל אני עורך סרטון ברמה כזאת עם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.3–16.2s | את עצמכם מדברים למצלמה על | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 16.2–17.6s | נושא שאתם רוצים. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 22.5–24.8s | תתקינו בקלוד את הסקיל שלי. | hero fill | fill 39%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 28.7–30.1s | הסקיל הזה מאפשר לקלוד | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 39.5–39.8s | הכי גדולים | collisions | caption 'הכי' on tl8: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.8–40.0s | גדולים משתמשים. | collisions | caption 'גדולים' on tl8: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 40.0–40.8s | משתמשים. | collisions | caption 'משתמשים' on tl8: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 40.8–43.3s | אני משתמש בס- בסקיל הזה וזה הקפיץ לי את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 44.2–46.2s | משלוש מאות ארבע מאות צפיות לסרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 53.1–54.5s | שאתם צריכים לעשות זה להגיב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 55.4–56.9s | skill וזה בדרך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.8–61.3s | וידאו בצורה מקצועית עם | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 64.8–67.0s | כנסו אליי לאתר. יש לי שמה קורסים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 67.1–68.4s | קורסים בדיוק בשבילכם, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
