/* FX: signature effects shared by every theme. Built once; each theme dresses them through its fx.css (--fx-* vars).
   Seek-safe: every frame is a pure function of the timeline time (one timeline onUpdate hook does the placing),
   reveals are GSAP tweens on the timeline. Placement is face-relative through FACE (effects/face.js).

   Layers (FX.init builds them around the theme's footage):
     footage (theme)  <  .fx-behind (word, cards)  <  .fx-matte (the speaker cut out, follows the footage)  <  .fx-front
   Markup the project provides once:  <div class="fx-matte"><video id="fxMatte" data-fx-matte src="assets/video/matte.webm"
     data-start="0" data-duration="…" data-track-index="2" muted playsinline></video></div>

   Effects:
     FX.wordBehind(tl, sel, t0, t1, o)        a huge display word behind the head; letters arrive one by one
     FX.shoulderCards(tl, sels, t0, t1, o)    cards rise from behind the shoulders, then open to the free sides
     FX.chestChart(tl, sel, t0, t1, spec, o)  a small chart on the chest, numbers only from facts (window.FACTS)
   Every element is marked data-fx="<effect>" (letters: span[data-fx-letter]) for the QA self-check.            */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease3 = (p) => 1 - Math.pow(1 - clamp(p, 0, 1), 3);
  const VW = 1080, VH = 1920;

  const X = {
    tl: null, root: null, faceVid: null, matte: null, items: [],

    /* init: wire the layers around the theme's footage; o.face = the footage <video>, o.root = the composition root */
    init(tl, o = {}) {
      X.tl = tl;
      X.root = $(o.root || "[data-composition-id]");
      X.faceVid = $(o.face || "#faceVid");
      X.matte = $(o.matte || "[data-fx-matte]");
      const faceBox = X.faceVid.parentElement;
      const fz = parseInt(getComputedStyle(faceBox).zIndex) || 1;
      X.behind = X.layer("fx-behind", fz + 1);
      if (X.matte) { const mb = X.matte.parentElement; mb.style.zIndex = String(fz + 2); X.matteBox = mb; tl.set(mb, { opacity: 0 }, 0); }
      X.front = X.layer("fx-front", o.frontZ || 29);
      // one hook places everything after the timeline has rendered this frame (layout sets at the same time included)
      const prev = tl.eventCallback("onUpdate");
      tl.eventCallback("onUpdate", function () { if (prev) prev.apply(this, arguments); X.place(tl.time()); });
      return X;
    },
    layer(cls, z) { const d = document.createElement("div"); d.className = cls; d.style.zIndex = String(z); X.root.appendChild(d); return d; },

    // the cut-out speaker copies the footage's on-screen geometry (transform, clip, grade) every frame
    syncMatte() {
      if (!X.matte) return;
      const fv = X.faceVid, cs = getComputedStyle(fv), box = getComputedStyle(fv.parentElement);
      X.matte.style.transform = cs.transform; X.matte.style.transformOrigin = cs.transformOrigin; X.matte.style.filter = cs.filter;
      X.matteBox.style.clipPath = box.clipPath;
    },
    // is any effect that needs the cut-out running at t?
    matteOn(t) { return X.items.some((it) => it.matte && t >= it.t0 && t <= it.t1 + 0.4); },

    place(t) {
      X.syncMatte();
      const fb = FACE.screen(t);
      X.items.forEach((it) => { if (fb) it.place(t, fb); });
    },

    /* ---------------- 1. the word behind the head ----------------
       o.text (default: the element's text) · o.width share of the frame (0.92) · o.step letter stagger (0.06 s)
       o.at face anchor the word's bottom sits on ("eyes") · o.dy in face heights · o.drift slow scale (1.04)
       The word is lifted until no letter loses more than ~25% to the head (estimated from the face box; the QA
       self-check verifies it against the real cut-out: every letter >= 70% visible).                         */
    wordBehind(tl, sel, t0, t1, o = {}) {
      const el = $(sel), text = o.text || el.textContent.trim();
      el.textContent = ""; el.classList.add("fx-word"); el.dataset.fx = "wordBehind"; el.dir = o.dir || "auto";
      Array.from(text).forEach((ch) => { const s = document.createElement("span"); s.dataset.fxLetter = ""; s.textContent = ch === " " ? " " : ch; el.appendChild(s); });
      X.behind.appendChild(el);
      // fit: the word spans o.width of the frame on one line
      let fs = 400; el.style.fontSize = fs + "px";
      while (el.scrollWidth > (o.width || 0.92) * VW && fs > 120) { fs -= 8; el.style.fontSize = fs + "px"; }
      const letters = Array.from(el.querySelectorAll("[data-fx-letter]"));
      tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, t0); tl.to(el, { opacity: 0, duration: 0.25, ease: "power2.in" }, t1 - 0.25);
      letters.forEach((l, i) => tl.fromTo(l, { opacity: 0, y: 30 }, { keyframes: [{ opacity: 0.35, y: 0, duration: 0.08 }, { opacity: 0.35, duration: 0.06 }, { opacity: 1, duration: 0.08 }], ...IR }, t0 + i * (o.step || 0.06)));
      tl.set(el, { opacity: 0 }, 0);
      if (X.matte) { tl.set(X.matteBox, { opacity: 1 }, t0); tl.set(X.matteBox, { opacity: 0 }, t1); }
      const lift = { v: 0 };
      X.items.push({ t0, t1, matte: true, place(t, fb) {
        if (t < t0 - 0.05 || t > t1 + 0.05) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        // estimate the head: the face box widened for hair and ears; lift the word until each letter is mostly clear
        const head = { x1: fb.x - 0.12 * fb.w, x2: fb.x + 1.12 * fb.w, y1: fb.y - 0.3 * fb.h };
        let bottom = fb[o.at || "eyes"] + (o.dy || 0) * fb.h;
        const left = clamp(fb.cx - w / 2, (VW - w) / 2 - 120, (VW - w) / 2 + 120);
        for (let k = 0; k < 40; k++) {
          const top = bottom - h; let worst = 0;
          letters.forEach((l) => { const lx1 = left + l.offsetLeft, lx2 = lx1 + l.offsetWidth, ly1 = top + 0.18 * h, ly2 = bottom - 0.12 * h;
            const ix = Math.max(0, Math.min(lx2, head.x2) - Math.max(lx1, head.x1)), iy = Math.max(0, ly2 - Math.max(ly1, head.y1));
            worst = Math.max(worst, (ix * iy) / Math.max(1, (lx2 - lx1) * (ly2 - ly1))); });
          if (worst <= 0.25) break; bottom -= 0.04 * fb.h;   // the head may take a quarter of a letter: it reads as behind, not beside
        }
        const s = 1 + ((o.drift || 1.04) - 1) * clamp((t - t0) / Math.max(0.1, t1 - t0), 0, 1);
        gsap.set(el, { x: left, y: Math.max(60, bottom - h), scale: s, transformOrigin: "50% 100%" });
      } });
      return letters.length;
    },

    /* ---------------- 2. cards from behind the shoulders ----------------
       sels: 1–4 card elements (their content is the theme's). o.step stagger (0.28 s) · o.rise (0.8 s: out along the shoulders, then up) · o.gap face heights
       between card and face (0.25) · o.width card width (240) · o.y face anchor of the risen cards ("eyes")           */
    shoulderCards(tl, sels, t0, t1, o = {}) {
      const cards = $$(sels), n = cards.length, step = o.step ?? 0.28, rise = o.rise ?? 0.8;
      cards.forEach((c) => { c.classList.add("fx-card"); c.dataset.fx = "shoulderCards"; c.style.width = (o.width || 240) + "px"; X.behind.appendChild(c); tl.set(c, { opacity: 0 }, 0); tl.set(c, { opacity: 1 }, t0); tl.to(c, { opacity: 0, duration: 0.2 }, t1 - 0.2); });
      if (X.matte) { tl.set(X.matteBox, { opacity: 1 }, t0); tl.set(X.matteBox, { opacity: 0 }, t1); }
      X.items.push({ t0, t1, matte: true, place(t, fb) {
        if (t < t0 - 0.05 || t > t1 + 0.05) return;
        const free = FACE.freeSide(fb);
        cards.forEach((c, i) => {
          const p = clamp((t - (t0 + i * step)) / rise, 0, 1);
          // sides: alternate when both sides have room for the card, else all on the free side, stacked
          const roomL = fb.x - (o.gap ?? 0.25) * fb.h - 30, roomR = VW - (fb.x + fb.w) - (o.gap ?? 0.25) * fb.h - 30, cw = c.offsetWidth;
          const both = roomL >= cw && roomR >= cw;
          const side = both ? (i % 2 === 0 ? free : (free === "left" ? "right" : "left")) : free;
          const row = both ? Math.floor(i / 2) : i;
          const tx = side === "left" ? fb.x - (o.gap ?? 0.25) * fb.h - cw : fb.x + fb.w + (o.gap ?? 0.25) * fb.h;
          const ty = fb[o.y || "eyes"] - c.offsetHeight / 2 + row * (c.offsetHeight + 24) - (both ? 0 : 0.3 * fb.h);
          const sx = fb.cx - cw / 2, sy = fb.shoulders;          // start: centred behind the body at shoulder height
          // two moves: out along the shoulders (behind the body, under the caption band), then up beside the head —
          // so a rising card never crosses the captions
          const px = ease3(p / 0.5), py = ease3((p - 0.45) / 0.55);
          gsap.set(c, { x: clamp(sx + (tx - sx) * px, 20, VW - 20 - cw), y: sy + (ty - sy) * py, rotation: (side === "left" ? -6 : 6) * py, scale: 0.92 + 0.08 * p });
          c.dataset.fxState = p >= 1 ? "up" : "rising";
        });
      } });
    },

    /* ---------------- 3. a chart on the chest ----------------
       spec = { title, bars: [{ fact: "numbers.views_before" }, { fact: "numbers.views_after", payoff: "אלפים", landAt: 47.42 }] }
       Values come ONLY from window.FACTS (the project's facts.yaml as JSON): no facts, no chart. "300–400" is drawn
       at its midpoint and labelled as written; "10K" = 10000. o.below face heights between chin and chart (0.65, clamped to the frame).   */
    fact(path) { return path.split(".").reduce((a, k) => (a == null ? a : a[k]), window.FACTS); },
    num(s) { s = String(s).replace(/,/g, ""); const r = s.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)/); if (r) return (+r[1] + +r[2]) / 2;
      const m = s.match(/(\d+(?:\.\d+)?)\s*([kKmM])?/); if (!m) return NaN; return +m[1] * (m[2] ? (/k/i.test(m[2]) ? 1e3 : 1e6) : 1); },
    chestChart(tl, sel, t0, t1, spec, o = {}) {
      const el = $(sel);
      const bars = (spec.bars || []).map((b) => ({ ...b, label: X.fact(b.fact) })).filter((b) => b.label != null && !isNaN(X.num(b.label)));
      if (bars.length < (spec.bars || []).length || bars.length < 2) { el.dataset.fxError = "missing facts: " + (spec.bars || []).map((b) => b.fact).join(", "); console.error("FX.chestChart:", el.dataset.fxError); el.remove(); return false; }
      el.classList.add("fx-chart"); el.dataset.fx = "chestChart"; el.innerHTML = "";
      if (spec.title) { const h = document.createElement("div"); h.className = "fx-chart-title"; h.textContent = spec.title; el.appendChild(h); }
      const plot = document.createElement("div"); plot.className = "fx-chart-plot"; el.appendChild(plot);
      const max = Math.max(...bars.map((b) => X.num(b.label)));
      const els = bars.map((b, i) => {
        const col = document.createElement("div"); col.className = "fx-chart-col";
        const v = document.createElement("div"); v.className = "fx-chart-val"; v.textContent = b.label; if (b.payoff) { v.dataset.qaPayoff = b.payoff; v.textContent = bars[i - 1] ? bars[i - 1].label : b.label; }
        const bar = document.createElement("div"); bar.className = "fx-chart-bar" + (i === bars.length - 1 ? " last" : "");
        bar.style.height = Math.max(8, 190 * Math.sqrt(X.num(b.label) / max)) + "px";   // sqrt: 300 vs 10K are both visible
        const lab = document.createElement("div"); lab.className = "fx-chart-lab"; lab.textContent = b.name || "";
        col.append(v, bar, lab); plot.appendChild(col); return { v, bar, b };
      });
      X.front.appendChild(el);
      const end = parseFloat(X.root.getAttribute("data-duration")) || Infinity;
      tl.set(el, { opacity: 0 }, 0); tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power3.out", ...IR }, t0);
      if (t1 < end - 0.05) tl.to(el, { opacity: 0, duration: 0.25 }, t1 - 0.25);   // at the very end it holds (a payoff must stay up)
      els.forEach(({ v, bar, b }, i) => {
        const at = b.landAt != null ? b.landAt - 0.9 : t0 + 0.35 + i * 0.7;
        tl.set(bar, { scaleY: 0, transformOrigin: "50% 100%" }, 0);
        tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: b.landAt != null ? "none" : "power2.out", transformOrigin: "50% 100%", ...IR }, at);
        if (b.payoff) {   // the value counts from the previous bar's number and lands on the payoff word
          const from = X.num(bars[i - 1].label), to = X.num(b.label), p = { v: from };
          const fmt = (n) => (n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, "") + "K" : String(Math.round(n)));
          tl.set(v, { opacity: 0 }, 0); tl.set(v, { opacity: 1 }, at);   // the value appears when its bar starts counting
          tl.fromTo(p, { v: from }, { v: to, duration: 0.9, ease: "power1.in", onUpdate: () => { v.textContent = p.v >= to ? b.label : p.v <= from ? bars[i - 1].label : fmt(p.v); }, ...IR }, at);
        } else { tl.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 0.2, ...IR }, at + 0.5); }
      });
      X.items.push({ t0, t1, matte: false, place(t, fb) {
        if (t < t0 - 0.05 || t > t1 + 0.05) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        // under the captions' band, on the chest, never off the bottom of the frame
        gsap.set(el, { left: clamp(fb.cx - w / 2, 30, VW - 30 - w), top: Math.min(fb.chin + (o.below ?? 0.65) * fb.h, VH - 40 - h) });
      } });
      return true;
    },
  };
  window.FX = X;
})();
