# Lessons: the user's corrections on Yellow and Bit (treat as rules)

## Yellow, 25/10/2026 (feedback rounds in order)
1. **Privacy:** "Instead of blurring, erase it with white." Never blur private data. Erase it and redraw dummy data.
2. **Placement:** the search bubble was not in place. Pop-outs must sit where they belong.
3. **Crop quality:** the wallet card was cut badly and at low quality. Ask for a better screenshot if needed, and crop with a 4× mask.
4. **Pixelated edges:** the barcode card's edges were pixelated. Use supersampled masks, and scale screens to 2× display size.
5. **Size:** "The elements are huge." Keep pop-outs modest next to the phone.
6. **The neon line:** it was cut and didn't flow evenly. One continuous line, with even speed through a piece.
7. **Neon over content:** the line ran over the "מבצעים וקופונים" text and the Coca-Cola card. Route it low, never through text or cards.
8. **Overlap:** the Coca-Cola "8 gift" card covered the cards beneath it, and its edges were pixelated.
9. **The ₪10 beat** repeated all three problems: neon over text, elements too big and pixelated, and not in place.
10. **Clipping:** from 0:14, the plane's wings were clipped by the frame, and so were the points cards. Check the edges of the frame.
11. **Pronunciation:**
    - The narrator said מבצעים like "operate" instead of "sales". Write it with niqqud and re-record only that sentence.
    - "5 סידורים": understand what the screen means before writing copy, and don't invent words.
12. **Neon behaviour:**
    - The line must stop exactly at the connection point, or its glow disappears.
    - After the loop closes around the phone, **don't pull another line out to the stations. Frame the selection instead.**
13. **Sound:** the Apple Pay button and station-selection SFX were "ear-splitting". Remove them, and use a gentle pop only on "שולם".
14. **Exits:** the line leaves from the **bottom** of the phone to the next screen.
15. **The neon rule:** no sharp right-angle corners, curves only. The line can enter a card mid-height, split into two that wrap it top and bottom, meet on the far side, and continue as one.
16. **"The plane takes off"** meant the **El Al** plane. When a brand partner object matters, get its real PNG on a transparent background and make it fly into the lens.
17. **Format:** the user wanted **16:9 "on a desktop screen"**, a formal deep voice (not his own), and "created by Refael Levi" at the end like the reference.
18. **Effort:** "Don't bring me something lazy." The target is the level of the reference video.

## Bit, 26/10/2026
1. **Opener collision:** in the first second, the opener's exit collided with text behind it that shouldn't exist at all. The opener needs its own **opaque** layer, plus `tl.seek(0.001)` before `master.add`, so the film's start state is set.
2. **Stretching:** the withdraw-to-bank element at 0:14 was out of frame and stretched sideways. Watch `box-sizing` and the image's natural size.
3. **Dead time at 0:19:**
   - the neon got stuck at the bottom of the screen;
   - the headline that should rise didn't;
   - an unrelated SFX played.
   That is a dead second and a half. **No dead seconds.** Every beat moves, and every SFX belongs to an action.
4. **Opener vs closer:** "זה ביט" didn't have time to appear before the closer, and the closer was identical to the opener. **Opener = the app (like Yellow). Closer = slogan, then bloom, then the real logo animation, then the credit.**
5. **Results:** the Yellow post brought about 500 followers, so this format is worth repeating for more brands.

## Pre-render checklist (contact sheet at 4–6 fps over the whole film)
- [ ] No neon crosses any text, card or face. No right-angle corner anywhere.
- [ ] The spark fades exactly where each piece stops. The final spark stays lit into the bloom.
- [ ] Every pop-out is at a sensible size, sharp at the edges, unstretched, and inside the frame.
- [ ] No element is clipped by the frame edges (wings, cards, rays).
- [ ] Every headline word lands on its spoken word, and no headline overlaps another.
- [ ] No dead second: something moves on every beat until the credit.
- [ ] SFX only on actions (pan = whoosh, pop = pop, landing = impact). Nothing harsh.
- [ ] The music is audible under the narration all the way through.
- [ ] Opener and closer differ, and the closing slogan holds for at least 1 s before the bloom.
- [ ] All private data is replaced with dummy data in the same font, with no blur.
- [ ] Every claim in the narration is visible on a real screen from the assets.
