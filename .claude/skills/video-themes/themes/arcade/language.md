# arcade: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (5777, 208, 58260,
> 95186); anything borrowed from another creator is translated and listed in `theme.md` → Contributions.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Page** | off-white #efedeb, 90px grid #e7e5e2 (barely visible) | the *desk*, calm | the stage: top 40% in split, full screen in page mode |
| **Pixel world** | a generated pixel landscape or room (banded dithered sky, sun, skyline, speckled ground / wallpaper + checker floor) in a rounded card (radius 22) or full-bleed | *the concept as a game* | metaphors: a graveyard, an arena, a city at night, an office, space |
| **Sprite** | pixel creatures and props on a grid (`ARCADE.SPR`), crisp edges, never smoothed | *a character or a thing* in the game | Bit (the mascot), crowds, coins, hearts, stars, checks, crosses, crowns, tombstones, monitors, envelopes, locks |
| **UI card** | white #fcfbfa, radius 22, soft warm shadow, serif body text for real messages, mono tags | *the real thing* | a message, a page, a setting, a list — the proof |
| **Red pen** | marker red #d03440, 6px wavy strokes, a handwritten word | *the creator's judgement* | strike, circle, scrawl a verdict |
| **HUD** | navy #1e2246 panel with a double light-blue pixel border, Silkscreen caps | *the game's interface* | codes, power bars, scores, levels, unlocks |

Rules: pixel things are pixel (stepped motion, crisp edges); UI is UI (smooth). The pen only on UI cards and the page.
The HUD only over a pixel world or the page.

## 2. Anatomy

Every page composition = **one window (a world card / a UI card / a row of 3 small cards) · the pen or sprites acting on it**.
- A world holds **one mascot action** (walks in, hops, is crowned) + up to 3 props with real words.
- A UI card holds the real text; the pen makes **at most 3 marks** (strike, circle, scrawl) in reading order.
- Limits: 3 small cards in a row, 1 HUD, 1 crowd (≤100 sprites), 1 scrawled word.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Caption pill | 84px tall, radius 12, #353a36, text 40px (JetBrains Mono 500 UPPERCASE +0.12em / Plex Sans Hebrew 600 +0.04em), center y 764 |
| World card | x 90–990, y 255–695 (440 tall), radius 22 |
| UI card | x 90–990 from y 255; serif body 40–46px, titles 38–78px Plex/Inter 700, mono tags 26px |
| Small cards (3 across) | 280 × 440, gap 30, sprite icon 66px, title 40px |
| Sprites | pixel size 8–12px (a 12-wide sprite = 100–150px); mascot 120px in a card, 220px in a full world; crowd sprites 66px |
| HUD | 860 wide, Silkscreen 40px, input 86px tall (46px), power blocks 58×40 |
| Speech label | Plex/Inter 700 30px, 3px outline, radius 10 |
| Scrawl | 74–100px marker font, −6° |
| Multiplier | "×100" 130px Inter 700, the × in marker red |
| Text inside anything | **minimum 26px** as shown |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| coral #d77656 | *us / the hero* | Bit, numbered CTA steps, the comment box, a primary button |
| marker red #d03440 | *wrong / boring / look here* | the pen only, the × of a multiplier |
| gold #e8c03a | *reward* | coins, stars, crowns, the HUD power bar |
| green #3fbf5b / #2fa860 | *done, correct* | check sprites, "ACTIVATED" (HUD green #5ef08a) |
| 8 crowd colors | *many different ones* | crowds of creatures, card icons (one color per card) |
| navy #1e2246 | *the game UI* | HUD panels |
| ink #1c1c1c | everything else | text |
Pixel worlds use their own palettes (`world()` presets) but never pure black backgrounds.

## 5. Space

- **Split** (default): page 0–770, face 770–1920 (40/60). The caption pill sits ON the seam.
- **Page full:** big boards, crowds, a 3-card row that needs height; the pill stays at 764 unless the graphic covers it,
  then it moves just under the graphic (`captions(..., { yAt })`).
- **Scene:** a full-bleed pixel world for the big beat (a HUD unlock, an arena fight); the pill stays at 764.
- **Face full:** rare — an emotional line, the line before the CTA.
- Switches every 2–3 s *(anchor: 14 cuts in 34 s)*.
- **Layout respects the shot.** Split shows only the bottom 60% — if the head rises into the top 40% (standing up,
  leaning in), use page full or a scene for that beat. Shift the footage down in split (`layout(..., { shift })`) so
  the hair never touches the seam.
