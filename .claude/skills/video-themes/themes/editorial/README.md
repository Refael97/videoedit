# Editorial: the magazine cover that talks

> Read order: **this file** (the editing prompt) → **`language.md`** (how to build *any* new element in this
> style, incl. the five mandatory rules) → `theme.md` (numbers measured on the anchor, contributions).
> Anchor: one creator, 3 videos (66150 "I didn't edit a single second of this video", 72005, 90553; 7451 is a
> re-post of 66150). Contributor: 9953 (translated, see `theme.md`).

## The idea in one sentence
A creator talks in their own room while the video is **typeset like a magazine** around them: a forest-green page,
huge condensed serif words set behind their head, heavy sans headlines, gold italic accents, pasted-paper labels,
and real cards (a prompt, a product, a counter) — calm, expensive, confident.

## Who it is for
Launches, announcements, personal stories, "how I did X", courses and offers, opinion pieces. One presenter, their
own room, 9:16, 30–60 s. It sells **taste**: this person (and their product) is premium.

## Editing character
- **Typography is the graphics.** Three voices, always the same: a **display serif** (huge, condensed, cream, set
  letter by letter), a **heavy sans** (black-weight, tight, lines rising out of masks), and a **gold italic serif**
  for the one word that carries feeling. Plus a tiny spaced-out mono kicker or timecode.
- **The speaker and the type share the space.** The big serif word sits **behind** the speaker's head (cut-out
  matte); for openings the speaker is cut out onto the green page. Text never covers the face.
- **Paper, not plastic.** Labels are slips of green (or cream) paper pasted at the top; cards are green with a gold
  hairline; inputs are cream. No glow, no gradients, no neon.
- **Four layouts:** the footage with overlays at the top (default), the speaker cut out on the green page
  (opening, the big statement), the **cover** (a thin gold frame, an issue line, the name behind the head), the green
  page alone (grids, a closing word). Hard cuts, a new overlay every ~2.5 s.
- **Calm, exact motion.** Letters ghost in one by one, sans lines rise out of a mask and leave upward, slips wipe in,
  counters flip. About 2 actions per second while an overlay is up, then the face alone breathes.

## Text
- **Captions:** a short phrase (≤4 words) in the condensed serif on a green slip at 71% height, words turning from
  sage to cream as they are spoken.
- **Headlines:** heavy sans (Inter Tight 900 / Heebo 900), aligned to the reading side, 3 short lines max.
- **Accent:** one gold italic word per composition (Instrument Serif italic / Noto Serif Hebrew condensed, slanted).
- **Display:** one word, 250–360px, condensed serif, behind the head.

## Sound
Voice first, a quiet warm bed, and paper/studio sounds: slide (a slip or card), thud (a heavy line lands), key
(letters, typing), shutter (cover, photo, a site that changes), tick (counts), ding (the payoff), swish (a ticker
change). Theme sfx: `click key tick ding swish whoosh shutter thud slide` (from `sfx_extra.py`).

## Never
- Neon, glow, gradients, drop-shadowed text, emoji stickers.
- Grey bars inside cards (the anchor's bonus cards use them — translated: real lines, see `language.md` §10b).
- More than one gold word per composition; gold on cream.
- Text over the face or the mouth; a display word in front of the head.
- Fast shaky zooms, bounces, rotations. Logos of other companies.

## How to shoot for this theme
- **Room:** the anchor's room *is* the brand — a dark, warm, lived-in room (green/olive walls, wall lamps, framed
  prints, plants). Dark or mid-tone walls make the cream type pop; a white wall works but looks plainer.
- **Shot:** chest-up to waist, speaker centered, **lots of headroom (the top 35–40% of the frame is for type)** —
  keep the top of your head at ~40% of the frame height so the display word can sit behind it.
- **Variety:** the anchor changes angle/distance every few sentences (close, mid, full body squatting) — shoot 2–3
  framings if you can; each change is a free "cut".
- **Wardrobe:** a cap or a strong pattern reads well against the type; avoid solid green (it merges with the page).
- **For the cut-out:** `npx hyperframes remove-background face.mp4 -o matte.webm` (downscale to 720 wide first,
  ≈0.5 s per frame). Hair edges look best against a plain background.
- **Avoid:** a busy bright window behind the head (the display word sits there), walking out of frame.
