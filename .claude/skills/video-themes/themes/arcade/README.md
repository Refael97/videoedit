# Arcade: the explainer that plays like a game

> Read order: **this file** (the editing prompt) → **`language.md`** (how to build *any* new element in this
> style, incl. the five mandatory rules) → `theme.md` (numbers measured on the anchor, contributions).
> Anchor: one creator, 4 videos (5777 "the arena skill", 208, 58260, 95186). Contributor: 81673 (translated, see `theme.md`).

## The idea in one sentence
A creator talks to camera under a calm off-white page where every idea becomes **a tiny video game** — a pixel
mascot walks into a scene, a crowd of pixel creatures multiplies, a HUD asks for a cheat code — and real UI cards
get attacked by a **red pen** (strikes, circles, a scrawled verdict). Every caption is a dark mono label pill
sitting exactly on the seam.

## Who it is for
AI tools, skills, workflows, "how I made X do Y" — tech explained with humor. One presenter, 9:16, 30–45 s.
It sells **fun + clarity**: a gag for the concept, the real screen for the proof.

## Editing character
- **The page is quiet; the games are loud.** Off-white #efedeb with a barely-visible 90px grid. All color lives
  inside pixel scenes, sprites and the red pen.
- **Two kinds of picture, alternating:** (1) a **pixel world** for the concept (a graveyard for dead phrases, an
  arena for competing answers, a library for knowledge, an office for agents), (2) a **real UI card** for the proof
  (the message, the page, the setting), marked up by the red pen.
- **One mascot.** "Bit" (the theme's jelly bot, coral) is the hero of every game; crowds are Bit in 8 colors.
- **Layouts:** split 40/60 (the page on top, the face below — the default), the page full (big boards, crowds),
  a full-bleed pixel world (big moments), the face full (rare). Hard cuts, ~every 2–3 s.
- **Game physics.** Sprites spawn in 3 pixel steps, hop in stepped arcs, walk with a 2-frame bob; cards rise
  smoothly. The pen draws at hand speed. About 2 actions per second.

## Text
- **Captions:** 2–3 words in a dark pill (#353a36), JetBrains Mono UPPERCASE with wide tracking (Latin) / IBM Plex Sans
  Hebrew 600 (Hebrew), 40px, centered on the seam (y 764) in every layout.
- **On sprites and props:** real words (a tombstone says "RIP / עוד אתר משעמם").
- **HUD:** Silkscreen pixel caps for Latin game text ("ENTER SKILL CODE", "SKILL ACTIVATED!").
- **The red pen:** Gveret Levin / Caveat in marker red #d03440, one word, rotated −6°.

## Sound
Voice first, a soft bed, and **8-bit** UI sounds (square waves): spawn, blip (menu / bar block), jump (hop), coin
(a reward), powerup (an unlock / the payoff), hit (a defeat / a drop), pen (marker on paper), plus whoosh and key.
Theme sfx: `blip coin jump spawn powerup hit pen whoosh pop key` (`sfx_extra.py`). Keep the square waves at 0.1–0.2 volume.

## Never
- Pixel art copied from games or brands; the anchor's mascot (a company's mascot) — use Bit.
- Grey placeholder bars inside cards (the anchor has some — translated: real lines, see `language.md` §10b).
- Smooth easing on sprites (they step); pixel scaling on UI cards (they're smooth).
- Glow, gradients on UI, dark backgrounds outside pixel worlds and the HUD.
- More than one game on screen at a time.

## How to shoot for this theme
- **Shot:** close-up, face centered, eyes at ~55% of the frame height — the split shows only the bottom 60%, so
  keep the whole head below the top 40% (the anchor frames tight: forehead to chest).
- **Background:** a warm, soft room (beige wall, a dark sofa) — anything calm; bright walls are fine (the page above
  is light too, the seam is a clean straight edge).
- **Light:** soft daylight on the face.
- **Audio:** clip-on mic or close shotgun; talk fast, joke-paced.
- **Avoid:** wide shots, standing far back, the head in the top 40% (it gets cut by the page).
