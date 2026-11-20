# board: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (31455, 42755);
> anything borrowed from another creator is translated and listed in `theme.md` → Contributions.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Board** | paper #ebe3d5, 54px grid at 13% ink, a soft light spot | the *desk* the explanation happens on | the ground, always |
| **Card** | white (or warm #fbf8f2), 4px ink outline, radius 18, **hard 12px offset shadow** | a *real thing*: an app window, a terminal, a document, a comment, a list | every content element |
| **Dark card** | #18181e, coral hard shadow | *code / under the hood* | terminals, status lines, meters |
| **Pixel** | crisp square pixels: the crab, reaction icons, the dissolve | *the narrator's hand* | the mascot, reactions, topic transitions |
| **Dark section** | #18181e with a warm glow, hazard stripes | *"but here's the catch"* | warnings, risks, the twist (one per video at most) |

Rules: cards sit on the board, never on each other except a deliberate stack (before / after). Pixels only for the
mascot, reactions and the dissolve — never for content. No blur shadows, no gradients on cards, no glass.

### Measured material & light (`anchor.py board --look`)

- **Light inside the hero:** luma span p95−p5 = 145.0 on the anchor → a new element needs ≥ 102: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails.
- **Glow:** none to speak of on the anchor (-0.996): depth comes from shadow and layering, not halos.
- **Accent:** median saturation of the hero's most saturated 10% = 108.65 → ≥ 76: the accent is a real, saturated colour, never a greyed tint.
- **Highlights:** 3.6% of the hero is specular highlight on the anchor (white edges, paper sheen, selection fills) — check by eye.
- **Size and fill:** the hero spans 82% of the frame width and 40% of its cells carry detail → ≥ 70% wide, ≥ 30% detailed.
- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.

## 2. Anatomy

Every composition = **header strip (always) · title (top) · one hero card (middle) · caption (73.6%) · the crab
(on the hero's top edge)**.
- One hero card at a time; a second card only as its pair (before/after, request/reply) or a stack.
- Inside a card: a bar (three dots + a mono label), then rows / the real content.
- Limits: 5 rows in a card, 6 tiles in a row, 3 steps in the step bar, 1 coral word per title, 1 crab.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Header strip | mono 27px caps, top 264, dot 14px coral, progress 270×6 right |
| Step row | mono 24px "STEP 1/3", one 6px segment per step, top 334 |
| Title | 104px sans 800, top 380, centered; coral serif-italic word; lead/second line 0.52 / 0.42 em grey |
| Captions | 56px sans 800, 1–3 words, center y 1413; the said word in a coral pill (radius 10, pad 2/14) |
| Line variant | 46px sans 500 grey → ink, center y 330; the key word in the selection box, serif |
| Hero card | 780–900 wide, top 640–700, bottom ≤ 1300 (≥ 110 px above the caption) |
| Card text | **minimum 26px** as shown; rows 40–46px, body 32px, mono labels 24px, quote 44px serif |
| Tiles | 150×170, number 72px 800, label mono 18px |
| Ring counter | 440 px, number 150px light serif |
| Crab | 130×104 (pixel unit 10 at 1080 → about 8.7 px per art pixel); reactions 56px |
| Card outline / shadow / radius | 4px / 12px offset / 18px (tiles 8px offset) |
| Watermark numeral | 760px outline at 7% ink, behind the hero |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| coral #e46c56 | *this one / now / next* | the title's serif word, the caption pill, the crab, progress, the next tile, the selection box, a dark card's shadow |
| coral soft #f7d6cc | *selected* | the active row, the selection box fill |
| green #3c9c6c | *done / works* | ticks, "READY", a finished tile |
| ink #1d1a17 | structure | text, outlines, shadows, "today" tile |
| grey #8c8478 | *not yet / secondary* | unsaid words, lead lines, locked tiles |
| hazard #eaae36 | *careful* | the dark section only (stripes + its serif word) |

## 5. Space

- **Card** (default): title on top, hero card in 640–1300, caption at 1413; the lower 25% stays empty (platform UI).
- **Dark section:** same grid on #18181e with hazard stripes at y 300 and a hazard serif word; 2–6 s, once.
- **Face card** (optional, contributor 67166): the speaker inside a 780×640 card in the hero slot — only when the
  person speaking *is* the point (hook, reaction, CTA). Frame the head with `--b-face-fx/fy/zoom`.
- A new composition about every 2.5–3.5 s *(42755: 14 compositions in 37 s)*; a topic change gets the pixel
  dissolve, a zoom into one thing gets the iris; inside a topic the hero card stays and acts.
- **Layout respects the shot** (face card only): a profile, a blurred or badly lit frame → stay on the product
  cards; never crop a face to fit.
- Nothing closer than 90px to the sides except the header strip (30px).


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions keep the theme's fixed line** (the anchor shows too few full faces to measure); the line must still clear the face: never above chin + 0.2 × face height while a face is on screen.
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `BOARD.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `pixels` | a new topic | coral 60px blocks cover in 0.22 s, scene switches, clear in 0.22 s | `pixels` |
| `iris` | zoom into one thing | coral circle grows 0.3 s, paper circle opens 0.32 s | `iris` |
| `title` | naming the idea | words rise 30px, 0.1 s apart; the serif word lands last with an overshoot | — |
| `drop` | a card arrives | from 70px above, back.out(1.6), 0.38 s | `thock` |
| `pop` | parts of a card | scale .6 → 1, back.out(2), stagger .08 | `pop` |
| `rows` | items / output lines | rise 24px, 0.24 s, stagger .14 | `tick` |
| `swap` (spinner → tick) | a step finishes | the spinner turns while it works, the tick pops | `tick` |
| `select` | "this word / this thing" | selection box with handles snaps on (scale .9 → 1) | `pop` |
| `press` | a button is used | the element sinks into its shadow (6px) and back | `click` |
| `type` | writing / commenting | 16–22 letters per second | `key` |
| `say` | a quote | the quote's words appear on the voice's timing | — |
| `count` / `ring` | a number changes | digits roll and the coral arc fills, **ending on the payoff word**; holds ≥0.8 s; the tick/“done” comes after it lands; the number is the biggest thing in the card | `tick` → `ding` |
| `meter` | progress / usage | cells light one by one (green; coral for the last ones when it's a limit) | — |
| `fill` | a step done in the header | a step segment / the progress line grows | — |
| `hop` | the crab moves to the next card | 0.32 s arc, squash on landing | `hop` |
| `peek` | the crab arrives | rises from behind a card edge | `hop` |
| `snap` | the key word | claws open/close ×2–3 | `snap` |
| `react` | the verdict | a pixel icon pops above the crab (✓ ! ♥ ★ ?) | `ding` for ✓ |
| `idle` | waiting | stepped 5% bob | — |
Forbidden: rotations of cards, soft fades longer than 0.15 s, blur, camera moves on cards, the crab moving without
a reason.

## 7. Sentence → element recipe

1. Find the **thing** (what would the product page show?). No thing → the face card or a title-only beat with the
   crab reacting.
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | a tool / app / website | a **browser or app card** with its real content (headline, the real button); the cursor `press`es what matters |
   | a feature list, "N things" | a **checklist card**: rows with number circles; the said row goes `act`, its spinner turns into a tick; the step bar fills |
   | installing, a command, code | a **dark terminal card**: the real command typed, real output rows, a meter; the name gets the selection box |
   | a number (stars, users, price) | the **ring counter** (iris in) with the real number rolling, or the number in the card at ≥72px |
   | a series, days, a schedule | **tiles** (DAY 01 02 03): today dark, next coral, later locked |
   | a quote, a rule, a principle | a **quote card** in the serif (`say`), with its source line in mono |
   | problems / mistakes | rows with coral ✕ icons and a short mono reason |
   | before / after | **two cards stacked**: the plain "BEFORE" (warm, small) crossed, the "AFTER" (coral shadow, bigger) dropped on top; the payoff word in the selection box, biggest on the board |
   | a risk, a catch, a warning | the **dark section**: hazard stripes, the serif word in hazard yellow, one card that shows the risk |
   | "comment X" | a **comment input** with the word typed, `press` send, a reply card drops and goes green |
3. Header strip always; title for every composition (or the line variant); write the anatomy (§2).
4. At least 3 actions over its life (§10d), each with an agent (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Grounds: `.b-page`, `.b-dark` + `.b-hazard`, `.b-scene` · Text: `.b-head` (`i`, `.prog > b`), `.b-step` (`.seg > b`),
`.b-title` (`em`, `.s`, `.sub`), `.b-water`, `.b-caps`/`.b-cap` (`span.on`), `.b-line` (+`.b-sel`) · Cards: `.b-card`
(+`.warm`, `.coral`, `.term`) with `.bar`, `.body`, `.row` (`.n`, `.n.on`, `.ck`, `small`, `.act`), `.tag`
(`.coral`, `.green`), `.q`, `.mono`, `.ok`; `.b-meter` (`i.on`, `i.hot`) · `.b-tiles` > `.b-tile` (`.on`, `.next`,
`.lock`) · `.b-ring` (svg `.track`, `.arc`, `.disc`; `.lab`, `.num`) · Pixel: `.b-mascot` (`BOARD.ART.crabPair`),
`.b-pop` (`check ask bang heart star`), `.b-pix`, `.b-iris` (`.paper`) · Other: `.b-face`, `.b-cursor`, `.b-input`
(`.av`, `.caret`, `.go`) · Art: `BOARD.ART.tick|cross|spin|lock|cursor|send`, `BOARD.pix(rows)` for new pixel icons.

## 9. Self-check
- [ ] Made only of board, cards, dark cards, pixels (+ one dark section) (§1)
- [ ] Header · title · one hero card · caption · crab on the hero (§2)
- [ ] Every size from §3; coral only for "this / now / next" (§4)
- [ ] Hero ends ≥110 px above the caption; lower quarter empty (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound; the crab has a job in every composition
- [ ] §10 a–e all true

## 10. Mandatory rules (in board terms)

a. **Activation.** Every card is acted on: the **cursor** presses its button, **typing** fills inputs and terminals,
   rows **tick**, the **selection box** lands on the key word, the **crab** hops, snaps and reacts. A card that only
   drops must be acted on within ~1 s.
b. **Real, readable content** (≥26px as shown). The anchor fills some cards with grey skeleton lines — translated:
   every line is real text from the script or the product (the real command, the real feature names, the real
   reply). Never bars, never lorem.
c. **The thing itself first.** "It installs in two commands" → the terminal with the two commands; "Day 1" → the
   day tiles; "220k stars" → the ring counter with that number. Generic blocks (tiles, ring, checklist) only when
   the script literally has a list, a series or a number.
d. **Action density ≈ 2 actions per second** *(measured: 42755 plugin card 6 actions / 2.4 s = 2.5; checklist
   row + spinner + tick + step segment per spoken item ≈ 2; 31455 quote: one word per voice word)*. A hero never
   holds still for more than ~1 s — when nothing else happens, the crab `idle`s or reacts.
e. **The opening has a visual.** The first frame already has the hero card (the product, the number, the day
   tiles) with the title — never the title alone *(31455 opens on the repo card + the star ring; 42755 on the
   monitor with the MOD sign)*.
