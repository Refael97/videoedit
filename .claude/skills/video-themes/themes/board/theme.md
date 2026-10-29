# board: measured spec

**Anchor:** one creator, **2 videos**: 31455 (48.8 s, "Karpathy skills / Day 1") and 42755 (37.1 s, "Claude Code
just got mods"), both 720×1280 30 fps; values ×1.5 to 1080×1920. Rules seen in only one video are marked
**(1/2)** and are provisional until a third video by this creator arrives. **Contributors** (other creators,
borrowed only through translation): 70856, 9561, 67166.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | **none** — both anchor videos are faceless voice-over explainers |
| Length | 30–50 s (anchor 37 / 49 s) |

## Grounds
| | Value |
|---|---|
| Paper | 230,221,203 (42755) … 240,233,226 (31455) → #ebe3d5, lighter in the middle |
| Grid | ≈36px at 720 → 54px, very faint (42755); 31455 shows a faint dot texture instead (1/2) |
| Dark section | 24,24,30 → #18181e, warm orange glow, hazard stripes 234,174,54 → #eaae36, skewed band near y 172–260 (1/2: 42755 "Here's the catch") |

## Accent + states
| | Value |
|---|---|
| Coral | 228,108,84 → #e46c56 (caption pill, serif word, mascot, progress, the next tile) |
| Green | 60,156,108 → #3c9c6c (ticks, "SETUP 1", done tile) |
| Ink | ≈ #1d1a17 (outline, text, shadow) |

## Cards (31455 Claude Code card, 42755 windows)
| | Value |
|---|---|
| Outline | ≈3px at 720 → 4px, ink |
| Shadow | hard, no blur, ≈9–10px offset at 720 → 12px (dark terminal: coral shadow) |
| Radius | ≈12 at 720 → 18 |
| Width | 80–90% of the frame |
| Inside | bar with three dots + label, rows with number circles, mono tags, green ticks, spinner → tick |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Header strip | mono caps, cap 13px, y 176 ("• AI.NXTLVL" + progress line right) (1/2) | 27px, top 264 | JetBrains Mono 700 |
| Step row | "STEP 1/3" mono y 223 + 3 segments (1/2) | 24px, top 334 | JetBrains Mono 700 |
| Title | cap height ≈53px, top y 239, 60% width ("Claude Code / just got *mods.*") | 104px, top 380 | **DM Sans 800 / Assistant 800** + **Lora 600 italic / David Libre 700 slanted −11°** in coral |
| Captions (42755) | ≈38px, center y 942 (73.6%), the said word in a coral pill 58px tall | 56px, center 1413 | sans 800 |
| Line captions (31455) | ≈30px 500, center y 221 (17%), grey → ink, key word serif in a selection box with handles (1/2) | 46px, center 330 | sans 500 + serif |
| Day numbers | light serif in a ring ("01") (1/2) | 150px | Lora 400 |
Fonts tested against crops of 42755's title ("Small *plugins.*", "Claude Code just got *mods.*"): Inter, Plus Jakarta,
Manrope, DM Sans × Fraunces, Lora, Playfair, Newsreader, DM Serif Display → DM Sans (single-storey g, round bold) +
Lora italic (soft wedge serifs). Hebrew: Assistant 800 (round humanist like DM Sans, unused by other themes) + David
Libre 700 slanted (distinct from night/arcade's Frank Ruhl).

## Mascot
A coral pixel creature perches on the active card's top edge, hops between cards, reacts (✓, !, ♥) — both videos
(31455: a blocky critter; 42755: a crab with antennae). Ours: **"Pinch", a pixel crab drawn for this theme**
(15×11 grid, claws up, eyes on stalks, two frames for snapping) — different from arcade's jelly bot "Bit".

## Transitions (frame strips)
| | Measured |
|---|---|
| Pixel dissolve | coral blocks ≈40px at 720 (→60) cover in ≈0.25 s, clear in ≈0.25 s (42755, between steps) |
| Iris | coral circle grows from a point, a cream circle opens inside it, the next scene's number appears (31455 "zero → Day 1") |
| Inside a topic | hard cuts; cards drop; parts pop |

## Motion
Title words rise one by one; the serif word lands with an overshoot. Caption pill jumps word to word. Quotes appear
word by word on the voice (31455). Checklist: spinner → tick per item, row highlighted. Ring counter: digits roll
00 → 01 while the coral arc fills (31455). Tiles slide in staggered.

## Sound
Spectrogram (42755, 0–20 s): voice over a soft low bed + many short broadband transients (UI clicks/pops on each
action, a granular burst at each dissolve). Theme set synthesized in `sfx_extra.py` (free): thock, hop, snap,
pixels, iris + click, pop, tick, ding, whoosh, key from `scripts/synth_sfx.py`.

## Action density (rule d)
42755 plugin card: cursor, click, tag, status bar, calendar drop, caption = 6 / 2.4 s = 2.5 · checklist item:
row + spinner→tick + segment ≈ 2 per item · 31455 quote: one word per voice word → **≈2 actions/s**.

## Layouts
Faceless: one board layout (+ the dark section once, 1/2). 14 compositions in 37 s (42755) → every ≈2.6 s.

## Contributions (translated into board)
| From | Element | Translation |
|---|---|---|
| 67166 | the speaker in a box under the graphics | **face card** (`.b-face`): the speaker as one more card on the board — outline + hard shadow, in the hero slot, short beats only |
| 70856 | "✦" bullet lists that build item by item | checklist **rows** that tick (no new glyph) |
| 9561 | stacked command chips ("/yt-script") over a card | mono **tags** inside cards (`.tag`, `.tag.coral`) |
| 9561 | a big number struck out ("1" crossed) | the plain "BEFORE" card crossed with the coral ✕ (before/after recipe) |

## Not yet measured / provisional (1/2)
Header strip + step row, dark "catch" section, line-caption variant, ring counter and day tiles each come from one
video only. Board needs a third video by this creator to confirm which caption variant is the default.

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
| Video-31455 | 48.67 s | 0.88 (1.08 − 0.2) | 37.2% | 1.87 s | 0.45 | 0.05 px · 2P 3D |
| Video-42755 | 36.97 s | 0.91 (1.87 − 0.97) | 10.7% | 0.63 s | 1.11 | 0.12 px · 5P 5D |
| **anchor** | 85.6 s | **0.89** | **25.8%** | **1.5 s** (95th pct) | **0.73** | jitter 0.08 px/frame, 10.5 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 0.67 (0.75 x anchor) |
| flat stretches (graphics layer) | <= 26.0% |
| max static hold (graphics layer) | <= 1.5 s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | 0.51–0.96 (anchor ±30%) |
| footage motion | reported, never failed |
