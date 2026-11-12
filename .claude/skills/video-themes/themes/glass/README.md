# Glass: spatial-UI talking-head reel

> Read order: **this file** (the editing prompt: who the look is for, what it feels like, how an editor who
> owns this style thinks) → **`language.md`** (the design grammar: how to build *any* new element in this style —
> materials, anatomy, scales, color meaning, motion verbs, sentence→element recipe) → `theme.md` (the numbers
> measured on the reference). `tokens.css` / `theme.css` / `motion.js` are the ready parts.
>
> The elements listed below are the ones the reference happened to show. They are examples, not the limit:
> anything the script needs is designed from `language.md`.
>
> **v2** — anchor creator, 3 videos (20957, 73421, 30868). What changed from v1 is listed in `theme.md`.

## The idea in one sentence
A person talks to camera in a real room, and their computer floats in the air next to them: a frosted-glass
desktop with real-looking app windows that react to what they say, as if Apple Vision Pro were editing the video.

## Who it is for
Tutorials and "how I did it" reels about tech, AI, apps and productivity. One presenter, one continuous take,
9:16. It sells **calm competence**: clean, premium, quietly impressive. It is not a hype or meme style.

## Editing character
- **Restraint.** One take or a few real locations joined by clean hard cuts (≈ every 10 s), no jump-cut montage,
  no flashing, no shaking, no colored backgrounds. The room stays
  real all the time; everything added is glass, white text, or a dark app window.
- **The glass is a place, not a sticker.** The glass desktop is anchored in the room (world space): it sits beside
  the speaker, it scales and moves with every zoom, and the room shows through it, blurred. Text (hook, captions,
  CTA) is the only thing in screen space.
- **Show, don't decorate.** Every window shows exactly what the voice is saying *right now*: "install it" means a
  terminal with green checks, "it learns your style" means a chat with your thumbnails, "you save thousands" means
  a big green number counting up. If there is nothing to show, show nothing: the empty glass and the face are enough.
- **Steps are explicit.** A tutorial is always numbered: a small dark pill "שלב N" in the corner of the glass.
  It ticks up with a little pulse when the voice says "שני" / "שלישי".
- **Rhythm comes from the camera.** A quick punch zoom (0.15 s) or a cut every 3–5 s, alternating wide and tight,
  plus a slow continuous drift so no frame is frozen. A zoom lands on the first word of a new idea. Hand-held POV
  footage already moves: punch less.

## Text
- **Hook (first ~2.5 s):** two tiers at the top. A small lead line ("איך נותנים ל-GPT") over a big punchline
  ("לערוך לכם סרטון?") that spans ~90% of the width. Warm off-white, heavy, soft shadow. It is cut by the first
  zoom, then captions start. Write hooks as a question or a promise in 2 + 3 words.
- **Captions:** 1 to 3 words, white, the heaviest weight, soft dark shadow, centered at 75% of the height.
  They swap hard on the word timing with no animation; the words are the rhythm. Never more than one line.
- **Brand words stay in their language** ("GPT", "Claude") inside Hebrew lines.

## Elements seen in the reference (examples — new ones come from `language.md` §7)
| Beat in the script | Element |
|---|---|
| "install / set up / download" | Terminal window, lines appear one by one, green check per line, a "חינם" badge |
| "it learns / I tell it" | Chat window: thumbnails, the user's prompt, the assistant's reply, option chips |
| "drag / open / find" | Finder-like window, an app icon moving into a folder, the cursor doing it |
| "you save / costs / numbers" | Dark-glass stat card above the head: big green counter, red strike lines over old costs |
| "what you will learn / the steps" | Checklist window (orange header), circles filling blue one by one with clicks |
| "look below / comment" | Light glass pill with a thin arrow pointing down, in the lower third; or the two-tier title at the top ("תגיבו / עריכה") |
| "this video / the edit" (v2) | Glass **timeline strip** of the video itself: ruler, thumbnails, waveform, blue playhead; things added drop onto it |
| a real object in the room (v2) | Dark glass **tag** attached to it ("מנהל עריכה" over the laptop), a spec card with green badges under it |
| "dozens of lessons / chapters" (v2) | A grid of small dark tiles ("פרק 1…20") multiplying in the window behind the desk |
| "allow it / approve" (v2) | A light-glass **system dialog**, the cursor clicks the blue button and it turns green |
| an example video (v2) | A **picture-in-picture** glass bezel with the clip inside, above the speaker |

The cursor is part of the world: it moves with eased paths and clicks (a small squash) on the thing that changes.

## Sound
Voice first. No music bed in the reference; if you add one, keep it barely audible (bed ≈0.15–0.2, carve 0.3).
UI sounds are soft and short, never louder than the voice: a low swoosh on each punch zoom, a pop when a window
opens, a tick per terminal check, a ding on success numbers, a trackpad click on each cursor click.
The set in `sfx/` is synthesized (free to redistribute).

## Never
- Real brand logos or app icons of other companies (Apple, OpenAI, CapCut…). Use the generic icon set in
  `motion.js` (`GLASS.ICONS`) or the user's own logo.
- SF Pro or any Apple font. The theme ships Rubik (OFL) + JetBrains Mono (OFL).
- Saturated full-screen color, emoji stickers, shaking camera, glitch, bouncy cartoon motion.
- More than one glass panel on screen at once (the stat card replaces the desktop, it does not join it).
- Text inside the glass bigger than the captions: the glass is supporting detail, the voice and captions lead.

## Footage needs
A medium shot with free space on one side of the speaker (desk, room, shelves) so the glass has somewhere to live.
A tight selfie close-up works only with the glass above the head and on the chest under the captions (see the shooting guide), never overlapping the face.

## How to shoot for this theme
- **Shot:** medium-wide, waist up, the speaker on one side (≈60% of the width), the other ~40% free: that is where
  the glass lives. A desk or table in the lower third helps (the glass "stands" on it). Standing shots with the
  room behind and first-person shots of your desk/laptop (for tags on real objects) work too (73421, 30868).
- **Several locations are welcome:** 3–5 short takes in different corners of the same space, same outfit, cut every
  ~10 s, give the edit its cuts. Keep the head at the same height in all of them (the caption line stays fixed).
- **Tight selfie:** possible (the preview is one), but then the glass can only live above the head and on the chest
  under the captions; wear something dark and plain on top so the chest reads as a backdrop.
- **Background:** a real, deep room with mid-tone, warm or wooden surfaces and some depth (shelves, lamps). The
  glass needs texture behind it to blur. A plain white wall makes the glass vanish (use `.bg-bright` if you must).
- **Light:** soft, warm, even on the face; no hard backlight behind the free side.
- **Camera:** static on a tripod, 4K if possible (the edit punches in to 110–115%).
- **Avoid:** selfie close-ups (no room for the glass), busy moving backgrounds, standing in the middle.
