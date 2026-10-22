---
name: pastel-motion-ad
description: >
  Build a clean "pastel AI-ad" motion-graphics reel in HyperFrames — the soft, premium look of
  Claude-made ads: pastel aurora backgrounds, words that resolve out of a blur one by one, ONE accent
  word per line (green gradient, serif italic or a highlight box), a rolling "no camera / no timeline"
  list, cards that swing in, a prompt file with a green selection box and cursor, a circular portal
  into a sky scene with a floating laptop, a dark scene with a glowing green horizon, a dot-matrix
  number, a pixel-art mascot and a profile + green "Comment X" CTA. Use when the user asks for motion
  graphics "like this video" / "in this style", a faceless promo or CTA reel in this look, or names
  the skill. Hebrew-first (RTL). 16:9 desktop (1920x1080) or 9:16 reel — ask/derive from the reference.
---

# pastel-motion-ad

A ready kit (CSS components + GSAP helpers) and a starter composition that reproduce the reference
ad's language. You write the script and pick scenes; the kit supplies the look and the motion so
every video lands at the same finish.

## 1. Start a project

```bash
bash .claude/skills/pastel-motion-ad/scripts/new.sh <project-name>    # from the repo root
```

Creates `videos/<project-name>/` with `assets/kit/` (kit.css, kit.js, fonts, GSAP, sky/sunset
plates), a working 28 s starter `index.html` (8 scenes, Hebrew), music + SFX and the HyperFrames
project files. Render the starter once if you want to see the baseline: `npx --yes hyperframes@0.8.150 render -o renders/x.mp4 --fps 30`.

Then edit `index.html`: keep the scenes you need, rewrite the copy, retime. Read
`/hyperframes-core` rules if unsure about clips/timelines; the starter already follows them.

**Full worked example (16:9, narrated, 55 s, 17 scenes): `videos/pastel-ad-he/`** — a Hebrew remake of
the reference ad. Copy its structure for any narrated piece: `tools/make_vo.py` lays the take onto a
sentence grid, `build.py` injects word times (`WD[i]`) and sentence starts (`SG.name`) into
`src/template.html`, and every visual lands on its spoken word via `sayAt(sel, [w(i), ...])`.

### Matching a reference video
1. Transcribe the reference narration (ElevenLabs scribe) → list its sentences with start times.
2. Contact-sheet it densely (`fps=1.5–6`) and write a beat list: what is on screen per sentence.
3. Same length as the reference — never drop beats. Match its format (16:9 if it is a desktop video).
4. Generate the narration in the user's voice, transcribe it, then place each Hebrew sentence at the
   reference sentence time (`max(ref_start, prev_end + 0.22)`).

### 16:9
`<div class="mg-root" data-format="landscape">` + `html, body { width: 1920px; height: 1080px }`. The
aurora blobs and horizon re-position themselves; scale type down (`.t-xl` ≈ 150px, `.t-lg` ≈ 100px).

## 2. Style DNA — do not drift from this

| Element | Rule |
|---|---|
| Background | Pastel aurora (`.bg-aurora` with 4 `.blob`s, `MG.drift` keeps it alive). Break the rhythm only with: a hero photo (`.bg-photo`), the sky (`.bg-sky` + `img/sky.jpg`), the dark horizon (`.bg-dark` + `.horizon`), or mint (`.bg-mint`) for the "want it?" beat. |
| Type | Assistant (default) or Rubik — `data-font="rubik"` on `.mg-root`. Ploni is commercial: drop its woff2 files into `kit/fonts/` and add @font-face rules to use it. Small lead-in line (`.t-sm`, muted) above a big line (`.t-lg` / `.t-xl`). Never more than ~6 words on screen. |
| Accent | Exactly ONE accent per line: `.acc-green` (gradient text), `.acc-serif` (italic serif in rust — for brand words like *Claude.*), `.acc-red` (pain words), or `.hl` highlight box (`<span class="hl"><span class="box"></span>word</span>`). |
| Motion | Words resolve from blur (`MG.blurIn`), hero words land big (`MG.hero`), UI rises (`MG.rise`), cards swing (`MG.flipIn`). Easing is expo/power3 out — fast in, long soft settle (0.6–1.0 s). Nothing bounces except the pixel mascot and the CTA pulse. |
| Smoothness | Every scene carries a slow camera push (`MG.push`, 1 → 1.03–1.045 over the scene) and drifting blobs, so no frame is static. Elements never pop: entrances start hidden (`MG.hide`, built into every entrance helper). Render at **60 fps** (`--fps 60`). |
| Transitions | Blur dissolve between aurora scenes (`MG.dissolve`); a circular portal + glow ring into a new world (`MG.portal`). No hard cuts on aurora scenes. |
| Pace | A new beat every 1.2–2 s. Each scene 3–4.5 s. Whole reel 25–60 s. |
| Color | Ink #1c1c22, muted #a3a1ad, green #1fc24a→#39e07a, rust #c8553d, red #e5483b. White cards with big soft shadows. |
| Sound | Light music bed (0.4–0.5), a whoosh on each scene change, pop on UI hits, riser into the portal, impact on the dark scene. |

## 3. Scene library (all in the starter)

