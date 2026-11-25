# Night: the framework on a dark stage

> Read order: **this file** (the editing prompt) → **`language.md`** (how to build *any* new element in this
> style, incl. the five mandatory rules) → `theme.md` (numbers measured on the anchor, contributions).
> Anchor: one creator, 4 videos (50462 "Addictive Storytelling Ladder", 19647, 33830, 41438). Contributors: 32135,
> 9041, 29402 (translated, see `theme.md`).

> **Not hooks:** night draws a *system* as light on a black stage, speaker in a box; hooks lands *one glowing word* on a full-frame speaker in a bright room.

## The idea in one sentence
A creator explains a **system** (a framework, a ladder of levels, a before/after curve) while the system itself
**lights up** above them on a black stage — neon structures, glowing curves, rows that unlock one by one — and the
speaker sits in a rounded window at the bottom with their head popping out of it.

## Who it is for
Frameworks, strategies, "the N levels of…", "why X stopped working", growth and content strategy, business
breakdowns. One presenter, 9:16, 40–120 s. It sells **authority**: this person has a system, and you watch it
being assembled.

## Editing character
- **The stage is night.** Near-black #101010 with a faint dot grid. Everything on it is *light*: neon red
  structures, white glowing lines and dots, a purple curve, yellow measuring bars, green "done". Nothing is
  "printed" on the dark; it glows or it is a dark panel.
- **One structure carries the video.** A ladder, a framework list, a chart: it comes back again and again
  (the anchor returns to its ladder 7 times), each time at a new level. The viewer always knows where they are.
- **Titles name the structure.** Bold sans with **one serif word** ("Addictive *Storytelling* Ladder"), words
  dropping in one by one; a **red box** behind the phrase that matters ("YOUR CONTENT").
- **Four layouts:** split (stage above, the speaker in the rounded box at the bottom, the head popping out — the
  default), the face full (talking points, emotion, no graphic needed), the **proof page** (light grey grid,
  for openings with real results), full (a cutaway or a punch takes the whole frame). Hard cuts.
- **Fast and cinematic.** Graphics brighten in from the dark, neon flickers on, a slow push-in while it holds,
  a **punch zoom with motion blur** into the detail the voice names. About 1.5–2 actions per second.

## Text
- **Captions:** ONE word at a time, white Inter Tight/Heebo 800, no outline, just above the speaker box (66%).
  Key terms in the serif.
- **Titles:** 66px, at the top (10%), sans 800 + one serif word; the red box for the key phrase.
- **Inside graphics:** level labels, row labels, tags — real words from the script, ≥26px.

## Sound
Voice first, a dark low music bed under it, and cinematic UI sounds: whoosh (layout change), neon (a structure
switches on), tick (lines/rows), key (typing), riser → boom (a punch zoom), ding (unlocked / the payoff).
Theme sfx: `click pop tick ding whoosh key neon boom riser`. The music bed is not shipped: use a dark, minimal
loop at -24 dB under the voice.

## Never
- Grey bars or skeleton lines (the anchor uses them inside its "documents" — translated: real text lines with
  real highlights, see `language.md` §10b).
- A light background outside the proof page; colored panels; gradients that aren't light (glow).
- More than one accent color *meaning* per element; neon on text paragraphs.
- Rotations, bounces, wobble; any glow on the footage.
- Logos of other companies.

## How to shoot for this theme
- **Shot:** chest-up, speaker **centered**, a little headroom. In split only the **head and shoulders** show in the
  box (the box is 942 × 490 px at the bottom), so keep your head in the middle third of the frame and don't lean
  out of it. The head pops 50 px above the box: keep the top of your head clear (no shelf or lamp right on it).
- **Background:** **dark** and moody (a room with practical lights, LED strips, shelves out of focus) — the
  anchor's room is almost black with cyan/blue accents. A dark sweater/cap fits. A **white wall works** but is
  graded down (`.n-face.grade`, brightness 0.78) and looks less native.
- **Light:** one soft key light on the face, everything else darker.
- **Audio:** clip-on mic; speak in short, punchy sentences — the captions are one word each.
- **For the pop-out:** run `npx hyperframes remove-background face.mp4 -o matte.webm` (≈0.5 s per frame on CPU;
  downscale to 720 wide first). Without a matte the box simply clips the head (`layout(..., { pop: false })`).
- **Avoid:** wide shots, standing far from the camera, walking, a hand in front of the face for long.
