# editorial: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (66150, 72005,
> 90553); anything borrowed from another creator is translated and listed in `theme.md` → Contributions.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Page** | forest green #163227, flat, no texture | the *magazine page* | openings with the cut-out speaker, grids, a closing word |
| **Type** | display serif (cream), heavy sans (cream), gold italic, mono kicker | the *voice* of the edit | every headline, every number, every name |
| **Slip** | a word on its own rectangle of green (or cream) paper, square corners, slightly overlapping the slip above | a *clipping* pasted on the frame | key phrases over the footage, stacked at the top |
| **Card** | green, radius 18, gold hairline under a serif header, mono status; or a cream input | a *real object* (a tool, a product, a prompt, a counter) | anything the viewer would see on a screen or hold |
| **Cover** | a 2px gold frame inset 40px + a mono issue line | *this is the feature* | the name of the thing, once or twice per video |

Rules: type and slips live on the footage's top 40% or on the page; cards at the top; nothing over the face.
No glow, no gradients, no shadows on text (cards may have a soft drop shadow).

### Measured material & light (`anchor.py editorial --look`)

- **Light inside the hero:** luma span p95−p5 = 198.842 on the anchor → a new element needs ≥ 139: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails.
- **Glow:** none to speak of on the anchor (-67.919): depth comes from shadow and layering, not halos.
- **Accent:** median saturation of the hero's most saturated 10% = 177.333 → ≥ 124: the accent is a real, saturated colour, never a greyed tint.
- **Highlights:** 0.1% of the hero is specular highlight on the anchor (lacquer / neon edges) — check by eye.
- **Size and fill:** the hero spans 90% of the frame width and 58% of its cells carry detail → ≥ 76% wide, ≥ 44% detailed.
- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.

## 2. Anatomy

Every composition = **one headline voice + at most one accent + one object**.
- A headline is either display serif (one word) **or** heavy sans (≤3 lines) — never both at full size at once.
- The accent (gold italic) is one word or a short phrase, attached to the headline.
- An object (card, flip counter, list, thumbnail grid) sits at the top; its own text follows the same three voices.
- Limits: 4 slips in a stack, 3 heavy lines, 1 display word, 1 gold accent, 5 rows in a list, 3 counter tiles.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Display serif | 250–360px, line-height .86, condensed (Hebrew wdth 62.5%), weight 300, cream, centered |
| Heavy sans | 104–128px, line-height .9, tracking −0.035em, aligned to the reading side at the 62px margin |
| Gold italic | 100–170px, attached under/after the headline; Hebrew = condensed serif slanted −11° |
| Slips | heavy 116px / italic 108px, padding 6×26px, small slip 46px |
| Kicker / timecode | mono 26–30px, tracking .32em (kicker) / .06em (timecode) |
| Captions | condensed serif 54px on a green slip 77px tall, center y 1358 (71%) |
| Cards | 940–980 wide at the top (y 200–700); header 74px with serif 40px; body text ≥30px; mono ≥26px |
| Flip tiles | 150×200, serif digits 190px |
| Text inside anything | **minimum 26px** as shown |
| Spacing | 14 / 26 / 62px |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| green #163227 | *the page / the brand* | page, slips, cards, caption slip |
| cream #ede9df | *the statement* | all headline type, card text |
| gold #c1a85e | *the feeling / the payoff* | one italic word, timecode frames, frame hairlines, the payoff |
| sage #8ea595 | *not yet* | caption words not yet spoken, dim timecode digits |
| cream paper #f6f3ec + ink | *the user's own words* | prompt inputs, comments, a cream slip with a dark italic |
| red #b8442f | *no longer true* | a strike through a word ("FOREVER" → struck) — rare |
One gold per composition.

## 5. Space

