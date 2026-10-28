# QA · rafael-test-headline · theme `headline`

**3/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.47 | >= 1.19 |
| ✗ | flat stretches | 42.2% | <= 16.0% |
| ✗ | actions / s | 0.37 events/s (GSAP 1.95 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 52%, 4 weak ranges | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✗ | graphic overlaps | 1 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.08 px/frame, 3 punches, 6 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.4–4.7s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 4.7–8.9s | אבל אתם אומרים איך לעזאזל אני עורך סרטון ברמה כזאת עם קלוד? | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 8.9–12.1s | אז אני עכשיו הולך לספר לכם, תישארו עד הסוף. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 9.0–12.2s | אז אני עכשיו הולך לספר לכם, תישארו עד הסוף. שלב | hero fill | fill 15%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 10.4–12.1s | תישארו עד הסוף. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 12.1–17.6s | שלב הראשון תצלמו את עצמכם מדברים למצלמה על נושא שאתם רוצים. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 17.6–20.6s | שלב שני תעלו את הסרטון הזה לקלוד. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 17.8–21.2s | שלב שני תעלו את הסרטון הזה לקלוד. שלב שלישי | hero fill | fill 30%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 18.1–19.7s | שני תעלו את הסרטון הזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 20.6–25.1s | שלב שלישי וזה השלב הכי חשוב תתקינו בקלוד את הסקיל שלי. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 21.5–24.0s | וזה השלב הכי חשוב תתקינו בקלוד את הסקיל | no placeholders | w5: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 21.6–23.8s | השלב הכי חשוב תתקינו בקלוד את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 23.9–25.1s | הסקיל שלי. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 25.1–28.3s | מי שרוצה את הסקיל תגיבו פה את המילה סקיל. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 28.5–32.2s | הסקיל הזה מאפשר לקלוד לערוך לכם את הסרטון ברמה מטורפת. בתוך | hero fill | fill 25%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 28.9–31.9s | הזה מאפשר לקלוד לערוך לכם את הסרטון ברמה מטורפת. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 30.5–31.5s | את הסרטון ברמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 33.8–38.2s | עשרות סוגי עיצובים ולפי העיצובים האלה קלוד יודע איך לערוך לכ | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 33.8–35.3s | עשרות סוגי עיצובים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 35.3–36.9s | ולפי העיצובים האלה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 36.9–38.2s | קלוד יודע איך לערוך לכם את זה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 40.9–47.4s | משתמש בס- בסקיל הזה וזה הקפיץ לי את הצפיות משלוש מאות ארבע מ | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 48.6–51.0s | חבר'ה הסקיל הזה הוא משנה חיים וגם | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 51.0–53.7s | וגם חוסך לכם הרבה זמן. אז כל מה שאתם צריכים לעשות | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 53.7–55.7s | לעשות זה להגיב לי פה את המילה skill | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 54.5–57.8s | להגיב לי פה את המילה skill וזה בדרך אליכם. וכמובן | collisions | span.w on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 54.8–57.8s | פה את המילה skill וזה בדרך אליכם. וכמובן | graphic overlaps | #ctaK overlaps span.w (27% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 57.5–65.0s | וכמובן אם אתם רוצים ללמוד איך לערוך וידאו בצורה מקצועית עם m | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 57.8–65.2s | וכמובן אם אתם רוצים ללמוד איך לערוך וידאו בצורה מקצועית עם m | hero fill | fill 33%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 58.4–59.4s | רוצים ללמוד איך | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 60.7–61.7s | מקצועית עם motion | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 61.7–65.0s | graphics, להשתמש ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.3–68.7s | כנסו אליי לאתר. יש לי שמה קורסים בדיוק בשבילכם, אל תישארו | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |
| 68.7–70.9s | תישארו מאחור חבר'ה. | actions / s | nothing happens here: act on the hero (mark, tick, fill, count, cursor, punch) at least every ~0.7 s |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
