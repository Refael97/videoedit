# Video Themes: a brief for the new session

> Written at the end of the previous session (branch `claude/kind-sagan-mqhm26`). The new session works on the same branch. Reply to the user in Hebrew only; see `CLAUDE.md`.

## The goal
The biggest gap between creators who edit with Claude is the **visual theme**. Today Claude invents fonts, transitions and elements from scratch on every video, so the results are inconsistent.

The goal is a **theme system**:
- The user picks a look once ("theme: notebook"), and from then on every video comes out in it. That covers fonts, colors, captions, cards, transitions, layouts and sound.
- Swapping themes is a one-word change.
- This is a real product. Rafael downloaded ~20 reference videos to build serious themes from, and the plan is to hand out one theme as a lead magnet and sell a bundle.

## The core idea: separate content from look
1. **A shared component contract.** Every theme exposes exactly the same components and layouts (list below), each in its own style.
2. **The storyboard does not depend on the theme.** Claude writes a scene list such as `split · step-label(2, "התקנת כלים") · prompt-card(...)`, and the theme decides how it looks.
3. **Proof that it works:** the same clip rendered in 3 themes, side by side. That is also a reel in its own right ("אותו סרטון, 3 ערכות נושא, מילה אחת").

## Component contract (initial proposal, refine from the references)
| Component | What it is |
|---|---|
| `layout.full-face` | Face fills the frame (talking head) |
| `layout.split` | Graphic in the top half, face in the bottom half (or the reverse) |
| `layout.full-graphic` | Graphic fills the frame, voice continues underneath |
| `caption` | Word-by-word captions (1–3 words), synced to a word-level transcript |
| `title` / `hook-title` | Fixed title at the top of the frame for the length of a section |
| `step-label` | "שלב 1. הכנה" |
| `prompt-card` | Prompt window with highlighting of the parts the user fills in |
| `app-window` | Generic app / browser window for screenshots and recordings |
| `icon-tile` | Icon with a label (folder, tool, logo) |
| `tree` | One item that branches into sub-items (folders, steps) |
| `recap-diagram` | Recap of all the steps around a center |
| `cta` | Comment word, profile, follow |
| `transition.*` | Between layouts, between scenes, element entrance/exit |
| `sfx.*` / `music` | Theme sound set: click, whoosh, pop, music bed |

A theme also defines **rules**, not just looks: how many words per caption, when to cut to split, maximum time on a single layout, and what is forbidden.

## Proposed structure
```
.claude/skills/video-themes/
  SKILL.md               ← router: how to pick a theme, the contract, the scene format, the review process
  themes/<name>/
    theme.md             ← the theme rules in words + do/don't
    tokens.css           ← colors, fonts, radii, shadows, sizes
    components.html      ← every contract component, ready to copy
    motion.js            ← entrances/exits/transitions as fixed GSAP functions (seek-safe)
    sfx/                 ← sound set
    preview.mp4          ← short demo of every component (for Claude and for the user)
```
The skill is built on top of HyperFrames (single paused GSAP timeline, `window.__timelines["main"]`). See `.claude/skills/hyperframes*` and `hyperframes-core`.

## First three themes
### 1. "Notebook" (from the creator whose video Rafael sent: a 4-step Claude Code tutorial, 9:16, 77s)
Sampled from the frames:
- **Background:** cream `#E0D7C5` (approx. `rgb(224,215,197)`), with a fine graph-paper grid in a slightly darker shade.
- **Accent:** red-orange around `#C9573A` (sampled average `rgb(192,100,69)` includes antialiasing, so the core is more saturated). Used for "Step 1." and for annotation labels.
- **Icons:** macOS-style folder in light blue `#6FCBF6`.
- **Layouts:** full face, split (cream graphic on top, face on the bottom), full graphic.
- **Captions:** 1–3 words, white and bold with a soft shadow, placed in the middle of the frame (at the seam in split layout).
- **Fixed title** at the top for the length of the intro ("Everything you need to…").
- **Step-label:** "Step 1." in orange plus the title in dark bold, at the top of the graphic area.
- **Elements:**
  - Folders that branch into subfolders with a thin line.
  - White prompt windows with the Claude logo and yellow highlighting on `[placeholders]`.
  - Line illustrations (laptop, camera) with orange pill tags ("Viewfinder", "Lens").
  - A recap diagram with dotted orange arrows around a folder.
