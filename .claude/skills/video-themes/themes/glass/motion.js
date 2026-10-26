/* glass theme: motion + small DOM builders. window.GLASS
   Every helper takes the root timeline and absolute times, parks its targets at t=0 and uses
   fromTo(..., immediateRender:false), so the timeline is seek-safe. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };

  /* generic, brand-free app icons (rounded squares) */
  const sq = (bg, inner) => '<svg viewBox="0 0 60 60"><defs><linearGradient id="gx' + bg.replace(/[^a-z0-9]/gi, "") + '" x1="0" y1="0" x2="0" y2="1">' +
    bg.split(",").map((c, i, a) => '<stop offset="' + (a.length > 1 ? i / (a.length - 1) : 0) + '" stop-color="' + c + '"/>').join("") +
    '</linearGradient></defs><rect x="1" y="1" width="58" height="58" rx="14" fill="url(#gx' + bg.replace(/[^a-z0-9]/gi, "") + ')"/>' + inner + "</svg>";
  const ICONS = {
    folder: sq("#e9f4ff,#cfe6ff", '<path d="M13 21h12l4 4h18v20H13z" fill="#5ab8f5"/><path d="M13 27h34v18H13z" fill="#7ccbfa"/>'),
    globe: sq("#ffffff,#e9e9ee", '<circle cx="30" cy="30" r="15" fill="none" stroke="#2f80ff" stroke-width="3"/><path d="M15 30h30M30 15c-7 8-7 22 0 30M30 15c7 8 7 22 0 30" fill="none" stroke="#2f80ff" stroke-width="2.5"/>'),
    photos: sq("#ffffff,#f1f1f4", '<rect x="14" y="17" width="32" height="26" rx="5" fill="#ffb340"/><path d="M14 38l9-9 7 7 5-5 11 10v2H14z" fill="#34c759"/><circle cx="38" cy="25" r="3.5" fill="#fff"/>'),
    notes: sq("#fff7d6,#ffe9a3", '<rect x="1" y="1" width="58" height="13" rx="0" fill="#ffd23f"/><path d="M14 26h32M14 34h32M14 42h22" stroke="#c9c2a8" stroke-width="2.5"/>'),
    spark: sq("#2b2b30,#141416", '<path d="M30 14l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" fill="#fff"/>'),
    clip: sq("#1b1b1d,#000000", '<path d="M18 18l24 24M42 18L18 42" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'),
    trash: sq("#e9e9ee,#cfcfd6", '<path d="M21 22h18l-2 22H23z" fill="#9b9ba3"/><path d="M18 21h24" stroke="#7d7d86" stroke-width="3" stroke-linecap="round"/>'),
  };
  const CHECK = '<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" fill="#2fcd58"/><path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const TICK = '<svg viewBox="0 0 30 30"><path d="M8 15.5l4.5 4.5L22 10.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CURSOR = '<svg viewBox="0 0 34 46"><path d="M3 2v35l9-8.5 6.5 14 6-2.8-6.3-13.6H31z" fill="#fff" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  const ARROW = '<svg viewBox="0 0 40 110"><path d="M20 2v100M8 88l12 16 12-16" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))"/></svg>';

  const G = {
    ICONS, CHECK, TICK, CURSOR, ARROW,

    /* fill a .g-dock with icons: G.dock("#dock", ["folder","globe",...]) */
    dock(sel, names) { $(sel).innerHTML = names.map((n) => '<div class="ic">' + ICONS[n] + "</div>").join(""); },

    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* hook: both tiers in from a short blur at t, hard cut at tEnd (the reference cuts it on the first zoom) */
    hook(tl, sel, t, tEnd) {
      const lines = $$(sel + " .l1, " + sel + " .l2");
      ft(tl, lines, { opacity: 0, y: 24, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "expo.out", stagger: 0.08 }, t);
      tl.set(lines, { opacity: 0 }, tEnd);
    },

    /* captions from word timings. words: [{text,start,end}]. Groups of <= maxWords, broken at punctuation
       or a pause; each group shows from its first word to the next group (hard swap, no animation). */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.35, hold = o.hold || 0.35, until = o.until || Infinity;
      const groups = [];
      let cur = [];
      words.forEach((w, i) => {
        cur.push(w);
        const next = words[i + 1];
        const brk = /[.,:!?;]$/.test(w.text) || !next || next.start - w.end > gap || cur.length >= max;
        if (brk) { groups.push(cur); cur = []; }
      });
      const box = $(sel);
      groups.forEach((g, i) => {
        const a = g[0].start;
        if (a >= until) return;
        const nx = groups[i + 1];
        const b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + hold + 0.6) : g[g.length - 1].end + hold);
        const el = document.createElement("div");
        el.className = "g-cap";
        el.textContent = g.map((w) => w.text.replace(/[.,:;]$/, "")).join(" ");
        box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0);
        tl.set(el, { opacity: 1 }, a);
        tl.set(el, { opacity: 0 }, b);
      });
      return groups;
    },

    /* punch zoom of the whole camera (footage + glass move together). quick 0.15 s ease, then hold. */
    zoomInit(tl, sel, scale = 1, x = 0, y = 0) { tl.set(sel, { scale, x, y }, 0); },
    zoom(tl, sel, t, scale, x = 0, y = 0, dur = 0.15) { tl.to(sel, { scale, x, y, duration: dur, ease: "power2.inOut" }, t); },
    /* slow drift between punches so no frame is static */
    drift(tl, sel, t, dur, dScale = 0.015) { tl.to(sel, { scale: "+=" + dScale, duration: dur, ease: "none" }, t); },

    /* glass space appears: fades up from a slight scale with blur */
    spaceIn(tl, sel, t) { ft(tl, sel, { opacity: 0, scale: 0.92, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" }, t); },
    spaceOut(tl, sel, t) { tl.to(sel, { opacity: 0, scale: 0.96, duration: 0.25, ease: "power2.in" }, t); },

    /* a window grows out of the glass (small + blurred -> full), as in the reference */
    winIn(tl, sel, t, o = {}) { ft(tl, sel, { opacity: 0, scale: 0.55, filter: "blur(12px)", y: o.y || 20 }, { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 0.4, ease: "expo.out" }, t); },
    winOut(tl, sel, t) { tl.to(sel, { opacity: 0, scale: 0.85, filter: "blur(8px)", duration: 0.22, ease: "power2.in" }, t); },

    /* step pill: <div class="g-step"><span>שלב 1</span><span>שלב 2</span></div>; shows span i from times[i], with a tiny pulse */
    steps(tl, sel, times) {
      const spans = $$(sel + " span");
      spans.forEach((s, i) => {
        tl.set(s, { display: i === 0 ? "inline" : "none" }, 0);
        if (i > 0) { tl.set(spans[i - 1], { display: "none" }, times[i]); tl.set(s, { display: "inline" }, times[i]); }
      });
      times.slice(1).forEach((t) => tl.fromTo(sel, { scale: 1 }, { scale: 1.14, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t));
    },

    /* rows appear one by one; checks pop after */
    rows(tl, sels, t, step = 0.35) { $$(sels).forEach((r, i) => ft(tl, r, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }, t + i * step)); },
    pop(tl, sels, t, step = 0.35) { $$(sels).forEach((r, i) => ft(tl, r, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" }, t + i * step)); },

    /* checklist circle fills blue with a tick */
    check(tl, sels, t, step = 0.3) { $$(sels).forEach((b, i) => ft(tl, b, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(2)" }, t + i * step)); },

    /* counting number: "₪0" -> "₪2,100" */
    count(tl, sel, from, to, t, dur, o = {}) {
      const el = $(sel), pre = o.prefix || "", suf = o.suffix || "";
      const fmt = (v) => pre + Math.round(v).toLocaleString("en-US") + suf;
      const p = { v: from };
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },

    /* red strike lines draw right-to-left across cost rows */
    strike(tl, sels, t, step = 0.25) { $$(sels).forEach((s, i) => ft(tl, s, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, t + i * step)); },

    /* cursor path: pts = [[x, y, t], ...] in the parent's px; clicks = [t, ...] squash */
    cursor(tl, sel, pts, clicks = [], o = {}) {
      if (o.init !== false) tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
    },

    /* CTA pill pops in, arrow draws down and bobs */
    cta(tl, sel, t) {
      const pill = $(sel).querySelector(".pill"), arr = $(sel).querySelector(".arrow svg");
      ft(tl, pill, { opacity: 0, scale: 0.6, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.8)" }, t);
      ft(tl, arr, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, t + 0.3);
      tl.fromTo(arr, { y: 0 }, { y: 14, duration: 0.45, yoyo: true, repeat: 5, ease: "sine.inOut", ...IR }, t + 0.65);
    },
  };
  window.GLASS = G;
})();
