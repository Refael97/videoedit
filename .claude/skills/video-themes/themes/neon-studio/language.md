# neon-studio: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (70647, 10899, 1191,
> 49478).

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Studio** | the footage: a dark room with colored practical lights | *me, talking to you* | hook lines, opinions, the CTA, anything without a tool |
| **Page** | warm off-white #f7f5f1 (or cool #fcfcfc), no texture | *the tool, in daylight* | real UI cards, a header, a calendar, an install |
| **Ambient** | a heavy blur (46px), dimmed (×0.5) and saturated copy of the media's own colors | *the media's world* | the backdrop of a screenshot, a site, a b-roll clip, an app tile |
| **Card** | white, radius 18, soft shadow; a media frame: radius 18, 2px light edge, deep shadow | *a real screen* | UI windows on the page; screenshots / sites / clips on the ambient |
| **Sprite** | pixel art, orange-red #fc410e with a light top row and dark sides, gold pixel icons | *a helper / a check / an agent* | counting things that *work for you* (detectors, agents, features) — over the speaker |

Rules: page and ambient never mix in one composition. Sprites only over the studio footage. No drawn dark stage, no neon
lines, no gradients except the ambient blur.

## 2. Anatomy

- **Page composition** = title or header (top, 14%) · **one card** (center, 75–85% wide) · a state pill under it ·
  captions in ink at 68%.
- **Ambient composition** = one media frame (top half in split: y 110–670; full: centered) over its own blur.
- **Studio composition** = the face + captions on the chest; optional sprites row(s) on the chest.
- Limits: 4 rows in a card, 3 pills, 5 sprites (3 + 2), 1 media frame, 1 yellow keyword.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Caption line | 78px Inter / Heebo 800, white, soft shadow; 2–3 words |
| Keyword line | 108px 800 yellow #f9fc04; a single short keyword 190px |
| CTA keyword | 190px **thin italic** (Inter 300 italic / Heebo 300 slanted −12°) yellow, holds to the end |
| Page header | 96px 800, two lines, ink + blue |
| Page title (small) | 44px 800 ink |
| Card text | **minimum 26px**; rows 32px 600; titles 36–44px 800; code JetBrains Mono ≥28px |
| Card | 80–85% wide (860–920), radius 18 |
| Media frame | 900 × 560 (split top half), up to 940 × 1300 full |
| Tile | 240 × 240, radius 56 |
| Sprite | 195 × 150 (13 × 10 pixels of 15px), icons 84px, pixel labels 34px in a black box with a white 3px border |
| Spacing | 24 / 40 / 70px |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| yellow #f9fc04 | *the word* | the keyword line, the CTA keyword, the key line of a site |
| mark yellow #f2c230 | *read this part* | the highlight sweep inside a light document |
| blue #074ffa | *action / progress* | progress bars, download tile, the header's 2nd line, connectors, a primary button |
| green #22b45a | *done* | check circles, "on"/"installed" pills |
| sprite red #fc410e | *a helper* | pixel sprites only |
| ink #111 / white | everything else | text |
One yellow at a time.

## 5. Space

- **Face** (≈50% of the time): captions on the **chest** — line center at 54% for a high-framed speaker; if the chin is
  lower than 60%, move them under the chin (`captions(..., { yFace })`). Never on the mouth.
- **Split:** the top surface (ambient, or a page) over 0–960 with a soft shadow at the seam; the footage moves down
  (`shift` ≈ 400) so the face fills the bottom half; captions centered at 815–860, above the seam; the media frame ends
  ≥ 120px above the caption.
- **Full:** the page or the ambient takes the frame; no speaker; captions at 68% (ink on the page).
- Layout switches every 1.5–3 s *(anchor 70647: 18 compositions in 37 s)*.
- **Layout respects the shot:** sprites and chest captions need a clear chest; hands in front → split or full for that beat.
- **Bright footage** (mean luma > ~150): `.s-face.grade` (brightness .8) and expect the captions to fight a light top.

