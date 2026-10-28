/* board theme: art + seek-safe motion verbs. window.BOARD
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const at = (t, i, step) => (Array.isArray(t) ? t[i] : t + i * step);

  /* ---------------- pixel art (drawn for this theme, brand-free) ----------------
     grids of characters → crisp svg rects. c coral, d dark coral, k ink, w white, g green, y hazard, . empty */
  const PAL = { c: "#e46c56", d: "#b9493a", k: "#1d1a17", w: "#ffffff", g: "#3c9c6c", y: "#eaae36", p: "#f7d6cc" };
  const pix = (rows, u = 10) => {
    const h = rows.length, w = rows[0].length; let r = "";
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (PAL[ch]) r += `<rect x="${x * u}" y="${y * u}" width="${u}" height="${u}" fill="${PAL[ch]}"/>`; }));
    return `<svg viewBox="0 0 ${w * u} ${h * u}" shape-rendering="crispEdges">${r}</svg>`;
  };
  // the mascot "Pinch": a pixel crab, claws up, eyes on stalks (two frames: claws up / claws open)
  const CRAB_A = [
    "cc...........cc",
    "ccc..k...k..ccc",
    ".cc..w...w..cc.",
    "..c..k...k..c..",
    "..cc.c...c.cc..",
    "...ccccccccc...",
    "..ccccccccccc..",
    "..cdcccccccdc..",
    "..ccccccccccc..",
    ".c.c.c...c.c.c.",
    "c..c.c...c.c..c",
  ];
  const CRAB_B = [
    "c.c.........c.c",
    "cc...k...k...cc",
    ".cc..w...w..cc.",
    "..c..k...k..c..",
    "..cc.c...c.cc..",
    "...ccccccccc...",
    "..ccccccccccc..",
    "..cdcccccccdc..",
    "..ccccccccccc..",
    ".c.c.c...c.c.c.",
    ".c..c.....c..c.",
  ];
  const ART = {
    crab: pix(CRAB_A),
    crabPair: '<div class="fa">' + pix(CRAB_A) + '</div><div class="fb" style="position:absolute;inset:0;opacity:0">' + pix(CRAB_B) + "</div>",
    check: pix(["......g", ".....gg", "g...gg.", "gg.gg..", ".ggg...", "..g...."]),
    ask: pix([".ccc.", "c...c", "...c.", "..c..", ".....", "..c.."]),
    bang: pix([".c.", ".c.", ".c.", ".c.", "...", ".c."]),
    heart: pix([".cc.cc.", "ccccccc", "ccccccc", ".ccccc.", "..ccc..", "...c..."]),
    star: pix(["...y...", "..yyy..", "yyyyyyy", ".yyyyy.", ".yy.yy.", "y.....y"]),
    lock: '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="4.5" y="11" width="15" height="10" rx="2" fill="currentColor"/></svg>',
    tick: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#3c9c6c"/><path d="M6.5 12.5l3.6 3.6 7.4-7.6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cross: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#e46c56"/><path d="M8 8l8 8M16 8l-8 8" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/></svg>',
    spin: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="rgba(29,26,23,.15)" stroke-width="3"/><path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#e46c56" stroke-width="3" stroke-linecap="round"/></svg>',
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#fff" stroke="#1d1a17" stroke-width="3" stroke-linejoin="round"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const B = {
    ART, pix,
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* scenes: one board composition visible at a time (a scene that starts at 0 is simply visible) */
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },
    // swapClass: seek-safe class change
    swapClass(tl, sel, t, add, remove) {
      $$(sel).forEach((el) => { const cls = el.getAttribute("class") || ""; let n = cls; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n = (n + " " + add).trim(); tl.set(el, { attr: { class: cls } }, 0); tl.set(el, { attr: { class: n } }, t); });
    },
    // dark: the dark section ("the catch") on/off; root gets .b-dark-on so captions/header turn light
    dark(tl, a, b, o = {}) {
      const d = $(o.el || "#dark"), root = $(o.root || "#root");
      tl.set(d, { opacity: 0 }, 0); tl.set(d, { opacity: 1 }, a); if (b != null) tl.set(d, { opacity: 0 }, b);
      const cls = root.getAttribute("class"); tl.set(root, { attr: { class: cls } }, 0); tl.set(root, { attr: { class: cls + " b-dark-on" } }, a); if (b != null) tl.set(root, { attr: { class: cls } }, b);
      const hz = d.querySelector(".b-hazard"); if (hz) ft(tl, hz, { xPercent: 12, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, a + 0.05);
    },

    /* captions: 1-4 words per line, the spoken word in the coral pill (karaoke). */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.35, until = o.until || Infinity, box = $(sel), y = o.y || 1413;
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, gi) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[gi + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.5);
        const el = document.createElement("div"); el.className = "b-cap"; el.style.top = (o.yAt ? o.yAt(a) : y) + "px";
        const spans = g.map((w) => { const s = document.createElement("span"); s.textContent = w.text; el.appendChild(s); return s; });
        box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
        g.forEach((w, k) => { const off = k < g.length - 1 ? g[k + 1].start : b; tl.set(spans[k], { attr: { class: "" } }, 0); tl.set(spans[k], { attr: { class: "on" } }, w.start); tl.set(spans[k], { attr: { class: "" } }, off); });
      });
    },
    /* variant "line" (31455): one sentence at the top; each word goes grey → ink on its time; the key word (k) gets the selection box */
    line(tl, sel, words, a, b, keyIndex = -1) {
      const el = $(sel); el.innerHTML = "";
      words.forEach((w, i) => { const s = document.createElement("span"); s.textContent = w.text + (i < words.length - 1 ? " " : ""); el.appendChild(s);
        if (i === keyIndex) { s.classList.add("b-sel"); }
        tl.set(s, { attr: { class: i === keyIndex ? "b-sel" : "" } }, 0); tl.set(s, { attr: { class: (i === keyIndex ? "b-sel " : "") + "said" } }, w.start); });
      tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); if (b != null) tl.set(el, { opacity: 0 }, b);
      if (keyIndex >= 0) { const k = el.children[keyIndex]; ft(tl, k, { scale: 0.8 }, { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, words[keyIndex].start); }
    },

    /* title: words drop in one by one (0.1 s apart); the serif accent word lands last with a small overshoot */
    title(tl, sel, t, step = 0.1) {
      const el = $(sel);
      if (!el.dataset.split) {
        el.dataset.split = "1";
        const walk = (node) => Array.from(node.childNodes).forEach((c) => {
          if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement("span"); s.className = "w"; s.textContent = p; frag.appendChild(s); } }); c.replaceWith(frag); }
          else if (c.nodeType === 1 && (c.tagName === "EM" || c.classList.contains("s") || c.classList.contains("sub"))) c.classList.add("w");
          else if (c.nodeType === 1) walk(c);
        });
        walk(el);
      }
      const ws = Array.from(el.querySelectorAll(".w")).filter((w) => !w.parentElement.closest(".w"));
      ws.forEach((w, i) => { const isEm = w.tagName === "EM"; ft(tl, w, { opacity: 0, y: 30, scale: isEm ? 0.85 : 1 }, { opacity: 1, y: 0, scale: 1, duration: isEm ? 0.32 : 0.22, ease: isEm ? "back.out(2.2)" : "power3.out" }, at(t, i, step)); });
      return ws.length;
    },

    /* ---------------- verbs (language.md §6) ---------------- */
    // drop: a card lands on the board (from 70px above, overshoot), its hard shadow "lands" with it
    drop(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, y: -70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: "back.out(1.6)" }, at(t, i, step))); },
    // rise: a small thing pops up (tags, tiles, rows)
    pop(tl, sels, t, step = 0.08) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, at(t, i, step))); },
    rows(tl, sels, t, step = 0.14) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.24, ease: "power3.out" }, at(t, i, step))); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, y: -20, duration: 0.18, ease: "power2.in" }, t); },
    // press: a button / card is pressed (moves into its shadow)
    press(tl, sel, t) { tl.fromTo(sel, { x: 0, y: 0 }, { x: 6, y: 6, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, t); },
    // icon: an icon element switches (spinner → tick); both live in the slot, seek-safe
    swap(tl, fromSel, toSel, t) { tl.set(toSel, { opacity: 0 }, 0); tl.set(fromSel, { opacity: 1 }, 0); tl.set(fromSel, { opacity: 0 }, t); ft(tl, toSel, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(3)" }, t); },
    // spin: a loading spinner turns while waiting
    spin(tl, sel, a, b) { tl.fromTo(sel, { rotation: 0 }, { rotation: 360 * Math.max(1, Math.round((b - a) / 0.6)), duration: b - a, ease: "none", ...IR }, a); },
    // type: letters appear
    type(tl, sel, text, t, cps = 16) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    // say: a quote's words appear in time with the voice (words = [{text,start}]), building the sentence
    say(tl, sel, words) {
      const el = $(sel); el.innerHTML = "";
      words.forEach((w, i) => { const s = document.createElement("span"); s.textContent = w.text + (i < words.length - 1 ? " " : ""); el.appendChild(s); ft(tl, s, { opacity: 0 }, { opacity: 1, duration: 0.12 }, w.start); });
    },
    // count: digits roll to the payoff
    count(tl, sel, from, to, t, dur = 0.8, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    // ring: the coral arc fills to `share` (0..1) around the ring counter
    ring(tl, arcSel, t, share = 1, dur = 0.8) { const p = $(arcSel), L = p.getTotalLength(); ft(tl, p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: L * (1 - share), duration: dur, ease: "power2.out" }, t); },
    // fill: a bar / progress segment grows (scaleX from its start; RTL bars set o.origin)
    fill(tl, sel, t, dur = 0.5, to = 1, origin = "0% 50%") { ft(tl, sel, { scaleX: 0, transformOrigin: origin }, { scaleX: to, duration: dur, ease: "power2.out" }, t); },
    // meter: segmented cells light one by one (n cells from i0), the last ones .hot if o.hot
    meter(tl, sel, t, n, step = 0.05, o = {}) { const cells = $$(sel + " i"); for (let i = 0; i < n && i < cells.length; i++) B.swapClass(tl, cells[i], t + i * step, o.hot && i >= n - o.hot ? "hot" : "on"); },
    // select: the selection box appears around a word/element (outline + handles)
    select(tl, sel, t) { B.swapClass(tl, sel, t, "b-sel"); ft(tl, sel, { scale: 0.9 }, { scale: 1, duration: 0.22, ease: "back.out(2.5)" }, t); },
    // cursor: path [[x,y,t],...], clicks squash
    cursor(tl, sel, pts, clicks = [], o = {}) {
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    pulse(tl, sel, t, s = 1.08) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    // progress: the header line fills to `share` of the video (call once per scene)
    progress(tl, sel, t, share) { tl.to(sel, { scaleX: share, duration: 0.4, ease: "power2.out" }, t); },

    /* ---------------- the mascot ---------------- */
    // place: where the crab is at t=0 (x,y in px of the root); later positions via tl.set(sel,{x,y},t) or hop
    place(tl, sel, x, y) { tl.set(sel, { x, y, opacity: 1 }, 0); },
    // hop: the crab jumps to (x,y) in a short arc (stepped feel: 0.32 s)
    hop(tl, sel, t, x, y, h = 90) {
      tl.to(sel, { x, duration: 0.32, ease: "none" }, t);
      tl.to(sel, { keyframes: [{ y: "-=" + h, duration: 0.14, ease: "power2.out" }, { y, duration: 0.18, ease: "power2.in" }] }, t);
      tl.fromTo(sel, { scaleY: 1 }, { scaleY: 0.82, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: "50% 100%", ...IR }, t + 0.32);
    },
    // peek: the crab rises from behind a card edge
    peek(tl, sel, t, dy = 70) { ft(tl, sel, { opacity: 0, yPercent: dy }, { opacity: 1, yPercent: 0, duration: 0.3, ease: "back.out(2)" }, t); },
    // snap: claws open/close a few times (two-frame sprite)
    snap(tl, sel, t, n = 3) { const a = $(sel).querySelector(".fa"), b = $(sel).querySelector(".fb"); if (!a || !b) return; for (let i = 0; i < n; i++) { tl.set(b, { opacity: 1 }, t + i * 0.16); tl.set(a, { opacity: 0 }, t + i * 0.16); tl.set(b, { opacity: 0 }, t + i * 0.16 + 0.08); tl.set(a, { opacity: 1 }, t + i * 0.16 + 0.08); } tl.set(b, { opacity: 0 }, 0); tl.set(a, { opacity: 1 }, 0); },
    // idle: a small stepped bob while the crab waits (keeps it alive between actions)
    idle(tl, sel, a, b) { const n = Math.max(1, Math.floor((b - a) / 0.5)); tl.fromTo(sel, { yPercent: 0 }, { yPercent: -5, duration: 0.25, ease: "steps(2)", yoyo: true, repeat: n * 2 - 1, ...IR }, a); },
    // react: an icon pops above the crab and fades (check / ask / bang / heart / star)
    react(tl, iconSel, t, hold = 0.7) { ft(tl, iconSel, { opacity: 0, scale: 0.3, yPercent: 40 }, { opacity: 1, scale: 1, yPercent: 0, duration: 0.25, ease: "back.out(3)" }, t); tl.to(iconSel, { opacity: 0, duration: 0.15 }, t + hold); },

    /* ---------------- transitions ---------------- */
    // pixels: coral blocks fill the frame (0.22 s), the scene switches under them, then they clear (0.22 s)
    pixels(tl, sel, t, seed = 7) {
      const box = $(sel), u = 60, cols = 18, rows = 32; let s = seed;
      const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
      if (!box.dataset.built) { box.dataset.built = "1"; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const i = document.createElement("i"); i.style.left = x * u + "px"; i.style.top = y * u + "px"; box.appendChild(i); } }
      Array.from(box.children).forEach((i) => { tl.set(i, { opacity: 0 }, 0); tl.set(i, { opacity: 1 }, t + rnd() * 0.22); tl.set(i, { opacity: 0 }, t + 0.3 + rnd() * 0.22); });
      return t + 0.26; // switch scenes here
    },
    // iris: a coral circle covers from a point, then a paper circle opens (the anchor's "zoom into a number")
    iris(tl, coralSel, paperSel, t, origin = [540, 960]) {
      [coralSel, paperSel].forEach((s) => tl.set(s, { left: origin[0], top: origin[1], scale: 0, opacity: 1 }, 0));
      tl.to(coralSel, { scale: 1, duration: 0.3, ease: "power2.in" }, t);
      tl.to(paperSel, { scale: 1, duration: 0.32, ease: "power2.out" }, t + 0.36);
      tl.set([coralSel, paperSel], { opacity: 0 }, t + 0.7);
      return t + 0.3; // switch scenes here
    },
  };
  window.BOARD = B;
})();
