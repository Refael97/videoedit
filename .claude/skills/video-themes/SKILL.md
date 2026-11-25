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

## Signature effects (shared by every theme)

`effects/` holds moves built once and dressed by the active theme (`themes/<t>/fx.css`): the **word behind the head**,
**cards from behind the shoulders** and the **chart on the chest** (numbers only from `data/facts.yaml`). All are
placed relative to the face (`effects/face.js` + `scripts/face_track.py`) and self-checked by QA every sample
(letters ≥ 70% visible against the cut-out, risen cards ≤ 50% hidden). See `effects/README.md`; demo `videos/fx-demo/`.

## Workflow: building a video in a theme

Creation is a loop, not a pass: **build → look next to the anchor → fix → look again**, scene by scene, until every
scene holds up beside the anchor's frame. Code measures what it can; Claude must LOOK at every round sheet. A draft that
"passes the numbers" but was never looked at side by side is not done. Every round is saved, so the progression is
visible (`review/<scene>/round-N.jpg`).

### Stage 0 · Footage (once, before any design)
1. `python3 scripts/footage_prep.py <project> --wire` — brings the voice to the delivery level (-16 LUFS under a music bed, -12 in a voice-led theme: the render mixes ~2 dB under the file), and measures the speaker footage with the same code that measured the
   anchor (`scripts/qa/look.py`), then grades in a closed loop (grade → measure → correct, up to 4 passes): face and
   background luma, contrast, saturation, skin warmth, garment vs background. When one curve can't reach the anchor's
   world (a bright wall on a dark theme, clothes melting into the wall) it grades the background separately through the
   cut-out matte. Crops to the anchor's full-face size (≤ 1.35×, the matte gets the same crop), re-tracks the face.
2. Read `footage-report.md`. **RESHOOT** → send the user the theme README's "How to shoot for this theme" *before*
   editing (the edit may continue on the best grade, but say so). Never design over footage from another world.

### Stage 1 · Scene by scene
3. Read `themes/<name>/README.md` (character), `language.md` (grammar, incl. §1 *Measured material & light*) and
   `theme.md` (numbers, incl. *Look targets*).
4. Storyboard as a scene list: components and text only (no colors, fonts, pixel values). For every beat run the
   sentence → element recipe (`language.md` §7). `use_theme.sh`, then build `index.html` from the blocks + verbs. A new
   element that will recur goes into the theme's blocks and must pass the self-check (§9). Every scene is an element
   with a `scene` class token or `data-qa-scene`.
5. **The loop, one scene at a time** (`scripts/review/review.py <project> scene next`):
   - it snapshots the scene's key moments (entrance, middle, end) and 8-frame motion strips around its entrances, puts
     each moment next to the anchor's moment of the same kind (`references/_analysis/<theme>/moments/`, built by
     `review/anchor_moments.py`), measures hero width, content density, luma span and glow on the stills, and writes
     `review/<scene>/round-N.jpg` + `round-N.md`;
   - **open the sheet and look.** Fill every row of the eye checklist (scale, real dense content, material & light,
     contrast, typography, footage, framing & safe zones, spacing, motion, activation, payoff, *same level as the
     anchor*): PASS only when the draft holds up next to the anchor frame; FIX + exactly what and how;
   - write the fixes, apply them, run the next round. Move to the next scene only when every row is PASS.
   - No round cap. When the same row fails 3 rounds in a row, stop and tell the user what fails and why.
6. `npx --yes hyperframes@0.8.150 check`.

### Stage 2 · Polish (after every scene passes)
7. `review.py <project> polish` — a sheet of the opening frame, every scene's middle and the last frame, and the polish
   checklist: depth (shadows), edges, easing and overshoot, secondary motion in holds, caption timing, a sound per
   event, colour consistency, line breaks, transitions, opening thumbnail, last frame. Loop until every row is PASS.
   Polish is not error fixing: it takes a correct draft to the anchor's finish.

### Stage 3 · The whole film
8. **QA gate:** `scripts/qa/qa <project>` — a 30 fps draft measured against the anchor: 13 timing / layout checks and
   7 look checks (footage match, hero scale, content density, full-face rhythm, material & light, text contrast,
   Hebrew typography). Mark payoffs with `data-qa-payoff="<word>"` (+ `data-qa-stamp`), stacks with `data-qa-stack`,
   deliberate decoration with `data-qa-decor`. Fix → `qa` again until 20/20. Targets are never edited to make a draft
   pass; they change only by re-measuring the anchor (`scripts/qa/anchor.py <theme> [--look]`).
9. `review.py <project> film` — the draft at 1 fps next to the anchor at 1 fps, loudness, and the film checklist
   (rhythm, consistency, dead air, hook, audio, same level). Loop until PASS.
10. `review.py <project> gate` must print READY (every scene, the polish and the film passed). Only then render the
    final 60 fps in the background.

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
7. Measure the targets on the anchor: `python3 scripts/qa/anchor.py <name>` (timing + look targets, and the
   *Measured material & light* block in `language.md` §1) and `python3 scripts/review/anchor_moments.py <name>` (the
   moment library the eye review pairs drafts with).
8. Iterate with the user on the preview. Only then extract more themes the same way.
9. Only what repeats in ≥3 videos **of the anchor creator** becomes a rule; contributors add elements only
   through translation.

## Hard-won rules (apply to every theme)

- **Layout respects the shot.** Before choosing a layout for a beat, look at the footage under it. If the shot is
  not frontal or not usable (profile, tight crop, blur, a hand over the face, another person), don't put the face
  in a split: use the full page / full graphic, or a card over the face. Check every split moment in a contact sheet.
- **The payoff lands.** A count / change / reveal ends **on the word that carries the payoff**, and the final value
  stays on screen **≥0.8 s before any cut**. Order is update → confirm: the stamp / check / ding comes after the
  number has landed, never before. The payoff is the biggest thing in its card.

- **Hebrew has no italic.** Where an anchor uses serif italic for emphasis, a Hebrew theme uses weight, the accent, the
  theme's box or a second face with Hebrew — never `font-style: italic` or a skew (QA check 20). Digits inside a Hebrew
  line take the line's own face.
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
