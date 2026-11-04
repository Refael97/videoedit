---
name: app-spec-ad
description: >
  Build a "spec ad" for an app in the Duolingo / Yellow / Bit style: a dark studio backdrop with a
  single brand-colour glow, ONE continuous neon line (halo + tube + white core, with a travelling
  spark) that links every scene, a "world strip" of panels the camera pans across, real app screens
  inside a 3D CSS phone with a neon loop, features cut out of the screen and popped out with neon
  selection frames, kinetic Hebrew headlines that resolve from blur on the narrator's words, and a
  logo opener + brand-colour bloom + "created by Refael Levi" ending. Use when the user asks for a
  promo / spec ad / פרסומת for an app or brand "like Yellow", "like Bit", "like the Duolingo video",
  "ספק אד", "סרטון לאפליקציה", or names the skill. Hebrew-first (RTL), 16:9 1920x1080 60fps by
  default, narrated in Hebrew. Built in HyperFrames with GSAP.
---

# app-spec-ad

Four projects proved this format:
- **The Duolingo reference** (`reference/duolingo-ref-sheet.jpg`).
- **Yellow** (`videos/yellow-spec/`, about 21 s, yellow on black). It brought 500 followers.
- **Bit** (`videos/bit-spec/`, about 26 s, turquoise on graphite).
- **El Al** (`videos/elal-spec/`, about 21 s, navy on a light cloud sky). The light variant; see §2b.

Bit is the most complete and most corrected build. **Start from it, not from scratch.**

Read these before building:
- `reference/recipes.md`: how to build every element, with exact numbers.
- `reference/lessons.md`: every correction the user gave on Yellow and Bit. They are hard rules.
- `CLAUDE.md` at the repo root: the user's standing rules (Hebrew, voice, quality bar).

## 0. What the format is (anatomy of the Duolingo reference)

1. **Logo opener:** the app icon/logo on the dark backdrop with a soft glow.
2. **The neon line starts:**
   - It draws itself across the frame, and a spark rides its head.
   - From here on, **one line connects everything**. It feels like one continuous shot with no cuts.
3. **Phone with real screens:**
   - The line closes a loop around a 3D phone.
   - The screen shows the real app UI.
4. **Feature beats, one per sentence.** Each beat:
   - pops a real element out of the screen (a button, a card, a number);
   - frames it in neon;
   - taps it and lands it with a sound.
   - Duolingo: lesson, streak 6→365, Diamond League, video call.
5. **Branching beat:** the line splits into rays to several items (Duolingo: Languages, Math, Music, Chess).
6. **Payoff line,** kinetic type: "One path. Every skill."
7. **Logo resolve,** then a small credit.

The packaging layer in the reference (filming the ad on a desk monitor with "Claude cooked 😮‍💨🔥 / prompt below ⬇️") is optional. The user films it himself if he wants it.

## 1. Inputs to collect before building (ask only for what is missing)

| Input | Why |
|---|---|
| App name and **brand colour(s)** | One accent colour for the line, the glow, the emphasised words and the end bloom. Dark backdrop: black for Yellow, graphite `#15191b` for Bit. |
| **Screen recordings + screenshots** of the real app (home, the 3–6 features, payment/confirm, logo/launch animation) | Everything on screen must be real UI. No invented features. |
| Logo / app icon (PNG, transparent if possible) | Opener and end. |
| Optional transparent PNGs of brand objects (e.g. the El Al plane) | For one hero moment. |
| Script idea or feature list | Becomes about 15–20 s of narration, one short sentence per beat. |
| Format | Default 16:9 1920×1080 @60fps (both Yellow and Bit). 9:16 only if asked. |

Put them in `videos/<name>/assets/raw/` (gitignored). Then **list every fact the script claims, with its source screen**, and flag anything not backed by the assets (see lessons: facts).

## 2. Workflow