| Scene | Markup | Motion |
|---|---|---|
| Hook over photo | `.bg-photo` + `.t-md` lead + `.t-xl` hero (white) | slow push-in on photo, `blurIn` lead, `hero` |
| Question | aurora + `.t-sm.t-muted` + `.t-xl.acc-green` | `blurIn`, `hero`, `blurOut` |
| Rolling list | `.roll > .row` (each with `.arrow` "←") | `MG.roll(tl, "#roll", t, step)` — 5 rows ≈ 3.1 s |
| Prompt file | `.frame-cloud` > `.card.file` + `.select` + `svg.cursor` | `rise` frame, `flipIn` card, `select`, `cursor` with click |
| Portal → sky | next scene with `.bg-sky`, ring div | `MG.portal(tl, "#s5", t, {x, y, ring})` |
| Floating laptop | `.laptop > .lid > .screen` (put any image/UI inside) + `.pill` labels | `float`, `rise` labels |
| Dark horizon | `.bg-dark` + `.horizon` + white type + `.hl` | horizon slides up, `blurIn`, `highlight` |
| Number moment | `.dots` built by `MG.dots(el, "50", 40)` + `.pixels` sprite | `dotsIn`, `rise` + `hop` the mascot |
| Profile CTA | `.avatar` + handle + `.cta` pill + muted fine print | `rise`, `type` handle, CTA pulse |

Extra components in kit.css for new scenes: `.app` (chat window "What should we build?" with input
and chips), `.profile` card (avatar, name, bio, green follow button), `.bubble` (DM bubbles),
`.pill.light`, `.bg-sunset`, `.bg-mint`. Bad-vs-good comparisons: show 4–6 small `.card`
screenshots tilted in a collage with a red `.acc-red` headline, then dissolve to the clean result.

## 4. Writing the script

The reference ad is a sequence of one-line beats, not paragraphs:

1. Hook question over a beautiful visual ("מה אם הייתם יכולים ליצור / מודעות כאלה").
2. Twist with the green hero word ("בלי לגעת אפילו / בעורך וידאו?").
3. Rolling list of what you don't need.
4. The method in two lines ("רק *Claude.* / ו**פרומפט** אחד.") + the prompt file on screen.
5. Proof: portal into the sky, laptop showing the result, pill captions narrating ("פתחתי", "וזה מה שהוא בנה לי").
6. Emotional beat on dark ("אני יודע. / גם אני לא [האמנתי]").
7. Scarcity: dot-matrix number + mascot ("רק ל-50 / הראשונים שמגיבים").
8. CTA: avatar, handle, green pill `תגיבו "מילה"`, fine print.

Keep the CTA word the user chose. Default handle/name come from the user (here: Refael Levi,
"מומחה AI ושיווק דיגיטלי").

## 5. Helper API (kit.js → `window.MG`)

All helpers take the root timeline and an absolute time, use `fromTo` + `immediateRender:false`,
and are seek-safe. Build DOM-generating parts (`MG.dots`, `MG.pixels`) before the tweens that use them.

- `MG.blurIn(tl, sel, t, {stagger, dur, y})` / `MG.blurOut(tl, sel, t)`
- `MG.hero(tl, sel, t, {from})` — big word lands
- `MG.highlight(tl, ".hl", t)`
- `MG.roll(tl, ".roll", t, step)`
- `MG.flipIn(tl, sel, t)` / `MG.rise(tl, sel, t, {y, scale, stagger})` / `MG.float(tl, sel, t, dur)`
- `MG.dissolve(tl, outSel, inSel, t, d)` / `MG.portal(tl, sceneSel, t, {x, y, dur, ring})`
- `MG.drift(tl, "#scene", t, dur)` — aurora blobs drift
- `MG.push(tl, "#scene", t, dur, from, to)` — continuous camera push
- `MG.hide(tl, sel)` — park elements invisible until their cue (call for any hand-written `fromTo`)
- `MG.type(tl, sel, t, dur)` / `MG.select(tl, sel, t)` / `MG.cursor(tl, sel, [[x,y,t],...], {click})`
- `MG.count(tl, sel, from, to, t, dur)` / `MG.dots(el, "50", pitch)` + `MG.dotsIn(tl, el, t)`
- `MG.pixels(el, MG.SPRITES.cactus, MG.SPRITES.cactusPalette, px)` + `MG.hop(tl, sel, t, dur)` — draw your own sprite with a string map.

## 6. Gotchas (learned building the kit)

- Gradient-text words (`.acc-green`) must stay one box: `MG.split` already treats `.acc-*`, `.hl`
  and `[data-word]` spans as single words — don't split them yourself.
- RTL: write lines in logical order; neutral punctuation at line ends is fine. The arrow in rolling
  lists is "←" for Hebrew.
- Overlap scenes by ~0.4 s (`data-start` of the next scene before the previous ends) so dissolves
  have both layers.
- Use the plates in `assets/kit/img/` or generate new ones (Higgsfield `gpt_image_2_5`, 9:16, "no
  text"). Real screenshots/photos of the user's product go inside `.laptop .screen` or `.card`.
- After edits: `npx --yes hyperframes@0.8.150 lint`, then `snapshot --at …` across every scene and
  look at the contact sheet before rendering. Compress share copies under 30 MB
  (`-b:v 3500k`, `loudnorm=I=-14`).
- A hand-written `fromTo(..., immediateRender:false)` leaves the element visible until its start —
  always `MG.hide` it first, or it flashes on screen early.
- Animate transforms only (x/y/scale) — `left/top/width/fontSize` tweens snap to pixels and fail lint.
  To "grow a card to full screen", build it full size and scale it down with `transform-origin: 0 0`.
