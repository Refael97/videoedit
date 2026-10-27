# QA · theme-hooks-preview · theme `hooks`

**9/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | graphics motion | 1.56 | >= 0.53 |
| ✓ | flat stretches | 23.9% | <= 34.0% |
| ✓ | actions / s | 0.82 events/s (GSAP 2.56 tweens/s) | 0.48–0.9 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 83%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 3 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.32 px/frame, 2 punches, 3 drifts (anchor: jitter 0.30 px/frame, 26.2 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.5–3.0s | אתם רוצים לבנות אתרים שנראים טוב עם | graphic overlaps | #th1 overlaps #th2 (9% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 0.8–3.0s | רוצים לבנות אתרים שנראים טוב עם | graphic overlaps | #th2 overlaps #th3 (9% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 15.2–17.2s | ואני שולח לכם את זה. | graphic overlaps | span.glw overlaps span.sub (25% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/hooks/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
