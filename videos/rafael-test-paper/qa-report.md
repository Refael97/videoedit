# QA · rafael-test-paper · theme `paper`

**5/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.52 | >= 0.69 |
| ✗ | flat stretches | 46.7% | <= 19.0% |
| ✓ | actions / s | 0.45 events/s (GSAP 1.66 tweens/s) | 0.36–0.66 |
| ✓ | payoff lands | 3 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 100%, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 1 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 5 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.09 px/frame, 2 punches, 7 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.8–4.8s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | graphic overlaps | #hook overlaps #reel0 (8% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 1.0–2.0s | מכירים את זה שאתם רואים סרטונים | no placeholders | reel0: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 13.3–14.5s | את עצמכם מדברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 14.5–16.0s | למצלמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 18.2–19.0s | שני תעלו את הסרטון | no placeholders | chat4: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 21.2–22.0s | שלישי וזה השלב הכי | no placeholders | term5: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 22.5–23.8s | תתקינו בקלוד את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 23.9–25.2s | הסקיל שלי. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 32.1–33.5s | בתוך הסקיל יצרתי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 38.0–38.5s | את זה ברמה | no placeholders | t88: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 38.0–38.5s | את זה ברמה | no placeholders | v88: image with almost no detail (grey box?): use a real frame / screenshot |
| 58.4–59.4s | רוצים ללמוד איך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 60.7–61.7s | מקצועית עם motion | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 62.5–65.1s | להשתמש ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.1–66.2s | כנסו אליי לאתר. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 66.8–68.4s | קורסים בדיוק בשבילכם, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 69.5–70.9s | חבר'ה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 70.5–71.0s |  | hero fill | fill 48%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
