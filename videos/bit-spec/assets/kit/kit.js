/* pastel-motion-ad kit — GSAP motion helpers.
   Every helper adds tweens to the paused root timeline `tl` at an absolute time `t`, uses
   fromTo/immediateRender:false so any seek lands on the right frame, and never reads the clock or
   Math.random(). Load after gsap.min.js; everything lives on window.MG. */
(function () {
  const MG = {};
  const q = (sel) => (typeof sel === "string" ? Array.from(document.querySelectorAll(sel)) : [].concat(sel));
  const fx = { immediateRender: false };
  // Park targets invisible from the start of the timeline; their entrance tween reveals them on cue.
  MG.hide = function (tl, sel, vars = { opacity: 0 }) { tl.set(q(sel), vars, 0); };

  // Wrap every word of the matched elements in <span class="w">, keeping nested accent spans intact.
  MG.split = function (sel) {
    q(sel).forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const walk = (node) => {
        Array.from(node.childNodes).forEach((n) => {
          if (n.nodeType === 3) {
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
              const s = document.createElement("span");
              s.className = "w";
              s.textContent = p;
              frag.appendChild(s);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.classList.contains("w") && !n.classList.contains("box")) {
            // accent spans (gradient text needs one box) and highlights animate as one word
            if (n.matches(".hl, .acc-green, .acc-serif, .acc-red, [data-word]")) n.classList.add("w");
            else walk(n);
          }
        });
      };
      walk(el);
    });
    return MG;
  };

  // Signature move: words resolve out of a soft blur, one after another.
  MG.blurIn = function (tl, sel, t, o = {}) {
    MG.split(sel);
    const words = q(sel).flatMap((el) => Array.from(el.querySelectorAll(".w")));
    MG.hide(tl, words);
    tl.fromTo(words, { opacity: 0, filter: "blur(18px)", y: o.y ?? 26, scale: o.scale ?? 1 },
      { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: o.dur ?? 0.55, stagger: o.stagger ?? 0.09, ease: o.ease ?? "power3.out", ...fx }, t);
    return words.length * (o.stagger ?? 0.09) + (o.dur ?? 0.55);
  };

  MG.blurOut = function (tl, sel, t, o = {}) {
    tl.to(q(sel), { opacity: 0, filter: "blur(16px)", y: o.y ?? -20, duration: o.dur ?? 0.35, ease: "power2.in" }, t);
  };

  // Hero word: big, starts oversized + blurred, lands with a slight overshoot.
  MG.hero = function (tl, sel, t, o = {}) {
    MG.hide(tl, sel);
    tl.fromTo(q(sel), { opacity: 0, scale: o.from ?? 1.35, filter: "blur(24px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: o.dur ?? 0.7, ease: "expo.out", ...fx }, t);
  };

  // Highlight box sweeps in behind a word (.hl > .box).
  MG.highlight = function (tl, sel, t) {
    MG.hide(tl, q(sel).map((e) => e.querySelector(".box")), { scaleX: 0 });
    tl.fromTo(q(sel).map((e) => e.querySelector(".box")), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power4.out", ...fx }, t);
  };

  // Rolling list (.roll > .row*): the live row sits in the middle, neighbours dim above/below.
  // Rows advance every `step` seconds; returns the time the roll finishes.
  MG.roll = function (tl, sel, t, step = 0.75) {
    const box = q(sel)[0];
    const rows = Array.from(box.querySelectorAll(".row"));
    const H = 110;
    const place = (k, at, d) => rows.forEach((r, i) => {
      const off = i - k;
      const vars = { y: 110 + off * H, opacity: off === 0 ? 1 : Math.abs(off) === 1 ? 0.22 : 0, filter: off === 0 ? "blur(0px)" : "blur(3px)", scale: off === 0 ? 1 : 0.86 };
      if (d === 0) tl.set(r, vars, at);
      else tl.to(r, { ...vars, duration: d, ease: "power3.inOut" }, at);
    });
    place(0, t, 0);
    rows.forEach((r, i) => i > 0 && tl.set(r.querySelector(".arrow"), { opacity: 0 }, t));
    for (let k = 1; k < rows.length; k++) {
      place(k, t + k * step - 0.3, 0.3);
      tl.set(rows[k - 1].querySelector(".arrow"), { opacity: 0 }, t + k * step - 0.3);
      tl.set(rows[k].querySelector(".arrow"), { opacity: 1 }, t + k * step - 0.05);
    }
    return t + rows.length * step;
  };

  // Card swings in like a page turning toward the viewer.
  MG.flipIn = function (tl, sel, t, o = {}) {
    MG.hide(tl, sel);
    tl.fromTo(q(sel), { opacity: 0, rotationY: o.rot ?? -75, rotationZ: o.tilt ?? 6, x: o.x ?? 260, z: -200, transformPerspective: 1600, transformOrigin: o.origin ?? "100% 50%" },
      { opacity: 1, rotationY: 0, rotationZ: 0, x: 0, z: 0, duration: o.dur ?? 0.8, ease: "expo.out", ...fx }, t);
  };

  // Rise from below with a soft blur — default entrance for UI cards.
  MG.rise = function (tl, sel, t, o = {}) {
    MG.hide(tl, sel);
    tl.fromTo(q(sel), { opacity: 0, y: o.y ?? 160, scale: o.scale ?? 0.94, filter: "blur(10px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: o.dur ?? 0.7, ease: "expo.out", stagger: o.stagger ?? 0, ...fx }, t);
  };

  // Slow continuous camera push on a whole scene: keeps every frame moving (no dead holds).
  MG.push = function (tl, sel, t, dur, from = 1.0, to = 1.045) {
    tl.fromTo(q(sel), { scale: from }, { scale: to, duration: dur, ease: "sine.inOut", ...fx }, t);
  };

  // Gentle idle float (hovering laptop / card).
  MG.float = function (tl, sel, t, dur, o = {}) {
    tl.fromTo(q(sel), { y: o.from ?? 0, rotation: o.r0 ?? -1 }, { y: o.to ?? -24, rotation: o.r1 ?? 1, duration: dur, ease: "sine.inOut", ...fx }, t);
  };

  // Slow drift of the aurora blobs inside a scene (keeps every frame alive).
  MG.drift = function (tl, sceneSel, t, dur) {
    const blobs = q(sceneSel + " .blob");
    blobs.forEach((b, i) => tl.fromTo(b, { x: 0, y: 0 }, { x: (i % 2 ? -1 : 1) * 140, y: (i % 3 - 1) * 120, duration: dur, ease: "none", ...fx }, t));
  };

  // Scene change: incoming scene opens as a circle from (x%, y%) with a glowing ring.
  MG.portal = function (tl, sceneSel, t, o = {}) {
    const at = `${o.x ?? 50}% ${o.y ?? 50}%`;
    tl.fromTo(q(sceneSel), { clipPath: `circle(0px at ${at})` }, { clipPath: `circle(1500px at ${at})`, duration: o.dur ?? 0.8, ease: "power3.in", ...fx }, t);
    if (o.ring) tl.fromTo(q(o.ring), { scale: 0.1, opacity: 1 }, { scale: 9, opacity: 0, duration: (o.dur ?? 0.8) + 0.1, ease: "power3.in", ...fx }, t);
  };

  // Scene change: soft blur dissolve (outgoing scene blurs/zooms away, incoming resolves).
  MG.dissolve = function (tl, outSel, inSel, t, d = 0.45) {
    if (outSel) tl.to(q(outSel), { opacity: 0, filter: "blur(30px)", scale: 1.06, duration: d, ease: "power2.in" }, t);
    if (inSel) tl.fromTo(q(inSel), { opacity: 0, filter: "blur(30px)", scale: 0.96 }, { opacity: 1, filter: "blur(0px)", scale: 1, duration: d + 0.3, ease: "power3.out", ...fx }, t);
  };

  // Typewriter: reveals the text of `sel` character by character (works for RTL).
  MG.type = function (tl, sel, t, dur) {
    q(sel).forEach((el) => {
      if (!el.dataset.typed) {
        el.dataset.typed = "1";
        const txt = el.textContent;
        el.textContent = "";
        Array.from(txt).forEach((c) => { const s = document.createElement("span"); s.textContent = c; s.className = "ch"; el.appendChild(s); });
      }
      const chars = el.querySelectorAll(".ch");
      MG.hide(tl, Array.from(chars));
      tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: dur / Math.max(1, chars.length), ...fx }, t);
    });
  };

  // Green selection rectangle with handles drawing itself around an element.
  MG.select = function (tl, sel, t) {
    MG.hide(tl, sel);
    tl.fromTo(q(sel), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", ...fx }, t);
  };

  // Cursor glides through [[x, y, t], ...] (absolute px / seconds); optional click pulse at the end.
  MG.cursor = function (tl, sel, pts, o = {}) {
    const el = q(sel)[0];
    tl.set(el, { x: pts[0][0], y: pts[0][1], opacity: 1 }, pts[0][2]);
    for (let i = 1; i < pts.length; i++) {
      tl.to(el, { x: pts[i][0], y: pts[i][1], duration: pts[i][2] - pts[i - 1][2], ease: "power2.inOut" }, pts[i - 1][2]);
    }
    if (o.click) tl.to(el, { scale: 0.8, duration: 0.08, yoyo: true, repeat: 1 }, pts[pts.length - 1][2]);
  };

  // Count a number in an element.
  MG.count = function (tl, sel, from, to, t, dur, fmt = (v) => Math.round(v)) {
    const el = q(sel)[0];
    const o = { v: from };
    tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: "power2.out", ...fx, onUpdate: () => { el.textContent = fmt(o.v); } }, t);
  };

  // ---------- dot-matrix digits (5x7) ----------
  const FONT = {
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"], "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"], "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"], "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"], "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"], "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"], "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  };
  // Builds the matrix for `text` inside `el` (a .dots element). size = dot pitch in px.
  MG.dots = function (el, text, size = 30) {
    el = q(el)[0];
    el.innerHTML = "";
    const cols = text.length * 6 - 1;
    el.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
    el.style.gridAutoRows = `${size}px`;
    el.style.direction = "ltr";
    for (let r = 0; r < 7; r++) for (let c = 0; c < cols; c++) {
      const ch = text[Math.floor(c / 6)], cc = c % 6;
      const on = cc < 5 && FONT[ch] && FONT[ch][r][cc] === "1";
      const i = document.createElement("i");
      i.style.margin = `${size * 0.12}px`;
      if (!on) i.className = "off";
      el.appendChild(i);
    }
  };
  // Dots pop on in a diagonal wave.
  MG.dotsIn = function (tl, el, t, dur = 0.7) {
    const on = Array.from(q(el)[0].querySelectorAll("i:not(.off)"));
    MG.hide(tl, on);
    tl.fromTo(on, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(3)", stagger: { each: dur / Math.max(1, on.length), from: "start" }, ...fx }, t);
  };

  // ---------- pixel sprites ----------
  // map: array of strings, one char per pixel, "." = empty; palette: { char: color }.
  MG.pixels = function (el, map, palette, px = 24) {
    el = q(el)[0];
    el.innerHTML = "";
    el.style.gridTemplateColumns = `repeat(${map[0].length}, ${px}px)`;
    el.style.gridAutoRows = `${px}px`;
    map.forEach((row) => Array.from(row).forEach((c) => { const i = document.createElement("i"); if (c !== ".") i.style.background = palette[c]; el.appendChild(i); }));
  };
  MG.SPRITES = {
    cactus: [
      "......gg......",
      ".....gGGg.....",
      ".....gGGg.....",
      ".g...gGGg...g.",
      "gGg..gwGw..gGg",
      "gGg..gkGk..gGg",
      "gGg..gGGg..gGg",
      "gGGggpGGpggGGg",
      ".gGGGGGGGGGGg.",
      "...ggGGGGgg...",
      ".....gGGg.....",
      ".....gGGg.....",
      ".....gGGg.....",
      "....bbbbbb....",
      "....bbbbbb....",
    ],
    cactusPalette: { g: "#139a3a", G: "#28c94f", w: "#ffffff", k: "#111111", p: "#ff8fb1", b: "#c2603a" },
    star: [".....y.....", "....yYy....", "yyyyYYYyyyy", ".yYYYYYYYy.", "..yYYYYYy..", "..yYy.yYy..", ".yy.....yy."],
    starPalette: { y: "#e0a400", Y: "#ffd23f" },
    wizard: [
      ".......hy.......",
      "......hhh.......",
      ".....hhhhh......",
      "....hhhyhhh.....",
      "..hhhhhhhhhhh...",
      ".......gg.......",
      "......gGGg....y.",
      "..g...gwGw...n..",
      ".gGg..gkGk..n...",
      ".gGg..gGGg.gGg..",
      ".gGGggpGGpggGGg.",
      "..gGGGGGGGGGGg..",
      "....ggGGGGgg....",
      "......gGGg......",
      "......gGGg......",
      ".....bbbbbb.....",
      ".....bbbbbb.....",
    ],
    wizardPalette: { h: "#3a35c8", y: "#ffd23f", n: "#8a5a2b", g: "#139a3a", G: "#28c94f", w: "#ffffff", k: "#111111", p: "#ff8fb1", b: "#c2603a" },
  };
  // Sprite hops in steps (pixel-art feel: stepped ease).
  MG.hop = function (tl, sel, t, dur, o = {}) {
    tl.fromTo(q(sel), { y: 0 }, { y: o.h ?? -40, duration: 0.25, ease: "steps(3)", yoyo: true, repeat: Math.max(1, Math.floor(dur / 0.25) - 1), ...fx }, t);
  };

  window.MG = MG;
})();
