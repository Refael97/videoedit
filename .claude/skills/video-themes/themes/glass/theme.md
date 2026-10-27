# glass: measured spec (v2)

**Anchor:** one creator, 3 videos: 20957 (37.7 s, office desk, one take), 73421 (55.4 s, 5 locations), 30868
(49.4 s, first-person POV at a desk, then face to camera). All 720×1280, 30 fps; values ×1.5 to 1080×1920.
**3/3** = seen in all three (confirmed) · **2/3** = in two (rule) · **1/3** = provisional, use only when the script
asks for it. v1 was built from 20957 alone; the corrections are marked **(v2)**.

## Format
| | Value | Seen |
|---|---|---|
| Canvas | 1080×1920, render 60 fps | — |
| Footage | a real, warm, deep room (office, wood, lamps, windows) | 3/3 |
| Takes | **(v2)** one take (20957) *or* several locations/angles joined by hard cuts every ≈10 s (73421: cuts at 5.9, 17.2, 22.2, 33.1, 47.3 s; 30868: 29.5, 39.8 s). v1's "always one continuous take" was 1/3 | 2/3 cuts |
| Length | 35–55 s | 3/3 |

## Camera
| | Value | Seen |
|---|---|---|
| Punch zoom | 4–5 frames ≈0.15 s, power2.inOut, alternating wide/tight | 20957 (8 in 37 s), 73421 (7 + 5 cuts in 55 s) → 2/3 |
| Camera change (punch or cut) | **(v2)** every 3–5 s (20957: 4.3 s, 73421: 3.4 s). In handheld POV (30868) the hand-held camera supplies the motion and punches are rare (3 in 49 s) | 3/3 |
| World space | every glass object is anchored in the room and moves with the camera (30868: tags and tiles track the laptops through a handheld move) | 3/3 |

## Type
| Role | Measured | Theme (1080) | Seen |
|---|---|---|---|
| Caption | glyph height 24–25 px at 720 in all three → 76px Rubik 900, white, soft shadow, 1–3 words, no box | 76px | 3/3 |
| Caption position | **(v2)** fixed for the whole video but set per framing: 74.7% (20957, seated wide), 65.9% (73421), 67.7% (30868) → always **just under the chin / on the upper chest**, never moving within a video | 65–75% | 3/3 |
| Hook | two tiers, small lead line over a big main line, warm off-white #e8e2d6 (measured 232,226,214 / 230,225,214) | 72 / 124px | 2/3 (20957, 73421) |
| CTA | 20957: light pill "תסתכלו למטה" in the caption slot with an arrow; **73421: the hook style again at the top ("תגיבו / עריכה")** | pill or two tiers | 2/3 |
Font: Rubik (OFL) stays the closest free match to the heavy rounded Hebrew sans (re-checked on 73421's hook).

## Materials (unchanged values, more uses)
| Material | v1 use | v2 additions | Seen |
|---|---|---|---|
| Light glass | the floating desktop | a timeline strip (ruler + thumbnails + waveform), a picture-in-picture bezel, a system dialog (73421 permission prompt: icon, title, text, two buttons, the cursor clicks "Allow" → it turns green) | 3/3 |
| Dark glass | stat card | object tags ("מנהל עריכה" + icon over a laptop), a spec card with green badges ("עוזר עריכה": GPU/CPU/RAM rows), grids of small numbered tiles ("פרק 1…20"), chat pills ("אתם: תיקונים קטנים") | 3/3 |
| Window | terminal, chat, checklist | an editor timeline shown on a floating laptop | 3/3 |
| 3D objects | — | a cinema camera, a laptop, a glossy disc ("הקורס") floating in the room (rendered 3D; **1/3–2/3, provisional**: needs real 3D assets; the theme does not ship them) | 2/3 |
Brand logos float next to things in all three (Claude, OpenAI, CapCut). **Not borrowed:** the theme stays logo-free; use the generic icon tiles.

## Colors (re-sampled)
green #2fcd58 (success, "Allow" after click, spec badges) · blue #0a84ff (playhead, the default button, selection) ·
red #ff453a (cost) · orange #ff9f0a (list header, 1/3) · hook ink #e8e2d6. Unchanged; all seen in ≥2 videos except orange.

## Motion (frame strips)
| Element | Measured | Seen |
|---|---|---|
| Window / glass in | scale ≈.55→1 + blur, ≈0.4 s expo.out | 3/3 |
| Tiles multiply | 20 tiles in ≈2.5 s in reading order, rows of 4 (≈8/s), the grid then holds and tracks the room | 1/3 |
| Timeline strip | blurs in, thumbnails already on it, playhead runs; returns 4× in 73421 as the "home" of the video | 2/3 |
| Dialog | appears, the cursor moves to "Allow", click, button turns green | 1/3 |
| Tag | grows out of its object | 2/3 |

## Sound
Spectrograms (first 30 s of each): voice + soft broadband transients on almost every UI event (73421 and 30868 are
denser than 20957), a soft whoosh on cuts; no clear music bed in any of the three. Theme set unchanged:
`zoom pop tick ding click whoosh`.

## Action density (rule d)
20957 terminal: 3 installs + 3 checks + badge in ≈3.5 s = 2.0 · 73421 dialog: in, cursor, click, green in ≈1.6 s = 2.5 ·
73421 timeline: strip, thumbnails, playhead, logos in ≈2 s = 2.0 · 30868 tiles: 20 tiles + tag in ≈2.5 s (count the
multiply as 2–3 actions) ≈ 1.2 → **≈1.5–2.5 actions per second** while an element is the hero.

## Component contract → glass parts
| Contract | glass |
|---|---|
| `layout.full-face` | footage full frame in `.g-cam` |
| `layout.split` | n/a — the glass lives in the room, never in a split |
| `layout.cut` | **(v2)** hard cut to another location/angle (a second `<video>` clip), every ≈10 s if the footage has it |
| `caption` | `.g-caps` + `GLASS.captions()`; set `--g-cap-center` per framing (65–75%) |
| `hook-title` | `.g-hook` (`.l1` + `.l2`) + `GLASS.hook()`; also the CTA (`.g-hook.cta-top`) |
| `timeline` | **(v2)** `.g-strip` + `GLASS.strip()/playhead()/marker()` |
| `object-tag` | **(v2)** `.g-tag` + `GLASS.tag()` |
| `tile-grid` | **(v2)** `.g-tiles` + `GLASS.multiply()` |
| `dialog` | **(v2)** `.g-dialog` (light glass) + `GLASS.cursor()` + `GLASS.swap(.., "done")` |
| `pip` | **(v2)** `.g-pip`, `.g-portal` |
| `app-window` | `.g-win` (+ `.g-term`, `.g-list`, `.g-chat`) + `GLASS.winIn/winOut()` |
| `stat` | `.g-stat` / `.m-dark` + `.g-num` + `GLASS.count()` |
| `cta` | `.g-cta` pill + `GLASS.cta()`, or the two-tier title |
| anything else | design it with `language.md` |

## Using it in a project
```bash
.claude/skills/video-themes/scripts/use_theme.sh glass videos/<project>   # copies into assets/theme/
```
Full working example: `videos/theme-glass-preview/` (`src/template.html`, `src/sfx.txt`, `build.py`).
v1 projects (`videos/glass-test-kowalski`) keep working: v2 only adds classes and verbs.
