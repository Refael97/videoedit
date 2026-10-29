# Signature effects (`effects/`)

Moves that every theme can use, built once and dressed by the active theme. The effect owns the choreography and the
placement; the theme owns the look through `themes/<theme>/fx.css` (`--fx-*` variables mapped from its own tokens), so
the same effect reads as paper in paper and as neon in night. Placement is always relative to the speaker's face
(`face.js`, data from `scripts/face_track.py`), never fixed pixels.

Files: `face.js` (`window.FACE`) · `fx.js` (`window.FX`) · `fx.css` (base styles) · per theme `themes/<t>/fx.css`.
`scripts/use_theme.sh` copies them to `assets/theme/effects/` and `assets/theme/fx.css`.

## Setup in a composition
```html
<link rel="stylesheet" href="assets/theme/fx.css" />            <!-- the theme's dress -->
<link rel="stylesheet" href="assets/theme/effects/fx.css" />    <!-- base styles -->
<script src="assets/theme/effects/face.js"></script>
<script src="assets/theme/effects/fx.js"></script>
...
<div class="fx-matte"><video id="fxMatte" data-fx-matte src="assets/video/matte.webm"
     data-start="0" data-duration="…" data-track-index="2" muted playsinline></video></div>
```
```js
window.FACE_DATA = …;  window.FACTS = …;          // inlined by build.py (data/face.json, data/facts.yaml)
FACE.init(window.FACE_DATA, "#faceVid");
<theme layout calls>
FX.init(tl, { face: "#faceVid", matte: "#fxMatte" });   // after the layout, before the effects
```
Layers: footage < `.fx-behind` (word, cards) < `.fx-matte` (the cut-out speaker, synced every frame to the footage's
transform, clip and grade) < `.fx-front` (chart) < captions. The cut-out is only shown while an effect needs it.
Seek-safe: one timeline `onUpdate` hook places everything from the time alone; reveals are timeline tweens.

## The effects

| effect | when the language uses it | API | self-check (QA "signature effects") |
|---|---|---|---|
| **word behind the head** | one stressed word that *is* the point ("מטורף", a name, a verdict) on a full-face beat | `FX.wordBehind(tl, el, t0, t1, { text, width: 0.92, step: 0.06, at: "eyes", dy: 0, drift: 1.04 })` — the theme's display font, fitted to `width` of the frame, letters arrive ghost → solid; its bottom sits at the eyes and is lifted until the head takes at most ~25% of any letter | every letter ≥ 70% visible against the real cut-out in every sample; **one** letter may dip below for ≤ 0.5 s (the head moves; a brief dip reads fine, two letters or a long dip don't) |
| **cards from behind the shoulders** | 2–4 named things that belong to the speaker ("my themes", "my tools") | `FX.shoulderCards(tl, [cards], t0, t1, { step: 0.28, rise: 0.8, gap: 0.25, width: 240, y: "eyes" })` — each card starts behind the body at shoulder height, moves out along the shoulders (under the caption band), then rises beside the head; both sides when both have room, else stacked on the free side | once risen, no card more than 50% hidden by the speaker |
| **chart on the chest** | a before → after or a measured number the speaker says | `FX.chestChart(tl, el, t0, t1, { title, bars: [{ fact: "numbers.views_before", name }, { fact: "numbers.views_after", name, payoff: "<word>", landAt: <s> }] }, { below: 0.65 })` — values **only** from `window.FACTS` (no facts → no chart, an error is logged); ranges ("300–400") drawn at their midpoint and labelled as written; the last value counts up and lands on the payoff word (marked `data-qa-payoff`) | the chart is a front card: the eyes-to-mouth check and the facts check cover it |

All effect elements carry `data-fx="<effect>"`; letters `span[data-fx-letter]`. Editorial's display word behind the
speaker (`EDITORIAL.letters` inside `.e-behind`) carries the same marks, so the same self-check applies to it.

## A theme's dress (`themes/<t>/fx.css`)
`--fx-accent` (the bar that matters, card dot) · `--fx-ink` · `--fx-display` / `--fx-display-weight` (the word) ·
`--fx-word` / `--fx-word-stroke` / `--fx-word-glow` · `--fx-body` · `--fx-card-bg` / `-ink` / `-ink-soft` / `-edge` /
`-r` / `-shadow` / `-blur` · `--fx-glow` · `--fx-bar-muted`. Map them from the theme's tokens only; add no new colors.

## Demo
`videos/fx-demo/` — 20 s of Rafael's footage (28–48 s of IMG_5381) in paper and in night (`out/paper.mp4`,
`out/night.mp4`); `make_media.sh` rebuilds the slice, `build.py <theme>` builds a composition.
