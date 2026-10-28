# Board: the faceless product explainer

> Read order: **this file** (the editing prompt) → **`language.md`** (how to build *any* new element in this
> style, incl. the five mandatory rules) → `theme.md` (numbers measured on the anchor, contributions).
> Anchor: one creator, **2 videos** (31455 "Karpathy skills / Day 1", 42755 "Claude Code just got mods"). Rules seen
> in only one of them are marked *(1/2)* in `theme.md`. Contributors: 70856, 9561, 67166 (translated).

## The idea in one sentence
A **faceless** explainer on a warm paper board: real product cards land on it with a thick ink outline and a
hard shadow, a little **pixel crab** hops between them and reacts, the title names the idea with one **coral
serif-italic** word, and the spoken word rides a coral pill in the caption — like a friendly product page that
explains itself.

## Who it is for
"X just shipped Y", tool tours, "3 things worth installing", daily series ("Day 1 of …"), launch recaps.
Voice-over only (or a voice-over with the speaker shown as **one more card**), 9:16, 30–60 s. It sells
**clarity with personality**: real UI, zero clutter, a mascot that makes it feel handmade.

## Editing character
- **The board is calm, the cards are bold.** Paper #ebe3d5 with a faint 54px grid. Everything that matters is a
  **card**: white, 4px ink outline, radius 18, a **hard 12px offset shadow** (no blur). Dark cards (terminals) get a
  coral shadow.
- **One accent: coral #e46c56** — the title's serif word, the caption pill, the mascot, progress, the next tile.
  Green #3c9c6c only for "done". Hazard yellow only in the dark "catch" section.
- **A header strip runs the whole video:** "• NAME" in mono on the left, a thin coral progress line on the right;
  for a list, a "STEP 1/3" row with one segment per step.
- **The mascot is the narrator's hand.** The pixel crab perches on the card being discussed, hops to the next one,
  snaps its claws on the key word, and pops a reaction (✓ ! ♥ ★ ?). It never talks and never covers content.
- **Transitions are toys:** a **pixel dissolve** (coral 60px blocks) between topics, an **iris** (coral circle →
  paper circle) when zooming into one thing (a number, a day). Inside a topic: hard cuts and card drops.
- **Quick and tidy:** cards drop with a small overshoot, parts pop in, rows tick, about 2 actions per second.

## Text
- **Title** (top, 20%): heavy sans 104px (Assistant / DM Sans 800) + one coral serif-italic word (David Libre
  slanted / Lora italic). Optional grey lead line ("Three:") or a small grey second line ("live since Oct 1").
- **Captions** (73.6%): 1–3 words, heavy sans 56px ink; the word being said sits in a **coral pill** (karaoke).
- **Variant "line"** *(1/2, from 31455)*: no title; the sentence itself sits at the top (17%), words go grey → ink
  as they are said, the key word in a coral **selection box** with handles, set in the serif.

## Sound
Voice, a soft low bed, and tactile UI sounds: thock (a card lands), pop (parts), tick (rows/checks), key (typing),
click (cursor), hop + snap (the crab), pixels (dissolve), iris (circle wipe), ding (done / the payoff).
Theme sfx: `thock pop tick key click hop snap pixels iris ding whoosh`.

## Never
- Skeleton lines inside cards (the anchor has some — translated: real text, see `language.md` §10b).
- Soft blurred shadows, gradients on cards, glass, glow (the dark section's warm light is the only glow).
- More than one coral word in a title; coral used for anything but "this one / now / next".
- The mascot covering text, the mascot as decoration with nothing to do.
- Logos of other companies; use the real product *name* in a card, never its logo.

## How to shoot for this theme
Board is **faceless**: record the voice-over only (clip-on mic or a quiet room, close to the mic, energetic and
fast — 3+ words per second). Screen recordings or screenshots of the real product are the best input: the cards
are built from them.
If you want to appear: film a **chest-up, centered** shot, any calm background; it is shown as a **card** on the
board (780 × 640, the head framed with `--b-face-fx/fy/zoom`), for 1–3 s at a time (the hook, a reaction, the
CTA). Look into the lens; keep hands below the chin.
