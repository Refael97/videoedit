# QA · rafael-test-headline · theme `headline`

**19/20 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.31 | >= 1.19 |
| ✓ | flat stretches | 2.4% (full frame 18.9%) | <= 17.0% |
| ✓ | max static hold | 0.53 s | <= 0.9 s |
| ✓ | actions / s | 0.75 events/s (GSAP 3.79 tweens/s) | 0.45–0.83 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 86%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | facts on screen | 0 unsourced | 0 |
| ✓ | signature effects | no signature effects | — |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |
| ✗ | footage match | contrast 167.877 (>= 174); garment vs background 10.638 (>= 106.4: the clothes melt into the wall) | theme.md → Look targets |
| ✓ | hero scale | median 0.85, 0 weak stretches | median >= 0.68, never < 0.56 for 1 s |
| ✓ | content density | median 0.41, 0 weak stretches | median >= 0.371, never < 0.272 for 1 s |
| ✓ | full-face rhythm | 17% full face, longest gap 28.5 s | >= 9%, gap <= 50.2 s |
| ✓ | material & light | span 148.723, glow -6.252, accent 199.588 | theme.md → Look targets |
| ✓ | text contrast | 0 low-contrast texts | >= 4.5:1 (>= 3:1 from 48px) |
| ✓ | Hebrew typography | 0 slanted Hebrew, 0 mixed faces | 0 |

footage motion (info, not scored): camera jitter 0.21 px/frame, 15 punches, 17 drifts (anchor: jitter 0.22 px/frame, 26.3 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–70.3s | אתם מכירים את זה שאתם רואים סרטונים ברשתות ואומרים לכם שערוך | footage match | contrast 167.877 (>= 174); garment vs background 10.638 (>= 106.4: the clothes melt into the wall): the footage is a different world from the anchor: run scripts/footage_prep.py <project> (grade, background, crop to the anchor's face size) and use its output; if it reports RESHOOT, send the user the theme README's 'How to shoot for this theme' before editing |

_targets measured on the anchor (`themes/headline/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 281/281 samples_
