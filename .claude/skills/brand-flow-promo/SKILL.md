---
name: brand-flow-promo
description: >
  Build a premium "brand flow promo" from nothing but a website link: capture the real site, then produce a
  16:9 1080p 60fps film of about 30 seconds in the style of the Airbnb reference reel. Logo draw-on, a 3D
  map or hero stage with floating photos, destination/product cards whose real photos come alive as video
  clips, a photo carousel on a full-screen brand colour, a camera flight through a space of floating details
  (title, photo strip, chips, a counting number, feature tiles, price card), a booking/purchase flow that ends
  on "confirmed", and the logo drawn out of the last element. Real motion blur, depth of field, a dedicated
  score and a sound per hit. Use when the user gives a site URL and asks for an ad / promo / "פרסומת לאתר",
  "סרטון לאתר", "סרטון כמו של ישרוטל", "כמו הסרטון של Airbnb", "סרטון ברוחב מחשב למותג", or names the skill.
  Hebrew-first (RTL) but works in any language. Code only for the motion (one draw(t) page rendered with
  sub-frame motion blur); optional paid steps (video model, music) need the user's go-ahead.
---

# Brand flow promo: a site link in, a finished ad out

The worked example is Isrotel (`videos/isrotel-promo/`, final file `renders/isrotel-promo-v3.mp4`). Its page
and scripts are copied in `example/`. Everything below was learned on that project, including the three
rounds in which the user sent the film back. Read `reference/lessons.md` before you start: it is the list of
what went wrong and what the user asked for, in their words.

## The bar (what the user will judge)

The user compares the result to the Airbnb reel (`reference/airbnb-breakdown.md`). Their notes, in order:

1. "It works" is not enough. Finish level matters as much as style: depth of field, motion blur, big elements,
   layered shadows.
2. The film must **open on the logo**.
3. Every moment something happens. No hold longer than about 1.5 s without a new element or a camera move.
4. Camera moves that travel through things, floating elements, strong motion effects.
5. More photos, and more colour: a full-screen brand-colour beat, colour in the background.
6. It must **end with an actual booking / purchase**, then the logo.
7. Luxury score and high-quality sound effects.
8. Do not send a "final" before the small details were checked frame by frame.

## Inputs

- The site URL (required). Optional: specific pages, the current logo file, the language, the length.
- If the logo on the site is old or low-res, ask for the current file. The user corrected this once.
- Ask nothing else. Derive the rest from the site and state your choices in the report.

## Process

### 1. Scaffold and capture
```bash
.claude/skills/brand-flow-promo/scripts/new.sh <name> <site-url> [<product/hotel page url> ...]
```
- `tools/capture.cjs` saves 2x screenshots (`assets/raw/<name>_top.png`, `_sNN.png`) and a JSON of links,
  images and fonts. `assets/raw/` is git-ignored.
- If the proxy refuses the site, read the environment docs and propose adding the exact hosts (site, its media
  host, its image CDN). Do not work around it.
- Read the screenshots. Take from them: brand colour, logo, real texts (headline, button labels), 3 products /
  destinations with a real name, a real "from" price and a real room/product type, real counts and facts.
- Download the large originals of the photos you will use (hero images are usually 1920 wide).
- Write `brief.md`: a table of every text and number on screen and its source. Anything not from the site is
  marked as yours. This table becomes the "what is mine" list in the final report.

### 2. Study the reference with your own eyes
- Never work from a text description of a reference video. Get the file (the user can push it on a temporary
  branch; Instagram is blocked from the cloud) and run `tools/refframes.sh <video> <dir> [crop]`.
- Compare the sheets against your own frames before every delivery. The gap list in
  `reference/airbnb-breakdown.md` is the checklist.

