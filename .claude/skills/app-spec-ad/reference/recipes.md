# Recipes: every element, with the numbers that worked

These are distilled from `videos/yellow-guide/src.html` and `videos/bit-guide/src.html`, the user-facing making-of pages with a copy-paste prompt per element. Working code is in `videos/bit-spec/index.html` (copied to `reference/bit.html` by `new.sh`).

`--c` is the brand accent. Yellow used `#ffd400` with halo `#ffb300`, glow `#ffd400` and core `#fffbe8`. Bit used tube `#39edf6`, halo `#16c4d2` and core `#f0ffff`.

## Stage
- **Size and frame:** 1920×1080, 60 fps, `#root` is `direction: rtl`, font Rubik 800/900 (from the kit).
- **Backdrop:**
  - black (Yellow) or graphite `#15191b` (Bit);
  - `#halo`: a radial gradient in the brand colour at about 16% → 6% → 0;
  - `#grain`: a 5px dot pattern at opacity 0.05;
  - `#vig`: a radial vignette to 0.55.
- **Dust:** 40 dots of 3px in a seeded rnd, drifting slowly over the whole film.
- **World strip:**
  - `#world` = N panels × 1920px, **laid out right-to-left**: `X(p,x) = (N-1-p)*1920 + x`.
  - `#cam` pans between panels: `x: -X(p,0)`, duration 0.5 s, `power3.inOut`. The pan happens on the word that starts the next beat.
  - Inside each panel, a slow push: `scale` 1.0 → 1.03, linear, for the panel's whole time.

## Neon line (`piece(d, a, b, {ease, chain, hold, noHead})`)
- **Three stacked copies of one SVG path:**

  | Layer | Stroke | Effect |
  |---|---|---|
  | halo | 28 | `blur(16px)`, opacity 0.55 |
  | tube | 7 | double `drop-shadow` in the brand colour |
  | core | 2.4 | white |

  `stroke-linecap: round`. It draws with `strokeDashoffset` from L to 0.
- **The head (spark):**
  - a 72px radial-gradient dot plus a 220px light streak;
  - keyframed along `getPointAtLength` using the piece's ease, about 30 samples per second, rotated to the tangent;
  - fades with `opacity 0, scale 0.3` over 0.25 s where the piece stops;
  - with `chain`, it hides instantly when the next piece continues;
  - with `hold:t`, it stays lit, which is what the final bloom needs;
  - it pulses: `.head b` scale 0.85 ↔ 1.15, period 0.18 s.
- **Paths:**
  - Write them in panel-local coordinates and map them with `P(p, "M…")`.
  - Use only `C`/`Q` curves and straight runs. A corner is always a `Q` with a radius.
  - Enter and exit panels **low** (y ≈ 990–1035), under the headlines, never through text.
- **Phone loop (`LOOP`):**
  - a rounded rectangle 14px outside the phone, radius 70;
  - it starts and closes on the phone's right edge;
  - the piece arriving there must end **vertical**, so the loop continues without a kink.
- **Exit from the phone:** peel off the bottom of the loop, horizontal at first and in the same direction as the loop. Then a soft bezier down and straight out to the panel edge. Time it so the line reaches the edge exactly as the camera pans.
- **Split around a card:**
  - two symmetric paths start at the same point, mid-height of the card's side, with the same length, duration and ease;
  - corners have radius 60, and the first turn is a soft `Q` from horizontal to vertical;
  - each path has its own spark;
  - they meet mid-height on the far side and leave as one line.
- **Rays / branching:**
  - straight, equal-length rays from the centre object, fired 0.2 s apart (`power2.out`, no head);
  - each item pops at the end of its ray (`back.out(2.6)`, with a pop);
  - Bit used 5 rays at -52, -26, 0, 26, 52°;
  - Yellow placed 5 circles on a regular pentagon (radius 280 at 36/108/180/252/324°), with the gap open towards the incoming line.

## Neon selection frame (`frameLayers(panel, d, at, out)`)
- **Shape:** the same three layers, drawn in 0.3 s (`power2.inOut`), 10px outside the element, with the element's own corner radius. Use `rectD(x,y,w,h,r)`, `circD(cx,cy,r)` or a pill (r = h/2).
- **Layering:** it sits above the element (z-index 6) and fades with it.
- **Tap:** an 80px ring with the brand fill at 22%. It expands and fades. The element presses `scale 0.94` (or 0.9) as a yoyo over 0.07 s.

## Phone (CSS)
- **Body:**
  - 400×820, radius 64, body `#050606`;
  - a 2px edge ring and a large soft shadow;
  - Dynamic Island 104×30.
  - Yellow used 330×660 / r54. Both work.
- **Screen:**
  - inset 12px, radius 52, `overflow: hidden`;
  - the screenshot is scaled to 2× the display width (752px for the 376px screen).