- **CTA:** search bar / pill at the top with the comment word being typed ("MOTION").

### 2. "Apple" (the creator Rafael will send: Liquid Glass and Apple designs 1:1)
- Liquid glass in HTML: `backdrop-filter: blur()` plus specular highlights plus an SVG displacement filter for refraction. **Verify it renders well in HyperFrames render** before building on it.
- **Font: do not use SF Pro.** Its license restricts it to Apple UI design, and the theme is going to be distributed. Use a free similar font: Inter for English, Heebo/Assistant for Hebrew.
- Do not copy Apple logos or trademarks. Copy the visual language only.

### 3. "Neon" (from our Yellow ad): code already exists in `videos/yellow-spec/index.html`
- Black background with a yellow halo, a three-layer neon line (halo/tube/core), and a spark that fades at connection points.
- Neon selection frames around cards, Rubik 900, blur→sharp headlines, a "world strip" camera across panels, a yellow bloom.
- Also worth seeing: the existing `pastel-motion-ad` skill (in `.claude/skills/`). It is effectively a theme already, just without a shared contract.

## How to analyze the 20 reference videos
For each video:
1. **Frame sheet:** 1fps, tiled 10×2 per image, plus close-ups of key frames.
2. **Transcript** with word timings: ElevenLabs scribe needs a public URL, so go via a Higgsfield `media_upload` → curl PUT → `media_confirm` → ElevenLabs `creative_attach_reference_file` → `creative_transcribe_audio`.
3. **Measurements, not impressions:**
   - Palette from pixel sampling.
   - Layout cut frequency (`ffmpeg select=gt(scene,0.3)`).
   - Average words per caption and caption position.
   - Font sizes relative to the frame.
   - Transition and entrance durations (frame by frame).
4. **Summary table per creator → `theme.md`.** Only what repeats in at least 3 videos becomes a rule.
- Keep the reference videos out of git (copyrighted content): `references/` → `.gitignore`.

## Lessons learned in the previous session (do not repeat them)
- **Hebrew/RTL:**
  - Many fonts do not support Hebrew (Geist, Manrope, Poppins, SF). Check every font in Hebrew before choosing it.
  - Gradient and arrow directions flip in RTL.
  - Flex can swallow spaces in typed text, so use `white-space: pre`.
- **Narration:** default is Rafael's voice (see `CLAUDE.md`). A mispronounced word: add niqqud (e.g. מִבְצָעִים) and re-record only that sentence.
- **Music under the voice:**
  - Do not carve at strength 0.8, because the music disappears. Use strength ≈0.3 and a bed volume of ≈0.3.
  - Command: `node .claude/skills/hyperframes-audio/scripts/carve.mjs --comp index.html --bed music --voice vo --strength 0.3`.
- **Image quality:**
  - Crop from frames at native resolution.
  - Draw rounded/circular masks at 4× and downscale with LANCZOS.
  - Add a `.aa` class to every transformed element (`outline: 1px solid transparent; backface-visibility: hidden`).
  - Otherwise edges come out pixelated.
- **Lines and connectors:**
  - Curves only, no right-angle corners.
  - Each piece starts in the direction the previous one ended.
  - A spark that stops at a point fades out.
  - A card gets a frame, not another branching line.
- **Lint rules:**
  - No non-transform tweens (letterSpacing/width).
  - `<video>` must not be nested inside a timed wrapper.
  - `<audio>` needs an `id`.
- **Seek-safe pattern:** `tl.set(from, 0)` + `fromTo(..., {immediateRender:false})`.
- **Rendering:** `npx --yes hyperframes@0.8.150 render -o renders/x.mp4 --fps 60` takes ~15 minutes for 20s at 60fps, so run it in the background.
- **Privacy:** personal data in screenshots is erased with white and replaced with dummy data, not blurred. Public addresses do not need masking.
- **Commits:** commit and push at the end of every step (a stop hook enforces it).

## Suggested milestones
1. Analyze the references → a `theme.md` draft for "Notebook" and "Apple" → **user approval**.
2. Build the contract plus the "Notebook" theme, with a `preview.mp4` of every component → approval.
3. "Apple" theme (verify liquid glass in render) → "Neon" theme (extract from yellow-spec).
4. Proof video: the same clip of Rafael in 3 themes.
5. Lead magnet: a page explaining the themes, plus one free theme for the comment word.
