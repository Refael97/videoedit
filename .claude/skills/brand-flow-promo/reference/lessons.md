# Lessons from the Isrotel project (what the user said, what was wrong, what fixed it)

The user's words are quoted in Hebrew as written. "Mine" marks my reading of them.

## Round 1: a full 25 s film built from text descriptions of the references
- User: "זה יפה אבל עדיין לא ברמה גבוהה של גימור · שלחתי לך רפרנסים כדי שתלמד לא רק את הסגנון אלא את רמת הגימור"
- Cause: I had never seen the reference videos, only a text walkthrough and one thumbnail each. I also skipped
  the frame-by-frame comparison the project rules require.
- Fix: got the files (user pushed them on a temporary branch), tiled frames, listed measured gaps: no depth of
  field, no motion blur, elements too small, flat page layout, blob background that looked like a template,
  fades instead of morphs, a schematic map.
- Rule: never start from a description of a reference. See it.

## Round 2: one scene rebuilt at the reference's finish, then a video model
- User approved the finish test, then: "חייבים להתחיל את הסרטון בלוגו" and gave the structure: logo → a beautiful
  3D map → a card with the price comes out of the place → enter the place through the door → two more
  locations → ending.
- User asked for a video model so that a photo "becomes a real place". He believed it was free; it was not.
  I checked the price first and reported it. Later: "יש אישור להכל רק שיהיה ברמה גבוהה עם מוזיקת רקע יוקרתית
  וסאונד אפקט ברמה גבוהה".
- Rule: an approval covers what was priced. New kinds of spend get a quote first.

## Round 3: the full film (24 s) was "much better", but
- User: "מרגיש לי שהסרטון של אייר בי אנד בי ששלחתי לך יותר יפה · הוא עם תנועות מצלמה יותר טובות אלמנטים צפים
  ואפקטי תנועה חזקים · יותר מושן גרפיקס · יותר תמונות · יותר חי בצבעים · כל רגע קורה משהו · וגם נגמר בהזמנה של
  מקום · מבקש ממך תראה שוב תבין ותיישם"
- Cause: holds of 2–3 s on a card or a clip, white-and-navy only, few photos, no purchase at the end.
- Fix: re-watched the reference at 5 frames per second (`airbnb-breakdown.md`), cut the first half from 20 s
  to 16 s, added floating photos around the map, colour blobs, a carousel on full-screen brand blue, the detail
  space, the booking flow, and the logo out of the dot.
- Rule: count seconds between new elements. More than about 1.5 s with nothing new is a hole.

## Small things that cost a render each (check them in stills)
- A title or chip cut by the frame edge after a camera key was moved.
- Pins disappearing after they landed (3D sorting inside one preserve-3d context) → sibling container.
- A layer painted above the one that should stay visible (white wipe over the carousel).
- An element without `position: absolute` landing at 0,0 (the summary sheet).
- A flip with `transform-origin: 0 0` skewing instead of flipping.
- Counting numbers ghosting under motion blur → step the value per frame.
- A carousel ring using `i * step` for all cards (one-sided) → centre the indices around 0.
- Text on a bright clip unreadable → stronger top shade and text shadow.
- A phrase wrapping to two lines in a price row → `white-space: nowrap` and shorter copy.
- An RTL line ending in `@handle` rendering reversed → `<span dir="ltr">`.

## Process notes
- The render is the slowest step. Three failed "final" renders were all caught by tiling frames of the mp4;
  each could have been caught in stills first.
- Keep the old render until the new one is checked; when only sound changes, re-mux.
- Raw captures, reference videos and video frames stay out of git.
