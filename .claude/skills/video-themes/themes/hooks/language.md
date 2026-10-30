# hooks: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (7784, 28202,
> 68494, 93864). No contributors yet.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Room** | the footage, full frame, bright warm daylight | *the person talking to you* | most of the video; every glow title, chip and template line lives here |
| **Glow type** | a heavy word with a vertical gradient fill and a bloom of the same color; a small white lead line above it | *the one word to remember* | the idea of the sentence, the hook, the payoff, the CTA keyword |
| **Void** | pure black, amber light leaking from two opposite corners (top-right + bottom-left; `.four` for all four) | *let me show you* | real screens, gold tiles, glossy pills, timelines, thumbnails |
| **Gloss** | gold tiles (gradient #fdd859→#fff985), candy pills with inner gradient + glow, dark-glass chips and pills | *a thing you can pick* | steps, options, labels, counts |
| **Cutaway** | another video full frame + a title strip on top + a view pill | *proof it works* | examples, case studies |

Rules: glow type only in the room (on the chest). Gloss objects mostly on the void; chips and view pills also in the
room. No boxes around the speaker, no paper, no neon line art.

### Measured material & light (`anchor.py hooks --look`)

- **Light inside the hero:** luma span p95−p5 = 158.94 on the anchor → a new element needs ≥ 111: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails.
- **Glow:** none to speak of on the anchor (2.72): depth comes from shadow and layering, not halos.
- **Accent:** median saturation of the hero's most saturated 10% = 185.64 → ≥ 130: the accent is a real, saturated colour, never a greyed tint.
- **Highlights:** 2.2% of the hero is specular highlight on the anchor (white edges, paper sheen, selection fills) — check by eye.
- **Size and fill:** the hero spans 70% of the frame width and 46% of its cells carry detail → ≥ 60% wide, ≥ 34% detailed.
- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.

## 2. Anatomy

- **Room beat** = speaker · (one glow title **or** captions) · optionally one chip + one template line, or a row of
  example cards above the head.
- **Void beat** = one hero (a screen, a tile, a set of pills) centered · captions at the bottom.
- Limits: 1 glow word at a time; 5 pills; 4 icons; 3 example cards; 1 chip in the room (a stack of up to 7 chips
  only in a top corner as the running list); 6 rows on a screen.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Glow word | Heebo / Inter Tight 900, fitted to **55–75% of the width** (`HOOKS.fit`), 120–230px, line-height .92, tracking −3.5% |
| Lead line | 60px 800 white, soft white bloom, 6px above the glow word |
| Sub line (CTA promise) | 76px condensed (Oswald / Karantina), directly under the glow word |
| Captions | 58px 800 white, soft shadow, 1–3 words |
| Chip | 120px tall pill, ring 72px with the number, label 46px condensed |
| Template line | 76px hand font, slots in yellow with a glow |
| View pill | 112px tall, eye 54px, number 64px 800 (small version 64px tall on cards) |
| Gold tile | 360px square (pushes in to ×1.25), number 120px 900, label 36px 900 |
| Glossy pill | 104px tall, 46px 900 |
| Screen | 860px wide, rows 120px, text 40px (secondary 30px) |
| Text inside anything | **minimum 26px** as shown |

## 4. Color meaning

| Glow / color | Means | Example |
|---|---|---|
| gold (#fff6c2→#ffc21a) | *the key idea* (default) | "HOOK", "FOLLOWERS", the CTA keyword |
| fire (#ffe36b→#ff6a1a) | *the problem, the stakes, "never"* | "NEVER POST", "ZERO" |
| lime (#f2ff7a→#b8f000) | *the action, the how* | "DESCRIPTIONS", "POST THIS" |
| violet (#f2a6ff→#9a1cf0) | *the desire, the result you want* | "WORK", "MILLIONS OF VIEWS" |
| red neon (outline + 3D lift) | *the number of the list / a warning* | "7 HOOKS" |
| ring yellow #ffc928 | *a slot / an item number* | chip rings, [brackets] |
| green #34c759 | *on / done* | switches, check |
| candy pill colors | *one option each* (no meaning beyond "different") | HOOK 1…5 |
One glow color per title. The lead line is always white.

## 5. Space

- **Room:** full frame. The glow title sits **on the chest, under the chin** — 63% (y 1210) on the anchor's framing;
  measure the chin on the actual footage and place the title's top ≥40px below it (`.h-glowt { top }`). Captions
  sit at the same place when no title is up.
- **Example cards / chip stack:** above the head (y 100–620) or in the top corner; never over the face.
- **Void:** hero centered between y 300 and 1350; captions at 1560.
- **Layout respects the shot.** If the shot crops the chest (close-up), the glow title goes to the void (centered) for
  that beat. Profile or hand over the chest → captions only.
- **Bright clothing / white wall behind the chest:** add `.shade` (a soft dark pool behind the title) — the glow
  must read; check one frame.
- Cuts every 3–6 s *(anchor 68494: 8 cuts in 47.5 s + 1 punch; inside a world, a new element every ≈1.2 s)*.


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions on the full face follow the face:** centre at **chin + 0.61 × face height** (anchor IQR 0.44…0.78), recomputed every frame: `captions(..., { yAt: FACE.yAt(tl, { at: "chin", dy: 0.61 }) })`. The fixed token is only the fallback when no face is found.
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `HOOKS.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the world changes (room / void / cut) | hard cut; `zoom` 1.15–1.2 = jump punch on the room | `hit` into the void, `swish` out |
| `glow` | the key word is said | lead line rises 10px .14 s; the glow word **ignites** on its word: opacity flicker .55→.3→1 + scale .94→1 in .22 s; hard off when the idea ends | `glow` |
| `chip` | an item of a list is named | slides in 40px from the side, .25 s | `pop` |
| `hand` | a formula / template is spoken | words appear on their spoken word; a [slot] lands with a 1.25→1 pop | `tick` |
| `views` | proof (a count) | pill pops (back.out) then a glint sweeps across | `glint` |
| `tile` | a numbered step on the void | pops .6→1, then pushes in slowly to ×1.25 for its life | `pop` |
| `pop` | options / icons / cards | scale .6→1 back.out(2), stagger .12 | `pop` |
| `rise` | a real screen appears | from 90px below, .38 s | `whoosh` |
| `type` | searching / commenting | 12–16 letters per second | `key` |
| `select` | "this row" | the row gets the yellow side bar + 1.03 pulse | `click` |
| `toggle` | turning a setting on | knob slides .16 s, track turns green | `toggle` |
| `bar` | progress / where in the video | yellow fill grows from the start | `tick` |
| `count` | a number changes | digits roll, **landing on the payoff word**, hold ≥0.8 s; the green / ding only after it lands | `tick` → `ding` |
| `push` | a held composition while the voice talks over it | slow continuous scale 1→1.06–1.10 over the hold, linear | — |
| `pulse` | the voice stresses it | 1→1.08→1 | — |
Forbidden: tweening `filter` on a glow word (it kills the bloom), slow fades, rotation, wobble, camera moves other
than the jump punch.

## 7. Sentence → element recipe

1. Find the **stressed word** of the sentence and its **thing** (what would you show?).
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | a hook, a claim, a promise | a **glow title** on the chest: lead line = the words before, glow word = the stressed word, color by §4 |
   | a list ("N ways / N hooks") | the **neon number** glow title once ("7 HOOKS"), then a **chip** per item; the running list stacks in the top corner |
   | a formula / template / script line | a **chip** with its name + a **template line** in the hand font with [slots] |
   | an example / a case / proof | a **cutaway** to the real example + title strip + **view pill**; or 3 **example cards** above the head |
   | a setting, a feature, an app step | the **void** + the **real screen** (real rows), `select` / `toggle` / `type` on it |
   | steps of a plan | the **void** + a **gold tile** per step (number + 2–4 word label) pushing in; icons pop under it |
   | options / variants | the **void** + **glossy pills**, one per word |
   | timing, "the first 3 seconds" | the **void** + the **timeline bar** filling to the moment |
   | the result you want | a **violet** glow word; a count on a view pill |
   | "comment X" | glow title: lead "comment" + the keyword in quotes (gold) + the promise in the condensed sub line |
3. Write the anatomy (§2), pick the world (§5).
4. At least 3 actions over its life (§10d), each with an agent (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Worlds: `.h-room` (+`.warm`), `.h-void` (+`.four`), `.h-cut`, `.h-scene` · Type: `.h-glowt` (`.gold|.fire|.lime|.violet|.red`,
`.shade`) > `.lead`, `.glw` (or `.neo`), `.sub`; `.h-caps`/`.h-cap` · Room objects: `.h-chip` (`.n`, `.dim`), `.h-chips`,
`.h-hand` (`.w`, `.slot`), `.h-views` (+`.sm`, `.shine`), `.h-strip`, `.h-thumb` (`.t`) · Void objects: `.h-tile` (`.n`, `.l`),
`.h-gpill` (`.red|.orange|.green|.blue|.violet`), `.h-screen` (`.hd`, `.row`, `.row.sel`, small), `.h-toggle` (+`.on`),
`.h-new`, `.h-bar` (`.fill`, `.mk`), `.h-icons`/`.h-icon`, `.h-cursor` · Art: `HOOKS.ART.eye|play|heart|chat|send|check|cursor`.

## 9. Self-check
- [ ] Room, glow type, void, gloss, cutaway only (§1)
- [ ] One glow word at a time, on its spoken word, color = meaning (§4)
- [ ] The glow title is on the chest, under the chin, readable (shade on bright clothing) (§5)
- [ ] Every size from §3; every movement a verb from §6 with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in hooks terms)

a. **Activation.** The voice is the agent of the glow word (it ignites on the spoken word); on the void a **cursor /
   select / toggle / type** acts on the screen; the **view pill glints**; the **tile pushes in**; the **bar fills**.
   An object that only pops must be acted on within ~1 s.
b. **Real, readable content.** Real settings rows, real example videos with their real counts, real script lines in
   the template. The anchor blurs parts of its screens — we don't: show fewer rows, all real. Never grey bars.
c. **The thing itself first.** "Turn on this setting" → the real settings screen and the switch; "this hook got 40M"
   → the example and its count. A gold tile only for a step that has no thing to show.
d. **Action density ≈ 1.2–1.5 actions per second** *(anchor: template line 6 words + chip in 1.2 s; tile + 3 icons +
   push in 2.4 s ≈ 1.7; room beats: a new glow word / chip every 1.2–2.5 s)*. In the room, a glow word or chip at
   least every ~2.5 s; on the void nothing holds still for more than ~1.2 s.
e. **The opening has a visual.** The anchor opens on the speaker with a glow title **plus** a visual: the neon number
   and the running chip list (7784), the glow title with the platform badge (28202, translated: a glyph tile), or the
   example videos. Never a glow title alone over the face.
