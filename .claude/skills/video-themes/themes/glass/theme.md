# glass: measured spec

Source: 1 reference reel (Hebrew tutorial, 37.7 s, 720×1280, 30 fps, one continuous take in an office).
Everything below was measured on that file, then scaled ×1.5 to 1080×1920. With one video every value is
"observed once"; items marked **(assumption)** are generalizations not visible in the reference.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, 9:16 |
| Render | 60 fps (reference is 30) |
| Footage | one continuous talking-head take, real room, no B-roll |
| Length | 30–45 s (reference 37.7 s) |

## Type
| Role | Font | Size | Color | Effect | Position |
|---|---|---|---|---|---|
| Hook lead line | Rubik 900 | 72px | #efeae0 (measured 230,225,214) | shadow 0 4px 16px rgba(0,0,0,.5) | top ≈10.5% |
| Hook main line | Rubik 900 | 124px (spans ~89% width for 3 words) | #efeae0 | same | under the lead line, line-height 1.02 |
| Caption | Rubik 900 | 76px (3 words ≈48% width) | #ffffff | same shadow | center at 74.7% height |
| Window text | Rubik 700 / JetBrains Mono 500 | 24–28px | #ececee | — | inside windows |
| Step pill | Rubik 700 | 26px | white on rgba(28,28,30,.55) glass | blur 10px | top-right of the glass |
| CTA pill | Rubik 900 | 56px | #1c1c1e on rgba(255,255,255,.74) | blur 12px | center at 66% height |

The reference font is a heavy rounded Hebrew sans (likely commercial). Closest free match tested: **Rubik 900**
(also tried Heebo 900/800, Rubik 800, Assistant 800, Secular One).

## Color
| Token | Hex | Use |
|---|---|---|
| green | #2fcd58 (measured 47,205,88) | money saved, success checks, "חינם" badge |
| blue | #0a84ff | checklist ticks, selection |
| orange | #ff9f0a | list header |
| red | #ff453a | strike-through over costs |
| window | rgba(30,30,33,.94) | dark app windows |
| glass | rgba(255,255,255,.16) + blur 14px + 1.5px white .4 edge | the floating desktop |

## Layout
- The **glass desktop** (≈400×560 at 1080 wide) lives on the side of the frame with free space, from ~33% to
  ~62% of the height. It has a tiny menu bar, a step pill top-right and a dock at the bottom.
- The **stat card** (dark glass, ≈760 wide) appears above the speaker's head, top ≈6–20%, and replaces the desktop.
- Captions always at 74.7%; CTA at 66%.

## Motion (measured frame by frame)
| Move | Timing | Easing |
|---|---|---|
| Punch zoom (whole camera, glass included) | 4–5 frames ≈0.15 s; at 2.5, 10.8, 14.4, 17.3, 24.5, 26.5, 28.1, 36.4 s → every ≈4.3 s, alternating wide/tight | power2.inOut |
| Hook out | hard cut on the first zoom (2.5 s) | — |
| Caption swap | hard cut per word group, no animation | — |
| Window in | grows from ~55% scale + blur to full in ≈0.4 s | expo.out |
| Window out | ≈0.2 s shrink + blur | power2.in |
| Counter | ₪0 → ₪2,100 in ≈1.5 s | power2.out |
| Strike lines | draw across each cost row, 0.25–0.4 s apart | power2.inOut |
| Drift between zooms **(assumption)** | +1.5% scale over the hold | none |

## Captions
- 1–3 words per group, break on punctuation or a pause > 0.35 s.
- No captions while the hook is on screen (first ~2.5 s).
- Single line always.

## Sound
- Reference: voice only, UI sounds very soft (a few short high blips around window events). No music bed detected.
- Theme set (`sfx/`, synthesized): `zoom` (punch), `pop` (window in), `tick` (terminal check), `ding` (success),
  `click` (cursor), `whoosh` (big change, e.g. desktop → stat card).
- Levels used in the preview: voice 1.0, zoom .35, pop .3, tick .35, ding .22, click .45, whoosh .28.

## Component contract → glass parts
| Contract | glass |
|---|---|
| `layout.full-face` | footage full frame in `.g-cam` |
| `layout.split` | n/a (one take; the glass desktop replaces it) |
| `layout.full-graphic` | n/a **(assumption: use the stat card big, centered)** |
| `caption` | `.g-caps` + `GLASS.captions()` |
| `hook-title` | `.g-hook` (`.l1` + `.l2`) + `GLASS.hook()` |
| `step-label` | `.g-step` + `GLASS.steps()` |
| `prompt-card` | `.g-chat` window |
| `app-window` | `.g-win` (+ `.g-term`, `.g-list`, `.g-chat`) + `GLASS.winIn/winOut()` |
| `icon-tile` | `GLASS.ICONS` in `.g-dock` |
| `tree` | build from `language.md`: light glass + `.g-tile`s joined by thin white 30% curves **(assumption)** |
| `recap-diagram` | `.g-list` checklist |
| `cta` | `.g-cta` + `GLASS.cta()` |
| `transition.*` | `GLASS.zoom()` punches; windows `winIn/winOut`; `spaceIn/spaceOut` |
| `sfx.*` | `sfx/*.wav` |
| anything else | design it with `language.md` (materials §1, recipe §7, blocks §8, verbs §6) |

## Using it in a project
```bash
.claude/skills/video-themes/scripts/use_theme.sh glass videos/<project>   # copies into assets/theme/
```
Then link `assets/theme/tokens.css`, `assets/theme/theme.css`, `assets/theme/vendor/gsap.min.js`,
`assets/theme/motion.js`. Full working example: `videos/theme-glass-preview/` (`src/template.html` + `build.py`).
