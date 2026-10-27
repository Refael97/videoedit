# QA · theme-glass-preview · theme `glass`

**2/9 checks passed — NOT READY**

| | check | value | target |
|---|---|---|---|
| ✗ | motion | 1.78 | >= 3.36 |
| ✗ | flat stretches | 34.3% | <= 2.0% |
| ✗ | actions / s | 0.48 events/s (GSAP 3.72 tweens/s) | 0.17–0.32 |
| ✓ | payoff lands | 0 marked, 0 problems | ends on word ±0.15, holds 0.8, stamp after |
| ✗ | min text | 20 items < 26px | >= 26px |
| ✗ | hero fill | n/a | >= 60% |
| ✗ | collisions | 1 collisions | 0 |
| ✗ | no placeholders | 4 found | 0 |
| ✓ | hook visual | visual on screen 3.0s of the first 3s | >= 0.5s |

## FIX LIST

| time | words | check | fix |
|---|---|---|---|
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | motion | more movement overall: give held graphics a slow push, add secondary motion (dots, sweeps, counters), punch on stressed words |
| 0.0–18.6s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. השת | actions / s | too busy: merge or drop events so each lands on a word |
| 0.0–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | min text | '00:00' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | min text | '00:05' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | min text | '00:10' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | min text | '00:15' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–3.8s | קלוד, תערוך את הסרטון הזה ותוסיף את האפקטים האלה: מסלול. | min text | '00:18' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 0.0–0.2s | קלוד, | no placeholders | svg: image with almost no detail (grey box?): use a real frame / screenshot |
| 0.0–0.2s | קלוד, | no placeholders | div: image with almost no detail (grey box?): use a real frame / screenshot |
| 0.9–1.3s | את הסרטון | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 2.2–2.8s | את האפקטים | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 3.9–5.0s | מסלול. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 5.2–7.2s | השתלטות צ'אט. בריחה | min text | 'Claude' (16px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 5.2–6.5s | השתלטות צ'אט. | no placeholders | chat: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 8.3–8.8s |  | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 9.2–11.0s | חד. רשימה | hero fill | fill 33%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 9.5–10.8s | חד. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 11.0–13.2s | רשימה קופצת. סערת | min text | 'Effects' (14px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 11.2–13.2s | רשימה קופצת. סערת | no placeholders | list: uniform / empty panel: fill it with the real content (text, screenshot, data) or remove it |
| 11.8–13.0s | קופצת. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 13.8–14.5s | כותרות. | hero fill | fill 16%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 13.9–15.0s | כותרות. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |
| 14.8–16.0s | פורטל זום. | hero fill | fill 26%: make the hero bigger (>= 60% of the free area between title and caption/face) or move to a layout with less empty space (over the full face: the hero >= 35% of the width) |
| 16.0–16.2s | זום. | collisions | caption 'פורטל זום' on portal: move the caption off the card (card bottom >= 60px above the caption) or move the card |
| 16.2–18.8s | עקומת צמיחה. | min text | '00:00' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.2–18.8s | עקומת צמיחה. | min text | '00:05' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.2–18.8s | עקומת צמיחה. | min text | '00:10' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.2–18.8s | עקומת צמיחה. | min text | '00:15' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.2–18.8s | עקומת צמיחה. | min text | '00:18' (18px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.2–18.8s | עקומת צמיחה. | min text | 'מסלול' (19px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.5–18.8s | עקומת צמיחה. | min text | 'צ'אט' (22px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.5–18.8s | עקומת צמיחה. | min text | 'בריחה' (21px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.8–18.8s | עקומת צמיחה. | min text | 'זום' (22px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 16.8–18.8s | עקומת צמיחה. | min text | 'רשימה' (22px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 17.0–18.8s | עקומת צמיחה. | min text | 'כותרות' (22px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 17.0–18.8s | עקומת צמיחה. | min text | 'פורטל' (22px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 17.0–18.8s | עקומת צמיחה. | min text | 'צמיחה' (17px): enlarge to >= 26px as shown (font-size x scale) or delete it (decoration, not content) |
| 18.0–18.5s | צמיחה. | flat stretches | add a build-up event, secondary motion or a camera move (push / punch) here |

_targets measured on the anchor (`themes/glass/qa-targets.json`); draft `renders/qa-draft.mp4`; faces detected in 74/74 samples_