- Nothing closer than 60px to the frame sides except full-bleed worlds.


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions keep the theme's fixed line** (the anchor shows too few full faces to measure); the line must still clear the face: never above chin + 0.2 × face height while a face is on screen.
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `ARCADE.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut | `whoosh` |
| `rise` | a window / card arrives | 50px below → place, .35 s power3.out (smooth) | `pop` / `whoosh` |
| `spawn` | a sprite appears | scale .2→1 in 3 steps, from its feet | `spawn` / `blip` |
| `walk` | a character enters / goes somewhere | stepped x move + 2-frame bob | `blip` per step-group |
| `hop` | joy, yes, "this one" | stepped arc, .36 s | `jump` |
| `drop` | something lands / is buried / is placed | falls .24 s power2.in, squash .86 | `hit` |
| `multiply` | "many", "100 versions", scale | one sprite becomes a crowd in 4 waves | `spawn` × waves |
| `count` | the number grows (×1 → ×100) | digits roll, **ending on the payoff word**, hold ≥0.8 s | `blip` → `coin` |
| `type` | entering a code / a comment | 13–16 letters/s, block caret | `key` |
| `bar` | power / progress | HUD blocks switch on 0.1 s apart | `blip` each |
| `blink` | an unlock message | 3 blinks then on | `powerup` |
| `strike` | "not this" | red wavy line through the phrase, .3 s per line, in reading direction | `pen` |
| `circle` | "this word" | red loop overshooting its start, .4 s | `pen` |
| `scrawl` | the verdict | a handwritten word revealed in reading direction, .45 s stepped | `pen` |
| `shake` | a hit, a failure | stepped x jitter .25 s | `hit` |
| `pulse` | the voice stresses it | 1 → 1.08 → 1 | — |
| `punch` | the stressed word, the payoff | a hard cut-in (×1.08–1.15, no tween), holds ~0.5 s, hard cut back — the anchor's ~2.4 s cut rhythm | `hit` (soft) |
| `pan` | a held full-bleed world | the game camera scrolls in pixel steps (one step / 0.1 s), so a held scene never freezes | — |
Forbidden: smooth scaling of sprites, rotation (except the scrawl's fixed −6°), blur, glow, slow fades.

## 7. Sentence → element recipe

1. Find the **concept** and the **proof** in the sentence. A concept → a game; a proof → a UI card.
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | something old / dead / bad that should go away | a **world** (dusk graveyard) with **tombstones** carrying the real bad phrases, dropped in; Bit walks past |
   | many attempts, versions, scale ("100 versions") | **multiply**: one Bit → a crowd + the "×N" counter rolling to the payoff |
   | competition, choosing the best | an **arena**: a crowd, then only one left (others `shake` + out), the winner gets the **crown** |
   | unlocking, installing, a secret, a setting | the **HUD**: "ENTER … CODE", the real code typed, the power bar fills, "ACTIVATED!" blinks |
   | a list of N options / types / steps | **3 small cards** (sprite icon per card, mono tag 01–03, the real title, a live demo inside) |
   | a real message, a page, generated text | a **UI card** with the real text; the pen strikes / circles / scrawls the verdict |
   | before → after | the "before" card marked by the pen → it cuts out → the "after" card rises, stars spawn |
   | agents / workers / a team | an **office world** (room): several Bits at desks with speech labels saying what each did ("40 gyms found") |
   | knowledge, research, a library | a **room** world with shelves (monitors/props) and Bit reading; tags with real sources |
   | money, reward, results | **coins** spawning + a count |
   | "comment X" | the **CTA card**: 1 follow (avatar, handle, button pressed) · 2 comment (the word typed in the coral box) · a DM line; an envelope flies in |
3. Write the anatomy (§2), pick the layout (§5).
4. At least 3 actions over its life (§10d), each with an agent (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layout: `.a-page`, `.a-face`, `.a-full`, `.a-scene` · Captions: `.a-caps`/`.a-cap` (`.ltr`) · Worlds: `.a-world` (+`.full`) filled by
`ARCADE.world(sel, "dusk|day|night|room|space", {horizon, seed, sunX, sunY, wall})` · Sprites: `.a-spr.px` +
`ARCADE.art(sel, "bot|coin|heart|star|check|cross|crown|tomb|monitor|envelope|lock|ball|brick|arrow", {color})`, text on props `.a-on` ·
Cards: `.a-card` (`.body`, `.serif`, `.meta`, `.tag`, `h4`, `.row`, `.chip`), `.a-mini` (`.ic`, `.tag`, `h4`, `.demo`) ·
Pen: `.a-ink` svg + `ARCADE.strike/circle(tl, ink, el, t)`, `.a-scrawl` + `ARCADE.scrawl` · `.a-say` · `.a-hud` (`.t`, `.in`, `.caret`, `.bar i`, `.ok`) ·
`.a-mult` (`b` = red ×) · `.a-cta` (`.st`, `.n`, `.av`, `.nm small`, `.btn`, `.box`, `.caret`, `.dm`).
New sprites: add a grid to `ARCADE.SPR` (letters in the legend at the top of `motion.js`), max 16×16.

## 9. Self-check
- [ ] Made only of page, worlds, sprites, UI cards, pen, HUD (§1)
- [ ] One window, its actors; within the limits (§2)
- [ ] Every size from §3; colors used for their meaning (§4)
- [ ] Right layout; the pill on the seam; nothing cut by the seam (§5)
- [ ] Sprites step, UI glides; every movement a verb from §6, on a word, with its 8-bit sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in arcade terms)

a. **Activation.** Every element has an agent: **Bit** walks, hops, gets crowned; the **pen** strikes, circles,
   scrawls; **typing** fills the HUD and the comment box; **gravity** drops tombstones and blocks; the crowd
   **multiplies**. An element that only appears must be acted on within ~1 s.
b. **Real, readable content.** Tombstones carry the real bad phrase, HUD inputs the real code, UI cards the real message
   or page, speech labels what really happened ("40 gyms found"). The anchor fills some cards with grey bars —
   **translated: real lines or a live demo** (a page that transitions, blocks labelled "כותרת / תמונה / כפתור"). ≥26px.
c. **The thing itself first.** A game only for a concept the script names; the real card for any claim about a
   tool. Never a pixel world as decoration.
d. **Action density ≈ 2 actions per second** *(anchor: reasoning cards 4 actions / 1.2 s; pen marks 4 / 2 s;
   crowd 100 spawns in ~1 s + counter)*. A window never holds still more than ~1 s — Bit hops, the demo loops.
e. **The opening has a visual.** The anchor opens on a world card with a gag (a graveyard of dead phrases with the
   mascot) from frame 0 — never a title on the face.

**The payoff lands.** Counts end on the payoff word and hold ≥0.8 s; the reward (coins, crown, stars) comes *after*
the number or the "after" card lands; the payoff is the biggest thing on screen (the "after" card is wider than the
"before" card).
