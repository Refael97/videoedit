# QA · skill-reel-headline · theme `headline`

**17/20 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.26 | >= 1.19 |
| ✓ | flat stretches | 2.9% (full frame 9.3%) | <= 17.0% |
| ✓ | max static hold | 0.43 s | <= 0.9 s |
| ✓ | actions / s | 0.54 events/s (GSAP 6.08 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 2 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 84%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | facts on screen | 0 unsourced | 0 |
| ✓ | signature effects | no signature effects | — |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |
| ✗ | footage match | garment vs background 97.818 (>= 106.4: the clothes melt into the wall) | theme.md → Look targets |
| ✓ | hero scale | median 0.90, 0 weak stretches | median >= 0.68, never < 0.56 for 1 s |
| ✓ | content density | median 0.39, 0 weak stretches | median >= 0.371, never < 0.272 for 1 s |
| ✓ | full-face rhythm | 35% full face, longest gap 13.5 s | >= 9%, gap <= 50.2 s |
| ✗ | material & light | accent saturation 88.806 (>= 89) | theme.md → Look targets |
| ✗ | text contrast | 1 low-contrast texts | >= 4.5:1 (>= 3:1 from 48px) |
| ✓ | Hebrew typography | 0 slanted Hebrew, 0 mixed faces | 0 |

footage motion (info, not scored): camera jitter 0.2 px/frame, 9 punches, 12 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–55.5s | לערוך סרטונים עם קלוד יכול להיות מאוד מתסכל וארוך וגם יכול ל | footage match | garment vs background 97.818 (>= 106.4: the clothes melt into the wall): the footage is a different world from the anchor: run scripts/footage_prep.py <project> (grade, background, crop to the anchor's face size) and use its output; if it reports RESHOOT, send the user the theme README's 'How to shoot for this theme' before editing |
| 0.0–55.5s | לערוך סרטונים עם קלוד יכול להיות מאוד מתסכל וארוך וגם יכול ל | material & light | accent saturation 88.806 (>= 89): flat fills: give the hero the theme's material (language.md → Material & light: gradient span, highlight, glow, accent saturation) |
| 34.0–35.8s | התוצאה המושלמת בלי שאתם | text contrast | 'כל אלמנט' 1.0:1: the text is too close to its background: use the theme's ink on its surface (>= 4.5:1, >= 3:1 from 48px), or mark deliberate decoration with data-qa-decor |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 221/221 samples_
