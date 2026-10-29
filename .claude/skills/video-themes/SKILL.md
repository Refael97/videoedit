---
name: video-themes
description: >
  Theme system for HyperFrames reels: pick a look once ("theme: notebook") and every video comes out
  in it — fonts, colors, captions, cards, transitions, layouts and sound. Every theme exposes the same
  component contract, and the storyboard is written theme-agnostic, so swapping a theme is a one-word
  change. Use when the user names a theme, asks for "the same video in another look", asks to build
  a new theme from reference videos, or starts a video without a stated style and a theme is set.
---

# video-themes

Separate **content** from **look**:

1. Claude writes a theme-agnostic storyboard (scene list): components from the contract + the words.
2. The theme decides how every component looks and moves (`themes/<name>/`).
3. Proof it works: the same storyboard rendered in 3 themes.

Built on HyperFrames: one paused GSAP timeline at `window.__timelines["main"]`, seek-safe tweens
(`tl.set(from, 0)` + `fromTo(..., {immediateRender:false})`). Read `/hyperframes-core` first.

## Themes

| Theme | Status | Look | Format |
|---|---|---|---|
| `glass` | v2 (anchor 20957, 3/3) — preview (`videos/theme-glass-preview`) | talking head in a real room + frosted-glass windows anchored in the space, timeline strip, punch zooms | 9:16 |
| `paper` | v1 (anchor 15422, 1/1) — tested on new footage (`videos/paper-test-scope`) | step-by-step tutorial: cream graph-paper page above the face, folders, real UI zooms, orange ink | 9:16 |
| `night` | v1 (anchor 50462, 4/4) — preview (`videos/theme-night-preview`) | a framework lighting up on a black dot-grid stage: neon ladders, glowing curves, rows that unlock; speaker in a rounded box, head popping out | 9:16 |
| `editorial` | v1 (anchor 66150, 3/3) — preview (`videos/theme-editorial-preview`) | green magazine page: huge serif word behind the head, ticker headlines, pasted paper slips, cover frame, karaoke captions | 9:16 |
| `headline` | v1 (anchor 97418, 5/5) — preview (`videos/theme-headline-preview`) | bright wall, headline with a blue box + serif italic, real screenshots in blue-edged windows, focus rings, blur-ins | 9:16 |
| `arcade` | v1 (anchor 5777, 4/4) — preview (`videos/theme-arcade-preview`) | light split page with generated pixel-art worlds, mascot "Bit", mono uppercase caption pill, red pen strikes | 9:16 |
| `neon-studio` | v1 (anchor 70647, 4/4) — preview (`videos/theme-neon-studio-preview`) | dark gaming-room footage, yellow keyword line, huge thin italic keyword, pixel sprites landing on the chest, UI cards on a light page | 9:16 |
| `hooks` | v1 (anchor 7784, 4/4) — preview (`videos/theme-hooks-preview`) | glowing meaning-colored word on the chest, black screen with amber corner light, chips with [slots], switches that flip | 9:16 |
| `board` | v1 (anchor 31455, 2/2, provisional) — preview (`videos/theme-board-preview`) | faceless-first: neo-brutalist cards on cream, coral serif word, pixel crab "Pinch", pixel dissolves; the speaker as a face card | 9:16 |

**night vs hooks (both dark accents):** night draws a *system* (ladder, rows, curve) as light on a black stage with the speaker in a box at the bottom; hooks keeps the speaker *full frame in a bright room* and lands *one glowing word* on the chest. Explaining a structure → night; selling one idea → hooks.

Default when the user names none: ask once, then remember the answer in the project's `meta.json`
(`"theme": "<name>"`).

## Theme folder layout

```
themes/<name>/
  README.md     the editing prompt: idea, who it is for, editing character, text, sound, never
  language.md   the design grammar that makes NEW elements in the style (see "Every theme is a language")
  theme.md      measured spec: type, color, layout, motion timings, captions, sound levels, contract mapping
  tokens.css    @font-face + CSS custom properties (colors, sizes, radii, shadows, positions)
  theme.css     generic building blocks + materials (and the reference's ready-made elements as examples)
  motion.js     window.<THEME> — generic verbs (appear, fill, update, confirm, emphasize, replace, exit, punch…) + builders
  fonts/        OFL fonts only
  sfx/          UI sound set (synthesized with scripts/synth_sfx.py, free to redistribute)
  vendor/       gsap.min.js
```
`scripts/use_theme.sh <theme> <project>` copies the runtime parts into `<project>/assets/theme/`.

## Every theme is a language, not a catalog

