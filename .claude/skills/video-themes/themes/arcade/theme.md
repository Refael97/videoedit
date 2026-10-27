# arcade: measured spec

**Anchor:** one creator, 4 videos: 5777 (34 s, "the arena skill"), 208 (44 s), 58260 (34 s), 95186 (44 s). All 720×1280,
30 fps; values ×1.5 to 1080×1920. **Contributor** (another creator, translated only): 81673.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | one take, tight close-up (forehead to chest), warm beige room, daylight |
| Length | 30–45 s, one topic, CTA "comment WORD" at the end |

## Layouts (measured)
| Layout | Share | Notes |
|---|---|---|
| split | ≈65% | page 0–513, face 513–1280 (40.1% → seam 770 at 1080); face is the camera frame shifted, not scaled |
| page full | ≈20% | crowds, 3-card rows, big UI cards |
| full-bleed world | ≈10% | arena, library, earth from space, a temple room |
| face full | ≈5% | rare |
| cuts | 14 in 34 s (5777) → every ≈2.4 s | hard cuts |

## Page and cards
| | Value |
|---|---|
| Page | #efedeb (239,237,235); grid 60px at 720 (→90), lines ≈3 levels darker |
| World card | x 60–660, y 170–463 at 720 → x 90–990, y 255–695; radius ≈15 (→22); soft shadow |
| UI card | #fcfbfa, serif body ≈30px at 720 (→45), meta row icons, mono tags ≈11px (→ raised to 26 by our 26px rule) |
| Coral | #d77656 (215,118,86) mascot, CTA step badges, comment box border (223,107,70) |
| Marker red | #d03440 (208,52,64) strikes, circles, scrawled "generic." |
| HUD (208) | navy panel, double light border, pixel caps, green "CHEAT ACTIVATED" |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Caption pill | x 169–550, y 481–537 (56 tall), center on the seam (y 509), #353a36, radius ≈8 | 84 tall, center 764, radius 12 | mono 500 UPPERCASE, cap height 18–20px, tracking ≈0.12em → **JetBrains Mono 500** (tested vs Geist, Plex, DM, Roboto Mono); Hebrew **IBM Plex Sans Hebrew 600** |
| Card titles / CTA | "Follow" ≈22px bold | 38–52px | grotesk bold → Inter 700 / Plex Sans Hebrew 700 |
| Real message text | ≈30px serif | 40–46px | Frank Ruhl Libre (Hebrew + Latin) |
| Scrawl | ≈26px marker | 74–100px | Caveat 700 / **Gveret Levin** (Hebrew) |
| HUD | pixel caps | 40px | Silkscreen (Latin only) |
Captions: 2–3 words per pill, uppercase, hard swaps, always at the seam line (also on page-full and full-bleed frames);
moved under the graphic only when a page-full graphic covers the line (58260 "THE MANAGER" at 74%).

## Motion (frame strips, 10 fps)
| Element | Measured |
|---|---|
| Mascot multiply | 1 creature → crowd in waves over ≈1 s, "×1" counter in red × under it rolls to ×100 |
| Pen | strike lines ≈0.3 s each in reading order, then a circle ≈0.4 s, then the scrawled word |
| 3 cards | appear together, then each card's content builds (bars, checks, a curve with a flag) ≈0.3 s apart |
| Sprites | stepped (no tweened scaling): spawn, walk, hop |
| Layout | hard cuts every ≈2.4 s |

## Sound
Spectrogram (5777, 0–12 s): voice + soft bed + tonal horizontal blips (square-wave chirps) on sprite actions + a broadband
crowd/whoosh block on the arena cut. Theme set synthesized in `sfx_extra.py`: `blip coin jump spawn powerup hit pen` + `whoosh pop key`.

## Action density (rule d)
reasoning cards: 3 cards + 4 builds / 1.2 s ≈ 3 · pen: 2 strikes + circle + scrawl / 2 s = 2 · crowd: spawn waves + counter /
1.5 s ≈ 3 · CTA: badge, avatar, typed word / 2 s ≈ 1.5 → **≈2 actions/s**.

## Contributions (translated into arcade)
| From | Element | Translation |
|---|---|---|
| 81673 | the same mono uppercase caption pill over real UI demos (CapCut/ChatGPT screens) | confirms the pill; real UI cards use our `.a-card`, never a full app screenshot without a crop |
| 81673 | the "Follow me & comment" CTA with a hand-drawn red circle around the word | the CTA box keeps the coral border; the red pen may circle the typed word once |
| 81673 | a side-by-side "original clip / edited" comparison | **before → after**: two UI cards, the pen on the before, the after rises bigger |

## Not borrowed
The anchor's mascot is a company's mascot and its scenes are hand-made pixel paintings; the theme ships its own mascot (Bit)
and generated worlds (`ARCADE.world`), which are simpler than the anchor's illustrated scenes (honest gap).

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Footage = info only.

| video | length | graphics motion (raw − baseline) | flat % | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|
| Video-5777 | 34.1 s | 2.41 (3.1 − 0.69) | 13.2% | 0.82 | 0.19 px · 8P 6D |
| Video-208 | 44.3 s | 0.63 (2.59 − 1.96) | 15.7% | 1.04 | 0.13 px · 6P 4D |
| Video-58260 | 33.4 s | 2.24 (2.81 − 0.57) | 11.5% | 0.9 | 0.12 px · 3P 5D |
| Video-95186 | 43.8 s | 2.64 (3.32 − 0.68) | 15.4% | 1.37 | 0.12 px · 7P 3D |
| **anchor** | 155.6 s | **1.93** | **14.2%** | **1.05** | jitter 0.14 px/frame, 16.2 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 1.45 (0.75 x anchor) |
| flat stretches | <= 15.0% |
| actions / s (events + camera moves) | 0.74–1.37 (anchor ±30%) |
| footage motion | reported, never failed |
