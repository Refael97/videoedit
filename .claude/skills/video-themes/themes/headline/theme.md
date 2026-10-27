# headline: measured spec

**Anchor:** one creator, 5 videos: 97418 (37.1 s, "Remove Your TV's Ads With Claude Code"), 75789 (46.9 s, "4 Free
Plugins That Run Your Agency"), 81754, 89398, 98315. All 720×1280, 30 fps; values ×1.5 to 1080×1920.
**Contributors:** none (the style is consistent across the 5 anchor videos).

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | one take, speaker **low in frame** (head top ≈56%), bright cool wall with leaf shadows, black hoodie, podcast mic; a second closer angle for the end |
| Length | 35–47 s |

## Layouts (measured on 97418)
| Layout | Time | Notes |
|---|---|---|
| split (graphics on the wall above the head) | ≈65% | title top 152/1280; window y 315–620 (→ 472–930), x 78–642 (→ 117–963); caption center 670 (52%) |
| dark (terminal) | 8–14 s, 20–23 s, 30–33 s | bg 6,5,10 → 11,12,17 with blurred blue light; window 83% wide; caption white at 74% |
| page (white, section header) | 75789: every "Plugin Number N" | title 84px, caret → box, window under it |
| face (closer angle) | last 4 s | "comment" serif + keyword |
| switches | a new screenshot every 1.5–3 s | hard cuts / blur swaps |

## Colors
| | Value |
|---|---|
| Wall | 214,228,241 (top-left, cool) → 243,245,240 |
| Blue box | 2,131,253 (#0283fd) |
| Caption accent | 55,131,223 (#3783df) |
| Window edge | core 14,58,119, halo 192,211,241 (2px + soft 5px) |
| Stat card | 6,11,22; number white → light blue (187,219,255) gradient + blue glow |
| CTA keyword | 251,253,98 with a yellow glow |
| Selection inside windows | light blue (≈181,213,255) |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Headline | cap glyphs 152–193, 580px wide for 20 chars | 80px, top 205 | Inter 700 tight (anchor: SF-like grotesk) / Heebo 700 |
| Box | 85px tall, x 88–612, serif ≈60px | 92px serif | **Playfair Display 700 italic** (matched against the crop: DM Serif too light, Source Serif too wide) / Frank Ruhl Libre 900 slanted −12° |
| Captions | glyph height ≈40 (≈48px), center 670 | 72px, center 1005 | Inter / Heebo 700; accent = the box serif in blue |
| Stat number | ≈125px | 190px | 800 |
| CTA | "comment" ≈48px serif, keyword ≈110px | 96 / 190px | serif / sans 800 |

## Motion (frame strips, 30 fps)
| Element | Measured |
|---|---|
| Headline | words blur in from light grey, ≈0.1 s apart (3 frames) |
| Box | a small blue square appears, grows to full width in ≈0.3 s, serif words blur in after |
| Window | fades in with blur ≈0.2–0.3 s |
| Stat beat | ring on the Star button → window dims → card blurs in → number counts 7,111 → 22,681 → 23,400 in ≈1.3 s |
| Captions | each word blurs in as spoken, up to 3 words build, then clear |
| Section header | title blurs in, blue caret blinks, becomes the box, the next window blurs in |

## Sound
Spectrogram (97418, 0–20 s): voice, **no clear music bed**, broadband soft "air/whoosh" blocks (0.3–0.5 s) at every
screenshot change. Theme set (synthesized, free): `air roll click pop tick ding whoosh swish key` (`sfx_extra.py`).

## Action density (rule d)
opening: 9 actions / 1.2 s · repo beat: 4 / 1.6 s = 2.5 · tweet beat: window + selection / 1.5 s · overall ≈ 2 actions/s.

## Contributions
None. (97418 was a paper contributor; here it is the anchor.)

## Not yet measured / derived
The stat card is measured; the `.h-photo` card (a real photo without browser chrome) is from the opening image of 97418.
The air veil (`.h-air`) is a theme technique for footage on a darker wall — the anchor doesn't need it.

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Footage = info only.

| video | length | graphics motion (raw − baseline) | flat % | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|
| Video-97418 | 36.97 s | 0.0 (3.8 − 3.99) | 16.3% | 0.76 | 0.21 px · 8P 10D |
| Video-75789 | 46.73 s | 0.0 (3.56 − 5.38) | 10.9% | 0.66 | 0.23 px · 13P 15D |
| Video-81754 | 38.33 s | 0.0 (3.58 − 4.47) | 18.8% | 0.55 | 0.23 px · 4P 11D |
| Video-89398 | 35.07 s | 0.0 (3.33 − 4.1) | 22.2% | 0.71 | 0.17 px · 3P 4D |
| Video-98315 | 37.17 s | 0.0 (2.86 − 5.49) | 13.3% | 0.51 | 0.26 px · 8P 9D |
| **anchor** | 194.3 s | **0.0** | **16.0%** | **0.64** | jitter 0.22 px/frame, 26.3 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 0.0 (0.75 x anchor) |
| flat stretches | <= 16.0% |
| actions / s (events + camera moves) | 0.45–0.83 (anchor ±30%) |
| footage motion | reported, never failed |
