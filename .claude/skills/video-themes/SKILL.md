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

1. Claude writes a theme-agnostic storyboard (scene list) in the format in `contract.md`.
2. The theme decides how every component looks and moves (`themes/<name>/`).
3. Proof it works: the same storyboard rendered in 3 themes.

Built on HyperFrames: one paused GSAP timeline at `window.__timelines["main"]`, seek-safe tweens
(`tl.set(from, 0)` + `fromTo(..., {immediateRender:false})`). Read `/hyperframes-core` first.

## Themes

| Theme | Status | Source | Format |
|---|---|---|---|
| `notebook` | draft (`theme.md`) — needs reference measurements | creator tutorial reel (4 steps, Claude Code) | 9:16 |
| `apple` | stub — waiting for the reference creator's videos | Liquid Glass / Apple design language | 9:16 |
| `neon` | `theme.md` + `tokens.css` extracted | `videos/yellow-spec/index.html` | 16:9 / 9:16 |

Default when the user names none: ask once, then remember the answer in the project's `meta.json`
(`"theme": "<name>"`).

## Theme folder layout

```
themes/<name>/
  theme.md         rules in words: palette, type, layouts, caption rules, pacing, do / don't
  tokens.css       CSS custom properties only (colors, fonts, radii, shadows, sizes)
  components.html  every contract component, ready to copy            (milestone 2)
  motion.js        window.THEME = { enter, exit, transition, ... } — fixed seek-safe GSAP functions (milestone 2)
  sfx/             click, whoosh, pop, music bed                       (milestone 2)
  preview.mp4      short demo of every component                       (milestone 2, kept out of git if > 20 MB)
```

## Workflow: building a video in a theme

1. Read `contract.md` (components + scene format) and `themes/<name>/theme.md`.
2. Write the storyboard as a scene list. No colors, fonts or pixel values in it — only components and text.
3. Build `index.html` from `components.html` + `tokens.css` + `motion.js`. Never invent a component
   the theme does not define; if one is missing, add it to the theme first (so the next video gets it).
4. Check the theme's rules (`theme.md` → Rules) against the storyboard: caption words, max time on one
   layout, forbidden moves.
5. `npx --yes hyperframes@0.8.150 check`, snapshots of every scene, then render at 60 fps in the background.

## Workflow: building a theme from reference videos

1. Put the videos in `references/<creator>/`. Copyrighted content: the repo must stay private and nothing from `references/` ships inside a theme.
2. Run `python3 .claude/skills/video-themes/scripts/analyze_refs.py references/<creator>` — per video it
   writes a 1 fps contact sheet (10×2 tiles per image), scene-cut times, cut frequency, a pixel-sampled
   palette and basic metadata into `references/<creator>/_analysis/`, plus a `summary.json` across videos.
3. Transcribe with word timings (ElevenLabs scribe via a public URL: Higgsfield `media_upload` → PUT →
   `media_confirm` → ElevenLabs `creative_attach_reference_file` → `creative_transcribe_audio`) to get
   words per caption and caption timing.
4. Measure, don't guess: font size as % of frame height, caption position, entrance / transition
   durations frame by frame (`ffmpeg -vf "select=between(t\,A\,B)" -vsync 0 f_%03d.png`).
5. Fill the summary table in `theme.md`. **Only what repeats in at least 3 videos becomes a rule.**
6. User approval of `theme.md` before writing `components.html` / `motion.js`.

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