- **Face** (default): the footage; overlays at the top (y 200–760); captions at 71%.
- **Cutout:** the speaker cut out on the green page — the opening and the big statement; the display word behind the head.
- **Cover:** the footage inside the gold frame, issue line at y 150, the name behind the head (`.e-behind` + matte).
- **Page:** green alone — thumbnail grids, a full-width card, the closing word.
- A new overlay every ~2.5 s *(anchor 66150: ≈22 overlays in 54 s)*; the face alone for 1–3 s between them.
- **Text never covers the face.** The display word may only go behind the head (matte), never in front.
- **Layout respects the shot.** A wide/full-body shot leaves more room on top — use it for a card; a tight close-up
  leaves little — use a single slip or nothing. No matte (or a bad one: busy background, motion blur) → no
  behind-text; put the word on the page in `cutout`-less `page` layout instead.
- **Captions never on the mouth:** 71% sits on the chest in a normal framing; check one frame and move with `{ y }`.


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions keep a fixed line** (the anchor's captions do not follow the face: IQR -1.73…0.74 face heights), but the line must clear the face: never above **chin + 0.2 × face height** while a face is on screen (move it under the chin with `yAt: FACE.yAt(tl, { at: "chin", dy: 0.3 })` when the speaker sits lower than the anchor).
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `EDITORIAL.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut | `whoosh` (soft) or `shutter` for the cover |
| `letters` | a display word is set | each letter ghosts in at 35% then goes solid, 0.07–0.09 s apart | `key` every 2–3 letters |
| `lines` | a heavy headline lands | each line rises out of its mask, .32 s power3.out, .16 s apart | `thud` on the last line |
| `linesOut` | the headline changes (ticker) | lines leave upward through the masks, .24 s | `swish` |
| `slip` | a key phrase is pasted on | the slip wipes in from the reading side .26 s, its text slides under it | `slide` |
| `rise` | a card / input / comment appears | up 50px + fade, .36 s power3.out | `slide` |
| `type` | the user types | 16–24 letters/s with a caret | `key` |
| `press` | send / like / choose | scale .86 and back, .14 s | `click` |
| `print` | a photo, a frame, a new version of a page lands | scale 1.08→1 + fade, .2 s | `shutter` |
| `flip` | a counter changes (countdown, length, price) | the old digit rises out, the new rises in | `tick` |
| `count` | a number / version rolls | digits roll and **end on the payoff word**; the final value holds ≥0.8 s; status/stamp after it lands; the payoff is the biggest type in the composition | `tick` → `ding` |
| `timecode` | "this is real time" | hh:mm:ss:ff rolling under a headline | — |
| `strike` | "not anymore" | a red line draws through the word, .25 s | `tick` |
| `film` | history, a flashback | sprocket edges on both sides scroll | — |
| `pulse` | the voice stresses it | scale 1.06 and back | — |
| `angle` | a new thought / a new point | hard cut to a closer framing (×1.12–1.2 on footage + matte), on the word; cut back on the next point | — |
Forbidden: bounce, rotation, scale-pops on type, blur zooms, anything glowing.

## 7. Sentence → element recipe

1. Find the **word that carries the sentence** (the name, the number, the feeling). No such word → face only.
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | the hook / the big claim | **cutout** on the green page: heavy lines tick in, then the display word behind the head, gold italic for the feeling, a running timecode |
   | a name (a product, a person, a tool) | the **cover**: gold frame + issue line + the name in display serif behind the head |
   | a list of qualities / reasons | a **slip stack**: heavy slip, italic slip, cream slip, small check slip — one per spoken word |
   | a prompt / something typed | a **cream input** ("TO CLAUDE" kicker), typed, the send button pressed |
   | a product / a result | a **green card**: serif name + mono version + status, a real thumbnail, heavy + gold text; it runs and turns DONE |
   | a duration, a deadline, a price | a **flip counter** with a kicker ("RAW TAKE", "DOORS CLOSE") |
   | a number that matters | heavy number + gold italic unit on a slip ("1,000 *people.*"), `count` |
   | a ranking / history / times | a **ruled list** in the serif (name · time), lines appear one by one; `film` edges for "back in 1954" |
   | examples / social proof | a **thumbnail grid** on the page (real thumbnails), 2–3 columns |
   | something that is no longer true | the word in heavy sans + a red `strike` |
   | a math point (time = money) | a serif **equation** ("2 שעות = ₪200"), the wrong value struck, the right one counted (contributor 9953) |
   | "comment X" | the **white pill** + a comment row typed with X, a reply row after it |
3. Pick the layout (§5), write the anatomy (§2).
4. At least 3 actions over its life (§10d), each with an agent (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layers: `.e-face` (video), `.e-page`, `.e-behind` (text behind the speaker), `.e-matte` (video of the cut-out), `.e-cover`
(+ `.e-issue`), `.e-over` (overlays), `.e-scene`, `.e-caps`/`.e-cap` (`.w`, `.on`) · Type: `.e-display` (`.l`), `.e-heavy`
(`.ln > span`), `.e-it` (+`.he`), `.e-kicker`, `.e-tc` (`b`, `i`) · Slips: `.e-stack` > `.e-slip` (`.heavy`, `.it`, `.cream`,
`.small`, inner `.in`) · Cards: `.e-card` (`.hd` with `.ver`, `.st`; `.bd`; `.ln`; `.mono`), `.e-input` (`.k`, `.tx`, `.t`,
`.go`), `.e-caret`, `.e-thumb` (`.chip`), `.e-flip` (`.kicker`, `.row`, `.tile`, `.colon`), `.e-list` (`.r`, `.n`),
`.e-strike`, `.e-film` (`.l`, `.r`) · CTA: `.e-cta` (`.pill`), `.e-comment` (`.av`, `.who`, `.t`, `.hrt`) · Art:
`EDITORIAL.ART.up|heart|check`.

## 9. Self-check
- [ ] Made only of page, type, slips, cards, cover (§1)
- [ ] One headline voice + one accent + one object (§2); one gold
- [ ] Every size from §3, colors for their meaning (§4)
- [ ] Nothing over the face; display word behind the head only with a matte (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in editorial terms)

a. **Activation.** Every element has an agent: letters are **set** one by one, lines **land**, slips are **pasted**
   on the spoken word, inputs are **typed** and **sent**, counters **flip**, cards **run** and turn DONE, words get
   **struck**. A card that just appears must change within ~1 s (status, version, a thumbnail printed in).
b. **Real, readable content** (≥26px as shown). The anchor's bonus cards show cream bars under "01 02 03" —
   **translated: the real bonus names as short serif lines**. Cards carry the real prompt, the real product name and
   version, real thumbnails. No bars, no lorem, no blurred rows.
c. **The thing itself first.** "Install the skill" → the real prompt typed; "the site turns insane" → the site itself
   shown before and after; a flip counter only for a real duration/deadline the script says.
d. **Action density ≈ 2 actions per second** while an overlay is up *(anchor 66150 0–3 s: 12 letters + 4 line rises
   + a ticker change + the italic + a timecode ≈ 6/s; "DOING *whatever*": 2 slips in 0.3 s then a 1.5 s hold;
   cards: rise, type 20 letters, press, out in 3 s)*. Between overlays the face may hold alone for 1–3 s — that is
   the breath, not a hole.
e. **The opening has a visual.** The anchor opens on the speaker **cut out on the green page** with the headline
   setting itself around/behind the head and a running timecode — never a title card without the person.

> **Shared effect.** The display word behind the speaker is the signature effect `wordBehind` (`effects/README.md`):
> `EDITORIAL.letters` on an element inside `.e-behind` marks it the same way, so the QA self-check (every letter >= 70%
> visible against the cut-out) applies here too. Outside editorial, `FX.wordBehind` gives any theme the same move in
> its own display font (`themes/<t>/fx.css`).
