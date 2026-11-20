/* night theme: art + seek-safe motion verbs. window.NIGHT
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute. */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };

  /* ---------------- art (brand-free, drawn for this theme) ---------------- */
  const ART = {
    lock: '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#fff" stroke-width="2.4"/><rect x="4.5" y="11" width="15" height="10" rx="2" fill="#fff"/></svg>',
    unlock: '<svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 9.6-1.9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><rect x="4.5" y="11" width="15" height="10" rx="2" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="12" cy="12" r="3.2" fill="#fff"/></svg>',
    cursor: '<svg viewBox="0 0 36 50"><path d="M3 2v38l9.5-9 7 15 6.5-3-6.8-14.6H33z" fill="#fff" stroke="#000" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  };

  const N = {
    ART,
    _layouts: [],
    art(sel, name) { $$(sel).forEach((e) => (e.innerHTML = ART[name])); },

    /* ---------------- layouts: "face" | "split" | "proof" | "full" ----------------
       face  = the footage full frame (hook, emotion, a pause in the graphics)
       split = graphics on the night stage, the speaker in the rounded box at the bottom (default while teaching)
       proof = the light page with the box at the bottom (openings: real results)
       full  = graphics or a cutaway take the whole frame, no speaker
       o.box = { s, x, y }: the video's scale and offset inside the box (frame the head so its top sits ~var(--n-pop) above the box) */
    BOX: { top: 1430, x: 69, r: 33 },
    layout(tl, mode, t, o = {}) {
      const face = $(o.face || "#face"), vid = face.querySelector("video"), matte = $(o.matte || "#matte"), proof = $(o.proof || "#proof");
      const B = N.BOX, bx = o.box || N._box || { s: 0.95, x: B.x, y: 600 }; N._box = bx;
      const boxClip = `inset(${B.top}px ${B.x}px 0px ${B.x}px round ${B.r}px ${B.r}px 0px 0px)`;
      const clip = { face: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", split: boxClip, proof: boxClip, full: "inset(1920px 0px 0px 0px round 0px 0px 0px 0px)" }[mode];
      const vv = mode === "face" ? { scale: 1, x: 0, y: 0 } : { scale: bx.s, x: bx.x, y: bx.y };
      const at = N._layouts.length ? t : 0;
      tl.set(face, { clipPath: clip }, at); tl.set(vid, vv, at);
      if (matte) { tl.set(matte.querySelector("video"), vv, at); tl.set(matte, { opacity: (mode === "split" || mode === "proof") && o.pop !== false ? 1 : 0 }, at); }
      if (proof) tl.set(proof, { opacity: mode === "proof" ? 1 : 0 }, at);
      N._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "face"; N._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },

    /* scenes: one composition visible at a time (a scene that starts at 0 is simply visible: never hide+show at one instant) */
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: ONE word by default, hard swap, just above the box (split) or at 66% (face).
       A word object with em:true is set in the serif (key terms). */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 1, gap = o.gap || 0.3, until = o.until || Infinity, box = $(sel);
      const y = { split: o.ySplit || 1275, face: o.yFace || 1270, proof: o.yProof || 1275, full: o.yFull || 1500 };
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.4);
        const el = document.createElement("div"); el.className = "n-cap" + (N.modeAt(a) === "proof" && o.darkOnProof ? " dark" : "");
        g.forEach((w, k) => { const s = document.createElement(w.em ? "em" : "span"); s.textContent = w.text.replace(/[.,:;]$/, "") + (k < g.length - 1 ? " " : ""); el.appendChild(s); });
        el.style.top = (o.yAt ? o.yAt(a) : y[N.modeAt(a)]) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
      });
    },

    /* title: wrap each word in .w and reveal them one by one (0.12 s apart), or on given times */
    title(tl, sel, t, step = 0.12) {
      const el = $(sel);
      if (!el.dataset.split) {
        el.dataset.split = "1";
        const walk = (node) => Array.from(node.childNodes).forEach((c) => {
          if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((p) => { if (!p) return; if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p)); else { const s = document.createElement("span"); s.className = "w"; s.textContent = p; frag.appendChild(s); } }); c.replaceWith(frag); }
          else if (c.nodeType === 1 && (c.tagName === "EM" || c.classList.contains("box"))) c.classList.add("w");
          else if (c.nodeType === 1) walk(c);
        });
        walk(el);
      }
      const ws = Array.from(el.querySelectorAll(".w")).filter((w) => !w.parentElement.closest(".w"));
      ws.forEach((w, i) => ft(tl, w, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, Array.isArray(t) ? t[i] : t + i * step));
      return ws.length;
    },
    hook(tl, sel, t, tEnd, step = 0.12) { N.title(tl, sel, t, step); if (tEnd != null) tl.set(sel, { opacity: 0 }, tEnd); },

    /* ---------------- verbs (language.md §6) ---------------- */
    // ignite: a graphic brightens in from the dark (the anchor's entrance for every new graphic)
    ignite(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.97, filter: "brightness(0.25)" }, { opacity: 1, scale: 1, filter: "brightness(1)", duration: 0.35, ease: "power2.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // neon: a light structure switches on with two flickers
    neon(tl, sels, t, step = 0.08) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.04 }, { opacity: 0.25, duration: 0.05 }, { opacity: 1, duration: 0.04 }, { opacity: 0.5, duration: 0.05 }, { opacity: 1, duration: 0.08 }] }, Array.isArray(t) ? t[i] : t + i * step)); },
    // push: the slow continuous push-in on a held graphic (never on the footage)
    push(tl, sel, t, dur, to = 1.06) { tl.set(sel, { scale: 1 }, 0); tl.fromTo(sel, { scale: 1 }, { scale: to, duration: dur, ease: "none", ...IR }, t); },
    // punch: a fast zoom into one detail with a motion blur; origin = [x, y] in the element's px
    punch(tl, sel, t, scale = 1.8, origin = [540, 700], dur = 0.32) {
      tl.set(sel, { transformOrigin: origin[0] + "px " + origin[1] + "px" }, 0);
      tl.fromTo(sel, { scale: 1, filter: "blur(0px)" }, { keyframes: [{ scale: 1 + (scale - 1) * 0.6, filter: "blur(6px)", duration: dur * 0.45, ease: "power2.in" }, { scale, filter: "blur(0px)", duration: dur * 0.55, ease: "power2.out" }], ...IR }, t);
    },
    // sweep: a band of light crosses a panel (the row / frame being talked about is "lit"); needs a .n-sweep child (added here)
    sweep(tl, sels, t, step = 0.2, dur = 0.7) {
      $$(sels).forEach((e, i) => {
        let b = e.querySelector(":scope > .n-sweep"); if (!b) { b = document.createElement("i"); b.className = "n-sweep"; b.dataset.qa = "bg"; e.appendChild(b); }
        const w = e.offsetWidth; ft(tl, b, { x: w + 60, opacity: 1 }, { x: -260, duration: dur, ease: "power1.inOut" }, (Array.isArray(t) ? t[i] : t + i * step));
        tl.set(b, { opacity: 0 }, (Array.isArray(t) ? t[i] : t + i * step) + dur);
      });
    },
    unpunch(tl, sel, t, dur = 0.28) { tl.to(sel, { scale: 1, filter: "blur(0px)", duration: dur, ease: "power2.inOut" }, t); },
    // rows: framework rows slide in from the side (RTL: from the right), one after another
    rows(tl, sels, t, step = 0.18) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // done: a row turns green (its lock becomes a check via CSS) with a small bump
    done(tl, sel, t) { N.swapClass(tl, sel, t, "done", "next"); tl.fromTo(sel, { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    // swapClass: seek-safe class change (e.g. a ladder level name lights up, a pill turns green, a chip lights)
    swapClass(tl, sel, t, add, remove) {
      $$(sel).forEach((el) => { const cls = el.getAttribute("class"); let n = cls; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n += " " + add; tl.set(el, { attr: { class: cls } }, 0); tl.set(el, { attr: { class: n } }, t); });
    },
    // light: chips / tokens switch on one by one
    light(tl, sels, t, step = 0.2) { $$(sels).forEach((e, i) => { N.swapClass(tl, e, Array.isArray(t) ? t[i] : t + i * step, null, "off"); tl.fromTo(e, { scale: 1 }, { scale: 1.12, duration: 0.1, yoyo: true, repeat: 1, ...IR }, Array.isArray(t) ? t[i] : t + i * step); }); },
    // draw: a stroke (axis, curve, road line, connector) draws along its length
    draw(tl, sel, t, dur = 0.6, ease = "power1.inOut") { $$(sel).forEach((p) => { const L = p.getTotalLength(); ft(tl, p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, t); }); },
    // dots: glowing points pop on, timed to follow a curve's draw
    dots(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.22, ease: "back.out(2.5)" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // grow: bars grow from their base (svg rect or html), yellow = measured
    grow(tl, sels, t, step = 0.1, axis = "x") { $$(sels).forEach((e, i) => ft(tl, e, axis === "x" ? { scaleX: 0, transformOrigin: "100% 50%" } : { scaleY: 0, transformOrigin: "50% 100%" }, axis === "x" ? { scaleX: 1, duration: 0.3, ease: "power2.out" } : { scaleY: 1, duration: 0.3, ease: "power2.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // mark: a highlight lands behind a phrase in a line (color class on .hl: y / p / r)
    mark(tl, sels, t, step = 0.25) { $$(sels).forEach((e, i) => { const tt = Array.isArray(t) ? t[i] : t + i * step; ft(tl, e, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.25, ease: "power2.out" }, tt); }); },
    // tag: a side tag pops next to its row
    tag(tl, sels, t, step = 0.15) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, Array.isArray(t) ? t[i] : t + i * step)); },
    // pop: a small thing arrives (avatar, chip, thumbnail)
    pop(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.8)" }, Array.isArray(t) ? t[i] : t + i * step)); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, duration: 0.15, ease: "power2.in" }, t); },
    // count: digits roll to the payoff (format: k/M suffix helpers via o.fmt)
    count(tl, sel, from, to, t, dur = 0.8, o = {}) {
      // a setter target (not onUpdate): the text follows every seek, even when callbacks are suppressed
      const el = $(sel), fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      let cur = from; const p = { get v() { return cur; }, set v(x) { cur = x; el.textContent = fmt(x); } };
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", ...IR }, t);
    },
    // type: letters appear (cps per second)
    type(tl, sel, text, t, cps = 16) {
      const el = $(sel); let n = 0; const p = { get n() { return n; }, set n(x) { n = x; el.textContent = text.slice(0, Math.round(x)); } }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", ...IR }, t);
      return t + text.length / cps;
    },
    // cursor: path [[x,y,t],...], clicks squash
    cursor(tl, sel, pts, clicks = [], o = {}) {
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 0 }, 0);
      tl.set(sel, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
      for (let i = 1; i < pts.length; i++) tl.to(sel, { x: pts[i][0], y: pts[i][1], duration: Math.max(0.05, pts[i][2] - pts[i - 1][2] - 0.05), ease: "power2.inOut" }, pts[i - 1][2]);
      clicks.forEach((c) => tl.fromTo(sel, { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", ...IR }, c));
      if (o.end != null) tl.set(sel, { opacity: 0 }, o.end);
    },
    pulse(tl, sel, t, s = 1.08) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },

    /* ---------------- builders ---------------- */
    // ladder: rails + rungs; levels = [{ lv: "שלב 1", nm: "המדווח" }, ...] bottom to top; returns rung/name elements
    ladder(sel, levels, o = {}) {
      const el = $(sel), H = el.offsetHeight, n = levels.length, pad = o.pad || 70, gap = (H - 2 * pad) / (n - 1 || 1);
      el.innerHTML = '<div class="rail l"></div><div class="rail r"></div>';
      levels.forEach((L, i) => {
        const y = H - pad - i * gap;
        el.insertAdjacentHTML("beforeend", `<div class="rung" data-i="${i}" style="top:${y}px"></div><div class="lv" data-i="${i}" style="top:${y}px">${L.lv}</div><div class="nm" data-i="${i}" style="top:${y}px">${L.nm}</div>`);
      });
      return { rungs: Array.from(el.querySelectorAll(".rung")), lvs: Array.from(el.querySelectorAll(".lv")), nms: Array.from(el.querySelectorAll(".nm")) };
    },
    // climb: rungs light up from the bottom, then the active level's name lights
    climb(tl, lad, t, step = 0.14) { N.neon(tl, lad.rungs, t, step); N.ignite(tl, lad.lvs, t + 0.05, step); N.ignite(tl, lad.nms, t + 0.05, step); },
    // cta: the title words drop in, then the serif word is typed
    cta(tl, sel, t) { return N.title(tl, sel, t, 0.12); },
  };
  window.NIGHT = N;
})();
