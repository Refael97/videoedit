# elal-spec: spec ad for the EL AL app

- **Format:** 16:9, 1920×1080, 60fps, like Yellow. About 20 s including the opener and the credit.
- **Skill:** `app-spec-ad`, with **light-background changes** (see "Light look" below).
- **Voice:** Itamar (eleven_v4) + deepening chain, as in Yellow and Bit.
- **Ending:** the EL AL logo, the motto "הכי בבית בעולם", then "created by Refael Levi".
- **Spec ad:** the post states that this is the user's own work, not an official El Al ad.

## Central idea
**"All the flight in one place."** The line is a **flight path**, and a small plane flies along its head. It wraps the screens in **airplane windows** (an oval, El Al's design language).

## Narration (user-approved draft, about 15 s)
> מתכננים חופשה?
> לא משנה לאן.
> מזמינים כרטיס, ונכנסים למצב נסיעה.
> לא דואגים לכלום, כי הכל במקום אחד.
> תרגישו בנוח. תרגישו בבית.
> אל על. הכי בבית בעולם.

⚠️ The user wrote "מצב טיסה". The app's own name for the feature is **"מצב נסיעה"** (not to be confused with the phone's airplane mode). The narration should use the app's name. Confirm with the user.

## Beats (one panel per sentence)
Sources: rec1/rec2/rec3 are the three screen recordings. The seconds are approximate, taken from 1 fps contact sheets.

| # | Sentence | On screen | Pops out / framed | Source |
|---|---|---|---|---|
| 0 | (opener, 1 s) | The app's real launch animation: the tail with the Magen David drawn in a thin navy line inside a window, then "EL AL" | – | rec2 ~6–10 s, rec1 ~4–7 s |
| 1 | מתכננים חופשה? | Large hook on the light studio; the line enters low | – | – |
| 2 | לא משנה לאן. | The line splits into 5–6 window-shaped "portholes": Tokyo, Bangkok, New York, Barcelona, Paris | Each window pops on a ray | rec2 ~54–63 s (destinations carousel) |
| 3 | מזמינים כרטיס, | Phone with the booking screen TLV ↔ NYC | The "חיפוש טיסה" button is framed and tapped | rec2 ~67–69 s |
| 4 | ונכנסים למצב נסיעה. | Phone: "ברוכים הבאים למצב נסיעה", plane in a window over the clouds; countdown "הטיסה שלי" | The counter digits roll | rec3 ~45–48 s; countdown rec2 ~0–1 s / ~70 s |
| 5 | לא דואגים לכלום, כי הכל במקום אחד. | 4 quick pops from the trip-status screen: boarding pass with QR, check-in counters D90–95, gate E4, baggage belt 6 | Each one framed by a window or pill | rec3 ~74–87 s |
| 6 | תרגישו בנוח. תרגישו בבית. | Pull-back: all the windows together; the plane flies into the lens (like the plane in Yellow) | – | rec2 trip-status hero plane |
| 7 | אל על. הכי בבית בעולם. | A navy bloom from the plane, then the EL AL logo and the motto, then the credit | – | rec1/rec2 launch animation |

**Not used:** App Store, notification and cookie prompts, loading screens, "ה-iPhone בשימוש", the home screen, and the woman from the campaign banner (a model; use planes and destinations instead).

## Facts (every claim needs a source screen)
| Claim | Source | OK? |
|---|---|---|
| Destinations shown (Tokyo, Bangkok, NY, Barcelona, Vienna, Milan, Paris) | rec2 "המלצות יעדים" | ✅ |
| Booking a flight in the app | rec2 "הזמנת טיסה" | ✅ |
| "מצב נסיעה" feature + onboarding | rec1 "מצב נסיעה יופעל כ-48 שעות לפני הטיסה", rec3 onboarding | ✅ (activates 48 h before the flight; don't imply it is always on) |
| Boarding pass, check-in counters, gate, baggage belt in one place | rec3 onboarding cards | ✅ (demo data "Mr. Israel Israeli") |
| "הכי בבית בעולם" | El Al's motto (user) | ✅ user-provided |

## Privacy (must replace before any frame is built)
The recordings contain real personal data. Erase each item with the sampled background colour and redraw dummy data in the same font. **Do not blur.**

| Data | Value | Replace with |
|---|---|---|
| Booking number | ZO8W9Q | a dummy code, e.g. ELA123 |
| Passenger name | MR TIRAN ELAZAR LEVI, "LEVI" typed in the form | MR ISRAEL ISRAELI |
| Flight | LY5454, TLV → RAK, 14 Dec 2026, 12:45 / 20:20 | Use the demo flight LY020 TLV → JFK from the onboarding, or a dummy |
| Seat / bag | 13F, 1×23kg | dummy, or omit |

The onboarding cards ("Mr. Israel Israeli", LY020, 36H) are El Al's own demo data, so they are fine.

## Light look (changes from the skill's dark default)
- **Backdrop:**
  - a light studio, `#f3f4f7` → `#e9ebf0`, with a soft radial lift at the centre;
  - fine grain at 0.03;
  - a very light vignette (0.08), not 0.55.
- **Accent:** El Al navy only. Sample it from the screenshots (about `#1b2a8c`). Everything else is white or grey. **No glowing neon** (CLAUDE.md).
- **The line:**
  - a crisp navy tube about 4 px wide, plus a faint navy shadow (blur 6, opacity 0.18);
  - no white core and no bloom;
  - like the line drawing in the app's launch animation.
- **The head of the line:** a small navy plane silhouette that rides the path and rotates to its tangent. It replaces the glowing spark.
- **Framing:**
  - the phone loop and the selection frames are **airplane windows**: a rounded "stadium" with radius = half the width, like the app's windows;
  - pills stay as pills.
- **Cards and the phone:** white, with soft studio shadows (`0 30px 60px rgba(20,30,80,.14)`), not black drop-shadows.
- **Headlines:**
  - navy/ink on light;
  - one emphasised word in navy;
  - the font is compared on the real text first: Heebo Black vs Noto Sans Hebrew vs Rubik (CLAUDE.md: Rubik is too round for aggressive styles; El Al is calm, so this needs testing).
- **Sound:** airy whooshes; a soft cabin "ding" on the landing beats as a signature; music calm-premium rather than hype.

## Inputs still needed (on the Mac, full resolution)
1. The three original recordings (`~/Desktop/elal-sheets/*.mov`) → `assets/raw/` (gitignored).
2. Full-resolution screenshots of the chosen screens: destinations, booking search, the onboarding cards, the countdown.
3. The El Al logo (PNG/SVG, transparent) and, optionally, a transparent PNG of a plane.
