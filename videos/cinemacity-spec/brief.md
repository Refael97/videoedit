# cinemacity-spec: spec ad for Cinema City Israel

- **Format:** 16:9, 1920x1080, 60fps.
- **Skill:** `app-spec-ad`. An upgrade on El Al: cut on the narration, rhythmic music, `arrive()` instead of frames.
- **Brand (from cinema-city.co.il, 10/11/2026):**
  - navy `#112369` (logo circle and header);
  - yellow `#fdd043` (highlights, the "10 ש"ח" banner);
  - red `#ea314f` (the "הזמנת סרטים" CTA);
  - light blue `#c9e6f7` (logo lettering).
  - Logo: `assets/brand/cc_logo.svg` (vector, from the site header).
  - Site sections: ticket booking (by movie or by time), VIP, Onyx, Prime and Cinema Lounge halls, personal area.
- **Source screens:** Cinema City is a web app, so the user's screen recording isn't needed. Captured directly from the site in an iPhone 14 Pro Max viewport at 1290x2220 (`assets/raw/site/`, gitignored):
  - home with banners;
  - the booking widget: cinema → movie → hall type → date → time;
  - the order page with the seat map (`tickets.cinema-city.co.il/order/...`).
- **Seats:** clicking a seat shows "נא להמתין" (probably a temporary hold), so no more clicks on the live site. The selected-seats state is rebuilt in SVG for the film.
- **Slogan on the site:** "קולנוע רואים בקולנוע".

## Concept (proposed, waiting for approval)
- **Look:** dark cinema hall (navy `#112369` → near black). The accent is yellow `#fdd043`; the CTA is red.
- **The line:** a **film strip** with sprocket holes, like the one in the logo, instead of a plain line.
- **Hero:** the seat map rebuilt in SVG in 3D perspective. Two seats in the middle light up yellow.
- **Other beats:**
  - real posters in a 3D coverflow;
  - VIP / ONYX / Prime / Lounge;
  - ending: the red "הזמנת סרטים" button, then a projector beam, then the logo + the slogan.
