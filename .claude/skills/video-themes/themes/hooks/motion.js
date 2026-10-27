/* hooks theme: art + seek-safe motion verbs. window.HOOKS
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const at = (t, i, step) => (Array.isArray(t) ? t[i] : t + i * step);
  const ft = (tl, sel, from, to, t) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, t); };

  /* ---------------- art (brand-free, drawn for this theme) ---------------- */
  const ART = {
    eye: '<svg viewBox="0 0 24 24"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12z" fill="#fff"/><circle cx="12" cy="12" r="4.2" fill="#1a1a1e"/><circle cx="13.4" cy="10.6" r="1.4" fill="#fff"/></svg>',
    play: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="#fff" stroke-width="2.2"/><path d="M10 8.2v7.6l6-3.8z" fill="#fff"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-8-4.9-8-10.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.5c0 5.7-8 10.6-8 10.6z" fill="#fff"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="#fff"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M3 11.5 21 3l-6.5 18-3.2-7.3z" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#fff" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  };

  const H = {
    ART,
    _layouts: [],
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* ---------------- layouts: "face" | "void" | "cut" ----------------
       face = the room, full frame (default; this theme never boxes the speaker)
       void = black with amber corners: UI, tiles, pills, timelines (every explanation that needs room)
       cut  = an example video full frame, with its title strip and view pill
       o.zoom: a jump-cut punch on the footage (1.0 / 1.15–1.25) — the anchor's "second angle"            */
    layout(tl, mode, t, o = {}) {
      const v = $(o.void || "#void"), c = $(o.cut || "#cut"), vid = $(o.video || "#room video");
      const first = !H._layouts.length, tt = first ? 0 : t;
      if (v) tl.set(v, { opacity: mode === "void" ? 1 : 0 }, tt);
      if (c) tl.set(c, { opacity: mode === "cut" ? 1 : 0 }, tt);
      if (vid) tl.set(vid, { scale: o.zoom || 1 }, tt);
      H._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "face"; H._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: 1–4 words, hard swap, at 62%. o.mute = [[a,b],...] ranges where a glow title / template line speaks instead */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.3, box = $(sel), mute = o.mute || [];
      const muted = (t) => mute.some(([a, b]) => t >= a - 1e-6 && t < b);
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (muted(a)) return;
        const nx = groups[i + 1]; let b = nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.4;
        mute.forEach(([ma]) => { if (ma > a && ma < b) b = ma; });
        const el = document.createElement("div"); el.className = "h-cap"; el.textContent = g.map((w) => w.text.replace(/[.,:;]$/, "")).join(" ");
        el.style.top = (o.yAt ? o.yAt(a) : o.y || 1192) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
      });
    },

    /* fit: the glow word spans `share` of the width (deterministic, at build) */
    fit(sel, share = 0.66, width = 1080, min = 120, max = 230) {
      $$(sel).forEach((el) => {
        let fs = max; el.style.fontSize = fs + "px";
        while (fs > min && el.getBoundingClientRect().width > share * width) { fs -= 2; el.style.fontSize = fs + "px"; }
        while (fs < max && el.getBoundingClientRect().width < share * width - 16) { fs += 2; el.style.fontSize = fs + "px"; }
      });
    },

    /* ---------------- verbs (language.md §6) ---------------- */
    // glow: a glow title ignites on the chest — the lead line first (tLead), the glow word on its spoken word (tWord); hard off at tEnd
    glow(tl, sel, tLead, tWord, tEnd) {
      const el = $(sel), lead = el.querySelector(".lead"), w = el.querySelector(".glw, .neo"), sub = el.querySelector(".sub");
      tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, Math.min(tLead, tWord));
      if (lead) ft(tl, lead, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, tLead);
      // (never tween `filter` here: it would wipe the drop-shadow glow; the ignition is an opacity flicker + a small scale)
      if (w) ft(tl, w, { opacity: 0, scale: 0.94 }, { keyframes: [{ opacity: 0.55, scale: 0.98, duration: 0.06 }, { opacity: 0.3, duration: 0.04 }, { opacity: 1, scale: 1, duration: 0.12, ease: "power2.out" }] }, tWord);
      if (sub) ft(tl, sub, { opacity: 0 }, { opacity: 1, duration: 0.15 }, tWord + 0.25);
      if (tEnd != null) tl.set(el, { opacity: 0 }, tEnd);
    },
    // chip: the numbered chip slides in (RTL: from the right) and settles
    chip(tl, sels, t, step = 0.15) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, at(t, i, step))); },
    // hand: the template line appears word by word on the spoken words (times[i]); [slots] flash as they land
    hand(tl, sel, times) {
      const ws = $$(sel + " .w");
      ws.forEach((w, i) => { ft(tl, w, { opacity: 0 }, { opacity: 1, duration: 0.06 }, times[i]); if (w.classList.contains("slot")) tl.fromTo(w, { scale: 1.25 }, { scale: 1, duration: 0.25, ease: "back.out(2)", ...IR }, times[i]); });
    },
    // views: the view pill pops in, then a glint sweeps across it
    views(tl, sel, t, glint = 0.4) {
      const el = $(sel), sh = el.querySelector(".shine");
      ft(tl, el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2)" }, t);
      if (sh) { tl.set(sh, { x: 0 }, 0); tl.fromTo(sh, { x: 0 }, { x: 900, duration: 0.45, ease: "power1.inOut", ...IR }, t + glint); }
    },
    // tile: a gold tile pops, then pushes in slowly for the rest of its life (dur)
    tile(tl, sel, t, dur = 2.4, to = 1.25) {
      ft(tl, sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.8)" }, t);
      tl.to(sel, { scale: to, duration: Math.max(0.1, dur - 0.3), ease: "none" }, t + 0.3);
    },
    // pop: small things (pills, icons, thumbnails) arrive with a light overshoot
    pop(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, at(t, i, step))); },
    // rise: a screen / card lifts in
    rise(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }, at(t, i, step))); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, duration: 0.12, ease: "power2.in" }, t); },
    // toggle: a settings switch flips on (knob moves, track turns green)
    toggle(tl, sel, t) { const el = $(sel), k = el.querySelector("i"); tl.set(k, { x: 0 }, 0); tl.to(k, { x: 48, duration: 0.16, ease: "power2.out" }, t); H.swapClass(tl, el, t + 0.06, "on"); },
    // select: a row gets the selected state
    select(tl, sel, t) { H.swapClass(tl, sel, t, "sel"); H.pulse(tl, sel, t, 1.03); },
    // bar: the timeline fill grows to a share
    bar(tl, sel, t, share, dur = 0.5) { const f = $(sel); tl.set(f, { scaleX: 0 }, 0); tl.to(f, { scaleX: share, duration: dur, ease: "power2.out" }, t); },
    // count: a number rolls, landing on the payoff word
    count(tl, sel, from, to, t, dur = 0.8, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    type(tl, sel, text, t, cps = 16) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    cursor(tl, sel, pts, clicks = [], o = {}) {
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    pulse(tl, sel, t, s = 1.08) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    swapClass(tl, sel, t, add, remove) {
      $$(sel).forEach((el) => { const cls = el.getAttribute("class"); let n = cls; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n += " " + add; tl.set(el, { attr: { class: cls } }, 0); tl.set(el, { attr: { class: n } }, t); });
    },
  };
  window.HOOKS = H;
})();
