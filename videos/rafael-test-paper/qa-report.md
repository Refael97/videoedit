# QA · rafael-test-paper · theme `paper`

**7/12 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.56 | >= 0.69 |
| ✗ | flat stretches | 60.0% (full frame 44.4%) | <= 20.0% |
| ✗ | max static hold | 2.43 s | <= 0.9 s |
| ✓ | actions / s | 0.47 events/s (GSAP 1.92 tweens/s) | 0.36–0.66 |
| ✓ | payoff lands | 3 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✗ | hero fill | median 98%, 1 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✗ | facts on screen | 2 unsourced | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.1 px/frame, 3 punches, 7 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.9s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 2.1–4.5s | סרטונים ברשתות ואומרים לכם שערוך את זה עם קלוד? | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 2.1–4.5s | סרטונים ברשתות ואומרים לכם שערוך את זה עם קלוד? | max static hold | held still 2.4 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.2–7.2s | עורך סרטון ברמה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 6.2–7.2s | עורך סרטון ברמה | max static hold | held still 1.1 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 7.9–8.9s | קלוד? | max static hold | held still 1.0 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 17.0–17.8s | רוצים. שלב | facts on screen | '00:04' is not in data/facts.yaml or the transcript: take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it |
| 18.5–20.8s | תעלו את הסרטון הזה לקלוד. שלב | facts on screen | '70' is not in data/facts.yaml or the transcript: take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it |
| 21.1–22.5s | שלישי וזה השלב הכי חשוב | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 21.1–22.5s | שלישי וזה השלב הכי חשוב | max static hold | held still 1.4 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 22.5–23.8s | תתקינו בקלוד את | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 22.5–23.8s | תתקינו בקלוד את | max static hold | held still 1.3 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 23.9–25.0s | הסקיל שלי. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 23.9–25.0s | הסקיל שלי. | max static hold | held still 1.1 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 34.1–35.3s | סוגי עיצובים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 34.1–35.3s | סוגי עיצובים | max static hold | held still 1.2 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 41.6–42.7s | בסקיל הזה וזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 41.6–42.7s | בסקיל הזה וזה | max static hold | held still 1.1 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 43.3–44.8s | הצפיות משלוש מאות | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 43.3–44.8s | הצפיות משלוש מאות | max static hold | held still 1.5 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 55.1–56.5s | המילה skill וזה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 55.1–56.5s | המילה skill וזה | max static hold | held still 1.4 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 58.4–59.4s | רוצים ללמוד איך | max static hold | held still 1.0 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 59.5–60.6s | לערוך וידאו בצורה | max static hold | held still 1.2 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 62.5–64.7s | להשתמש ב-Higgsfield ועוד, | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 62.5–64.7s | להשתמש ב-Higgsfield ועוד, | max static hold | held still 2.2 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.1–66.2s | כנסו אליי לאתר. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 65.1–66.2s | כנסו אליי לאתר. | max static hold | held still 1.1 s (anchor never holds > 0.9 s): add a build-up event, secondary motion or a camera move (push / punch) here |
| 70.5–71.0s |  | hero fill | fill 60%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
