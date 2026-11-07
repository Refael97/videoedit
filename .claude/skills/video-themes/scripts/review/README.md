# The review loop (`review.py`)

Numbers catch known mistakes; they don't see *finish*. This loop makes Claude look at every scene next to the anchor
creator's frame of the same kind, write down what is below the anchor's level, fix it and look again — until it holds up.

```
python3 .claude/skills/video-themes/scripts/footage_prep.py videos/<project> --wire     # stage 0: footage into the anchor's world
python3 .claude/skills/video-themes/scripts/review/review.py videos/<project> scenes    # map the scenes
python3 .claude/skills/video-themes/scripts/review/review.py videos/<project> scene next # one round for the first open scene
python3 .claude/skills/video-themes/scripts/review/review.py videos/<project> polish    # after every scene passes
.claude/skills/video-themes/scripts/qa/qa videos/<project>                               # 20 checks on a draft
python3 .claude/skills/video-themes/scripts/review/review.py videos/<project> film      # the whole film vs the anchor
python3 .claude/skills/video-themes/scripts/review/review.py videos/<project> gate      # READY or what is still open
```

## One round

1. `scene next` picks the first scene whose latest round is not all PASS (`scene <id>` for a given one).
2. Key moments: right after the first entrance settles, the middle, the end (a face beat: its middle). Motion: 8 frames,
   every 2 frames, from each of the scene's two busiest entrances (clusters of GSAP tween starts).
3. Stills come from `hyperframes snapshot --at …` (exact instants, real footage frames, no render).
4. Each still is classified like the anchor library (`look.py`: face / split / graphic, hero box) and paired with the
   anchor moment of the same layout whose hero sits closest in height and size.
5. `review/<scene>/round-N.jpg` (draft left, anchor right, motion strips below) and `round-N.md`:
   measured numbers per moment, then the **eye checklist** — 12 rows, each PASS or FIX + what exactly — and
   "Fixes for the next round". The next round's md repeats those fixes at the top, so each round answers the last.
6. The gate reads the checklist tables: any row not PASS (or left ☐) keeps the scene open.

## Rules for the reviewer

- Open the sheet image before writing a single verdict. A verdict without looking is not a review.
- PASS means "at the anchor's level side by side", not "acceptable".
- A FIX names the element, the problem and the change ("the chat window is 62% wide and holds one bubble: widen to the
  anchor's 85%, show the real 3-message exchange from the script, type the last line").
- No round cap. If one row fails three rounds running, stop and tell the user what fails and why.
- Rounds are kept: they are the record of how the video got to the anchor's level.

## Anchor moments

`anchor_moments.py <theme>` samples the anchor creator's videos at 1 fps, classifies every frame, and keeps up to
10 face / 24 split / 14 graphic moments spread over the set (`references/_analysis/<theme>/moments/`, private).
