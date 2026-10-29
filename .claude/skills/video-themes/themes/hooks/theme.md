# hooks: measured spec

**Anchor:** one creator, 4 videos: 7784 (49.7 s, "7 hooks"), 28202 (53.9 s), 68494 (47.5 s), 93864 (64.8 s). All
720×1280 30 fps; values ×1.5 to 1080×1920. **Contributors:** none.

## Format
| | Value |
|---|---|
| Canvas | 1080×1920, render 60 fps |
| Footage | medium shot, centered, bright warm daylight room (white curtains, a mesh office chair), **black t-shirt**, clip-on mic; occasionally a second tighter angle |
| Length | 45–65 s |

## Worlds (measured)
| World | Share | Notes |
|---|---|---|
| room | ≈60% | full frame always; never boxed |
| void | ≈30% | pure black (1,0,2) with amber corner light: at the corner 85,61,0, fading to black by ≈40% of the height; 68494 lights top-right + bottom-left, 28202 lights all four |
| cutaway | ≈10% | example videos full frame, title strip at y≈193 (15%), view pill at y≈975 (76%) |
| cuts | 68494: 8 scene cuts in 47.5 s (+ cuts inside the void) | hard cuts |

## Type
| Role | Measured (720) | Theme (1080) | Font |
|---|---|---|---|
| Glow word | cap height 50–115px, 58–70% of the width, center y≈810 (63%) | fitted 55–75% width, 120–230px, center 1210 | heavy grotesk → **Inter Tight 900 / Heebo 900** (render-matched on "DESCRIPTIONS") |
| Glow fill | vertical gradient (light top → saturated bottom) + same-color bloom | `.glw` gradient + 2× drop-shadow | — |
| Lead line | cap ≈30px, white, directly above | 60px 800 | same |
| Sub line | condensed light under the word ("I'll send them") | 76px | Oswald 400 / Karantina 700 |
| Captions | cap ≈30px, white 800, center y≈795 (62%) | 58px, 1192 | Inter Tight / Heebo 800 |
| Chip | pill ≈88px tall, ring ≈52px, label condensed | 120 / 72 / 46px | Oswald / Karantina |
| Template line | ≈52px casual hand font, [slot] in yellow glow | 76px | Comic Neue 700 / Playpen Sans Hebrew 600 |
| View pill | text cap ≈40px, pill center y≈975 | 64px, 1462 | sans 800 |

## Colors
| | Value |
|---|---|
| Gold tile | 253,216,89 → 255,249,133 (left → right) |
| Amber corner | 85,61,0 at the corner on black |
| Glow palettes | gold, fire (orange-red), lime (≈ #d7f70f), violet (≈ #b030f0), red neon (7784 opening) |
| Ring / slot | ≈ #ffc928 |

## Motion (frame strips)
| Element | Measured |
|---|---|
| Glow word | ignites in ≈0.15–0.2 s (dim → full), no travel; swaps hard to the next word |
| Template line | words appear one by one on the spoken words, the slot word in yellow |
| Gold tile | pops, then a slow push-in (≈×1.4 over 2.4 s); icons pop under it ≈0.2 s apart |
| View pill | appears with the cut; a glint flashes across it ≈0.4 s later |
| Neon number | red neon outline with a 3D drop, flickers on |

## Sound
Spectrogram (68494, 0–30 s): continuous soft music bed + broadband transients on cuts and graphic events.
Theme set (synthesized, free): `glow hit glint toggle pop tick ding whoosh swish key click`.

## Action density (rule d)
template line: 6 words + chip / 1.2 s · tile: pop + 3 icons + push / 2.4 s ≈ 1.7 · room: a glow word or chip every
1.2–2.5 s → **≈1.2–1.5 actions/s**.

## Translations
| In the anchor | In the theme |
|---|---|
| Instagram / TikTok / Facebook logos | generic glyph tiles (`.h-icon`), no brand marks |
| blurred / unreadable UI rows | fewer rows, all real text |
| real platform screenshots | real screens rebuilt from the user's actual settings / pages (`.h-screen`) |

## QA targets

Measured on the anchor by `scripts/qa/anchor.py` (the same detectors `qa` runs on drafts). Change only by re-measuring the anchor.
Graphics motion = frame difference with the camera's global move removed and the speaker masked, in windows with
graphics, minus the footage's own residual (windows without graphics, else the quietest 10%). Flat stretches and the
longest static hold are read on the same graphics layer (residual < 0.3 above that baseline, runs >= 0.4 s). Footage = info only.

| video | length | graphics motion (raw − baseline) | graphics flat % | longest static hold | actions / s | footage (jitter · punches, drifts) |
|---|---|---|---|---|---|---|
| Video-7784 | 49.53 s | 0.29 (0.95 − 0.66) | 50.8% | 1.97 s | 0.69 | 0.39 px · 8P 11D |
| Video-28202 | 53.77 s | 0.15 (0.71 − 0.56) | 64.1% | 4.8 s | 0.65 | 0.21 px · 11P 11D |
| Video-68494 | 47.37 s | 2.53 (3.01 − 0.49) | 28.9% | 1.7 s | 0.59 | 0.4 px · 18P 15D |
| Video-93864 | 64.67 s | 0.17 (0.83 − 0.66) | 62.8% | 4.14 s | 0.8 | 0.23 px · 5P 15D |
| **anchor** | 215.3 s | **0.71** | **52.9%** | **2.4 s** (95th pct) | **0.69** | jitter 0.30 px/frame, 26.2 camera moves/min |

| check | target |
|---|---|
| graphics motion | >= 0.53 (0.75 x anchor) |
| flat stretches (graphics layer) | <= 53.0% |
| max static hold (graphics layer) | <= 2.4 s = the anchor's 95th-percentile hold (a marked payoff hold is exempt) |
| actions / s (events + camera moves) | 0.48–0.9 (anchor ±30%) |
| footage motion | reported, never failed |
