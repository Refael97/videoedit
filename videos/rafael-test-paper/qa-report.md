# QA · rafael-test-paper · theme `paper`

**4/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.43 | >= 0.69 |
| ✗ | flat stretches | 47.4% | <= 19.0% |
| ✓ | actions / s | 0.39 events/s (GSAP 1.62 tweens/s) | 0.36–0.66 |
| ✗ | payoff lands | 3 marked, 1 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | full face, 4 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 5 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 4 found | 0 |
| ✓ | hook visual | visual on screen 2.2s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.07 px/frame, 5 punches, 6 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.8–4.8s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | hero fill | fill 14%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 5.0–9.0s | אומרים איך לעזאזל אני עורך סרטון ברמה כזאת עם קלוד? אז | graphic overlaps | #chat1 overlaps div.p-step (12% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 12.5–17.0s | הראשון תצלמו את עצמכם מדברים למצלמה על נושא שאתם רוצים. | hero fill | fill 33%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 12.5–17.8s | הראשון תצלמו את עצמכם מדברים למצלמה על נושא שאתם רוצים. שלב | graphic overlaps | div.p-step overlaps svg. (25% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 13.3–14.5s | את עצמכם מדברים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 14.5–16.0s | למצלמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 16.0–17.0s | על נושא שאתם רוצים. | payoff lands | #tim3 lands at 16.46s, word at 16.94s: retime the count so it ends ON the payoff word (start it on the set-up word) |
| 17.2–17.8s | רוצים. שלב | hero fill | fill 33%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 18.0–20.8s | שני תעלו את הסרטון הזה לקלוד. שלב | graphic overlaps | #chat4 overlaps div.p-step (12% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 18.2–19.0s | שני תעלו את הסרטון | no placeholders | chat4: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 21.2–23.8s | שלישי וזה השלב הכי חשוב תתקינו בקלוד את | no placeholders | term5: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 22.5–23.8s | תתקינו בקלוד את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 23.9–25.2s | הסקיל שלי. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 32.1–33.5s | בתוך הסקיל יצרתי | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 33.8–41.0s | עשרות סוגי עיצובים ולפי העיצובים האלה קלוד יודע איך לערוך לכ | hero fill | fill 21%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 41.2–48.8s | משתמש בס- בסקיל הזה וזה הקפיץ לי את הצפיות משלוש מאות ארבע מ | graphic overlaps | #stat9 overlaps div.p-step (12% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 41.5–44.0s | בס- בסקיל הזה וזה הקפיץ לי את הצפיות משלוש | no placeholders | stat9: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 58.0–71.0s | וכמובן אם אתם רוצים ללמוד איך לערוך וידאו בצורה מקצועית עם m | graphic overlaps | #prof overlaps div.p-step (38% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 58.2–63.0s | אתם רוצים ללמוד איך לערוך וידאו בצורה מקצועית עם motion grap | no placeholders | prof: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 58.4–59.4s | רוצים ללמוד איך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 60.7–61.7s | מקצועית עם motion | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 62.5–65.1s | להשתמש ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.1–66.2s | כנסו אליי לאתר. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 66.8–68.4s | קורסים בדיוק בשבילכם, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 69.5–70.9s | חבר'ה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
