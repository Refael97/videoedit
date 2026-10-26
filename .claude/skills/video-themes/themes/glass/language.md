# glass: design language

> `README.md` says what the look *feels* like. This file is the **grammar**: the rules that let you design any
> element the reference never showed (a calendar, a chart, a map, a WhatsApp message, a price table…) so it still
> looks like it belongs. When the script needs something new, do not copy the nearest reference element — build
> it from the materials, the anatomy, the scales and the motion verbs below. If the result needs a value this
> file does not give, the design is wrong, not the file.

---

## 1. Materials: everything is made of exactly one of three

| Material | Class | Looks like | Means | Use for |
|---|---|---|---|---|
| **Light glass** | `.m-light` | white 16% + blur 14px + 1.5px white 40% edge + top inner highlight | a *place* | the floating desktop, a map, a calendar page, a "space" that holds other things |
| **Dark glass** | `.m-dark` | near-black 55% + blur 16px + 1.5px white 32% edge | a *moment / a fact* | numbers, results, a notification, a quote, anything that should be read in one glance |
| **Window** | `.m-win` | opaque dark #1e1e21 94% + 1px white 12% edge + traffic lights | a *tool* | an app: terminal, chat, editor, browser, list, settings |

Rules:
- A window may sit **inside** light glass; dark glass is always free-floating; glass never sits inside a window.
- Never invent a fourth material (no colored cards, no gradients-as-background, no paper, no neon).
- Light text on all three. The only dark text in the theme is on the CTA pill.
- Inside a window, sub-surfaces are white at 6–12% (inputs, chips, rows), never another color.
- **Adapt to the footage brightness.** The materials above are tuned for a mid/dark room. On bright footage
  (white wall, daylight; mean luma of the free area > ~170) add `.bg-bright` on `.g-root`: dark glass goes
  to 80% so it stays black instead of muddy grey, light glass gets a 30% fill, an 85% edge and a soft drop
  shadow so it still reads as glass on white. Check one frame of each material against the real background.

## 2. Anatomy: every element = header · body · (state)

