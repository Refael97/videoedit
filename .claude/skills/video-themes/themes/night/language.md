# night: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (50462, 19647,
> 33830, 41438); anything borrowed from another creator is translated and listed in `theme.md` → Contributions.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Night** | #101010, 18px dot grid #262626, a faint lift in the middle | the *dark room* where ideas light up | the stage, full frame, under everything |
| **Light** | neon tubes (red #b31123 with glow), glowing white lines and dots, a purple curve, yellow bars | the *structure* of the idea | ladders, frames, axes, curves, roads, connectors, measuring bars |
| **Panel** | dark rows #232323 with a red side bar, radius 8; a red-cornered frame around a document | a *step* or a *real thing* (a message, a command, a list) | framework rows, lists, documents, messages |
| **Proof** | light grey page #e9e9e9 with a 36px grid, dark text | *evidence* in daylight | openings: real results with numbers (views, revenue, before/after) |

Rules: light only on the night stage; panels on the stage or over the face; the proof page only for evidence and
mostly in the first 3 s. No colored panels other than the meaning colors below; no gradients except glow.

### Measured material & light (`anchor.py night --look`)

- **Light inside the hero:** luma span p95−p5 = 176.346 on the anchor → a new element needs ≥ 123: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails.
- **Glow:** the anchor's hero lifts the stage around it by 10.773 luma → ≥ 5.4: a soft halo / bloom of the accent behind the hero, not a hard outline only.
- **Accent:** median saturation of the hero's most saturated 10% = 189.194 → ≥ 132: the accent is a real, saturated colour, never a greyed tint.
- **Highlights:** 2.8% of the hero is specular highlight on the anchor (lacquer / neon edges) — check by eye.
- **Size and fill:** the hero spans 65% of the frame width and 48% of its cells carry detail → ≥ 55% wide, ≥ 36% detailed.
- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.

## 2. Anatomy

Every stage composition = **title (top, 10%) · one structure (center) · labels / tags (beside it)**.
- The structure is one thing: a ladder, a list of rows, a chart, a frame. Tags sit to its side, joined to it.
- **One structure carries the video** and returns: show the whole, zoom into one part, come back to the whole one level up.
- Limits: 5 ladder levels, 4 rows, 4 tags on one structure, 5 dots on a curve, 3–5 thumbnails on the proof page.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Title | 66px sans 800 (Heebo / Inter Tight), centered, top 194; one word in the serif (`em`, ×1.12); the red box (`.box`) behind the key phrase |
| Captions | **one word**, 57px 800 white, no outline, soft shadow, center y 1275 (just above the box) / 1270 on the full face; key terms in the serif |
| Rows | 860–900 wide, 104–150 tall, label 36–52px 800, number 40–54px |
| Frame (document) | 900 wide, lines 34–40px (mono for code), highlight pads 8px |
| Tags | 30–44px 800, dark pill, a colored edge matching its meaning |
| Ladder | 520–600 wide, 700–900 tall, rails 34px, level labels 30px, names 34px |
| Chart | axes 4px white, curves 5px with glow, dots r 13 (the payoff dot r 18 and pulsed) |
| Big number | 210px 800 glowing |
| Face box | x 69–1011, top 1430 to the bottom edge, radius 33 (top corners); the head pops ~50px above |
| Text inside anything | **minimum 26px** as shown |
| Spacing | 22 / 34 / 60px |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| red neon #b31123 | *the structure / the level you're on* | ladders, frame corners, row side bars |
| red box #b50004 | *this is the point* | behind one phrase in a title or the CTA |
| purple #c80dd5 | *the change / the new path* | the "after" curve, a highlighted phrase that changes |
| yellow #fae302 | *what we measure / the part that matters* | measuring bars under charts, highlighted phrases, chips |
| green #3a9432 | *done / unlocked / it worked* | completed rows, view pills that grew, a sent reply |
| white glow | *neutral data* | axes, the "before" line, dots, roads |
| grey #8a8a8a | *not yet / not this one* | unlit bars, pills before the count |
One meaning per element; red is the default structure color.

## 5. Space

- **Split** (default): the stage full frame, the speaker in the box at the bottom (x 69–1011, from 1430), head popping out
  (`matte`); graphics live between 190 and 1200; captions at 1275.
- **Face full:** talking points without a structure, emotion, the line before the CTA; captions at 66% — check they
  sit under the chin, not on the mouth (`captions(..., { yFace })`).
- **Proof:** the light page + the box; the opening (rule e) and any "here is the result" moment.
- **Full:** a cutaway video/meme or a structure that needs the whole height; no box.
- Layout changes every 2–4 s *(anchor: 50462 has ~40 switches in 124 s)*.
- **Layout respects the shot.** The box shows only head and shoulders: a profile, a hand over the face or the speaker
  leaving the middle third → face full or full for that beat.
- **Bright footage** (white wall, daylight; mean luma > ~150): grade it down (`.n-face.grade` + `.n-matte.grade`) so the box
  doesn't glow brighter than the graphics.
- **Light clothing under the captions** (white hoodie/shirt): add `.shade` to `.n-caps` (dark halo) and on the full face
  move captions under the chin (`yFace`), never on the mouth.
- Nothing under 1200 on the stage in split (the head and the caption live there).


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions on the full face follow the face:** centre at **chin + 0.41 × face height** (anchor IQR 0.34…0.51), recomputed every frame: `captions(..., { yAt: FACE.yAt(tl, { at: "chin", dy: 0.41 }) })`. The fixed token is only the fallback when no face is found.
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `NIGHT.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut (clip-path + transform) | `whoosh` |
| `title` | naming the structure | words drop in one by one, 0.12 s apart, 14px rise | — |
| `ignite` | a graphic appears | brightens from the dark (brightness .25→1, scale .97→1), .35 s | — |
| `neon` | a structure switches on | two flickers then on, .26 s | `neon` |
| `rows` | a step / an item | slides in from the side (RTL: from the right) 80px, .3 s, stagger .18 | `neon` or `tick` |
| `done` | a step is achieved | the row turns green, the lock opens, bump 1.04 | `ding` |
| `climb` | going up a level | rungs light from the bottom, labels and the level name ignite | `neon` |
| `draw` | a line / curve / road appears | stroke draws along its length | `tick` |
| `dots` | data points | glowing dots pop on along the drawn curve | — |
| `grow` | measuring | yellow bars grow from their base | `tick` |
| `mark` | "this part" | a highlight sweeps in behind a phrase (y / p / r) | `tick` |
| `tag` | naming a part | a dark pill slides out beside it | `tick` |
| `light` | counting things | chips switch on one by one | `pop` |
| `count` | a number changes | digits roll, ending **on the payoff word**; the final value holds ≥0.8 s; any green comes after it lands; the payoff is the biggest thing in its composition | `tick` → `ding` |
| `sweep` | "this one is lit" — a held panel gets attention without changing | a light band crosses the row / frame, .7 s, stagger .2 | `whoosh` (soft) |
| `push` | holding a graphic | slow continuous scale 1→1.05 over the whole hold | — |
| `punch` | "this detail" | fast zoom (×1.4–1.9) with a 6px motion blur, .32 s; `unpunch` back | `riser` → `boom` |
| `type` | writing / commenting | 16–24 letters per second | `key` |
| `pulse` | the voice stresses it | scale 1→1.08→1 | — |
Forbidden: rotation, bounce beyond `pop`, slow cross-fades, camera moves on the footage, glow on the footage.

## 7. Sentence → element recipe

1. Find the **structure** (what system is being described?). No structure → face full, captions only.
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | levels, stages, a progression | the **neon ladder** (`ladder` + `climb`), the current level's name lit; return to it at each new level |
   | a framework, steps, a checklist | **rows** 01–04 with the red side bar and a lock; each slides in on its word, turns green when done |
   | how something changes over time, before / after, growth | a **chart**: white flat "before" line, the purple curve for "after", white dots, yellow bars under the axis, tags |
   | a document, a script, a command, a message | a **red-cornered frame** with the real lines, the important phrases **marked** (yellow / purple / red) with side tags |
   | a choice between two paths (a headfake, a fork) | two **glowing roads** (white dashed vs. green/purple glowing), drawn |
   | results, proof, examples | the **proof page**: real thumbnails with view pills counting up and turning green |
   | a count of things (stakes, reasons, points) | **chips** that light up one by one, a label beside each |
   | a key number | the **big glowing number** with `count` |
   | a pop-culture reference, a metaphor | a **full** cutaway (real footage the user supplies), 0.8–2 s |
   | "comment X" | the **CTA**: "תגיבו *X*" with the red box line, and the comment typed into a row that turns green when "sent" |
3. Write the anatomy (§2), pick the layout (§5).
4. At least 3 actions over its life (§10d), each with an agent (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layout: `.n-stage`, `.n-proof`, `.n-face` (+`.grade`), `.n-matte` (+`.grade`), `.n-scene`, `.n-full` · Text: `.n-title`
(`em` serif, `.box` red box), `.n-caps`/`.n-cap` (`.dark` on proof), `.n-hook` · Light: `.n-ink` svg with `.axis`, `.curve`
(`.p`, `.r`), `.line`, `.dot`, `.bar` (`.off`); `.n-ladder` via `NIGHT.ladder` · Panels: `.n-rows` > `.n-row` (`.num`, `.lk`
with `.c`/`.u`, states `.next`, `.done`), `.n-frame` > `.n-line` (`i` bullet, `.hl.y|.p|.r`, `.dim`), `.n-panel` ·
Other: `.n-tag` (`.y|.p|.r`), `.n-chip` (`.off`), `.n-thumb` + `.n-pill` (`.up`), `.n-num` (`.r`), `.n-cursor`, `.n-cta` ·
Art: `NIGHT.ART.lock|unlock|check|eye|cursor`.

## 9. Self-check
- [ ] Made only of night, light, panels, proof (§1)
- [ ] Title · one structure · tags; within the limits (§2); the structure returns
- [ ] Every size from §3; colors used for their meaning (§4)
- [ ] Right layout; nothing under 1200 in split; captions not on the mouth (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in night terms)

a. **Activation.** Every element is acted on: rows **unlock**, ladders **climb**, curves **draw** and their dots pop,
   phrases get **marked**, chips **light**, the comment is **typed**, the camera **punches** into the named detail.
   An element that only ignites must be acted on within ~1 s.
b. **Real, readable content.** The anchor fills its "documents" with white bars — **translated: real lines from the
   script** (the command, the hook, the message), ≥26px, with the important phrases marked. No bars, no skeletons, no
   blurred placeholder rows (the anchor blurs rows it hasn't reached yet: we show them dim `.next` with their real names).
c. **The thing itself first.** "Install the skill" → the real command typed; "the reporter level" → the ladder at
   level 1. A chart only with real numbers or a real before/after the script states; never a decorative curve.
d. **Action density ≈ 1.5–2 actions per second** while a structure is the hero *(anchor: ladder build 5 levels in
   ~1 s; framework list 4 rows + 2 unlocks in 3 s = 2.0; chart: axis, curve, 6 dots, bars in 2.5 s = 3.2; document:
   lines + 4 marks + 2 tags in 4 s = 1.5)*. A structure never holds still for more than ~1.2 s — if nothing happens,
   `push` it.
e. **The opening has a visual.** 3 of 4 anchor videos open on the **proof page** (title + red box + real thumbnails
   whose view pills count up and turn green); the 4th opens on the structure itself. Never a title on the face alone.
