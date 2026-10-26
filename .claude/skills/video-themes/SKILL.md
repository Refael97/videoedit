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
| `glass` | v1 — README, spec, tokens, components, motion, sfx, preview (`videos/theme-glass-preview`) | talking head + a floating frosted-glass desktop with app windows, punch zooms | 9:16 |

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

When extracting a theme from references, derive each section from what is consistent across the reference's
elements (what surfaces repeat, what sizes repeat, what color is used for what), then extend it to the noun
types the reference did not cover, marked *(assumption)*.

## Workflow: building a video in a theme

1. Read `themes/<name>/README.md` (character), `language.md` (grammar) and `theme.md` (numbers).
2. Write the storyboard as a scene list. No colors, fonts or pixel values in it — only components and text.
3. For every beat, run the sentence → element recipe (`language.md` §7). `use_theme.sh`, then build
   `index.html` from the blocks + verbs (copy the preview project's structure). A new element that will recur
   gets added to the theme's blocks (so the next video gets it); it must pass the self-check (§9).
4. Check the theme's rules (`theme.md` → Rules) against the storyboard: caption words, max time on one
   layout, forbidden moves.
5. `npx --yes hyperframes@0.8.150 check`, snapshots of every scene, then render at 60 fps in the background.

## Workflow: building a theme from a reference video

Proven on `glass` (one reference). Follow every step; the user checks the preview, not the spec.

1. **Get the file.** References live in `references/inbox/` (repo must stay private; nothing from
   `references/` ships inside a theme). `ffprobe` it: size, fps, duration.
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
4. **Pick fonts by rendering, not by name.** Render the reference crop next to 5–6 free Hebrew candidates
   (Playwright screenshot) and choose by eye. Only OFL fonts ship.
5. **Write the theme:** `README.md` (the editing prompt — character first, rules second), `language.md` (the
   9-section grammar above — the part that makes it work on new scripts), `theme.md` (numbers + contract
   mapping, mark anything not seen in the reference as *(assumption)*), `tokens.css`, `theme.css` (generic
   blocks first), `motion.js` (generic verbs first), `sfx/` (synthesize; never ship other people's sounds or
   logos — draw generic icons).
6. **Preview project** `videos/theme-<name>-preview/`: the user's own footage + VO + word timings, a storyboard that
   shows every component once, SFX on every event. `lint` → `snapshot` contact sheet → fix framing → render
   60 fps in the background. Show the user the preview next to reference frames.
7. Iterate with the user on the preview. Only then extract more themes the same way.
8. With 3+ references of the same style: only what repeats in at least 3 becomes a rule.

## Hard-won rules (apply to every theme)

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
