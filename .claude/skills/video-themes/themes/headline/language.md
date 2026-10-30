# headline: design language

> The grammar for building any element in this style, including ones the anchor never showed. If a new element
> needs a value this file does not give, the design is wrong, not the file. Built from the anchor (97418, 75789,
> 81754, 89398, 98315).

## 1. Materials

| Material | Looks like | Means | Use for |
|---|---|---|---|
| **Air** | the real bright wall above the speaker, cool white (#eef2f5 → #dfe9f3 at the top) | the *desk of a reporter* | the stage in split; the air veil (`.h-air`) lifts a darker wall to it |
| **Window** | a real screenshot / real UI in a browser or terminal window, 2px #1a4f9a edge + 5px light-blue halo, radius 21 | a *receipt*: this exists, here is the proof | tweets, repos, product pages, terminals, prompts, results |
| **Stat card** | navy #08111f, radius 36, a huge white→blue gradient number with a blue glow + one label | *the number that matters* | stars, users, money, time, counts |
| **Blue box** | #0283fd, sharp corners, serif bold italic white words | *the promise / the name* | the headline's second line, a section number, a product name |
| **Page / Dark** | a clean white page · a navy room with soft blue light | *a new chapter* · *inside the computer* | section headers · terminals, code, dark apps |

Rules: windows and stat cards float on air, on the page or on dark; the blue box only in a headline or a section header;
nothing covers the face in split.

### Measured material & light (`anchor.py headline --look`)

- **Light inside the hero:** luma span p95−p5 = 179.292 on the anchor → a new element needs ≥ 126: a gradient, a highlight edge or real content with darks and lights. A flat fill of one colour fails.
- **Glow:** none to speak of on the anchor (-3.196): depth comes from shadow and layering, not halos.
- **Accent:** median saturation of the hero's most saturated 10% = 127.5 → ≥ 89: the accent is a real, saturated colour, never a greyed tint.
- **Highlights:** 20.7% of the hero is specular highlight on the anchor (white edges, paper sheen, selection fills) — check by eye.
- **Size and fill:** the hero spans 80% of the frame width and 50% of its cells carry detail → ≥ 68% wide, ≥ 37% detailed.
- **Hebrew emphasis:** Hebrew has no italic. Where the anchor sets a word in serif italic, use weight, the accent colour, the theme's box or a second face that has Hebrew — never a slant or skew.

## 2. Anatomy

Every composition = **(headline or section header, top) · one receipt (window) · one overlay act (ring, selection, stat card)**.
- One window at a time; the next one **swaps** in place.
- Limits: 1 headline per video, 1 box per header, 1 stat card per window, 1 ring per window, 3 selections per window,
  3 words per caption.

## 3. Scales (1080 wide)

| Thing | Size |
|---|---|
| Headline | 80px sans 700 ink (Heebo / Inter), tracking −2.4, top 205 (11%) |
| Blue box | serif 92px (Frank Ruhl 900 upright for Hebrew / Playfair Display 700 italic for Latin), padding 4/30/12, right under the headline |
| Section header | 84px sans 700 on the white page, top 160, the box under it |
| Window | 850 wide (78–83%), top 470 under a headline / 300 without; text inside ≥26px as shown (body 32–40px, titles 52–62px) |
| Stat card | number 190px 800, label 54px 700, padding 26/44/32 |
| Captions | 72px sans 700, center 1005 (52%, right above the head) in split; 1420 on dark/page; 1390 on the face |
| CTA | lead serif 96px white; keyword 190px 800 #f4fb5a with glow, in serif quotes |
| Focus ring | 6px #0283fd, radius 14, 10px around the target |
| Spacing | 18 / 30 / 60px |

## 4. Color meaning

| Color | Means | Allowed on |
|---|---|---|
| blue #0283fd | *the point / where to look* | the box, focus rings, accent words (#2f7fe0 in captions), window edges (#1a4f9a) |
| selection #b5d5ff | *this sentence* | behind real text inside a window |
| ink #151515 | everything said | headlines, captions on light |
| navy #08111f / #0b0c11 | *the number* / *inside the computer* | stat cards / the dark layout |
| yellow #f4fb5a | *do this now* | the CTA keyword only |
One accent: blue. No red, no green except inside a real screenshot.

## 5. Space

- **Split** (default ≈65%): speaker low on the real wall, graphics in 160–960, captions at 1005 right above the head.
  If the head top is above ~50%, `drop` the footage (default for the Kowalski clip: 300px) and let the air veil fill the top.
- **Dark** (≈15%): terminal / code / a dark app; a cut, no speaker; captions at 74%.
- **Page** (≈10%): a section header ("Plugin Number *Two*") with its window; no speaker.
- **Face** (≈10%, the end): the closer camera (or a 1.18× punch), CTA.
- A new receipt every 1.5–3 s; a layout change every 3–6 s.
- **Layout respects the shot.** The face must be clear below the graphics: a hand over the face, a profile or the head
  rising into the graphics → cut to dark or page for that beat.
- **Captions never cover the mouth** on the full face: check the chin line and pass `yFace`.


### Face-relative placement (measured, `theme.md` → Face-relative placement)
Positions near the speaker are measured from the face box in every frame (`scripts/face_track.py` → `data/face.json`, runtime `effects/face.js`), never fixed pixels:
- **Captions on the full face follow the face:** centre at **chin + 0.29 × face height** (anchor IQR 0.26…0.35), recomputed every frame: `captions(..., { yAt: FACE.yAt(tl, { at: "chin", dy: 0.29 }) })`. The fixed token is only the fallback when no face is found.
- **Cards / objects next to the speaker:** eye level, on the free side, 0.4 × face height from the face (`FACE.follow(tl, wrapper, t0, t1, { at: "eyes", side: "free", gap: 0.4 })`).
- **Never covered:** eyes to mouth (the checker reads the face box in every sample).

## 6. Motion verbs (`motion.js` → `HEADLINE.<verb>`)

| Verb | Story event | Motion | Sound |
|---|---|---|---|
| `layout` | the medium changes | hard cut | `whoosh` / `swish` |
| `title` / `blurIn` | words appear | blur 12px → 0 + fade, .28 s, 0.1 s apart | `air` |
| `box` | the promise | the box grows from a square to full width (.3 s), then its serif words blur in | `swish` |
| `section` | a new item in a list | title blurs in, a blue caret blinks, it becomes the box | `swish` |
| `win` | a receipt appears | blur 14 → 0, scale .96 → 1, .32 s | `air` |
| `swap` | the next receipt | the old blurs out .18 s, the new blurs in | `whoosh` |
| `streak` | "look at this window" | a light runs along the window's top edge, .9 s | — |
| `ring` | "this button / this number" | focus ring lands from 1.18×, .25 s | `click` |
| `select` | "this sentence" | a selection sweeps over real text, .3 s | `tick` |
| `dim` + stat card + `count` | a number | the window goes grey, the card blurs in, the digits roll **ending on the payoff word**, final value holds ≥0.8 s, the payoff is the biggest thing on screen | `roll` → `ding` |
| `type` | a command / a comment | 20–24 letters per second | `key` |
| `push` | a window is being explained | slow continuous scale 1 → 1.05 over the hold (never on the footage in split) | — |
| `punch` / `unpunch` | the voice names a part of the window | quick zoom ×1.2–1.3 into that part (.3 s power3.out), holds, returns | `air` |
| `hold` | a window is explained for 1.5 s+ | punch the window's `.body` ×1.06–1.1 into the named part, creep on to ×1.12–1.2, return at the end of the sentence (the frame stays still, the screenshot zooms); keeps a held receipt from going flat | `air` |
| `cta` | "comment X" | the serif lead blurs in, the keyword lands big with its glow | `pop` |
| captions | speech | each word blurs in on its start; up to 3 words, then clear | — |
Forbidden: slides, rotations, bounces, camera moves on the footage in split, slow fades. (The full-face layout may
push in slowly on the footage: it is the "second camera".) No speaker on dark / page: the footage is hidden there.

## 7. Sentence → element recipe

1. Find the **receipt**: what on the internet proves this sentence? No receipt → caption only (the speaker on the wall).
2. Classify and build:
   | The sentence is about… | Build it as |
   |---|---|
   | someone posted / said something | the **tweet / post** in a window, the key sentence **selected** |
   | a tool, a repo, an app | its **real page** in a browser window, a **ring** on the button (Star, Install, Download) |
   | a number (stars, users, money, time) | **dim + stat card + count** on top of the page it comes from |
   | a command, code, the AI doing something | **dark** layout: the terminal window, the command **typed**, real output lines |
   | "number N" in a list | **page** layout: section header with the box ("Plugin Number *Two*"), its window under it |
   | a before / after | the same window **swapped** (before → after), a label under it, a ring on the improved part |
   | a promise / the topic | the **headline + box** (only once, at the start) |
   | "comment X" | the **CTA** on the full face |
3. Pick the layout (§5), write the anatomy (§2).
4. Give it ≥3 actions over its life (§10d) with an agent each (§10a).
5. Check §9.

## 8. Building blocks (`theme.css`, `motion.js`)

Layout: `.h-face` (video), `.h-air`, `.h-dark`, `.h-page`, `.h-scene` · Text: `.h-title`, `.h-boxline` > `.h-box`
(`dir="ltr"` for Latin), `.h-acc` (inline serif accent), `.h-caps`/`.h-cap` (`.light`), `.h-cta` (`.lead`, `.kw`, `.q`),
`.h-sec` (`.t`, `.h-caret`) · Windows: `.h-win` (`.bar` with `i i i`, `.url`, `.cnt`; `.body` (+`dir="rtl"`), `p`, `.sel`),
`.h-win.term` (`.in`, `.ok`, `.dim`), `.h-photo`, `.h-streak`, `.h-ring` (+ `HEADLINE.place`), `.h-dim` · Stat: `.h-stat`
(`.n`, `.l`) · `.h-cursor` · Art: `HEADLINE.ART.cursor|star|check|lock`.

## 9. Self-check
- [ ] Made only of air, windows, stat cards, the blue box, page/dark (§1)
- [ ] One receipt + one overlay act; within the limits (§2)
- [ ] Every size from §3; blue only for "the point" (§4)
- [ ] The face is clear; captions right above the head, not on the mouth (§5)
- [ ] Every movement is a verb from §6, on a word, with its sound
- [ ] §10 a–e all true

## 10. Mandatory rules (in headline terms)

a. **Activation.** Every window is acted on: a **ring** lands on its button, a **selection** sweeps its sentence, a
   **stat card** counts on it, a command is **typed** into it, a **streak** runs its edge, or it **swaps** to its after-state.
   A window that only arrives must be acted on within ~1 s.
b. **Real, readable content.** Windows show the real post, the real repo page, the real command and output, real
   numbers (≥26px as shown). If the user has no screenshot, build the window with the real words — never skeleton lines.
c. **The thing itself first.** "A guy on Twitter" → his tweet; "it has 23k stars" → the repo page with the Star button
   ringed, then the stat card. No stat card without a real number from the script or the source.
d. **Action density ≈ 2 actions per second** (on long talking-head scripts: swap the receipt every 1.5–3 s, a cursor works the UI, `hold` on every window held longer than ~1.2 s; selections are gradient-backed so `select` really sweeps) *(anchor: opening 4 words + box + 3 serif words + window in 1.2 s; repo
   beat: ring, dim, card, roll in 1.6 s; caption words on top of that)*. A receipt never holds still for more than ~1.2 s.
e. **The opening has a visual.** The headline + box with a real image/screenshot under it, all inside the first second
   (anchor: title at 0.1 s, box 0.3 s, image card 0.4 s). Never the headline alone.