A theme that can only redraw what the reference showed is useless on the next script. Each theme ships a
`language.md` with exactly these sections, written so Claude can design an element the reference never had:

1. **Materials** — the 2–4 surfaces everything is made of, what each *means*, how they may nest. No others.
2. **Anatomy** — the parts every element has (e.g. header · body · state) and the item limits.
3. **Scales** — type steps, spacing steps, radii, element size as % of frame. Only these values.
4. **Color meaning** — each accent = one meaning, where it is allowed, max accents per element.
5. **Space and depth** — world vs screen space, placement rules, how many elements at once.
6. **Motion verbs** — appear, fill, update, confirm, strike, emphasize, point, replace, exit, punch… each with
   when (story event), how (timing/easing) and its sound; plus what is forbidden.
7. **Sentence → element recipe** — find the noun, classify it (number, comparison, tool, process, person,
   date, place, progress, file, choice…), map to material + blocks, then anatomy, size, verbs.
8. **Building blocks** — generic CSS blocks in `theme.css` and the builders in `motion.js`.
9. **Self-check** — the checklist a new element must pass.
10. **Mandatory rules** — the five rules below, written out in the theme's own terms (with its measured numbers).

When extracting a theme from references, derive each section from what is consistent across the **anchor's**
elements (what surfaces repeat, what sizes repeat, what color is used for what), then extend it to the noun
types the anchor did not cover: first by translating a contributor's element (see below), otherwise by design,
marked *(assumption)*.

### The five mandatory rules (every `language.md`, learned from the glass test)

a. **Activation.** Every element has an *agent* that makes it happen: a cursor clicks it, text is typed into it,
   something is dragged into it, a marker circles/ticks it. Never just "appears". Write which agent each block
   uses.
b. **Real, readable content from the script.** No grey bars, skeletons, lorem ipsum or placeholders. If the voice
   says "a website with motion", show a website with a real headline and real buttons that move. Every text inside
   an element is readable at reel size and comes from (or follows from) the script.
c. **The thing itself first; a template only if there is no choice.** Show the actual tool, file, page or result.
   A generic block (chart, toast, meter) is a last resort, and never without real data — no chart without numbers,
   no "before/after" without what changed.
d. **Action density.** An element lives through several steps while it is on screen (typed → sent → answered →
   ticked), not one entrance and a hold. Measure in the anchor how many actions per second happen inside one
   element and write the number; the build must match it (±30%).
e. **The opening has a visual.** The hook is never text alone: it carries the strongest image of the video (the
   result, the tool, the object), measured from how the anchor opens.

### Anchor creator, contributors

