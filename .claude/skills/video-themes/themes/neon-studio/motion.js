/* neon-studio theme: pixel art + seek-safe motion verbs. window.NEONSTUDIO
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const at = (t, i, step) => (Array.isArray(t) ? t[i] : t + i * step);

  /* ---------------- pixel art (drawn for this theme, brand-free) ----------------
     bitmap rows: "." empty, letters index the palette */
  const pixel = (rows, pal, px = 10) => {
    const w = rows[0].length * px, h = rows.length * px; let r = "";
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (c !== "." && pal[c]) r += `<rect x="${x * px}" y="${y * px}" width="${px}" height="${px}" fill="${pal[c]}"/>`; }));
    return `<svg viewBox="0 0 ${w} ${h}">${r}</svg>`;
  };
  const SPRITE = ["...hhhhhhh...", "..hrrrrrrrh..", ".hrrrrrrrrrr.", "rrrrrrrrrrrrr", "rrrkkrrrkkrrr", "rrrkkrrrkkrrr", "rrrrrrrrrrrrr", "lrrrrrrrrrrrl", "lrrrrrrrrrrrl", "rrr.rrrrr.rrr", "rr..rr.rr..rr", "rr..rr.rr..rr"];
  const SPR_PAL = { r: "#fc410e", h: "#ff7a45", l: "#b52a06", k: "#1a0b05" };
  const G = { g: "#f3c84a", d: "#b8871c", w: "#ffffff", s: "#d8d8e0" };
  const ICONS = {
    x: ["g...g", ".g.g.", "..g..", ".g.g.", "g...g"],
    check: ["......g", ".....g.", "g...g..", ".g.g...", "..g...."],
    up: ["....ggg", ".....gg", "....g.g", "g..g...", ".gg....", "g......"],
    halo: [".ggggg.", "g.....g", ".ggggg."],
    bulb: ["..ggg..", ".gwwwg.", "gwwwwwg", "gwwwwwg", ".gwwwg.", "..ddd..", "..ddd.."],
    spark: ["...g...", "...g...", "..ggg..", "ggggggg", "..ggg..", "...g...", "...g..."],
    heart: [".gg.gg.", "ggggggg", "ggggggg", ".ggggg.", "..ggg..", "...g..."],
    eye: ["..ggg..", ".g...g.", "g..g..g", ".g...g.", "..ggg.."],
  };
  const ART = {
    sprite: (pal) => pixel(SPRITE, Object.assign({}, SPR_PAL, pal || {}), 15),
    icon: (name) => pixel(ICONS[name], G, 12),
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#111" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M12 3v11m-5-5 5 5 5-5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>',
    spark4: '<svg viewBox="0 0 100 100"><path d="M50 8 C53 38 62 47 92 50 C62 53 53 62 50 92 C47 62 38 53 8 50 C38 47 47 38 50 8 Z" fill="#fff"/></svg>',
  };

  const S = {
    ART, pixel,
    _layouts: [],
    art(sel, svg) { $$(sel).forEach((e) => (e.innerHTML = svg)); },

    /* ---------------- layouts: "face" | "split" | "full" ----------------
       face  = the studio footage full frame (talking, emotion, the CTA)
       split = the top surface (ambient or page) over 0..960, the face in the bottom half (footage moved down by o.shift)
       full  = the top surface takes the whole frame (a page with real UI, a media card on its ambient)              */
    layout(tl, mode, t, o = {}) {
      const top = $(o.top || "#top"), vid = $(o.video || "#face video"), seam = $(o.seam || "#seam"), shift = o.shift != null ? o.shift : 400;
      const clip = { face: "inset(0px 0px 1920px 0px)", split: "inset(0px 0px 960px 0px)", full: "inset(0px 0px 0px 0px)" }[mode];
      const vv = mode === "split" ? { y: shift, scale: o.splitScale || 1 } : { y: 0, scale: 1 };
      const tt = S._layouts.length ? t : 0;
      tl.set(top, { clipPath: clip }, tt); tl.set(vid, vv, tt);
      if (seam) tl.set(seam, { opacity: mode === "split" ? 1 : 0 }, tt);
      S._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "face"; S._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: up to 3 words; a word with key:true goes to the yellow line under the white one.
       Words blur in one by one on their own start time. o.ink(t) -> true for dark captions (on the page).
       o.yAt(t) overrides the center y; defaults: face 1040, split 860, full 1300. */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.3, until = o.until || Infinity, box = $(sel);
      const Y = { face: o.yFace || 1040, split: o.ySplit || 860, full: o.yFull || 1300 };
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max || w.key || (n && n.key && cur.some((c) => c.key))) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until || (o.skip && o.skip(a))) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.4);
        const el = document.createElement("div"); el.className = "s-cap" + (o.ink && o.ink(a) ? " ink" : "");
        const l1 = document.createElement("span"); l1.className = "l1";
        const l2 = document.createElement("span"); l2.className = "l2";
        const keys = g.filter((w) => w.key);
        if (keys.length === 1 && g.length <= 2 && keys[0].text.length <= 8) l2.classList.add("big");
        g.forEach((w) => { const s = document.createElement("span"); s.className = "w"; s.textContent = w.text.replace(/[.,:;]$/, "") + " "; s.style.whiteSpace = "pre"; (w.key ? l2 : l1).appendChild(s); w._el = s; });
        if (l1.childNodes.length) el.appendChild(l1); if (l2.childNodes.length) el.appendChild(l2);
        const m = S.modeAt(a); el.style.top = (o.yAt ? o.yAt(a) : Y[m]) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
        // words take their place only when spoken, so the visible part of the line stays centered (as in the anchor)
        g.forEach((w) => { const tw = Math.max(a, w.start); tl.set(w._el, { display: "none" }, 0); tl.set(w._el, { display: "inline-block" }, tw); ft(tl, w._el, { opacity: 0, filter: "blur(10px)", y: 6 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.14, ease: "power2.out" }, tw); });
      });
    },
    /* the thin keyword: blurs in, holds while the captions above keep changing (CTA) */
    key(tl, sel, t, b) { ft(tl, sel, { opacity: 0, filter: "blur(14px)", scale: 0.92 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.3, ease: "power2.out" }, t); if (b != null) tl.set(sel, { opacity: 0 }, b); },

    /* ---------------- verbs (language.md §6) ---------------- */
    // blurIn: the default entrance for any card, tile, pill or title (a lens pull, not a fade)
    blurIn(tl, sels, t, step = 0.1, o = {}) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, filter: "blur(16px)", scale: o.from || 0.94, y: o.y || 0 }, { opacity: 1, filter: "blur(0px)", scale: 1, y: 0, duration: 0.32, ease: "power3.out" }, at(t, i, step))); },
    // pop: a tile / icon arrives with a small overshoot (and the blur)
    pop(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, filter: "blur(10px)", scale: 0.6 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.34, ease: "back.out(1.8)" }, at(t, i, step))); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, filter: "blur(10px)", duration: 0.16, ease: "power2.in" }, t); },
    // swap: one media replaces another in place (blur cross)
    swap(tl, a, b, t) { tl.to(a, { opacity: 0, filter: "blur(12px)", duration: 0.18, ease: "power2.in" }, t); ft(tl, b, { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.24, ease: "power2.out" }, t + 0.08); },
    // scroll: a long real document glides up while it is read (continuous)
    scroll(tl, sel, t, dur, dy) { tl.set(sel, { y: 0 }, 0); tl.fromTo(sel, { y: 0 }, { y: -dy, duration: dur, ease: "power1.inOut", ...IR }, t); },
    // zoom: push into one part of a UI (origin in the element's px), smooth
    zoom(tl, sel, t, scale, origin, dur = 0.5) { tl.set(sel, { transformOrigin: origin[0] + "px " + origin[1] + "px", scale: 1 }, 0); tl.fromTo(sel, { scale: 1 }, { scale, duration: dur, ease: "power3.inOut", ...IR }, t); },
    unzoom(tl, sel, t, dur = 0.4) { tl.to(sel, { scale: 1, duration: dur, ease: "power3.inOut" }, t); },
    // mark: a yellow highlight sweeps behind words in a document
    mark(tl, sels, t, step = 0.2) { $$(sels).forEach((e, i) => ft(tl, e, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.28, ease: "power2.out" }, at(t, i, step))); },
    // check: a row's circle turns green with its tick
    check(tl, sels, t, step = 0.25) { $$(sels).forEach((e, i) => { const tt = at(t, i, step), c = e.getAttribute("class"); tl.set(e, { attr: { class: c } }, 0); tl.set(e, { attr: { class: c + " on" } }, tt); tl.fromTo(e, { scale: 1 }, { scale: 1.25, duration: 0.1, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, tt); }); },
    // swapClass: seek-safe class change
    swapClass(tl, sel, t, add, remove) { $$(sel).forEach((el) => { const c = el.getAttribute("class"); let n = c; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n += " " + add; tl.set(el, { attr: { class: c } }, 0); tl.set(el, { attr: { class: n } }, t); }); },
    // progress: the bar fills and the percentage counts with it; lands on the payoff word
    progress(tl, barSel, pctSel, from, to, t, dur = 1.0) {
      tl.set(barSel, { scaleX: from / 100 }, 0); tl.fromTo(barSel, { scaleX: from / 100 }, { scaleX: to / 100, duration: dur, ease: "power2.inOut", ...IR }, t);
      if (pctSel) S.count(tl, pctSel, from, to, t, dur, { suffix: "%", ease: "power2.inOut" });
    },
    count(tl, sel, from, to, t, dur = 0.8, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    type(tl, sel, text, t, cps = 18) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    cursor(tl, sel, pts, clicks = [], o = {}) {
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    // draw: a connector draws along its length
    draw(tl, sel, t, dur = 0.4, ease = "power2.inOut") { $$(sel).forEach((p) => { const L = p.getTotalLength(); ft(tl, p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, t); }); },
    pulse(tl, sel, t, s = 1.08) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },

    /* sprites: pixel agents land on the speaker in 3 hard steps (no smooth scale: it's pixel art), then bob on 2 frames */
    sprites(tl, sels, t, step = 0.14, o = {}) {
      $$(sels).forEach((e, i) => {
        const tt = at(t, i, step);
        tl.set(e, { opacity: 0, scale: 0.4 }, 0);
        tl.set(e, { opacity: 1, scale: 0.4 }, tt); tl.set(e, { scale: 1.15 }, tt + 0.05); tl.set(e, { scale: 1 }, tt + 0.1);
        if (o.bob !== false) for (let k = 0, n = Math.floor((o.until || tt + 2) - tt - 0.2) * 3; k < n; k++) tl.set(e, { y: k % 2 ? 0 : -8 }, tt + 0.2 + k / 3 + (i % 2) * 0.16);
        if (o.until) tl.set(e, { opacity: 0 }, o.until);
      });
    },
    // icons: a pixel icon appears above its sprite (1 step + a sparkle frame)
    icons(tl, sels, t, step = 0.14, until) { $$(sels).forEach((e, i) => { const tt = at(t, i, step); tl.set(e, { opacity: 0 }, 0); tl.set(e, { opacity: 1, scale: 1.3 }, tt); tl.set(e, { scale: 1 }, tt + 0.08); if (until) tl.set(e, { opacity: 0 }, until); }); },
  };
  window.NEONSTUDIO = S;
})();
