# QA · rafael-test-headline · theme `headline`

**7/11 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.77 | >= 1.19 |
| ✗ | flat stretches | 35.8% (full frame 30.6%) | <= 17.0% |
| ✗ | max static hold | 2.76 s | <= 0.9 s |
| ✓ | actions / s | 0.61 events/s (GSAP 2.96 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 76%, 4 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.1 px/frame, 11 punches, 9 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 5.4–6.8s | איך לעזאזל אני עורך סרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 5.4–6.8s | איך לעזאזל אני עורך סרטון | max static hold | held still 1.5 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.0–9.8s | אז אני עכשיו הולך לספר | hero fill | fill 28%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 12.4–14.5s | הראשון תצלמו את עצמכם מדברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.4–14.5s | הראשון תצלמו את עצמכם מדברים | max static hold | held still 2.1 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 14.7–15.9s | למצלמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 14.7–15.9s | למצלמה | max static hold | held still 1.2 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 17.8–18.2s | שלב שני | hero fill | fill 50%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 18.2–18.8s | שני תעלו | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 20.8–21.2s | שלב שלישי | hero fill | fill 37%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 30.5–31.2s | לכם את הסרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 34.4–35.3s | עיצובים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 34.4–35.3s | עיצובים | max static hold | held still 0.9 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 37.2–39.9s | יודע איך לערוך לכם את זה ברמה שעורכי התוכן הכי גדולים משתמשי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 37.2–39.9s | יודע איך לערוך לכם את זה ברמה שעורכי התוכן הכי גדולים משתמשי | max static hold | held still 2.8 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 41.1–42.4s | משתמש בס- בסקיל הזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 41.1–42.4s | משתמש בס- בסקיל הזה | max static hold | held still 1.3 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 42.9–43.8s | הקפיץ לי את הצפיות | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 44.0–45.6s | משלוש מאות ארבע מאות צפיות | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 44.0–45.6s | משלוש מאות ארבע מאות צפיות | max static hold | held still 1.6 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 45.6–46.4s | לסרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 56.6–57.5s | בדרך אליכם. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 56.6–57.5s | בדרך אליכם. | max static hold | held still 1.0 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 57.8–58.2s | וכמובן אם אתם | hero fill | fill 54%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
