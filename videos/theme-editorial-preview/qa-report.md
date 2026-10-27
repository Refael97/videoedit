# QA · theme-editorial-preview · theme `editorial`

**8/10 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | graphics motion | 0.5 | >= 1.26 |
| ✓ | flat stretches | 0.0% | <= 2.0% |
| ✓ | actions / s | 0.52 events/s (GSAP 2.62 tweens/s) | 0.47–0.88 |
| ✓ | payoff lands | 1 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✓ | min text | 0 items < 26px | >= 26px |
| ✓ | hero fill | full face, 0 weak ranges | >= 60% |
| ✓ | collisions | 0 collisions | 0 |
| ✗ | graphic overlaps | 34 overlaps | 0 (unless in one data-qa-stack) |
| ✓ | no placeholders | 0 found | 0 |
| ✓ | hook visual | visual on screen 2.2s of the first 3s | >= 0.5s |

footage motion (info, not scored): camera jitter 0.26 px/frame, 3 punches, 1 drifts (anchor: jitter 0.24 px/frame, 29.4 camera moves/min)

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–17.2s | אם אתם רוצים לבנות אתרים שנראים טוב עם motion, מעברים ומבנה  | motion | more movement in the graphics layer: secondary motion on the hero (dots, sweeps, counters, glow), elements that act on each other, more acts per beat (a push of the whole stage counts as camera, not graphics) |
| 0.8–3.0s | רוצים לבנות אתרים שנראים טוב עם | graphic overlaps | span. overlaps span. (26% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 1.5–3.0s | אתרים שנראים טוב עם | graphic overlaps | #th0 overlaps span.l (59% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 1.5–3.0s | אתרים שנראים טוב עם | graphic overlaps | #sA0 overlaps span.l (59% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 1.5–3.0s | אתרים שנראים טוב עם | graphic overlaps | div.ph overlaps span.l (17% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.0–3.0s | שנראים טוב עם | graphic overlaps | span. overlaps span.e-it (12% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | #sB0 overlaps span.l (59% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | h4. overlaps span.l (20% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | #sA0 overlaps #sB0 (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | #sB0 overlaps h4. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | h4. overlaps h4. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | em. overlaps h4. (83% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | #sB0 overlaps div.ph (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 2.2–3.0s | טוב עם | graphic overlaps | div.ph overlaps div.ph (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 4.8–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #sl1 overlaps #sl2 (7% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 4.8–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #sl1 overlaps span. (7% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 4.8–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | #sl2 overlaps span.in (6% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 4.8–6.8s | מעברים ומבנה כמו שצריך, אתם | graphic overlaps | span. overlaps span.in (6% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.5–6.8s | ומבנה כמו שצריך, אתם | graphic overlaps | #sl2 overlaps #sl3 (5% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.5–6.8s | ומבנה כמו שצריך, אתם | graphic overlaps | #sl3 overlaps span. (5% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.8–6.8s | ומבנה כמו שצריך, אתם | graphic overlaps | span. overlaps span. (5% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 5.8–6.8s | ומבנה כמו שצריך, אתם | graphic overlaps | #sl2 overlaps span. (5% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | h4. overlaps h4. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | em. overlaps h4. (81% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | div.ph overlaps div.ph (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #tA overlaps #tB (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #sA overlaps #tB (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #sA overlaps #sB (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #tB overlaps h4. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #sB overlaps h4. (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #tB overlaps div.ph (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | #sB overlaps div.ph (100% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | div.ph overlaps h4. (33% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | graphic overlaps | div.ph overlaps em. (9% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |
| 12.0–13.0s | שלכם למטורף. | graphic overlaps | #t4a overlaps span.e-it (22% of the smaller): move one of them so they don't overlap; if the language stacks them on purpose (cards on cards), wrap them in one data-qa-stack container |

_targets measured on the anchor (`themes/editorial/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