- **Entry:** `rotationY 28, z -260` → `rotationY -10`, `expo.out`, then a slow continued turn.
- **Shine:** a white 110px band at 18° sweeps across the screen once.
- **Screen changes:** stack the `img`s inside `.scr` and swap them on the narrator's word (the new one enters from below). Two screenshots, say 0 and 10, read as typing.
- **Real app motion** (a loading → check, a logo animation):
  - cut the clip with ffmpeg and speed it up (`setpts=PTS/1.6`);
  - place it as a `<video class="clip" data-start data-duration data-track-index muted playsinline>` inside the screen.

## Pop-out element
- **Crop:** cut the element (button, card, amount, balance) from the screenshot with a 4× mask.
- **Placement:** start it at its exact on-screen position, computed from the screen scale. Then it grows to about 190px (a button) or about 400px wide (a card) beside the phone, `back.out(1.4–1.5)`.
- **Dark buttons:** a dark button on a dark backdrop gets its own white card (padding 12, radius 22). Keep the image at its natural size, and watch `box-sizing` so it isn't stretched.
- **A single changing digit** (balance 2→3):
  - cut both digits from the real screens;
  - stack them in a small `overflow:hidden` window coloured like the card;
  - slide up one digit height with `back.out(1.4)`.

## Headlines
- **Hook:**
  - centre, Rubik 800 at about 170–180px;
  - line 1 is white, line 2 is `<em>` in the brand colour with a glow;
  - each word enters from `blur(22px)` and `scale 1.35`, at the **exact word time** from `words.json` (the stagger falls out of the speech).
- **Beat headlines:**
  - right column (`right:140px; top:300px; width:620px`), 92px, line-height 1.06;
  - one key word per headline in `<em>`.
- **Closing line:** every word rises on its spoken time. The brand word comes last and holds for a full second.

## Opener (1 s, in front of everything)
- **Build:**
  - the whole film lives in `tl`;
  - `master.add(tl, 1.0)`, and every audio `data-start` moves +1 s;
  - before `master.add`, run `tl.seek(0.001)` so the film's start state is set at load time and no default layout flashes during the transition.
- **Look:**
  - an opaque layer with the same backdrop and halo;
  - the icon pops from `scale 0`, `back.out(2.4)`, with a small rotation from -12° to 0;
  - it breathes, then exits `back.in` at 0.76 s;
  - a pop on entry, a whoosh on exit.

## Ending
- **Bloom:** the last line stops at the centre with its spark **held lit**. From it, `#bloom` opens `clip-path: circle(0 → 1200px)` in the brand colour, over 0.16 s, `power1.in`, with an impact.
- **Logo:** then the real logo animation from the app's launch recording, cropped and enlarged with a soft radial mask. Yellow used a static logo with `scale 1.2 → 1`, `expo.out`.
  - Sample the rendered video's colour for the bloom, because video shifts the hue slightly.
- **Credit:**
  - a dark screen with "CREATED BY" small and widely tracked;
  - "Refael Levi" enters from blur;
  - a brand-colour glowing line stretches underneath (`scaleX 0 → 1`).

## Hero object (optional, e.g. the El Al plane)
- **Layer:** a transparent PNG in a layer **above** the world, so the camera moves don't affect it.
- **Motion:**
  1. It emerges from the phone screen: `scale 0.08 → 0.15` over 0.3 s.
  2. It climbs, `sine.inOut`.
  3. It flies into the lens: `scale 5`, `blur 0 → 6px`, `power3.in` over 0.65 s, with a strong whoosh.
- **Exit:** the phone and headline fade as the plane grows, and the brand bloom follows.

## Sound
- **Narration:**
  - ElevenLabs, formal deep male voice (Itamar), `eleven_v4`;
  - deepening chain `asetrate=44100*0.95,aresample=44100,atempo=1.0526,bass=g=3:f=140`, then `loudnorm` to -16 LUFS;
  - fix mispronounced words with niqqud (e.g. מִבְצָעִים) and re-record only that sentence.
- **Music:** `data-volume="0.34"`, with carve `{"enabled":true,"sources":["vo"],"strength":0.3}`.
- **SFX** (from the kit): whoosh on every camera pan, pop on every pop-out, impact on landings and on the bloom. Riser optional. No loud click.

## Privacy
- **Find:** list every person's name, profile photo, account/confirmation number, barcode, licence plate, address/location, and other apps' notifications.
- **Replace:**
  - erase each one with a rectangle in the **sampled background colour**;
  - redraw dummy data at the same size and weight (Rubik, PIL with `direction='rtl'`; `scripts/crop.py redact` does both);
  - replace a profile photo with an illustrated avatar from the app;
  - draw a generic barcode in SVG.
- **Video:** don't use video segments that contain private data.
- **Storage:** keep the uncensored originals in `assets/raw/` (gitignored).
