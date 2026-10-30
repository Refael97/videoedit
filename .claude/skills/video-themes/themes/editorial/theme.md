# editorial: measured spec

**Anchor:** one creator, 3 videos: 66150 (54 s), 72005 (58 s), 90553 (49 s); 7451 is a re-post of 66150 with a
caption bar added (not counted). All 720×1280, ×1.5 to 1080×1920. **Contributor:** 9953 (translated only).

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | own room (dark olive walls, wall lamps, framed prints), cap + patterned jacket/flannel, 2–3 framings per video (close, mid, full body) |
| Length | 45–60 s |

## Layouts (measured)
| Layout | Share | Notes |
|---|---|---|
| face + overlays | ≈75% | overlays in the top 200–760 (at 1080); the face alone 1–3 s between overlays |
| cutout on green | first 3 s (66150, 72005), "SUNDAY" close | the speaker matted onto #163227, display/heavy type above and behind the head |
| cover | 1–2 per video | 2px gold frame inset 27px (→40), mono issue line "NO. 01 · OCTOBER 2026 · EDITED BY CLAUDE", display word behind the head, a barcode |
| page | short | thumbnail grid 3 columns, full storyboard card, "DOORS CLOSE / SUNDAY" |
| overlays | ≈22 in 54 s → every ≈2.5 s | hard cuts |

## Color
| | Value |
|---|---|
| Green | #163227 (measured 22,50,39 — identical in all 4 files) |
| Cream | #ede9df (237,234,223) |
| Gold | #c1a85e (193,168,94 median of the italic accents) |
| Caption slip | green at ~94% over the footage; unspoken words sage ≈ #8ea595 |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Display serif | "I DIDN'T / EDIT": cap ≈120px, spans 76% width, line-height ≈.86 | 250–360px | **Instrument Serif** (exact match) / Hebrew **Noto Serif Hebrew wdth 62.5** weight 300 |
| Heavy sans | "CLAUDE / EDITED / THIS.": cap ≈57px, left at x 41, line-height ≈.9 | 104–128px, margin 62 | **Inter Tight 900** (Archivo 900 too wide) / **Heebo 900** |
| Italic accent | "did.", "whatever", "people.", "for you." gold | 100–170px | **Instrument Serif italic** / Hebrew: Noto Serif Hebrew condensed slanted −11° |
| Captions | box y 880–931 (h 51, center 70.7%), serif ≈34px | 54px, box h 77, center 1358 | Instrument Serif / Noto Serif Hebrew wdth 75 |
| Kicker / timecode | ≈17px, tracking ≈.3em | 26–30px | JetBrains Mono |
Fonts were rendered next to the anchor crops (fc.png in the scratchpad): Inter Tight 900 vs Archivo 900, Instrument
Serif, Bellefair / Frank Ruhl / David Libre / Noto Serif Hebrew (62.5% and 100%) → the choices above.

## Motion (frame strips)
| Element | Measured |
|---|---|
| Display serif | letters appear one by one ≈0.08 s apart, each first semi-transparent then solid ("C → CL → CLA… CLAUDE", "E → ED → EDI → EDIT") |
| Heavy sans | lines rise out of a mask ("A SINGLE / SECOND"); the next headline replaces it by the old lines leaving up and the new rising in ("OF THIS SECOND" → "VIDEO.") |
| Slips | a green slip wipes in, the text slides in under it ("DOING" then "*whatever*" 0.13 s later) |
| Timecode | hh:mm:ss:ff runs under the opening headline |
| Flip counter | "0:54 → 0:52" digits roll vertically on green tiles |
| Cards | rise in, hold, cut |

## Sound
Spectrogram (66150, 0–30 s): voice with frequent short transients (clicks, slides, key taps) and a quiet bed; no
big booms. Theme set (synthesized, free): `click key tick ding swish whoosh shutter thud slide`.

## Action density (rule d)
opening 0–3 s ≈6 actions/s (letters, lines, ticker, timecode) · slips 2 in 0.3 s + hold · prompt card: rise, 20
typed letters, send, out in 3 s · average while an overlay is up ≈2/s.

## Contributions (translated into editorial)
| From | Element | Translation |
|---|---|---|
| 9953 | serif "equations" over the head ("2 Hours = $100 × 2" → "$200", "$200" struck → "$50") | a serif equation in cream, the old value **struck in red**, the new value counted, the result in gold italic |
| 9953 | small serif text floating above the head, no box | allowed only as the display serif behind the head (with matte) — floating text without a slip is not editorial |

## Gaps / not measured
- The anchor's barcode on the cover and the thumbnail grid are described but not built as components (use real images).
- The matte edge on a plain white wall shows a light fringe on the green page; the anchor's footage is cut more cleanly.

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
| Video-66150 | 53.97 s | 1.49 (2.39 − 0.9) | 14.7% | 0.84 s | 0.7 | 0.28 px · 19P 14D |
| Video-72005 | 57.97 s | 2.55 (3.23 − 0.68) | 7.8% | 1.07 s | 0.53 | 0.28 px · 17P 9D |
| Video-90553 | 49.07 s | 0.85 (1.19 − 0.34) | 29.3% | 1.6 s | 0.82 | 0.15 px · 11P 9D |
| **anchor** | 161.0 s | **1.68** | **16.7%** | **1.4 s** (95th pct) | **0.68** | jitter 0.24 px/frame, 29.4 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 1.26 (0.75 x anchor) |
| flat stretches (graphics layer) | <= 17.0% |
| max static hold (graphics layer) | <= 1.4 s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | 0.47–0.88 (anchor ±30%) |
| footage motion | reported, never failed |

## Face-relative placement

Measured on the anchor by `scripts/face_anchor.py` (face box + caption band at 2 fps). Place things by the
speaker's face, not at fixed pixels (runtime `effects/face.js`, data `scripts/face_track.py`). dy is in face heights below the chin
(negative = above the chin); a wide IQR means the anchor's captions do not follow the face.

| framing | samples | anchor face (1080×1920) | caption centre | IQR |
|---|---|---|---|---|
| full face | 227 | chin 1134, h 360 | **chin + 0.36 × h** | -1.73 … 0.74 |
| low face | 30 | chin 1269, h 364 | **chin + -1.5 × h** | -2.73 … 0.27 |

Cards next to the speaker: eye level, the free side, 0.4 × h from the face. Never covered: eyes to mouth.

## Look targets

Measured on the anchor by `scripts/qa/anchor.py editorial --look` (`look.py`, the same code `qa` runs on drafts, 2 fps, 360x640).
Footage is read around the face; the hero is the graphics zone (above the head in a split, the whole frame without a face).

| | anchor | target |
|---|---|---|
| face height (share of frame) | 0.184 | 0.156–0.212 |
| face luma | 140.731 | 116–166 |
| skin warmth (R − B) | 73.88 | 62–86 |
| background luma | 63.806 | 36–92 |
| background saturation | 91.472 | 66–116 |
| footage contrast (p95 − p5) | 191.083 | >= 153 |
| garment vs background (luma) | 62.579 | >= 37.5 |
| hero width (share of frame) | 0.9 | median >= 0.765, never < 0.63 for 1 s |
| hero content density | 0.583 | median >= 0.437, never < 0.321 for 1 s |
| full-face share of time | 0.783 | >= 0.47 |
| longest stretch without a full-face beat | 5.0 s | <= 7.5 s |
| material: luma span inside the hero | 198.842 | >= 139 |
| material: highlight share | 0.001 | (eye review) |
| material: glow around the hero | -67.919 | >= — |
| material: accent saturation | 177.333 | >= 124 |
