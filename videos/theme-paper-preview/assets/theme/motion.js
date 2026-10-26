/* paper theme: art + seek-safe motion verbs. window.PAPER
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const NS = "http://www.w3.org/2000/svg";
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };

  /* ---------------- art (brand-free, drawn for this theme) ---------------- */
  const ART = {
    // blue folder: back panel with tab, a sheet, front flap (class "front" so it can open)
    folder: '<svg viewBox="0 0 240 200"><path d="M14 30 Q14 18 26 18 H92 Q100 18 105 26 L113 38 H214 Q226 38 226 50 V176 Q226 188 214 188 H26 Q14 188 14 176 Z" fill="#4aa9db"/>' +
      '<rect class="sheet" x="34" y="34" width="172" height="120" rx="6" fill="#fbf8f2"/><rect x="34" y="34" width="172" height="120" rx="6" fill="none" stroke="#e6dfd2" stroke-width="2"/>' +
      '<g class="front" style="transform-origin:120px 188px"><path d="M10 66 Q10 56 20 56 H220 Q230 56 230 66 L224 178 Q223 188 213 188 H27 Q17 188 16 178 Z" fill="#6fcbf6"/><path d="M12 64 H228" stroke="#a9e2fb" stroke-width="4" stroke-linecap="round"/></g></svg>',
    // generic AI sparkle (four-point star + small star), white on the orange tile
    spark: '<svg viewBox="0 0 100 100"><path d="M46 10 C49 36 56 44 82 47 C56 50 49 58 46 84 C43 58 36 50 10 47 C36 44 43 36 46 10 Z" fill="#fff"/><path d="M78 12 C79 21 81 23 90 24 C81 25 79 27 78 36 C77 27 75 25 66 24 C75 23 77 21 78 12 Z" fill="#fff" opacity=".85"/></svg>',
    sparkOrange: '<svg viewBox="0 0 100 100"><path d="M46 10 C49 36 56 44 82 47 C56 50 49 58 46 84 C43 58 36 50 10 47 C36 44 43 36 46 10 Z" fill="#c65a3c"/><path d="M78 12 C79 21 81 23 90 24 C81 25 79 27 78 36 C77 27 75 25 66 24 C75 23 77 21 78 12 Z" fill="#c65a3c" opacity=".8"/></svg>',
    // line-art laptop (screen area 40..280 x 20..170 is where content goes)
    laptop: '<svg viewBox="0 0 320 240"><rect x="34" y="12" width="252" height="168" rx="12" fill="#f4efe6" stroke="#2a241b" stroke-width="5"/><rect x="48" y="26" width="224" height="140" rx="4" fill="#fff" stroke="#2a241b" stroke-width="2.5"/>' +
      '<path d="M8 196 H312 L296 226 Q292 232 284 232 H36 Q28 232 24 226 Z" fill="#f4efe6" stroke="#2a241b" stroke-width="5" stroke-linejoin="round"/><path d="M130 196 H190" stroke="#2a241b" stroke-width="4" stroke-linecap="round"/></svg>',
    // line-art phone
    phone: '<svg viewBox="0 0 140 260"><rect x="6" y="6" width="128" height="248" rx="22" fill="#f4efe6" stroke="#2a241b" stroke-width="5"/><rect x="16" y="20" width="108" height="220" rx="12" fill="#fff" stroke="#2a241b" stroke-width="2"/><rect x="52" y="12" width="36" height="7" rx="3.5" fill="#2a241b"/></svg>',
    // line-art document
    doc: '<svg viewBox="0 0 180 230"><path d="M10 14 Q10 6 18 6 H120 L170 56 V214 Q170 222 162 222 H18 Q10 222 10 214 Z" fill="#fff" stroke="#2a241b" stroke-width="5" stroke-linejoin="round"/><path d="M120 6 V48 Q120 56 128 56 H170" fill="#f4efe6" stroke="#2a241b" stroke-width="5" stroke-linejoin="round"/></svg>',
    // swatch fan: 7 cards on one pivot (class "sw" each, rotated by PAPER.fanOpen)
    fan: '<svg viewBox="0 0 320 300">' + ["#c65a3c", "#e39a4f", "#f2c95b", "#9cc56a", "#5fb2c9", "#6f7fd1", "#a36cc2"].map((c, i) =>
      '<g class="sw" style="transform-origin:70px 250px"><rect x="52" y="40" width="44" height="220" rx="10" fill="' + c + '" stroke="#2a241b" stroke-width="4"/><rect x="58" y="214" width="32" height="32" rx="6" fill="#fff" opacity=".85"/></g>').join("") +
      '<circle cx="74" cy="240" r="9" fill="#fff" stroke="#2a241b" stroke-width="4"/></svg>',
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#fff" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M5 12h13M12 5l7 7-7 7" fill="none" stroke="#c65a3c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const P = {
    ART,
    _layouts: [],

    /* put art into an element: P.art("#f1", "folder") */
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* ---------------- layouts: "face" | "split" | "paper" ----------------
       o.flash: a 0.14s paper-white veil (the anchor uses it when the paper takes the full frame)
       o.shift: how far the footage moves down in split so the face sits in the bottom half (px)          */
    layout(tl, mode, t, o = {}) {
      const stage = $(o.stage || "#stage"), vid = $(o.video || "#face video"), shift = o.shift != null ? o.shift : 470;
      const st = { face: { clipPath: "inset(0px 0px 1920px 0px)" }, split: { clipPath: "inset(0px 0px 960px 0px)" }, paper: { clipPath: "inset(0px 0px 0px 0px)" } }[mode];
      const vv = { face: { y: 0, scale: 1 }, split: { y: shift, scale: o.splitScale || 1 }, paper: { y: shift, scale: 1 } }[mode];
      if (!P._layouts.length) { tl.set(stage, st, 0); tl.set(vid, vv, 0); }
      else { tl.set(stage, st, t); tl.set(vid, vv, t); }
      if (o.seam !== false && $(o.seamEl || "#seam")) { const sm = $(o.seamEl || "#seam"); if (!P._layouts.length) tl.set(sm, { opacity: mode === "split" ? 1 : 0 }, 0); else tl.set(sm, { opacity: mode === "split" ? 1 : 0 }, t); }
      P._layouts.push([t, mode]);
      if (o.flash) ft(tl, o.flashEl || "#flash", { opacity: 0 }, { keyframes: [{ opacity: 0.9, duration: 0.05 }, { opacity: 0, duration: 0.12 }] }, t - 0.05);
    },
    modeAt(t) { let m = "face"; P._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },

    /* scenes: only one paper composition visible; show(sel, from, to) */
    // (a scene that starts at 0 is simply visible; never hide and show at the same instant - the renderer drops it)
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: 1-3 words, hard swap; vertical position follows the layout at that moment */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.3, until = o.until || Infinity, box = $(sel);
      const y = { split: o.ySplit || 908, face: o.yFace || 1190, paper: o.yPaper || 1190 };
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.4);
        const el = document.createElement("div"); el.className = "p-cap"; el.textContent = g.map((w) => w.text.replace(/[.,:;]$/, "")).join(" ");
        el.style.top = (o.yAt ? o.yAt(a) : y[P.modeAt(a)]) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
      });
    },

    /* hook: lines rise in fast; hard cut at tEnd */
    hook(tl, sel, t, tEnd) { ft(tl, sel, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, t); tl.set(sel, { opacity: 0 }, tEnd); },

    /* ---------------- verbs (language.md §6) ---------------- */
    // pop: an object/card arrives with a small overshoot
    pop(tl, sels, t, step = 0.12, o = {}) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: o.from || 0.6, y: o.y || 0 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.7)" }, (Array.isArray(t) ? t[i] : t + i * step))); },
    // rise: a card lifts in from below (cards over the face, cards on paper)
    rise(tl, sel, t) { ft(tl, sel, { opacity: 0, y: 70, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }, t); },
    // out: anything leaves (fast)
    out(tl, sel, t) { tl.to(sel, { opacity: 0, scale: 0.9, duration: 0.18, ease: "power2.in" }, t); },
    // park: the hero object shrinks and moves to make room for what comes next
    park(tl, sel, t, to) { tl.to(sel, { ...to, duration: 0.45, ease: "power3.inOut" }, t); },
    // label: appears orange (active), turns ink when the next one becomes active
    label(tl, sel, t, settle) { const e = $(sel); ft(tl, e, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, t); tl.set(e, { color: "#c65a3c" }, 0); if (settle != null) tl.set(e, { color: "#221c12" }, settle); },
    // ink paths: draw a solid path (tree line, strike, arrow) along its length
    draw(tl, sel, t, dur = 0.3, ease = "power2.inOut") { $$(sel).forEach((p) => { const L = p.getTotalLength(); ft(tl, p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, t); }); },
    // dotted connector: drawn through a mask so the dots stay dots
    dotted(svgSel, d, id) {
      const svg = $(svgSel);
      svg.insertAdjacentHTML("beforeend", '<defs><mask id="m-' + id + '" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path id="mp-' + id + '" d="' + d + '" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/></mask></defs><path class="dots" d="' + d + '" mask="url(#m-' + id + ')"/>');
      return "#mp-" + id;
    },
    connect(tl, svgSel, d, id, t, dur = 0.45) { const m = P.dotted(svgSel, d, id); P.draw(tl, m, t, dur, "power1.inOut"); },
    // branch: tree lines draw, then children slide out of the parent along them
    branch(tl, lineSel, kids, from, t, step = 0.13) {
      P.draw(tl, lineSel, t, 0.25, "power1.out");
      $$(kids).forEach((k, i) => ft(tl, k, { opacity: 0, x: from[0], y: from[1], scale: 0.5 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.34, ease: "power3.out" }, t + 0.15 + i * step));
    },
    // drop: an item falls into a folder; the folder's front flap dips and the folder bumps
    drop(tl, itemSel, folderSel, t, from = [0, -220]) {
      ft(tl, itemSel, { opacity: 0, x: from[0], y: from[1], rotation: -8 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.42, ease: "power2.in" }, t);
      const f = $(folderSel), front = f.querySelector(".front");
      if (front) tl.fromTo(front, { scaleY: 1 }, { scaleY: 0.82, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t + 0.3);
      tl.fromTo(f, { scale: 1 }, { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t + 0.42);
    },
    // tag: a dotted leader draws to the part, then the orange pill pops
    tag(tl, tagSel, svgSel, d, id, t) { P.connect(tl, svgSel, d, id, t, 0.3); P.pop(tl, tagSel, t + 0.18); },
    // lift: a card comes out of a screen toward the viewer
    lift(tl, sel, t, from = { scale: 0.45, y: 90 }) { ft(tl, sel, { opacity: 0, ...from }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.5, ease: "power3.out" }, t); },
    // cycle: a set of items shows one at a time at the given times
    cycle(tl, sels, times) { const es = $$(sels); es.forEach((e, i) => { tl.set(e, { opacity: i === 0 ? 1 : 0 }, 0); if (i > 0) { tl.set(es[i - 1], { opacity: 0 }, times[i]); tl.set(e, { opacity: 1 }, times[i]); } }); },
    // type: text appears letter by letter (cps = characters per second); el gets a caret while typing
    type(tl, sel, text, t, cps = 14) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    // highlight: the yellow box behind a fill-in part appears (left to right in LTR text)
    highlight(tl, sels, t, step = 0.15) { $$(sels).forEach((e, i) => { tl.set(e, { backgroundColor: "rgba(251,227,138,0)" }, 0); tl.to(e, { backgroundColor: "rgba(251,227,138,1)", duration: 0.2 }, t + i * step); }); },
    // cursor: path [[x,y,t],...] in the parent's px, clicks squash
    cursor(tl, sel, pts, clicks = [], o = {}) {
      if (o.init !== false) tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    // fan: the swatch fan opens (each card rotates out from the pivot)
    fanOpen(tl, sel, t, spread = 80) { const sw = $$(sel + " .sw"), n = sw.length; sw.forEach((g, i) => ft(tl, g, { rotation: 0 }, { rotation: -spread / 2 + (spread * i) / (n - 1) + 30, duration: 0.5, ease: "back.out(1.4)" }, t + i * 0.04)); },
    // fit: set a text block's font size so its longest line spans `share` of `width` (deterministic, run at build)
    fit(sel, share = 0.8, width = 1080, min = 48, max = 140) {
      const el = $(sel); let fs = max; el.style.fontSize = fs + "px";
      const longest = () => { let w = 0; const lines = el.textContent.split("\n");
        const probe = document.createElement("span"); probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:inherit;letter-spacing:inherit"; el.appendChild(probe);
        lines.forEach((l) => { probe.textContent = l; w = Math.max(w, probe.getBoundingClientRect().width); }); probe.remove(); return w; };
      while (fs > min && longest() > share * width) { fs -= 2; el.style.fontSize = fs + "px"; }
      while (fs < max && longest() < share * width - 20) { fs += 2; el.style.fontSize = fs + "px"; }
      return fs;
    },
    // emphasize: a quick pulse on the thing the voice stresses
    pulse(tl, sel, t) { tl.fromTo(sel, { scale: 1 }, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    // CTA: the comment pill drops in, then the word is typed into it
    cta(tl, sel, word, t) {
      const box = $(sel), ph = box.querySelector(".ph"), w = box.querySelector(".word");
      ft(tl, box, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.25, ease: "back.out(1.6)" }, t);
      tl.set(ph, { opacity: 1 }, 0); tl.set(ph, { opacity: 0 }, t + 0.5);
      return P.type(tl, w, word, t + 0.5, 12);
    },
  };
  window.PAPER = P;
})();