## 6. Motion verbs (`motion.js` → `NEONSTUDIO.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut (clip-path + footage shift) | `whoosh` |
| `captions` | speech | words blur in one by one on their start (blur 10→0, .14 s); line stays centered; the keyword drops to the yellow line | — |
| `blurIn` | a card / title / pill appears | blur 16→0, scale .94→1, .32 s power3.out | `air` |
| `pop` | a tile / small thing arrives | blur + scale .6→1 back.out(1.8) | `pop` |
| `swap` | one media replaces another (before → after) | blur cross, .25 s | `air` |
| `scroll` | reading a long real document | the content glides up continuously | — |
| `zoom` | "look here" inside a UI | smooth push to a part, .5 s power3.inOut | — |
| `mark` | the phrase that matters | yellow highlight sweeps behind it | `tick` |
| `type` | writing / prompting / commenting | 18–26 letters per second | `key` |
| `check` | a step is done | grey circle turns green with a tick, bump 1.25 | `ding` |
| `progress` | installing / loading / a percentage | blue bar + % count together, **landing on the payoff word**; the "done" pill only after it lands | `tick` → `ding` |
| `cursor` | choosing in the UI | cursor eases, squash on click | `click` |
| `sprites` | helpers arrive | pixel steps: 0.4 → 1.15 → 1 in 0.1 s (no smooth scale), then a 2-frame bob | `blip` |
| `icons` | what each helper does | a pixel icon blinks on above it | — |
| `key` | the CTA word | thin yellow keyword blurs in and holds | `air` |
Forbidden: smooth tweening on pixel art, bounces beyond `pop`, rotations, slow fades, glow.

## 7. Sentence → element recipe

1. Is a **tool** named? → show it. No tool → face + captions (pick the keyword).
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | the tool itself ("X just launched", "there's an AI that…") | a **tile** on the ambient (a glyph on the tool's color), then its real **card** |
   | connecting / setting up / installing | **page** + header (ink + blue) + install card: command typed → progress lands on the name → green pill |
   | what it does (a list of features) | **page** + card with rows, each row's check turns green on its word |
   | the result, a site, a video, an image | **ambient** + media frame; before → after with `swap` |
   | a document, a README, a long prompt | **page** + the real text in a card, `scroll` + `mark` the phrase being said |
   | writing, posting, commenting | a card with the real text being **typed** |
   | a schedule, a week, a plan | a calendar card, the days filled on the words |
   | N helpers / checks / agents | **sprites** on the chest (≤5), an icon above each, a pixel label under each |
   | "comment X" | face + the thin yellow **CTA keyword** holding; a DM card arrives and gets its check |
3. Pick the layout (§5), give it ≥3 actions (§10d), each with an agent (§10a). Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layout: `.s-face` (+`.grade`), `.s-top`, `.s-scene`, `.s-amb` (put any colored element inside: it is blurred), `.s-page`
(+`.cool`), `.s-seam` · Text: `.s-caps`/`.s-cap` (`.l1`, `.l2`, `.l2.big`, `.ink`), `.s-key`, `.s-title`, `.s-head` (`.b`)
· Cards: `.s-media`, `.s-card` (`.hd`, `.bd`, `.row`, `.ck`/`.ck.on`, `.mono`, `.mk`, `.typed`, `.caret`), `.s-pill`
(`.blue`), `.s-btn`, `.s-prog` + `.s-pct`, `.s-tile`, `.s-ink` (`.ln`, `.nd`), `.s-cursor` · Sprites: `.s-sprite`
(`NEONSTUDIO.ART.sprite()`), `.s-icon` (`ART.icon("x|check|up|halo|bulb|spark|heart|eye")`), `.s-plabel` · Art:
`ART.check`, `ART.cursor`, `ART.download`, `ART.spark4`, `pixel(rows, palette, px)` for new pixel art.

## 9. Self-check
- [ ] Made only of studio, page, ambient, cards, sprites (§1); page and ambient not mixed
- [ ] One card / one media / one keyword; within the limits (§2)
- [ ] Sizes from §3; one yellow (§4)
- [ ] Captions on the chest / above the seam / ink on the page, never on the mouth (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in neon-studio terms)

a. **Activation.** Every card is used: rows get **checked**, text is **typed**, a bar **fills**, a phrase is **marked**,
   the **cursor** clicks, media **swaps** before → after, sprites get their **icons**. A card that only blurs in must be
   acted on within ~1 s.
b. **Real, readable content** (≥26px as shown). Real commands, real feature names, real post text; a site is a real
   mini page (headline, button). No grey lines, no skeleton UI. (The anchor shows long real READMEs; keep the part
   being read ≥26px and `zoom` into it.)
c. **The thing itself first.** The tool's own card / command / result before any metaphor. Sprites only when the script
   literally counts helpers or checks.
d. **Action density ≈ 2 actions per second** *(anchor 70647, 0–10 s: tile, title, 3 checks, pill, README highlight,
   cursor, typing ≈ 20 / 10 s)*. A card never holds still more than ~1.2 s — `scroll` or `zoom` it.
e. **The opening has a visual.** The anchor opens on the tool's tile over an ambient blur with the hook caption, the
   speaker in the bottom half (split). Never the hook on the face alone.

**The payoff lands:** a percentage / count ends on the payoff word, holds ≥0.8 s, and the green pill comes after it.
