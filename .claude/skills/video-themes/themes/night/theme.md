# night: measured spec

**Anchor:** one creator, 4 videos: 50462 (124 s, "Addictive Storytelling Ladder"), 19647, 33830, 41438. All 720×1280,
values ×1.5 to 1080×1920. **Contributors** (other creators, borrowed only through translation): 32135, 9041, 29402.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | one take, chest-up, centered, **dark** room with cyan/blue practical lights, black cap/hoodie, clip-on mic |
| Length | 40–125 s |

## Layouts (measured)
| Layout | Share | Notes |
|---|---|---|
| split | ≈60% | stage full frame; face box x 46–673, top 954 (→ 69–1011, 1430), radius 22 (→33), bleeds off the bottom; the head (cap) pops 30–40px above the box (matted subject) |
| face full | ≈35% | talking points; captions at 66% |
| proof | first 2–3 s in 3/4 videos | light #e9e9e9 page with a grid, dark title + red box, 3+2 thumbnails 190×300 (at 1080) with view pills grey → green |
| full | short | movie/meme cutaways, a punch-in on a document ("eporter" crop) |
| switches | ≈40 in 124 s → every ≈3 s | hard cuts |

## Stage
| | Value |
|---|---|
| Background | #101010 (measured 16,16,16), dot grid 12px at 720 (→18), dots ≈ #262626 |
| Red neon | #b31123 (179,17,35) ladder; corners #8c0d0f; glow ≈ 12/34px |
| Red box | #b50004 (181,0,4) behind "YOUR CONTENT", "No Longer Works", "To Get The Link" |
| Purple | #c80dd5 (200,13,213) curves |
| Yellow | #fae302 (250,227,2) bars under charts, highlighted rows |
| Green | #3a9432 (58,148,50) completed framework rows, grown view pills |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Title | ≈44px, top y≈129 (10%) | 66px, top 194 | sans 800 (Inter-like grotesk) + one serif italic word (Instrument-like) → **Inter Tight 800 / Heebo 800 + Instrument Serif italic / Frank Ruhl Libre skewed −10°** |
| Captions | ≈38px, 1 word, center y≈850 (66%) | 57px, center 1275 | sans 800 white, no outline; key terms serif |
| Rows | 01–04, label ≈24px | 36–52px | sans 800 |
Fonts tested against the anchor crop (`4-Week Content Growth Program`, `Addictive Storytelling Ladder`): Inter Tight 800
matches the Latin; Instrument Serif italic matches the accent almost exactly. Hebrew has no serif italic under OFL →
Frank Ruhl Libre 500 slanted −10°.

## Motion (frame strips)
| Element | Measured |
|---|---|
| Title | words appear one by one, ≈0.12 s apart |
| New graphic | brightens in from dark ≈0.3 s |
| Held graphic | slow continuous push-in (≈5% over the hold) |
| Punch | fast zoom into a detail with motion blur (ladder level, a document line) |
| Rows | slide in with the red side bar, ≈0.18 s apart; turn green with a lock icon |
| Chips | light up staggered ≈0.2 s |
| Curve | draws left → right, dots pop as the line reaches them |

## Sound
Spectrogram (50462, 0–30 s): continuous low music bed under the voice + dense broadband transients at nearly every
graphic change (whooshes / hits). Theme set (synthesized, free): `whoosh neon tick key riser boom ding pop click`.

## Action density (rule d)
ladder build: 5 levels ≈1 s · framework list: 4 rows + 2 unlocks / 3 s = 2.0 · chart: axis, curve, 6 dots, bars /
2.5 s ≈ 3 · document: lines, 4 marks, 2 tags / 4 s = 1.5 → **1.5–2 actions/s**.

## Contributions (translated into night)
| From | Element | Translation |
|---|---|---|
| 32135 | real app notifications / chat cards shown big over a dark room | real messages go in **dark panels** (`.n-panel`) or a frame; light cards only on the proof page |
| 32135 | a huge version number with a glow ("5.5") | `.n-num` big glowing number + `count` |
| 9041 / 29402 | "✕ DEAD ENDS / ✕ MESSY DEBUGGING" stamped rows | a **row** in the "no" state: red side bar, ✕ instead of the number, dim label (use `.n-row.next` + ✕) |
| 9041 / 29402 | glitched red hook text over the face | not borrowed (no glitch in the anchor); the hook stays the proof page or a title |

## Not yet measured
3/4 videos open on the proof page, so the hook-over-face variant (`.n-hook`) is derived, not measured.

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
| Video-50462 | 124.0 s | 1.43 (1.86 − 0.43) | 17.7% | 1.5 s | 0.6 | 0.16 px · 8P 19D |
| Video-19647 | 73.9 s | 1.09 (1.29 − 0.2) | 20.2% | 1.87 s | 0.57 | 0.13 px · 9P 11D |
| Video-33830 | 78.3 s | 1.91 (2.08 − 0.17) | 18.9% | 1.6 s | 0.7 | 0.15 px · 17P 9D |
| Video-41438 | 107.5 s | 0.0 (1.54 − 1.69) | 52.5% | 6.93 s | 0.64 | 0.18 px · 9P 21D |
| **anchor** | 383.7 s | **1.06** | **28.2%** | **2.6 s** (95th pct) | **0.63** | jitter 0.16 px/frame, 16.1 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 0.8 (0.75 x anchor) |
| flat stretches (graphics layer) | <= 29.0% |
| max static hold (graphics layer) | <= 2.6 s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | 0.44–0.81 (anchor ±30%) |
| footage motion | reported, never failed |

## Face-relative placement

Measured on the anchor by `scripts/face_anchor.py` (face box + caption band at 2 fps). Place things by the
speaker's face, not at fixed pixels (runtime `effects/face.js`, data `scripts/face_track.py`). dy is in face heights below the chin
(negative = above the chin); a wide IQR means the anchor's captions do not follow the face.

| framing | samples | anchor face (1080×1920) | caption centre | IQR |
|---|---|---|---|---|
| full face | 244 | chin 994, h 573 | **chin + 0.41 × h** | 0.34 … 0.51 |
| low face | 494 | chin 1608, h 219 | **chin + -5.39 × h** | -6.15 … -3.45 |

Cards next to the speaker: eye level, the free side, 0.4 × h from the face. Never covered: eyes to mouth.

## Look targets

Measured on the anchor by `scripts/qa/anchor.py night --look` (`look.py`, the same code `qa` runs on drafts, 2 fps, 360x640).
Footage is read around the face; the hero is the graphics zone (above the head in a split, the whole frame without a face).

| | anchor | target |
|---|---|---|
| face height (share of frame) | 0.119 | 0.101–0.137 |
| face luma | 103.915 | 79–129 |
| skin warmth (R − B) | 67.519 | 56–80 |
| background luma | 42.146 | 14–70 |
| background saturation | 41.26 | 16–66 |
| footage contrast (p95 − p5) | 129.19 | >= 103 |
| garment vs background (luma) | 12.678 | >= 25 |
| hero width (share of frame) | 0.65 | median >= 0.552, never < 0.455 for 1 s |
| hero content density | 0.481 | median >= 0.361, never < 0.265 for 1 s |
| full-face share of time | 0.324 | >= 0.194 |
| longest stretch without a full-face beat | 14.5 s | <= 21.8 s |
| material: luma span inside the hero | 176.346 | >= 123 |
| material: highlight share | 0.028 | (eye review) |
| material: glow around the hero | 10.773 | >= 5.4 |
| material: accent saturation | 189.194 | >= 132 |
