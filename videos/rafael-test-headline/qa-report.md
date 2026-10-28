# QA · rafael-test-headline · theme `headline`

**5/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.71 | >= 1.19 |
| ✗ | flat stretches | 37.3% | <= 16.0% |
| ✓ | actions / s | 0.58 events/s (GSAP 2.75 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 76%, 4 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 2 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 2 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.08 px/frame, 10 punches, 10 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 7.9–8.8s | קלוד? | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 8.9–9.7s | אז אני עכשיו הולך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.0–9.8s | אז אני עכשיו הולך לספר | hero fill | fill 28%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 10.5–11.9s | תישארו עד הסוף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 17.8–18.2s | שלב שני | hero fill | fill 48%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 21.5–22.0s | וזה השלב הכי | no placeholders | w5: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 21.6–22.5s | השלב הכי חשוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 22.2–23.5s | חשוב תתקינו בקלוד | no placeholders | w5: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 22.6–23.8s | תתקינו בקלוד את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 24.3–25.1s | שלי. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 28.5–29.0s | הסקיל הזה | hero fill | fill 57%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 29.8–30.2s | לקלוד לערוך | graphic overlaps | #b7 overlaps #p7a (22% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 31.2–32.0s | ברמה מטורפת. בתוך | graphic overlaps | #b7 overlaps #p7b (29% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 35.3–36.9s | ולפי העיצובים האלה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 37.1–39.0s | יודע איך לערוך לכם את זה ברמה שעורכי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 39.0–39.8s | התוכן הכי גדולים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 57.8–58.2s | וכמובן אם אתם | hero fill | fill 54%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 58.5–59.4s | רוצים ללמוד איך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 62.8–65.0s | להשתמש ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
