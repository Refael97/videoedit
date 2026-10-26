# paper: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (15422);
> anything borrowed from another creator is translated and listed in `theme.md` → Contributions.

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Page** | cream #dfd6c4, 48px graph grid #d5ccb9, faint paper mottling | the *desk* where work happens | the stage: top half in split, full screen in full-page |
| **Card** | white, radius 16, 1px warm edge, soft warm shadow, optional window bar with traffic lights | a *real screen*: an app window, a prompt, a table of links, a document | anything the user would actually see on their computer |
| **Object** | blue folders (#6fcbf6), orange app tiles (radius 28), white-bordered phone thumbnails, line-drawn props (5px ink outline, #f4efe6 fill) | a *thing* you can hold | files, folders, apps, devices, videos, props that explain an idea |
| **Ink** | orange dotted connectors and arrows, thin ink tree lines, orange pills (tags), orange strike lines | an *annotation* by the teacher | relations, labels, corrections, pointing |

Rules: cards and objects sit on the page or float over the face (cards only). Ink only on the page.
Nothing else exists: no colored panels, no gradients, no glass, no glow. A real dark output (e.g. a generated
document) may be shown **as-is** inside a card, never as a background.

## 2. Anatomy

Every page composition = **step label (top) · one hero (center) · labels / ink (around it)**.
- The hero is one object or one card. Secondary objects are smaller and labeled.
- Labels sit under objects (ink, 40px); the active one is orange.
- Limits: 3 children in a tree, 3–4 thumbnails in a row, 3 tags on one object, 5 rows in a card, 4 steps.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Step label | 70px Heebo 700, orange "שלב N." + ink title, centered at y 300 (16%) |
| Section title (no step) | 58px Heebo 700, one orange word |
| Object labels | 40px Heebo 700 |
| Card text | **minimum 26px** at the size it is shown; body 28–34px, titles 36–44px 700, code/links JetBrains Mono ≥28px. Anything that would render under 26px (nav items, URLs in a bar, secondary lines) is **deleted**: it is decoration, not content |
| Tags | 30px Heebo 700 white on orange pill, height 54 |
| Captions | 76px Heebo 800, white, 10px black outline |
| Hook | **Heebo 800+**, white; size is fitted so the longest line spans ≈80% of the width (`PAPER.fit`), not a fixed size. On bright footage add the caption outline (`.p-hook.stroke`) or darken the top half (`.p-shade`) |
| Hero object | split: 300–560px wide. **Full page: the hero is 35–45% of the page height (670–860px) and centered**; children/parked objects 180–240px. A full page must never look mostly empty |
| Card on page | **UI zoom (the anchor's main technique): 80–90% of the frame width (860–970px), shown enlarged, allowed to bleed off one side of the frame; show only the relevant part** (the dropdown, the prompt, the command). Smaller cards (600–760) only for a whole small window |
| Spacing | 24 / 36 / 60px; grid step 48px — align objects to the grid when you can |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| orange #c65a3c | *this one / now / the teacher's hand* | step number, the active label, tags, dotted connectors, arrows, strikes, app tiles, one word in a title |
| blue #6fcbf6 | *a container of files* | folders only |
| yellow #fbe38a | *fill this in yourself* | the blanks inside a prompt card |
| link blue #2f6fd6 | *a link you can open* | URLs inside cards |
| green #2fa860 | *verified* | a check mark inside a card, a "works" stamp |
| ink #221c12 | everything else | text, outlines |
One accent per element besides ink; orange is the default.

## 5. Space

- **Split** (default while teaching): page 0–960, face 960–1920; captions on the seam (908).
- **Full face:** hook, emotion, and a single card floating over the face at the top (y 240–700).
- **Full page:** when a drawing needs the whole height (trees, recaps, illustrations); captions at 62% (1190).
- Layout changes every ~4–6 s *(1/1: 15 switches in 77 s)*. A step usually spans several layouts.
- One hero at a time. When the next object arrives, the previous one **parks** (shrinks, moves up/aside) or leaves.
- Nothing closer than 60px to the frame sides **except UI-zoom cards, which may bleed off one side**; nothing under the seam in split.
- **The seam on bright footage:** if the footage's mean luma is above ~170 (white wall, daylight), darken the face half by ~15% (`.p-face.dim`) or add the soft seam shadow (`.p-seam`) so the page and the face don't merge into one bright block.
- **Layout respects the shot.** Split only over a frontal, usable shot. Profile, tight crop, blur or a hand over the
  face → full page or a card over the face for that beat (found in the scope test, 9–12.6 s).
- **Captions never sit on a card.** In split the card ends ≥60px above the seam caption (card bottom ≤ 840).
- **Captions never cover the mouth.** 62% is the anchor's value for its framing; if the speaker's chin is lower,
  move full-face captions just under the chin (`captions(..., { yFace })`). Check one full-face frame.

## 6. Motion verbs (`motion.js` → `PAPER.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut; `flash` (0.14 s paper-white veil) when the page takes the full frame | `swish` on flash |
| `pop` | a thing is introduced | scale .6→1 + fade, back.out(1.7) .35 s; stagger .12 | `pop` |
| `rise` | a screen/card is shown | from 70px below, .4 s power3.out | `pop` |
| `park` | make room for the next thing | shrink + move, .45 s power3.inOut | — |
| `fill` | output / a list builds up | lines rise 16px + fade, .2 s each, one after another (≈.18 s apart) | `tick` |
| `branch` | one thing splits into parts | tree lines draw .25 s, children slide out of the parent .34 s, stagger .13 | `tick` per child |
| `drop` | something goes into something | item falls in (.42 s power2.in), front flap dips, folder bumps | `pop` |
| `label` | naming the thing | label rises, orange while active, ink after | — |
| `connect` | A uses / reads / sends to B | orange dotted line draws .45 s | — |
| `strike` | not this one | orange line across, .25 s | `tick` |
| `tag` | naming parts of a thing | dotted leader draws, orange pill pops | `pop` |
| `point` | "this one" | orange arrow drops; or the cursor moves there | — |
| `click` / `cursor` | choosing in a real UI | cursor eases, squash .82 on click | `click` |
| `type` | writing / commenting / prompting | letters at 12–14 per second | `key` per ~3 letters |
| `highlight` | "fill this part in" | yellow box behind the blank, .2 s, staggered | `tick` |
| `count` | a number changes (price, headcount, total) | the digits roll to the new value, **ending on the payoff word** (start on the word that sets it up), power2.out; the final value holds ≥0.8 s before any cut; any stamp/check comes **after** it lands; the payoff number is the biggest text in the card (≥56px, usually 72+) | `tick` at start, `ding` on landing |
| `lift` | zoom into a detail | a card comes out of a screen, .5 s power3.out | `whoosh` |
| `cycle` | many examples | thumbnails swap every ~0.5 s | — |
| `pulse` | the voice stresses it | scale 1→1.08→1 in .24 s | — |
Forbidden: slow fades, rotation of cards, bouncing beyond the pop overshoot, camera zooms on the footage,
anything moving without a story event.

## 7. Sentence → element recipe

1. Find the **noun** (what would the teacher draw?). No noun → full face, no graphic.
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | a tool / app you open or install | **UI zoom**: its real window shown big (80–90% wide, bleeding off one side), cropped to the part being used; the cursor or typing acts on it |
   | an app as a thing (download, choose) | an orange **tile** (sparkle or the app's first letter) in a ring + label; alternatives as small tiles, the wrong one struck |
   | files, a project, organization | **folders** (+ `branch` into sub-folders, `drop` files into them) |
   | a prompt / an instruction | a **prompt card**: the real prompt text, blanks highlighted yellow |
   | links / resources / tools list | a **table card**: name + one-line role + the real link |
   | examples, inspiration, results | 3 **phone thumbnails** of real videos/screens, `cycle` or `pop` in a row |
   | how something works / its parts | a **line-drawn prop** (laptop, phone, doc, fan, camera…) + orange **tags** on its parts |
   | a website (only when the word is literally "site / אתר") | a real mini page (`.p-site`) inside a laptop/phone illustration or a UI zoom; otherwise prefer the props |
   | style, design, colors, a look | the **swatch fan** opening (`PAPER.art(.., "fan")` + `fanOpen`) |
   | A connects to / reads B | two objects + orange **dotted connector** |
   | a choice between options | the options as tiles/cards, the right one `pulse`, the others `strike` |
   | a before / after, a comparison | two cards side by side with **real content**, an orange stamp on the loser ("✕ …") and a green one on the winner |
   | a date, a schedule | a **calendar card**, marked days in orange |
   | a conversation, feedback | **bubbles**: the request (white, from the user) and the reply (with the sparkle) |
   | the summary of all steps | **recap**: the hero object in the center, the step labels around it, dotted arrows into it |
   | "comment X" | the **comment pill** with the word typed |
3. Write the anatomy (§2) and pick the layout (§5): split for teaching, full page for big drawings, a card over the
   face for a single screen.
4. Give it at least 3 actions over its life (§10d) and an agent for each (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layout: `.p-face` (video), `.p-stage` (page), `.p-flash`, `.p-scene` (one composition) · Text: `.p-step` (b = orange),
`.p-title` (em = orange), `.p-label` (`.on`), `.p-caps`/`.p-cap`, `.p-hook` · Cards: `.p-card` (+`.warm`) with
`.bar`, `.body`, `.head`, `.row`, `.link`, `.mono`, `.hl`, `.input`, `.send`; `.p-menu` (`.it`, `.sel`, `.k`);
`.p-site` (+`.plain`) for real mini web pages · Objects: `.p-obj` + `PAPER.art(sel, "folder|laptop|phone|doc|spark")`,
`.p-tile`, `.p-ring`, `.p-thumb` · Ink: `.p-ink` svg with `.tree`, `.strike`, `.arrow`, dotted via `PAPER.connect`,
`.p-tag`, `.p-stamp` (+`.ok`) · Other: `.p-bubble` (`.me`, `.ai`), `.p-cal`, `.p-cta`, `.p-cursor`.

## 9. Self-check
- [ ] Made only of page, cards, objects, ink (§1)
- [ ] Step label · one hero · labels; within the limits (§2)
- [ ] Every size from §3; one accent, used for its meaning (§4)
- [ ] Right layout; one hero; nothing under the seam (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in paper terms)

a. **Activation.** Every element has an agent: the **cursor** clicks the real UI; **typing** fills prompts,
   searches and the comment pill; a **drop** puts files into folders; the **teacher's hand** (orange arrows,
   strikes, tags, dotted connectors) points, corrects and names. An object that only pops in must be acted on
   within ~1 s.
b. **Real, readable content** (≥26px as shown, §3). Cards show the real prompt, the real link, the real menu items, real file names;
   thumbnails are real frames; a website is a real mini page with a headline and a button (`.p-site`). Never bars,
   skeletons or lorem.
c. **The thing itself first.** "Download the app" → the app tile and the arrow to it; "select the folder" → the
   real dropdown with the cursor; "how a camera works" → a camera with labeled parts. A generic block (calendar,
   bubbles, stamps) only when the script is literally about that, and only with real data on it.
d. **Action density ≈ 1.5 actions per second** inside the page *(1/1, measured: icons 4 actions / 3.5 s = 1.1;
   folder tree 10 / 8 s = 1.25; dropdown 6 / 4 s = 1.5; camera 7 / 3 s = 2.3)*. An element never holds still
   for more than ~1.2 s while it is the hero.
e. **The opening has a visual.** The hook sits over the face with a row of 3 real thumbnails (the result, the
   examples) cycling under the title *(anchor: 3 short-video cards swapping every ~0.6 s for 9 s)*.