- **Every theme is built around ONE anchor creator** (one taste). Pick the anchor video that is most consistent
  and most recognizable; all rules, numbers and the README come from the anchor (and the anchor's other videos).
- **"Repeats in ≥3" applies only to videos of the anchor creator.** With fewer anchor videos, write *(n/n)*.
- **Other creators in the same family are contributors.** You may take an element the anchor never showed, only
  after translating it into the anchor's language: the anchor's materials, colors, type, radii, motion verbs and
  sound. Note in `theme.md` → Contributions which video it came from and what was changed.
- Never average creators: the shared denominator of several creators is only the layout, and a theme made of it
  is generic.

### Shooting guide (every theme)

Each theme's README ends with **"How to shoot for this theme"**: the shot (wide / medium / close), where the
speaker sits in the frame (and what part of the frame the graphics need free), the background (color,
brightness, clutter), light, and what to avoid. Measured from the anchor.

## Workflow: building a video in a theme

1. Read `themes/<name>/README.md` (character), `language.md` (grammar) and `theme.md` (numbers).
2. Write the storyboard as a scene list. No colors, fonts or pixel values in it — only components and text.
3. For every beat, run the sentence → element recipe (`language.md` §7). `use_theme.sh`, then build
   `index.html` from the blocks + verbs (copy the preview project's structure). A new element that will recur
   gets added to the theme's blocks (so the next video gets it); it must pass the self-check (§9).
4. Check the theme's rules (`theme.md` → Rules) against the storyboard: caption words, max time on one
   layout, forbidden moves.
5. `npx --yes hyperframes@0.8.150 check` and snapshots of every scene.
6. **QA gate (mandatory — no draft reaches the user before it passes):** `scripts/qa/qa <project>`. It renders a
   fast draft (30 fps, draft quality), measures it against the theme's anchor targets (`themes/<name>/qa-targets.json`)
   and the known-mistake rules, and writes `qa-report.md` + `qa.json`: a score N/12 and a FIX LIST with time, words,
   the failed check and a concrete fix. Mark every payoff number with `data-qa-payoff="<word>"` (+ `data-qa-stamp`).
   Mark groups the language lets overlap (cards on cards) with `data-qa-stack`. Loop: fix → `qa` again, **at most
   3 rounds**. Only at 12/12 render the final 60 fps. If something still fails after
   3 rounds, tell the user exactly what fails and why — never send it silently. Targets are never edited to make a
   draft pass; they change only by re-measuring the anchor (`scripts/qa/anchor.py <theme>`). See `scripts/qa/README.md`.
7. Render at 60 fps in the background.

## Workflow: building a theme from a reference video

Proven on `glass` (one reference). Follow every step; the user checks the preview, not the spec.

1. **Get the files.** References live in `references/<style>/` (repo must stay private; nothing from
   `references/` ships inside a theme). Read `references/_analysis/styles.md`: which video is the **anchor**,
   which are contributors. `ffprobe` them: size, fps, duration.
2. **See it.** Contact sheets at 2 fps (`fps=2,scale=240:-1,drawtext=pts,tile=10x2`), then full-res key frames
   for every distinct state (hook, each overlay type, stat moments, CTA) stacked 4 at a time.
3. **Measure, don't guess.**
   - Cuts and zooms: `scdet=threshold=2` prints change scores; clusters of 3–5 frames = an animated punch zoom.
     Look at 8 consecutive frames around each to get the duration.
   - Text: crop the caption / hook at native size; bbox of near-white pixels → glyph height and width share;
     median color of the text pixels (hook text is often off-white, not #fff).
   - Accent colors: median of the saturated pixels inside the element.
   - Sound: spectrogram + waveform (`showspectrumpic`, `showwavespic`): music bed = continuous harmonic band;
     UI sounds = short high blips; note when they happen.
   - Action density: for 3–4 elements of the anchor, list every change inside the element frame by frame
     (typed, clicked, ticked, moved…) and divide by its time on screen → actions per second (rule d).
   - The opening: what image carries the hook in the first 2 s (rule e).
   - The shot: framing, subject position, background, light (shooting guide).
4. **Pick fonts by rendering, not by name.** Render the reference crop next to 5–6 free Hebrew candidates
   (Playwright screenshot) and choose by eye. Only OFL fonts ship.
5. **Write the theme:** `README.md` (the editing prompt — character first, rules second, shooting guide last),
   `language.md` (the 10-section grammar above, incl. the five mandatory rules — the part that makes it work on
   new scripts), `theme.md` (numbers + contract
   mapping, mark anything not seen in the reference as *(assumption)*), `tokens.css`, `theme.css` (generic
   blocks first), `motion.js` (generic verbs first), `sfx/` (synthesize; never ship other people's sounds or
   logos — draw generic icons).
6. **Preview project** `videos/theme-<name>-preview/`: the user's own footage + VO + word timings, a storyboard that
   shows every component once, SFX on every event. `lint` → `snapshot` contact sheet → fix framing → render
   60 fps in the background. Show the user the preview next to reference frames.
7. Iterate with the user on the preview. Only then extract more themes the same way.
8. Only what repeats in ≥3 videos **of the anchor creator** becomes a rule; contributors add elements only
   through translation.

## Hard-won rules (apply to every theme)

- **Layout respects the shot.** Before choosing a layout for a beat, look at the footage under it. If the shot is
  not frontal or not usable (profile, tight crop, blur, a hand over the face, another person), don't put the face
  in a split: use the full page / full graphic, or a card over the face. Check every split moment in a contact sheet.
- **The payoff lands.** A count / change / reveal ends **on the word that carries the payoff**, and the final value
  stays on screen **≥0.8 s before any cut**. Order is update → confirm: the stamp / check / ding comes after the
  number has landed, never before. The payoff is the biggest thing in its card.

- Hebrew/RTL: check every font in Hebrew before choosing it (Geist, Manrope, Poppins, SF have no Hebrew).
  Gradient and arrow directions flip in RTL. Typed text uses `white-space: pre`.
- Fonts that ship with a distributed theme must be free to redistribute (OFL). No SF Pro, no Ploni.
- No trademarks or logos of other companies inside a theme — visual language only.
- `.aa` on every transformed element (`outline: 1px solid transparent; backface-visibility: hidden`).
  Masks drawn at 4× and downscaled with LANCZOS.
- Lines: curves only, each piece starts in the direction the previous ended, sparks fade where they stop,
  a card gets a frame instead of another branch.
- Transform tweens only (no `letterSpacing`/`width`/`left`). `<audio>` needs an `id`. No `<video>` inside a timed wrapper.
- Music under voice: carve strength ≈0.3, bed ≈0.3.
