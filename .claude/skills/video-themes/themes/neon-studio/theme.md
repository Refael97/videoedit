# neon-studio: measured spec

**Anchor:** one creator, 4 videos: 70647 (37.5 s, 25 fps), 10899 (28.1 s), 1191 (27.3 s), 49478 (23.9 s). All 720×1280,
values ×1.5 to 1080×1920. **Contributors:** none (the style is consistent across the 4).

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | one take, chest-up, centered, dark gaming/neon studio (blue neon sign, LED strips, a warm lamp), black tee |
| Length | 24–38 s |

## Layouts (measured)
| Layout | Share | Notes |
|---|---|---|
| face | ≈45% | captions on the chest: white line ≈52px at 720 centered ≈y 700 (55%), yellow keyword under it to ≈66% |
| split | ≈20% | media/tile over an ambient blur 0–640 (50%), the face full-width in the bottom half; caption just above the seam |
| full page | ≈25% | #f7f5f1 (247,245,241) or #fcfcfc; title 26px at y 187–211 (14.6%); ink captions at y≈867 (68%) |
| full ambient | ≈10% | a UI / b-roll over its own blur (10899) or a magenta/purple gradient (49478) |
| switches | 70647: ≈18 compositions in 37 s → every ≈2 s | hard cuts; graphics blur in |

## Color (measured)
| | Value |
|---|---|
| Keyword yellow | #f9fc04 (249,252,4) |
| Blue (progress, header 2nd line, download) | #074ffa (7,79,250) |
| Sprite red | #fc410e (252,65,14), lighter top row, darker sides; gold pixel icons |
| Document highlight | warm yellow ≈ #f2c230 behind "The LinkedIn" |
| Page | #f7f5f1 / #fcfcfc |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Caption line | ≈52px bold, white, soft shadow | 78px | Inter 800 / Heebo 800 |
| Keyword (bold) | "Video" cap height 92px → ≈128px | 108px (2+ words) / 190px (single) | same, yellow |
| Keyword (CTA) | "SKILL" cap height 92px, thin italic | 190px | Inter 300 italic / Heebo 300 skewed −12° |
| Page header | "Install / Hunyuan Video" ≈70px | 96px | 800, ink + blue |
Fonts tested against the "I'll send / SKILL" crop: Inter 800 + Inter 300 italic match (the anchor's thin is a touch heavier).

## Motion (frame strips, 12.5 fps)
| Element | Measured |
|---|---|
| Captions | build word by word (one frame of blur on each word); "checks" → "checks / the content"; the CTA keyword "SKILL" stays while the white line changes 5 times |
| Cards / tiles / pills | blur-in ≈0.3 s; the pill "Autopilot on" blurs in under the tile |
| Documents | continuous scroll while read; a highlight + cursor on the phrase |
| Media | swap with a blur; UI pushes in (zoom) to the relevant control (10899) |
| Sprites | appear in steps on the chest (5 in two rows), icons above, stay ≈3 s |

## Sound
Spectrogram (70647, 0–30 s): a constant low bed under the voice + dense short broadband transients (clicks, soft
whooshes, typing) on almost every graphic change. Theme set (synthesized): `air pop tick ding whoosh key click blip coin`.

## Action density (rule d)
70647 0–10 s ≈ 20 actions → **≈2 per second**; sprites: 5 sprites + 5 icons in ≈1.2 s.

## Contributions
None. (49478's small grey pill captions and its magenta gradient were seen once each; not adopted as rules.)

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Footage = info only.

| video | length | graphics motion (raw − baseline) | flat % | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|
| Video-70647 | 37.4 s | 0.0 (1.77 − 2.68) | 33.1% | 0.78 | 0.04 px · 15P 9D |
| Video-10899 | 27.93 s | 1.07 (3.93 − 2.86) | 5.1% | 1.29 | 0.12 px · 5P 4D |
| Video-1191 | 27.17 s | 5.18 (9.25 − 4.07) | 9.4% | 1.32 | 0.49 px · 11P 8D |
| Video-49478 | 23.77 s | 4.24 (5.92 − 1.68) | 20.3% | 1.3 | 0.09 px · 10P 5D |
| **anchor** | 116.3 s | **2.33** | **18.2%** | **1.14** | jitter 0.17 px/frame, 34.6 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 1.75 (0.75 x anchor) |
| flat stretches | <= 19.0% |
| actions / s (events + camera moves) | 0.79–1.48 (anchor ±30%) |
| footage motion | reported, never failed |
