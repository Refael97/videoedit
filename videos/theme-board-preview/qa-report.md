# QA · theme-board-preview · theme `board`

**5/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✓ | motion | 1.87 | >= 1.83 |
| ✓ | flat stretches | 45.0% | <= 46.0% |
| ✓ | actions / s | 0.82 events/s (GSAP 4.72 tweens/s) | 0.47–0.88 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✗ | min text | 9 items < 26px | >= 26px |
| ✗ | hero fill | median 69% | >= 60% |
| ✗ | collisions | 4 collisions | 0 |
| ✗ | no placeholders | 3 found | 0 |
| ✓ | hook visual | visual on screen 2.8s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–0.2s | אם | min text | 'studio-bait.co.il' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–0.8s | אם אתם רוצים | hero fill | fill 42%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |
| 0.5–3.0s | אתם רוצים לבנות אתרים שנראים טוב עם | min text | 'studio-bait.co.il' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.5–1.0s | אתם רוצים לבנות | no placeholders | site0: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 0.8–3.0s | רוצים לבנות אתרים שנראים טוב עם | no placeholders | img0: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 3.0–6.8s | עם motion, מעברים ומבנה כמו שצריך, אתם | min text | 'STEP 1/3' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 3.2–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | min text | 'kowalski · skill' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 3.2–6.8s | motion, מעברים ומבנה כמו שצריך, אתם | min text | '3 / 3 FEATURES' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 6.2–6.8s | שצריך, אתם | min text | '✓ READY' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 6.8–10.0s | אתם צריכים להתקין skill שנקרא Kowalski. הסקיל | min text | 'claude code · terminal' (23px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 6.8–7.0s | אתם צריכים | collisions | caption 'אתם' on irisP: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 6.8–7.0s | אתם צריכים | collisions | caption 'צריכים' on irisP: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 6.8–7.0s | אתם צריכים | collisions | caption 'להתקין' on irisP: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 7.0–8.8s | צריכים להתקין skill שנקרא | no placeholders | term2: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.2–13.0s | הופך את האתר שלכם למטורף. | min text | 'studio-bait.co.il' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 13.0–15.8s | כל מה שאתם צריכים לעשות זה להגיב לי פה ואני שולח | hero fill | fill 1%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |
| 13.0–14.5s | כל מה שאתם צריכים לעשות זה | collisions | #irisP on the eyes/mouth: keep captions and cards off the eyes and mouth: move it, or use a layout that gives the face its own space |
| 15.8–17.2s | לכם את זה. | min text | '✉' (24px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.0–17.2s | את זה. | hero fill | fill 26%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space |

_targets measured on the anchor (`themes/board/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 68/68 samples_