```
┌──────────────────────────┐
│ header   small, quiet    │  window: traffic lights + 17px grey title; glass: 26–30px 700 label or nothing
│ body     the one thing   │  the content the voice is talking about — one idea
│ state    what changed    │  a check, a number, a badge, a highlight — the payoff
└──────────────────────────┘
```
- One idea per element. If you need two, it is two beats (replace, don't add).
- The payoff (state) is the only part that gets color.
- Lists max 5 rows. Charts max 5 bars. Chips max 4. Thumbnails max 4.

## 3. Scales (use these numbers, nothing in between)

**Type** (Rubik, 1080 wide; mono = JetBrains Mono for code/commands only)
| Step | px | weight | role |
|---|---|---|---|
| T1 | 132 | 900 | the one big number / word of a dark-glass fact |
| T2 | 56 | 900 | CTA, a short headline inside glass |
| T3 | 30 | 900 / 700 | element headers, list headers (orange in lists) |
| T4 | 25–28 | 700 | rows, messages, labels |
| T5 | 18–20 | 500–700 | sub-labels, timestamps, menu bar, window titles (grey) |
Screen text (hook 72/124, captions 76) is separate and always bigger than anything inside glass.

**Space**: 8 · 12 · 16 · 22 · 34 px. Padding of windows 22, of dark glass 26×34, row height 50–54, gaps 8–12.
**Radii**: light glass 30 · dark glass 30 · window 18 · inner surfaces 10–14 · chips/pills full.
**Size**: an element takes 35–45% of frame width when it lives in the glass desktop, 65–75% when it is a
free dark-glass fact. Never full width, never smaller than 30%.
- **Windows hug their content**: height = content + padding; no empty dark area below the last row.
- **Dark-glass facts are read in one glance**: their smallest text is T4 at 30px; titles T3 at 34px; never T5
  except a timestamp.
- **Charts are slim**: bars 120px wide with 60px gaps, centered, labels T4 white 85% under each bar; the card
  keeps empty space around the bars instead of stretching them.

## 4. Color: meaning, not decoration

| Color | Hex | Means | Allowed on |
|---|---|---|---|
| green | #2fcd58 | success, money gained, done, free | numbers, checks, "done" badges, a positive delta |
| red | #ff453a | cost, loss, problem, old way | strike lines, a negative delta, an error dot |
| blue | #0a84ff | selection, "you are here", the active one | checked circles, selected row, a map pin, today in a calendar |
| orange | #ff9f0a | a list/section header | the header of a list, never a body |
| white / grey | #fff, #ececee, #9a9a9f | everything else | all text and icons |
Max **one** accent color per element (plus white). The footage supplies all other color.

## 5. Space and depth

- **World space** (`.g-cam`, moves with zooms): footage, light glass, windows, dark glass.
- **Screen space** (fixed): hook, captions, CTA. Nothing else.
- Placement: on the side of the speaker with free room; dark-glass facts above the head (top 6–20%) or
  beside it. Never over the mouth/eyes, never under the caption line (74.7%), never touching the frame edge (≥18px).
- Only **one** primary element on screen. Showing a new one = replace (§6), not stack.
- The cursor belongs to the light glass it is in; it only appears when something is being *done*.
- **Captions stop when the CTA appears** (the CTA *is* the last line); never show both. The CTA takes the
  caption slot (≈75%), below the face, arrow pointing down to the comments; never over the face.
- **Light glass is never empty**: a window inside it fills at least ~60% of it. If the content is short, give the
  window more true content (the steps the command runs, the files it made) instead of leaving dead glass.
- When the only free space is above the head, everything lives in the top third (y 90–680) and the camera
  punches add y offset (+60–70px when tight) so nothing gets closer than 18px to the top edge.

## 6. Motion: verbs, not effects

Every change on screen is one of these verbs. Pick by what happens in the story, never by what looks cool.
All are in `motion.js` as `GLASS.<verb>`.

| Verb | When the story… | Motion | Sound |
|---|---|---|---|
| `appear` | introduces a thing | light glass: scale .92→1 + blur 8→0, .45s expo.out · window: scale .55→1 + blur 12→0 from 20px below, .4s expo.out · dark glass: same as window from 40px below | `pop` (window), `whoosh` (dark glass fact) |
| `fill` | lists / adds items | items rise 14px + fade, .25s each, .3–.45s apart (match the words) | `tick` per item |
| `update` | a value changes | numbers count (power2.out, 1–1.6s); bars grow from 0 (power2.out .6s, stagger .12); meters fill; text swaps hard | `tick` at start |
| `confirm` | something succeeds | a state mark pops: scale .3→1 back.out(2.4) .3s; circle fills blue / check turns green | `ding` (once per element, on the last) |
| `strike` | the old way is cancelled | red line draws across, .3s power2.inOut, .25–.4s apart | — |
| `emphasize` | the voice stresses it | scale 1→1.12→1 in .24s, or a 3px white ring that fades | `click` |
| `point` | "here", "this one" | cursor eases to it (power2.inOut), squash .82 on click | `click` |
| `replace` | the topic changes | old: scale .85 + blur 8 + fade .22s power2.in; new `appear` starts .05s after | `pop` |
| `exit` | the topic ends | same as the old half of replace | — |
| `punch` | a new idea starts | whole camera snaps between wide (1.0) and tight (1.1–1.15) in .15s power2.inOut, every ≈4s | `zoom` |
Forbidden: bounce on anything but a state mark and the CTA, rotation/flip, slide-in from outside the frame,
typewriter on anything but a terminal/prompt line, more than two verbs on screen at the same moment.

## 7. From a sentence to an element (recipe)

1. Find the **noun** of the sentence (what would you point at?). No noun → no element; keep the face.
2. Classify it:
   | The sentence is about… | Material | Build it as |
   |---|---|---|
   | a number, price, % , result | dark glass | T1 number + T5 label + optional 2–3 rows with deltas/strikes |
   | a comparison (before/after, A vs B) | dark glass | 2 bars or 2 columns, red for the loser, green for the winner |
   | growth over time | dark glass | 4–5 bars (`.g-bars`) growing, the last one green |
   | a tool, an app, a command | window | the app's essential UI, generic (no logo): rows, input, a result |
   | a process, steps, setup | window | a list (`.g-list`) or terminal rows filling + confirms |
   | a person, a message, a DM, a comment | dark glass | `.g-toast` notification or `.g-bubble` chat bubbles with an avatar circle |
   | a date, a deadline, a schedule | light glass | `.g-cal` month grid, today/target in blue |
   | a place, a delivery, "anywhere" | light glass | `.g-map` (abstract streets drawn in white 15%), one blue pin, optional route line |
   | progress, "almost done", a level | dark glass | `.g-meter` bar filling to the value, label T4 |
   | a file, an asset, a folder | light glass desktop | `.g-tile` icons + a window |
   | a choice, options, settings | window | chips (`.g-chip`), the chosen one green / selected blue |
3. Write its anatomy (§2): header, body, state. The state lands on the word that carries the payoff.
4. Size and place it (§3, §5). Pick the verbs (§6) from the words: appear on the noun, update/confirm on the
   payoff, exit/replace when the next noun arrives.
5. Check: one material? one accent color? sizes from the scales? only allowed verbs? If yes, it is glass.

## 8. Building blocks (theme.css)

Material classes `.m-light` `.m-dark` `.m-win` go on a `.g-card` (any absolutely positioned element).
Inside them use:
`.g-head` (header row) · `.g-row` (list row: icon/box + text + trailing value) · `.g-chip` (+ `.on`, `.sel`) ·
`.g-num` (T1 number) · `.g-label` (T5) · `.g-delta.up|.down` · `.g-meter > i` (fill) ·
`.g-bars > .bar > i` (column chart) · `.g-toast` (notification: avatar + title + text + time) ·
`.g-bubble.in|.out` (chat bubbles) · `.g-avatar` (circle, image or initials) · `.g-cal` (month grid; `.today`, `.mark`) ·
`.g-map` (abstract street lines + `.pin` + `.route`) · `.g-tile` (icon + label) · `.g-input` (prompt field) ·
`.g-badge` (outlined green) · `.g-sep` (1px white 8% line).
Ready-made windows from the reference (`.g-term`, `.g-chat`, `.g-list`, `.g-stat`) are just these blocks
already assembled; read them as examples of the grammar, not as the only options.

## 9. Self-check before rendering a new element
- [ ] Made of one material, nested legally (§1)
- [ ] Header · body · state, one idea, within the item limits (§2)
- [ ] Every size from the scales (§3)
- [ ] One accent color, used for its meaning (§4)
- [ ] In world space, on the free side, not over face or captions (§5)
- [ ] Every movement is a verb from §6, timed to a word, with its sound
- [ ] No logo, no brand icon, no new font

## 10. Mandatory rules (in glass terms)

a. **Activation.** Nothing in the glass just appears. Agents: the **cursor** (clicks a dock icon to open a
   window, clicks a button, drags a file), **typing** (terminal commands, chat prompts, search fields letter by
   letter), the **system** (a notification slides in because something happened, e.g. after "send"). A dark-glass
   fact is activated by the event that caused it (a click, a finished command).
b. **Real content.** Windows show real, readable things from the script: a real page headline and buttons, the
   real command, the real message text. Never grey bars or skeletons (the first glass test broke this with a
   website skeleton: wrong).
c. **The thing itself first.** "A website" → a real-looking page in a browser window. "Comments" → a comment
   list with names and text. A chart only with real numbers on it; a before/after only with what changed
   written on both sides (the glass test's unlabeled bars: wrong).
d. **Action density.** Reference: the terminal does 3 installs + 3 checks + a badge in ~3.5 s, the chat does
   thumbnails → prompt → reply → chips in ~3 s, the checklist ticks 4 rows in ~2 s → **≈1.5–2 actions per second
   inside the element on screen**. Hold an element still for at most ~1 s.
e. **The opening has a visual.** Reference: the hook sits over a glass timeline strip of video thumbnails with the
   AI logo moving across it, not over the bare room. The hook always carries the strongest image of the video in
   glass (the result, the tool) behind/under the two-tier title.
