# Headline: the news-desk explainer

> Read order: **this file** (the editing prompt) → **`language.md`** (how to build *any* new element in this
> style, incl. the five mandatory rules) → `theme.md` (numbers measured on the anchor).
> Anchor: one creator, 5 videos (97418 "Remove Your TV's Ads With Claude Code", 75789, 81754, 89398, 98315).

## The idea in one sentence
A creator reports a **real thing that happened on the internet** — a tweet, a repo, a tool, a result — and the
proof floats above their head on a bright, airy wall: real screenshots in thin blue-edged windows, a bold headline
with **a blue box in serif italic**, and numbers that roll up on a dark stat card.

## Who it is for
"Someone just built X", "4 free tools that…", news and tool roundups, product discoveries. One presenter,
9:16, 30–50 s, fast. It sells **credibility**: every claim has its receipt on screen.

## How it differs from `night`
Both use a box + serif accent, but they are opposite worlds: headline is **light** (bright wall, ink text, one blue),
night is **dark** (black stage, neon structures). Headline shows **real screenshots** (receipts); night builds
**diagrams** (systems). Headline's speaker is on the real background, low in the frame, no box; night puts them in a
rounded box. Headline words **blur in**; night's graphics **ignite** and neon flickers. Headline captions build
**up to 3 words karaoke-style**; night shows one word.

## Editing character
- **The wall is the page.** The speaker sits low (head top at ~55%), the bright wall above them is where the
  graphics live. No panels, no frames around the speaker.
- **Receipts, not illustrations.** Tweets, GitHub pages, terminals, product pages — real UI in a browser/terminal
  window with a thin dark-blue edge and a light halo. A focus ring lands on the button that matters; a selection
  sweeps over the sentence that matters.
- **One headline per video** (the opening): ink sans + a **blue box** with the serif words; **section headers**
  on a white page for lists ("Plugin Number *Two*").
- **Numbers become stat cards:** a dark navy card on top of the dimmed screenshot, the number in a white→blue
  gradient rolling up to the payoff.
- **Cuts to a dark screen** for terminals and code: navy, a glowing window, white captions.
- **The CTA on the full face:** "comment" in serif, then the keyword huge in glowing yellow, in quotes.
- **Soft and fast:** everything blurs in (≈0.25 s), screenshots swap every 1.5–3 s, ≈2 actions per second.

## Text
- **Headline:** 80px sans 700 ink + 92px serif bold italic white in a blue (#0283fd) box, top 11%.
- **Captions:** up to 3 words, 72px sans 700 ink, each word blurs in as it is spoken; the key word in the **blue serif**.
  White on dark and on the full face.
- **Inside windows:** real text, ≥26px as shown.

## Sound
Voice first, almost no music (at most a very soft bed). Soft air sounds on every blur-in (`air`), a whoosh / swish on
layout cuts, ticks for selections and list lines, `roll` for a number rolling up, a click for a focus ring, `ding` for the payoff.
Theme sfx: `air roll click pop tick ding whoosh swish key`.

## Never
- Grey skeleton lines or fake UI: if you don't have the real screenshot, build a real-content window (`.h-win` with
  real text) — never bars.
- Colors other than ink, white, the blue and the CTA yellow (the yellow only at the CTA).
- Neon, glow on anything but the stat number and the CTA keyword; rotations; bounces beyond `back.out(1.6)` on the CTA.
- A box around the speaker; graphics over the face in split.
- Logos of other companies drawn by us (a real screenshot that contains one is fine — it's the receipt).

## How to shoot for this theme
- **Shot:** the speaker **low in the frame** — head top at ~55%, shoulders to the bottom edge, centered, looking
  into the lens. Leave the top half as clean wall. If the footage is framed higher, the edit drops it
  (`layout(..., { drop })`) and the air veil fills the top.
- **Background:** a **bright, plain wall** (white / light grey / cool), soft window light; leaf shadows are a bonus.
  A darker wall works but the air veil becomes visible as a gradient.
- **Wardrobe:** a **dark top** (black hoodie): the white captions on the full face and the ink captions both read.
  A white shirt makes the full-face captions hard to read.
- **A second, closer angle** (or 4K to crop) for the CTA; otherwise the edit punches in 1.18×.
- **Audio:** a podcast mic on a stand or a lav; fast, newsy delivery.
- **Avoid:** busy or dark backgrounds, the speaker high in the frame with no wall above, wide shots.
