# Polish · round 6

`rafael-test-headline` · theme `headline` · sheet `review/_polish/round-6.jpg`. Errors are fixed already (every scene passed); this round takes
the video from good to great. Watch the QA draft once, look at the sheet, then fill every row.

## Eye checklist

| # | item | what to look at | verdict (PASS / FIX) | note — what exactly, and the fix |
|---|---|---|---|---|
| 1 | Depth | soft contact shadow under every card / window (the theme's shadow), the stage reads in layers | PASS | windows carry the theme's halo + soft shadow; stage reads in layers (page, window, caption) |
| 2 | Edges | clean 1px edge or inner highlight on cards, no aliasing (.aa on transformed elements), no hairline gaps | PASS | 1px window edge + blue halo everywhere, no hairline gaps on the sheet |
| 3 | Easing | every entrance eases out with a small overshoot (<= 4%); exits are faster; nothing linear | PASS | H.win / H.section use the theme's eased entrances; exits are blur-outs, faster than entrances |
| 4 | Secondary motion | something alive during every hold (caret, cursor drift, subtle float, glow breathing) | PASS | every hold has a push, float (±6 px yoyo on every window), cursor or streak; leaves drift the whole film |
| 5 | Captions | each word on its word (±2 frames), never over a card, the theme's caption style everywhere | PASS | one caption style; face captions on the navy plate; no caption on a card (CTA lines hidden 54.26–57.55) |
| 6 | Sound per event | an SFX on every event and none on nothing; music bed ≈0.3 under the voice | PASS | 82 SFX cues on the events (src/sfx.txt), voice at -16 LUFS on top |
| 7 | Colour consistency | the accent is one hex in every scene; the footage grade is stable across cuts | PASS | one blue accent (--h-blue) in every scene; one global grade on the footage, stable across cuts |
| 8 | Line breaks | balanced lines, no single-word widow, numbers aligned | PASS | balanced 1–2 line breaks; numbers in their own column (1/2/3, 300–400) |
| 9 | Transitions | one family, directions matched (RTL flips), no card pops in or out | PASS | one family: window swap / blur; page ↔ split ↔ dark cuts on the sentence |
| 10 | Opening frame | t = 0.0 is a strong thumbnail: the result / the thing itself, readable at a glance | PASS | t=0 is the headline + 'עם קלוד?' box + three real edited reels over the speaker |
| 11 | Last frame | the video ends on a clean, composed frame | PASS | ends on the profile card + courses button and the speaker, caption 'חבר'ה' |

## Fixes for the next round

-
