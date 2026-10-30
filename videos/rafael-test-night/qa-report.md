# QA · rafael-test-night · theme `night`

**11/12 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.03 | >= 0.8 |
| ✓ | flat stretches | 10.5% (full frame 30.9%) | <= 29.0% |
| ✓ | max static hold | 0.93 s | <= 2.6 s |
| ✓ | actions / s | 0.59 events/s (GSAP 2.3 tweens/s) | 0.44–0.81 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 84%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✓ | graphic overlaps | 0 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✗ | facts on screen | 3 unsourced | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.14 px/frame, 4 punches, 10 drifts (anchor: jitter 0.16 px/frame, 16.1 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 18.8–20.8s | תעלו את הסרטון הזה לקלוד. שלב | facts on screen | '70' is not in data/facts.yaml or the transcript: take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it |
| 24.0–25.2s | הסקיל שלי. מי | facts on screen | '10' is not in data/facts.yaml or the transcript: take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it |
| 43.2–48.8s | הצפיות משלוש מאות ארבע מאות צפיות לסרטון לעשרות אלפים. חבר'ה | facts on screen | '5K' is not in data/facts.yaml or the transcript: take it from facts.yaml (add it there only if it is true and the user confirmed it) or remove it |

_targets measured on the anchor (`themes/night/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 283/283 samples_
