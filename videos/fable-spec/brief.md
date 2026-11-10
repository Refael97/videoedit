# fable-spec: launch film for Claude Fable 5.2 (v2, story)

- **Format:** 9:16 story, 1080×1920, 60fps, 23.2 s. Type and grid stay inside the story safe area (top 250 px, bottom 300 px free).
- **Look (v2, after the user's notes "story format, light, premium, clean"):** one pale studio in Three.js. Black lacquer, white ceramic and chrome objects, ONE clay accent. Softbox reflections come from an env map given only to the glossy materials; the floor is lit by a key light with a soft VSM shadow.
- **Structure:** six stations in one 3D space, alternating left and right of a clay line that slaloms into the depth of the studio. The camera moves between them with expo.inOut and ends on a pull-back that reveals the whole route, then a paper end card.
- **Type:** Heebo Black headlines (DOM overlay, each word on its spoken time), JetBrains Mono eyebrows and counters, hairline + corner brackets.
- **Files:** `index.html` (overlay, audio, type timeline), `js/film.js` (the 3D film as a pure function of time), `shots.cjs` (stills for the verify loop). The dark 16:9 first pass is kept in `reference/dark-v1.html`.
- **Voice:** Itamar (`l7Q9rbdCC6j3J5dNlOOg`, eleven_v4), take A + deepening chain. Word times in `data/words.json`. The narration starts at 0.8 s.
- **Music:** the El Al track (122 BPM), cut to length with a fade. A placeholder until the user picks one.
- **Spec ad:** the user's own work, not an official Anthropic ad. The mark is modelled in code (not the official logo file) and the Claude window is drawn in code (no screen recordings were supplied).

## Narration (take A, 19.3 s)
> חיכיתם למודל הבא? הוא כאן.
> Fable 5.2. המודל הכי חזק של Claude שפתוח לכולם.
> הוא כותב קוד ברמה חדשה, מנהל יותר מאלף סוכנים במקביל, ועובד על משימה אחת ימים שלמים.
> מהיר עד שלושים אחוז, ובמחיר נמוך יותר.
> בקיצור, העתיד כבר כאן. Fable 5.2.

## Facts (source: anthropic.com/claude/fable and the launch post "Introducing Claude Fable 5.2 and Claude Mythos 5.2", 9 Nov 2026)
| Claim | Source wording | OK? |
|---|---|---|
| Launched 09.11.2026 | news card dated Nov 9, 2026 | ✅ |
| "הכי חזק ... שפתוח לכולם" | "our most capable generally available model for technical fields"; safeguards allow it to be "available to all users" | ✅ (generally available; Mythos 5.2 is the restricted twin) |
| Plans: Pro, Max, Ultra, Team, Enterprise | Fable page availability line | ✅ |
| Family: Opus 5.5, Sonnet 5.5, Haiku 5.5 | named on both pages | ✅ |
| "כותב קוד ברמה חדשה" / FrontierCode 2.0 49.1% | "sets a new bar in coding"; 49.1% confirmed in the post text | ✅ |
| "יותר מאלף סוכנים במקביל" | "coordinate hundreds or even more than a thousand subagents" | ✅ |
| "ימים שלמים" | "run ambiguous engineering work for days" (one experiment ran eight days) | ✅ |
| "מהיר עד 30%" | "up to 30% faster than Claude Fable 5.1" | ✅ keep "עד" |
| "במחיר נמוך יותר" | $8 / $40 per million tokens, down from $10 / $50 | ✅ |

## Stations (times on the narration clock)
| # | Sentence | Object | What moves |
|---|---|---|---|
| 0 | חיכיתם למודל הבא? הוא כאן. | the clay mark | drops and settles; pulses on "הוא כאן"; the line starts from it |
| 1 | Fable 5.2. המודל הכי חזק של Claude שפתוח לכולם. | lacquer slab with the model list | turns to the lens; the Fable 5.2 row lifts off the screen; the selection lands |
| 2 | הוא כותב קוד ברמה חדשה, | three bars, to scale from zero: GPT-6 Astra 42.8, Opus 5.5 45.5, Fable 5.2 49.1 (FrontierCode 2.0) | bars grow, values ride their tops |
| 3 | מנהל יותר מאלף סוכנים במקביל, | one clay sphere and 1,000 lacquer spheres in a sunflower disc | spheres pop outward in a wave; the headline counts to 1,000 |
| 4 | ועובד על משימה אחת ימים שלמים. | eight slabs numbered 01–08 | a slab rises per day while the key light swings like a sun |
| 5 | מהיר עד שלושים אחוז, ובמחיר נמוך יותר. | two beads on two tracks; ten chrome coins | 5.2 runs 30% further in the same time; ten coins become eight |
| 6 | בקיצור, העתיד כבר כאן. Fable 5.2. | the whole route | pull-back reveal, then the paper end card and the credit |
