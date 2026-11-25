---
name: brand-flow-promo
description: >
  Build a "brand flow promo" for a website or app in the style of the Airbnb / Amazon / Kreativelyy
  reference reels: the brand's real UI is taken apart into floating cards on a clean backdrop, a virtual
  camera pushes through one continuous booking/purchase flow (logo, search, pick, details, pay,
  confirmed), one kinetic headline on a brand-colour card resets attention in the middle, and the logo
  draws itself at the end. Use when the user asks for a promo "like the Airbnb video", "like the Amazon
  one", "סרטון לאתר", "סרטון ברוחב מחשב למותג", or names the skill. 16:9 1920x1080 60fps by default,
  20-30 seconds, code only (HyperFrames + GSAP/vanilla JS), real site content.
---

# brand-flow-promo

Learned from three reference reels (full breakdowns in `reference/analysis.md`):
- **Airbnb** (30 s, light): phone reveal, calendar card, map with price pins, coral headline card, 3D photo carousel, exploded listing, reserve, confirmed, logo draw.
- **Amazon** (22 s, dark, narrated): light-streak logo, phone search, buy button that morphs into a confirmation pill, 3D city route, parcel, kinetic slogan, logo.
- **Kreativelyy** (12 s, 1:1): dark hook that snaps to a light SaaS look, typed search, cards fanning out, a `+` that grows into a button, checklist, done badge.

First build: **Isrotel** (`videos/isrotel-promo/`).

## 1. What makes the style (the eight rules)

1. **Deconstructed UI.** Never show a flat screenshot. Rebuild the real widgets (search bar, date picker, room card, price, button) as separate cards and let them float.
2. **One flow, one camera.** The film is a single user journey. The camera pushes, tilts and whips between steps; no hard cuts except onto the headline card.
3. **Depth.** Cards sit on different Z planes with soft, wide contact shadows; the far ones are slightly blurred. Parallax on every camera move.
4. **Springs.** Everything enters with overshoot (`back.out`) and settles; exits are short and eased in. Typical beat: 0.8-1.5 s.
5. **Micro-interactions.** A cursor types, clicks and drags. Buttons press (scale 0.96), ripple, and morph into their result (button -> confirmation pill).
6. **Attention reset.** Once, in the middle, cut to a full brand-colour card with one bold line, then back to the light UI.
7. **Real photos as cards.** Destination photos appear as a 3D fan/carousel of rounded cards, not as full-screen stills.
8. **Logo bookends.** A short logo moment opens the film; the logo draws itself (stroke trim, then fill) to close it, with the slogan and a small credit.

## 2. Inputs

| Input | Source |
|---|---|
| Brand site | Capture with `tools/capture.cjs` (desktop viewport, DPR 2): page screenshots, link list, image list, fonts. The hosts must be allowed in the environment's network settings. |
| Logo | The site's own SVG. |
| Colours and font | From the site's CSS. If the font is licensed, pick the closest free Hebrew font and say so. |
| Photos | The site's own large images (keep the originals in `assets/img/`). |
| Facts on screen | Names, prices, badges and labels copied verbatim from the capture. List each with its source page. Nothing invented except the generic "order confirmed" step, which is labelled as concept. |

## 3. Storyboard template (about 24 s)

| # | Time | Beat | On screen |
|---|---|---|---|
| 1 | 0-1.6 | Logo in | Logo pops on the backdrop, one brand accent moves. |
| 2 | 1.6-4.6 | Search | The real search bar as a floating card; cursor types the destination; the date card opens and two dates get picked; click on search. |
| 3 | 4.6-6.6 | Choose | A map or grid of options with pins/cards popping; push into the chosen one. |
| 4 | 6.6-8.4 | Headline card | Brand colour, one bold line. |
| 5 | 8.4-11.6 | Photos | 3D carousel of three to five photo cards. |
| 6 | 11.6-16 | Details exploded | Title, badges, key numbers, one room/product card with its real price, amenities chips. |
| 7 | 16-19.6 | Act | Booking card, cursor click, button morph, loyalty/discount badge. |
| 8 | 19.6-21.6 | Confirmed | Confirmation card (concept), flips away. |
| 9 | 21.6-25 | Logo out | Slogan, logo draw, credit "spec ad". |

## 4. Build rules

- One HTML page, one `draw(t)` function driven by a single linear GSAP tween (seek-safe, deterministic). A `world` element holds the cards; the camera is a transform on it (`perspective` on the parent), with holds on each beat and eased travel between them.
- Cards are HTML/CSS (real text, RTL), photos are `<img>`. Shadows: two layers, e.g. `0 30px 80px rgba(brand,.18), 0 4px 12px rgba(0,0,0,.06)`.
- Cursor: an SVG arrow with its own keyframes; it presses on click and the target reacts on the same frame.
- Motion blur on fast camera travel (blur along the direction of travel), nothing else gets blur for decoration.
- Sound: a rhythmic bed, a soft pop on every card, a click on every press, a whoosh on every camera travel, one impact on the headline card. Narration is optional.
- Verify loop before rendering: contact sheet across the whole film; check overlaps, clipped cards at the frame edges, text below about 28 px, and that every fact matches the capture.
- First show one beat (logo + search) at final quality for approval, then build the rest.

## 5. Honesty

It is a spec ad: say so in the credit and in the post. Prices and offers are a snapshot of the capture date; put the date in `brief.md`.