### 3. Storyboard (about 30 s, the proven structure)
| Time | Beat | Notes |
|---|---|---|
| 0–2 | Logo | contour rings tighten, outline draws letter by letter, fill lands, logo parks small in a corner |
| 2–4.7 | Stage | 3D map slab with pins (or the brand's equivalent "where/what" stage), site headline, photos floating around in depth |
| 4.7–16 | Three items | camera flies to a pin, a card pops out of it (name, type, price counting up), the card photo comes alive, opens to full frame with a two-word line and a glass price bar, closes back into the pin |
| 16–18.5 | Carousel | brand colour grows over the frame, nine photos on a ring spin fast and settle on the chosen one, "find yours" line |
| 18.5–24 | Detail space | camera flies station to station: title + hero, photo strip with counters, chips, a card with a counting number, six feature tiles, a huge photo, the price card |
| 24–28 | Purchase | cursor clicks, the button grows into a brand-colour card, flips into a summary sheet, confirm click, card with spinner, check mark and "confirmed" |
| 28–30.4 | Logo | the card shrinks to a dot, the logo draws out of it, slogan, credit |

Adapt the nouns to the brand (shop: products instead of hotels, "add to cart / order placed"). Keep the rhythm.

### 4. Build
- One page, one `draw(t)`, no timeline library. Everything is a pure function of `t` (see `example/`).
- Start from `example/promo3.html`, `promo3.js` (first half) and `promo3b.js` (second half). Replace assets,
  texts, colours and timings; keep the engine pieces. The example is Isrotel's code without its images, logo paths
  and clips, so it does not run as copied: the page waits for `window.__ready`, which is only set once
  `assets/img/logo_paths.js`, `assets/img/map_paths.js` and the photos it names exist. Build those first.
  - `mkLogo(svg, ringsEl)` → `(t, t0)`: rings + per-letter outline draw + fill. Logo paths come from
    `tools/trace_logo.py` (one path per letter, from the user's PNG).
  - Map slab: `tools/country_outline.py` writes `window.MAP`. Twelve stacked SVG layers give thickness, a blurred
    copy gives the shadow, a dot pattern gives the top. Pins live in a **sibling** container with the same
    transform (inside the same 3D context they vanish behind the slab).
  - `LOC[]` cards: pop out of the pin's screen position, price counts, a `<canvas>` "portal" tracks the card
    photo's rect and opens to 1920×1080 and back.
  - Detail space: `add(html, cls, x, y, z, w, h)` objects, `cam3(t)` keys `[t, cx, cy, cz, focusZ, rx, ry]`,
    `put()` computes blur from the distance to the focus plane, `pop()` is the spring entrance.
  - Morphs for the purchase: `rectTo(el, x, y, w, h, r)` from a button's `getBoundingClientRect()` to a card.
- Numbers that count must step per frame: `frameT(t) = floor(t*60)/60`, or motion blur ghosts two digits.
- Fonts: the brand font is usually licensed. Use the bundled Heebo (300/400/700) and say so.
- Hebrew: no tight letter spacing; wrap any `@handle` or Latin run in `<span dir="ltr">`.

### 5. Living photos (optional, paid)
- A video model turns a real site photo into 4–5 s of motion. Used on Isrotel: Higgsfield `magi_2`,
  image-to-video, 1080p, no audio. It is **not free** (about 12.5 credits per 5 s there). Quote the cost with
  the estimate tool and get the user's go-ahead before the first clip; do not generate more than agreed.
- Always anchor to real photos: `start_image` = the card photo cropped to 16:9. Use `end_image` = a second
  real photo when the camera should arrive somewhere real (room → balcony).
- Prompt pattern: "The still photo comes alive. One continuous, smooth, slow cinematic dolly forward … gentle
  ripples / curtains sway … photorealistic, no people, no text, no cuts; <things> stay exactly as in the photo."
- `tools/clip60.sh clip.mp4 assets/video/<name>` makes 60 fps frames. The page draws them on a canvas through
  `window.__settle()` (one decoded image at a time), which the renderer awaits. Git-ignore the frames.
- Without a video model: keep the portal and animate the still (slow push + parallax). Say that it is a still.

### 6. Sound
- Score: one dedicated cue at the film's length + 0.6 s (ElevenLabs music, about 900 credits; ask first unless
  the user already approved spending). Prompt the structure by seconds to match the beats. Check for vocals by
  transcribing it; empty text means none.
- Effects: the five generated files in `assets/audio/fx_*.mp3` (airy whoosh, soft sub boom, glass pop, card
  swish, shimmering swell). Their raw levels differ a lot; `example/mix_example.py` has the gains.
- One sound per hit: swell on a reveal/open, boom on a landing, pop per chip/pin/click, card on a card,
  whoosh on a camera flight. Target about −15 LUFS. When only audio changes, re-mux; do not re-render.

### 7. Check, render, check again
```bash
node tools/mb.cjs shots <page> <dir> <t1> <t2> ... && python3 tools/sheet.py <dir>     # stills
tools/render.sh <page> <duration> assets/audio/bed.m4a renders/<name>.mp4 <work-dir>   # 6 samples per frame, resumable
```
- Before rendering, shoot at least one frame per 0.7 s and at every entrance. Look for: text or chips cut by the
  frame edge, overlaps, labels colliding, empty frames between scenes, an element that never appears,
  text unreadable on a photo, anything smaller than about 24 px.
- Rendering is slow (roughly 2–3 minutes per film second on 4 cores). Run it in the background with a 2 h
  limit. Fix everything in stills first.
- After rendering, tile about 50 frames of the mp4 and look again. Only then send.

## Finish rules (the difference between "nice" and "high level")

- **Depth of field**: only the focus plane is sharp. Blur = distance from the focus plane, in every scene.
- **Real motion blur**: sub-frame accumulation (the renderer does it). Never a fake blur filter on moving things.
- **Scale**: the main element fills 40–60% of the frame. Small cards in a big empty frame read as a template.
- **Shadows in three layers** (contact, ambient, long), a 1.5 px light rim on cards and photos, 28–44 px radii.
- **Colour**: the brand colour full-screen at least once; two soft colour blobs drifting behind white scenes;
  one accent. Photos carry the rest. No neon, no bloom.
- **Entrances**: spring for objects (scale 0.5→1, tilt, rise), words and letters resolve out of blur one by one.
- **Transitions are morphs**: a button becomes a card, a photo becomes the frame, a card becomes a dot, the dot
  becomes the logo. No plain fades between scenes.
- **Camera never parks**: every hold still drifts; flights use ease in-out quart and pass close to an object.
- **Photos everywhere**: floating around the stage, flying through the detail space, at least 20 distinct
  real photos in the film.
- **Text on video**: white, big, with a top gradient shade strong enough for the brightest clip.

## Honesty and reporting

- Real names, prices and facts only from the capture date; say the date. Anything invented (the booking dates,
  totals, feature tiles read off photos, taglines, a hotel count you summed) goes in a "mine, not from the
  site" list in the report.
- Say which borders a map outline includes.
- Report costs per service after every paid step.
- Say what was not verified: you check frames, not continuous motion, and you cannot hear the mix. The user's
  eyes and ears are the last check; tell them exactly what to look and listen for.
- A spec ad credit line stays on the last frame ("ספק אד · נוצר על ידי …").
