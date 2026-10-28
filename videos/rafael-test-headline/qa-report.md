# QA · rafael-test-headline · theme `headline`

**5/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.77 | >= 1.19 |
| ✗ | flat stretches | 30.8% | <= 16.0% |
| ✓ | actions / s | 0.59 events/s (GSAP 2.96 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 76%, 4 weak ranges | >= 60% |
| ✗ | collisions | 6 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.11 px/frame, 12 punches, 10 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 7.9–8.6s | קלוד? | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.0–9.8s | אז אני עכשיו הולך לספר | hero fill | fill 28%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 9.5–10.2s | הולך לספר לכם, | no placeholders | w2: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 17.8–18.2s | שלב שני | hero fill | fill 50%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 17.8–18.9s | שלב שני תעלו את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 20.8–21.2s | שלב שלישי | hero fill | fill 37%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 21.6–22.5s | השלב הכי חשוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 22.5–23.7s | תתקינו בקלוד | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 27.0–27.7s | את המילה סקיל. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 28.7–29.4s | הסקיל הזה מאפשר | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 33.7–35.3s | עשרות סוגי עיצובים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 38.1–39.0s | זה ברמה שעורכי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 39.0–39.2s | התוכן | collisions | caption 'זה' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.0–39.2s | התוכן | collisions | caption 'ברמה' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.0–39.2s | התוכן | collisions | caption 'שעורכי' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.2–40.0s | התוכן הכי גדולים משתמשים. | collisions | caption 'התוכן' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.5–40.0s | הכי גדולים משתמשים. | collisions | caption 'הכי' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 39.8–40.0s | גדולים משתמשים. | collisions | caption 'גדולים' on nm: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 57.8–58.2s | וכמובן אם אתם | hero fill | fill 54%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 58.4–59.4s | רוצים ללמוד איך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 61.7–62.5s | graphics, להשתמש | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 63.1–64.8s | ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
