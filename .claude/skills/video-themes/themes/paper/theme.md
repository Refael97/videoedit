# paper: measured spec

**Anchor:** 15422 (one creator, one video: 77.0 s, 720×1280, 30 fps). Every value below is from it (×1.5 to
1080×1920) and is *(1/1)* until more videos by the same creator arrive. **Contributors** (other creators,
borrowed only through translation): 33407, 82014, 97418, 5777, 70647.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | one take, medium close-up, centered, dark home background, clip-on mic held in hand |
| Length | 45–90 s (anchor 77 s), 4 numbered steps + recap + CTA |

## Layouts (measured)
| Layout | Share of time | Notes |
|---|---|---|
| full face | ≈35% | hook (0–9.5 s), emotional beats, a single white card over the face at y 240–700 |
| split | ≈40% | page 0–960 exactly (seam measured at 640/1280), face 960–1920 |
| full page | ≈25% | trees, UI demos, illustrations, recap |
| switches | 15 in 77 s → every ≈5 s | hard cuts; face→full page has a ≈0.13 s paper-white flash |

## Page
| | Value |
|---|---|
| Paper | #dfd6c4 (measured 223,214,196) with faint light/dark mottling |
| Grid | 48px step (32.3 at 720), 1.5px lines #d5ccb9 (9 points darker) |
| Folder blue | #6fcbf6 (measured 111,203,246) |
| Orange | #c65a3c (median incl. anti-aliasing 193,102,74) |
| Ink | #221c12 (measured 34,28,18) |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Step label | glyphs y 204–249, centered | 70px, top 300 | Heebo 700, tracking −1.5 (anchor: a tight grotesk) |
| Captions (split) | center y 605 (47.3%), 3 words ≈ 50% width | 76px, center 908 | Heebo 800, white, 10px black outline under the fill, soft shadow |
| Captions (face/page) | center y 796 (62%) | center 1190 | same |
| Hook | 2 lines, y 194–313 (15%), 78% width | 68px, top 290 | Heebo 700 white, soft shadow, no outline |
| Labels | ≈27px | 40px | Heebo 700 |
Fonts tested in Hebrew against the anchor crops: Heebo 900/800/700, Rubik 700, Assistant 800 → Heebo.

## Motion (frame by frame, 15 fps steps)
| Move | Measured |
|---|---|
| Object pop | ≈0.3 s to full size with a small overshoot |
| Sub-folders out of the parent | 3 children, stagger ≈0.13 s, each ≈0.33 s, lines drawn first |
| Hero folder park | big (372 px at 720) → small at the top in ≈0.4 s |
| Lift (camera out of the laptop screen) | ≈0.5 s |
| Comment pill | drops in ≈0.15 s, then types the word ≈0.07 s per letter |
| Thumbnails in the hook | swap every ≈0.6 s |
| Action density | 1.1–2.3 actions/s inside the page (avg ≈1.5) |

## Sound
Spectrogram: continuous fast speech, a low music bed underneath, many short transients beyond the speech →
UI sounds on most actions (estimate; levels used: voice 1.0, bed 0.15–0.2 with carve 0.3, pop .3, click .45,
key .3, tick .3, swish .3, ding .22). Theme set synthesized: `pop click tick ding whoosh key swish`.

## Elements seen in the anchor (examples of the grammar)
Hook over a cycling row of real video thumbnails · step label · app tile in a ring + browser tiles struck out ·
arrow down to the right app · big folder with orange label → parks · tree into 3 sub-folders · thumbnails drop
into folders · real app window with cursor and dropdown · Claude tile —dotted— folder · "Install these tools"
table card over the face · prompt card with yellow blanks · color-swatch fan · 3 reference thumbnails · a real
dark brand sheet shown as-is · phone clip dropping into "Raw footage" · line-art tools (cuts / captions / music)
with labels · feedback bubbles · recap: folder + 4 steps with dotted arrows · sparkle + timeline · laptop →
lifted camera with orange tags · comment pill typing the word.

## Contributions (translated into paper)
| From | Element | Translation |
|---|---|---|
| 70647 (LinkedIn agent) | a content calendar | white card, ink numbers, marked days orange (`.p-cal`) |
| 5777 (pixel arena) | ideas "fight", losers get ✕ labels, a winner survives | two real cards side by side, orange outline stamps "✕ …" on the loser, green "✓" on the winner (`.p-stamp`); no pixel art |
| 97418 / 33407 | dark terminal windows | a **white** card with JetBrains Mono lines (`.mono`), green check per finished line; dark terminals are not allowed on the page |
| 82014 | numbered list fanning out of an icon | step tiles in a row with orange numbers above, joined by dotted connectors |

## Contract mapping
| Contract | paper |
|---|---|
| layout.full-face / split / full-graphic | `PAPER.layout(tl, "face" / "split" / "paper", t)` |
| caption | `.p-caps` + `PAPER.captions()` (position follows the layout) |
| hook-title | `.p-hook` + thumbnails row + `PAPER.hook()` |
| step-label | `.p-step` |
| prompt-card | `.p-card` + `.hl` blanks + `PAPER.highlight()` |
| app-window | `.p-card` with `.bar` (+ `.p-menu`, cursor) |
| icon-tile | `.p-tile` in `.p-ring` / folders `PAPER.art(.., "folder")` |
| tree | `.p-ink .tree` + `PAPER.branch()` |
| recap-diagram | hero object + step labels + `PAPER.connect()` arrows |
| cta | `.p-cta` + `PAPER.cta()` |
| transition.* | `layout` (cut / flash), `pop`, `park`, `out` |
| sfx.* | `sfx/*.wav` |

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
| Video-15422 | 76.83 s | 0.92 (1.38 − 0.47) | 19.5% | 0.9 s | 0.51 | 0.16 px · 5P 7D |
| **anchor** | 76.8 s | **0.92** | **19.5%** | **0.9 s** (95th pct) | **0.51** | jitter 0.16 px/frame, 9.4 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 0.69 (0.75 x anchor) |
| flat stretches (graphics layer) | <= 20.0% |
| max static hold (graphics layer) | <= 0.9 s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | 0.36–0.66 (anchor ±30%) |
| footage motion | reported, never failed |

## Face-relative placement

Measured on the anchor by `scripts/face_anchor.py` (face box + caption band at 2 fps). Place things by the
speaker's face, not at fixed pixels (runtime `effects/face.js`, data `scripts/face_track.py`). dy is in face heights below the chin
(negative = above the chin); a wide IQR means the anchor's captions do not follow the face.

| framing | samples | anchor face (1080×1920) | caption centre | IQR |
|---|---|---|---|---|
| full face | 27 | chin 1137, h 420 | **chin + -1.82 × h** | -1.93 … -1.57 |
| low face | 56 | chin 1623, h 423 | **chin + -2.63 × h** | -3.0 … -1.69 |

Cards next to the speaker: eye level, the free side, 0.4 × h from the face. Never covered: eyes to mouth.
