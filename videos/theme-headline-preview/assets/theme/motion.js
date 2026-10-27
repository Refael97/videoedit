/* headline theme: seek-safe motion verbs. window.HEADLINE
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const at = (t, i, step) => (Array.isArray(t) ? t[i] : t + i * step);

  const ART = {
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#fff" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="4.5" y="11" width="15" height="10" rx="2" fill="currentColor"/></svg>',
  };

  // split text nodes of an element into .w spans (once); returns the spans
  const words = (el) => {
    el = $(el);
    if (!el.dataset.split) {
      el.dataset.split = "1";
      const walk = (node) => Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(p)); else { const s = document.createElement("span"); s.className = "w"; s.textContent = p; f.appendChild(s); } }); c.replaceWith(f); }
        else if (c.nodeType === 1 && !c.classList.contains("w")) walk(c);
      });
      walk(el);
    }
    return Array.from(el.querySelectorAll(".w"));
  };

  const H = {
    ART,
    _layouts: [],
    words,
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* ---------------- layouts: "split" | "face" | "dark" | "page" ----------------
       split = graphics float on the bright wall above the speaker (default); o.drop moves the footage down when the
               head sits too high (the head top should be at ~55% of the frame), the air veil lifts the wall
       face  = the full face, a closer "second camera" (scale o.faceScale, default 1.18) — CTA, emotion
       dark  = a cut to a screen: navy, a glowing window, white captions; no speaker
       page  = the white page with a section header; no speaker                                                      */
    layout(tl, mode, t, o = {}) {
      const vid = $(o.video || "#face video"), air = $(o.air || "#air"), dark = $(o.dark || "#dark"), page = $(o.page || "#page");
      if (o.drop != null) H._drop = o.drop; if (o.faceScale != null) H._fs = o.faceScale;
      const drop = H._drop || 0, fs = H._fs || 1.18;
      const a = H._layouts.length ? t : 0;
      tl.set(vid, mode === "face" ? { y: 0, scale: fs, transformOrigin: "50% 30%" } : { y: drop, scale: 1, transformOrigin: "50% 0%" }, a);
      if (air) tl.set(air, { opacity: mode === "split" ? 1 : 0 }, a);
      if (dark) tl.set(dark, { opacity: mode === "dark" ? 1 : 0 }, a);
      if (page) tl.set(page, { opacity: mode === "page" ? 1 : 0 }, a);
      H._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "split"; H._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: up to 3 words build up karaoke-style, each word blurs in on its start; the group clears on the next.
       word.em = true → blue serif accent. Ink on light, white on dark / face. */
    captions(tl, sel, ws, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.35, until = o.until || Infinity, box = $(sel);
      const y = { split: o.ySplit || 1005, face: o.yFace || 1390, dark: o.yDark || 1420, page: o.yPage || 1420 };
      const groups = []; let cur = [];
      ws.forEach((w, i) => { cur.push(w); const n = ws[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.5);
        const m = H.modeAt(a), el = document.createElement("div");
        el.className = "h-cap" + (m === "split" || m === "page" ? "" : " light");
        g.forEach((w) => { const s = document.createElement("span"); if (w.em) s.className = "h-acc"; if (w.em && /^[A-Za-z0-9]/.test(w.text)) s.dir = "ltr"; s.textContent = w.text.replace(/[.,:;]$/, ""); el.appendChild(s); });
        el.style.top = (o.yAt ? o.yAt(a) : y[m]) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
        Array.from(el.children).forEach((s, k) => H.blurIn(tl, s, Math.max(a, g[k].start - 0.04), 0, 0.2));
      });
    },

    /* ---------------- verbs (language.md §6) ---------------- */
    // blurIn: the signature entrance — from blurred and faint to sharp (words, windows, cards)
    blurIn(tl, sels, t, step = 0.1, dur = 0.28) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, filter: "blur(12px)" }, { opacity: 1, filter: "blur(0px)", duration: dur, ease: "power2.out" }, at(t, i, step))); },
    // title: the sans words blur in one by one (0.1 s apart); returns the end time
    title(tl, sel, t, step = 0.1) { const ws = words(sel); H.blurIn(tl, ws, t, step); return t + ws.length * step; },
    // box: the blue box grows from a square to its width, then its serif words blur in
    box(tl, sel, t, step = 0.12) {
      const el = $(sel), ws = words(el);
      ft(tl, el, { scaleX: 0.08, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.05 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }] }, t);
      H.blurIn(tl, ws, t + 0.25, step);
      return t + 0.25 + ws.length * step;
    },
    // headline: title then box, the anchor's opening move
    headline(tl, titleSel, boxSel, t) { const e = H.title(tl, titleSel, t); return H.box(tl, boxSel, e + 0.05); },
    // win: a window / photo / stat card arrives (blur + slight scale)
    win(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.96, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.32, ease: "power2.out" }, at(t, i, step))); },
    // swap: the next screenshot replaces the current one in place
    swap(tl, outSel, inSel, t) { tl.to(outSel, { opacity: 0, filter: "blur(10px)", duration: 0.18, ease: "power2.in" }, t); H.win(tl, inSel, t + 0.1); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, filter: "blur(10px)", duration: 0.2, ease: "power2.in" }, t); },
    // streak: a light runs along a window's top edge (sel = .h-streak placed on the edge; dx = travel)
    streak(tl, sel, t, dx = 700, dur = 0.9) { ft(tl, sel, { x: 0, opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.1 }, { x: dx, duration: dur - 0.2, ease: "power1.inOut" }, { opacity: 0, duration: 0.1 }] }, t); },
    // place: put an overlay (ring) around a target element, measured at build time (call after fonts are ready)
    place(sel, targetSel, pad = 10) {
      const el = $(sel), tg = $(targetSel), root = el.offsetParent.getBoundingClientRect(), r = tg.getBoundingClientRect();
      Object.assign(el.style, { left: r.left - root.left - pad + "px", top: r.top - root.top - pad + "px", width: r.width + 2 * pad + "px", height: r.height + 2 * pad + "px" });
    },
    // ring: a focus ring lands on the element being talked about
    ring(tl, sel, t) { ft(tl, sel, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1, duration: 0.25, ease: "power3.out" }, t); },
    // dim: the window behind goes grey so a stat card can sit on it
    dim(tl, sel, t) { ft(tl, sel, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t); },
    // select: a text selection sweeps over a real phrase (like dragging the mouse)
    select(tl, sels, t, step = 0.2) { $$(sels).forEach((e, i) => ft(tl, e, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.3, ease: "power1.inOut" }, at(t, i, step))); },
    // count: digits roll to the payoff; ends ON the payoff word; hold ≥0.8 s
    count(tl, sel, from, to, t, dur = 1.2, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    // type: letters appear (terminal input, a prompt, a comment)
    type(tl, sel, text, t, cps = 20) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    // section: "Title" blurs in, a blue caret blinks, then becomes the box with the serif word
    section(tl, titleSel, caretSel, boxSel, t) {
      const e = H.title(tl, titleSel, t);
      ft(tl, caretSel, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.02 }, { opacity: 1, duration: 0.25 }, { opacity: 0, duration: 0.02 }] }, e);
      return H.box(tl, boxSel, e + 0.27);
    },
    // cursor: path [[x,y,t],...], clicks squash
    cursor(tl, sel, pts, clicks = [], o = {}) {
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    pulse(tl, sel, t, s = 1.06) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    // cta: the serif lead blurs in, the keyword lands big with its glow
    cta(tl, leadSel, kwSel, t) { H.blurIn(tl, words(leadSel), t, 0.1); ft(tl, kwSel, { opacity: 0, scale: 1.35, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.35, ease: "back.out(1.6)" }, t + 0.3); },
  };
  window.HEADLINE = H;
})();