1. **Scaffold:** `bash .claude/skills/app-spec-ad/scripts/new.sh <name>` from the repo root. It creates `videos/<name>/` with the kit, the SFX, the HyperFrames files, and `reference/bit.html` + `reference/yellow.html` as working examples.
2. **Privacy pass first** (recipes §Privacy). Every name, profile photo, account/confirmation number, barcode, plate or address is **erased with the exact background colour and redrawn as dummy data in the same font**. Never blur. Originals stay in `assets/raw/` (gitignored).
3. **Crops** with `scripts/crop.py`: rounded-rect, circle and pill masks drawn at 4× and downsampled with LANCZOS, so the edges are smooth. The phone screens are scaled to 2× their display width so they stay sharp.
4. **Script → narration:**
   - one short sentence per beat, 15–20 s total;
   - ElevenLabs, formal deep male voice (Itamar on eleven_v4 was used for both);
   - deepening chain + loudnorm (recipes §Sound);
   - words that get mispronounced are written **with niqqud**, and only that sentence is re-recorded;
   - the opening line is a question or tension, the payoff is "בקיצור … זה <brand>." or a slogan.
5. **Transcribe the narration with word times** (ElevenLabs scribe) into `data/words.json`. Every headline word, pop, tap, camera pan and SFX is timed to a word.
6. **Storyboard as panels:** one panel per beat. Write the beat list (panel, sentence, element that pops, the line's path in and out) and show it to the user before building.
7. **Build `index.html` from `reference/bit.html`:**
   - keep the engine: world strip, camera, `piece()`, `frameLayers()`, `rectD`/`circD`/`LOOP`, `words()`, intro wrapper, bloom, credit, audio rules;
   - replace the panels, colours and copy.
8. **First beat at final quality** (opener + hook + first phone loop). Show 2–3 stills to the user and get approval, then build the rest.
9. **Verify loop before every render:** contact sheet at 4–6 fps over the whole film, then check the list in `reference/lessons.md`.
10. **Render:**
    - On the Mac (Metal GPU): `npx --yes hyperframes@0.8.150 render -o renders/<name>-16x9.mp4 --fps 60 --workers 1`.
    - In the cloud it is slow (CPU). Render there only if the user asks.
11. **Deliverables for the user's funnel:**
    - the video;
    - an Instagram caption;
    - ManyChat DMs for the comment word (template: `videos/instagram-dm.md`);
    - a making-of guide page with a ready prompt per element. The models are `videos/yellow-guide/` and `videos/bit-guide/`.

## 2b. Light variant (El Al, `videos/elal-spec/`)
Use it when the brand is calm or premium (an airline, a bank), or when the user asks for a light background.
- **Backdrop:** a cloud-sea photo with a white haze, parallax per pan (`#bgx`, `?bg=sky`). Background variants are behind `?bg=sky|navy|map|mesh`, and `render_bg.sh <variant>` renders one.
- **The line:** a crisp navy tube (4.2 px) with a faint halo and **no glow**. The head is a small plane that rotates to the tangent.
- **Framing:** none. Use `arrive()`: the element grows over a short dark-sky-blue halo.
- **Cards:** white, rebuilt in HTML in the app's own font.
- **Timing:** the narration is one clip, and the timeline is cut on its sentence ends (lessons, El Al §11).

## 3. Non-negotiables (from the user)

- **One neon line, curves only.** No right-angle corners. Every new piece starts in the direction the previous one ended. The spark fades where a piece stops, except the final one, which stays lit and the bloom opens from it.
- **Select by framing, not by pulling a new line.** Around a card, the line splits into two symmetric paths and rejoins on the far side.
- **Elements at a sensible size:** never huge, never pixelated. Neon never crosses text or covers other cards.
- **No dead seconds.** Something moves on every beat, and the line travels under the closing sentence.
- **Opener = the app icon; closer = slogan + brand bloom + the real logo animation + credit.** They are different from each other.
- **Gentle SFX:** a pop on a pop, a whoosh on a pan, an impact on landings. No harsh click on Apple Pay or on selection.
- **Music stays audible under the voice:** volume 0.34, carve strength 0.3. It is not ducked away.
- **Real UI only.** It is a spec ad: the post says it is the user's own work, not an official ad.
