# QA · theme-paper-preview · theme `paper`

**7/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.5 | >= 0.69 |
| ✓ | flat stretches | 17.1% | <= 19.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 2.97 tweens/s) | 0.36–0.66 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | median 80%, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 11 overlaps | 0 (unless in one data-qa-stack) |
| ✗ | no placeholders | 1 found | 0 |
| ✓ | hook visual | visual on screen 2.5s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.17 px/frame, 0 punches, 1 drifts (anchor: jitter 0.16 px/frame, 9.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 3.2–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #scr1 overlaps svg. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 3.5–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | graphic overlaps | span.nav1 overlaps svg. (91% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 3.5–5.0s | motion, מעברים | graphic overlaps | #h1a overlaps svg. (91% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 3.5–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #sub1 overlaps svg. (93% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 3.5–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | graphic overlaps | div.img overlaps svg. (89% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 3.5–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | graphic overlaps | svg. overlaps svg. (91% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.0–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #h1b overlaps svg. (79% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.5–6.8s | ומבנה כמו שצריך, אתם | graphic overlaps | span.blk overlaps svg. (99% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 7.2–8.2s | להתקין skill | no placeholders | term2: uniform / mostly empty panel (content covers < 40% of it): fill it with the real content, or make the panel hug its content |
| 11.5–13.5s | האתר שלכם למטורף. כל מה | graphic overlaps | svg. overlaps svg. (25% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.8–13.5s | שלכם למטורף. כל מה | graphic overlaps | b. overlaps svg. (17% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.8–13.5s | שלכם למטורף. כל מה | graphic overlaps | #sc2 overlaps svg. (26% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/paper/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
