/* editorial theme: art + seek-safe motion verbs. window.EDITORIAL
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const isHe = (s) => /[֐-׿]/.test(s);

  const ART = {
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="#ede9df" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="#14140f" stroke-width="2"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const E = {
    ART,
    _layouts: [],
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* ---------------- layouts ----------------
       face   = the footage, overlays on top (the default)
       cutout = the speaker cut out on the green page (openings, the big statement) — needs the matte
       cover  = the footage inside a thin gold frame + issue line, display text BEHIND the speaker — needs the matte
       page   = the green page alone (grids, a full card, a closing word); no speaker                         */
    layout(tl, mode, t, o = {}) {
      const at = E._layouts.length ? t : 0;
      const page = $(o.page || "#page"), matte = $(o.matte || "#matte"), cover = $(o.cover || "#cover"), face = $(o.face || "#face");
      tl.set(page, { opacity: mode === "cutout" || mode === "page" ? 1 : 0 }, at);
      if (matte) tl.set(matte, { opacity: mode === "cutout" || mode === "cover" ? 1 : 0 }, at);
      if (cover) tl.set(cover, { opacity: mode === "cover" ? 1 : 0 }, at);
      if (face) tl.set(face, { opacity: mode === "page" ? 0 : 1 }, at);
      E._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "face"; E._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },
    // seek-safe class change
    swapClass(tl, sel, t, add, remove) { $$(sel).forEach((el) => { const c = el.getAttribute("class") || ""; let n = c; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n += " " + add; tl.set(el, { attr: { class: c } }, 0); tl.set(el, { attr: { class: n } }, t); }); },

    /* captions: a phrase (≤4 words) on a green slip, spoken words cream, the rest sage (karaoke) */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 4, gap = o.gap || 0.35, until = o.until || Infinity, box = $(sel), y = o.y || 1358;
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.5);
        const el = document.createElement("div"); el.className = "e-cap";
        el.style.top = (o.yAt ? o.yAt(a) : y) + "px";
        g.forEach((w, k) => { const s = document.createElement("span"); s.className = "w"; s.textContent = w.text + (k < g.length - 1 ? " " : ""); if (!isHe(w.text)) s.style.fontStretch = "100%"; el.appendChild(s); E.swapClass(tl, s, w.start, "on"); });
        box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
      });
    },

    /* ---------------- type verbs (language.md §6) ---------------- */
    // letters: the display serif sets itself letter by letter; each letter arrives as a ghost (35%) then solid
    letters(tl, sel, t, step = 0.08) {
      const el = $(sel);
      if (!el.dataset.split) { el.dataset.split = "1"; const txt = el.textContent; el.textContent = ""; Array.from(txt).forEach((ch) => { if (ch === "\n") { el.appendChild(document.createTextNode("\n")); return; } const s = document.createElement("span"); s.className = "l"; s.textContent = ch === " " ? " " : ch; el.appendChild(s); }); }
      const ls = Array.from(el.querySelectorAll(".l"));
      ls.forEach((l, i) => ft(tl, l, { opacity: 0 }, { keyframes: [{ opacity: 0.35, duration: 0.06 }, { opacity: 0.35, duration: 0.08 }, { opacity: 1, duration: 0.08 }] }, t + i * step));
      return t + ls.length * step;
    },
    // lines: heavy sans lines rise out of their own mask, 0.16 s apart
    lines(tl, sel, t, step = 0.16) { $$(sel).forEach((e, i) => ft(tl, e, { yPercent: 105 }, { yPercent: 0, duration: 0.32, ease: "power3.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // linesOut: the block leaves upward through the same masks (the ticker change)
    linesOut(tl, sel, t, step = 0.05) { $$(sel).forEach((e, i) => tl.to(e, { yPercent: -105, duration: 0.24, ease: "power3.in" }, t + i * step)); },
    // slip: a cut-paper label wipes in from the reading side, then its text slides in under it
    slip(tl, sels, t, step = 0.22) {
      $$(sels).forEach((e, i) => {
        const tt = Array.isArray(t) ? t[i] : t + i * step, rtl = getComputedStyle(e).direction === "rtl";
        const w = Math.ceil(e.offsetWidth) + 2;  // px, not %: the wipe is the same, and px insets are what layout tools read
        ft(tl, e, { clipPath: rtl ? `inset(0px 0px 0px ${w}px)` : `inset(0px ${w}px 0px 0px)` }, { clipPath: "inset(0px 0px 0px 0px)", duration: 0.26, ease: "power3.out" }, tt);
        const inn = e.querySelector(".in"); if (inn) ft(tl, inn, { x: rtl ? 40 : -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, tt + 0.08);
      });
    },
    // type: letters appear at cps; an optional caret element blinks while typing
    type(tl, sel, text, t, cps = 18) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    // timecode: hh:mm:ss:ff rolling (30 fps), the seconds cream and the frames gold
    timecode(tl, sel, from, to, t, dur) {
      const el = $(sel), p = { v: from }, pad = (n) => String(n).padStart(2, "0");
      const fmt = (v) => { const f = Math.floor(v * 30), ff = f % 30, s = Math.floor(f / 30) % 60, m = Math.floor(f / 1800); return pad(0) + ":" + pad(m) + ":<b>" + pad(s) + "</b>:<i>" + pad(ff) + "</i>"; };
      el.innerHTML = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: "none", onUpdate: () => (el.innerHTML = fmt(p.v)), ...IR }, t);
    },

    /* ---------------- object verbs ---------------- */
    // rise: a card comes up 50px and fades in (cards, inputs, thumbnails)
    rise(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.36, ease: "power3.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // print: a photo / frame lands like a print on the table (scale 1.08 → 1, fast)
    print(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, duration: 0.14, ease: "power2.in" }, t); },
    // flip: a counter tile changes digit: the old one rises out, the new one rises in
    flip(tl, tile, digits, times) {
      const el = $(tile); el.innerHTML = digits.map((d) => "<span>" + d + "</span>").join("");
      const ss = Array.from(el.children);
      ss.forEach((s, i) => tl.set(s, { yPercent: i === 0 ? 0 : 100 }, 0));
      times.forEach((tt, k) => { tl.to(ss[k], { yPercent: -100, duration: 0.22, ease: "power2.in" }, tt); tl.fromTo(ss[k + 1], { yPercent: 100 }, { yPercent: 0, duration: 0.26, ease: "power2.out", ...IR }, tt + 0.06); });
    },
    // count: a number rolls to the payoff (ends ON the payoff word, holds ≥0.8 s)
    count(tl, sel, from, to, t, dur = 0.7, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    // strike: a line draws through a word that stops being true
    strike(tl, sel, t) { ft(tl, sel, { "--s": 0 }, { "--s": 1, duration: 0.25, ease: "power2.out" }, t); },
    // press: a button / tile is pressed
    // angle: a hard cut to a closer framing (the anchor cuts between camera angles every few seconds; with one camera
    // it is a 1.12–1.2× punch on the footage + matte, set instantly on a word). angle(tl, t, 1) cuts back.
    angle(tl, t, scale = 1.15, origin = [540, 760], o = {}) {
      const vids = $$(o.videos || ["#faceVid", "#matteVid"]).filter(Boolean);
      vids.forEach((v) => { tl.set(v, { transformOrigin: origin[0] + "px " + origin[1] + "px" }, 0); tl.set(v, { scale }, t); });
    },
    press(tl, sel, t) { tl.fromTo(sel, { scale: 1 }, { scale: 0.86, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, t); },
    pulse(tl, sel, t, s = 1.06) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    // film: sprocket edges on both sides for a flashback / history beat
    film(tl, a, b, sel = ".e-film") { tl.set(sel, { opacity: 0 }, 0); tl.set(sel, { opacity: 1 }, a); tl.fromTo(sel, { backgroundPositionY: "0px" }, { backgroundPositionY: "-620px", duration: b - a, ease: "none", ...IR }, a); tl.set(sel, { opacity: 0 }, b); },
  };
  window.EDITORIAL = E;
})();
