/* arcade theme: pixel sprites, pixel worlds + seek-safe motion verbs. window.ARCADE
   Every helper parks its targets at t=0 and uses fromTo(..., immediateRender:false). Times are absolute.
   All pixel art is drawn here from character grids (brand-free, our own designs). */
(function () {
  const IR = { immediateRender: false };
  const $ = (s) => (typeof s === "string" ? document.querySelector(s) : s);
  const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [].concat(s).map($));
  const ft = (tl, sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const at = (t, i, step) => (Array.isArray(t) ? t[i] : t + i * step);

  /* ---------------- color helpers ---------------- */
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (c) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const shade = (h, k) => toHex(hex(h).map((v) => (k < 0 ? v * (1 + k) : v + (255 - v) * k)));
  // deterministic RNG (same frame every render)
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  /* ---------------- sprites: character grids ----------------
     X body (o.color) · D darker body · L lighter body · W white · K ink · Y gold · O dark gold · y light gold
     R red · r dark red · G green · S stone · s dark stone · l light stone · B screen blue · b light blue · . empty */
  const FIX = { W: "#ffffff", K: "#1c1c1c", Y: "#e8c03a", O: "#a8790e", y: "#f8e58a", R: "#e5534b", r: "#a8302b", G: "#3fbf5b", g: "#2a8a40", S: "#b8b6b2", s: "#8c8a86", l: "#dcdad6", B: "#2d3f9a", b: "#6f86f0", P: "#c64fc9" };
  const SPR = {
    // the theme's mascot "Bit": a jelly bot with two antennae (our own design)
    bot: ["...D....D...", "....D..D....", "..XXXXXXXX..", ".XLXXXXXXXX.", "XXWWXXXXWWXX", "XXWKXXXXWKXX", "XXXXXXXXXXXX", "XXXXXKKXXXXX", "XXXXXXXXXXXX", "XX.XX..XX.XX", "X...X..X...X"],
    coin: ["..OOOO..", ".OYYYYO.", "OYyYYYYO", "OYyYOYYO", "OYyYOYYO", "OYYYOYYO", ".OYYYYO.", "..OOOO.."],
    heart: [".RR...RR.", "RWRR.RRRR", "RWRRRRRRR", "RRRRRRRRR", ".RRRRRRR.", "..RRRRR..", "...RRR...", "....R...."],
    star: ["....Y....", "...YYY...", "YYYYYYYYY", ".YYYyYYY.", "..YYYYY..", "..YYYYY..", ".YYY.YYY.", ".YY...YY."],
    check: ["........G", ".......GG", "G.....GG.", "GG...GG..", ".GG.GG...", "..GGG....", "...G....."],
    cross: ["RR...RR", "RRR.RRR", ".RRRRR.", "..RRR..", ".RRRRR.", "RRR.RRR", "RR...RR"],
    crown: ["Y...Y...Y", "YY.YYY.YY", "YYYYYYYYY", "YRYYbYYRY", "YYYYYYYYY", "OOOOOOOOO"],
    tomb: ["...SSSS...", ".SSllllSS.", ".SlSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SlSSSSSSSs", "SSSSSSSSSs", "ssssssssss"],
    monitor: ["KKKKKKKKKKKK", "KBBBBBBBBBBK", "KBbBBBBBBBBK", "KBBBBBBBBBBK", "KBBBBBBBBBBK", "KBBBBBBBBBBK", "KBBBBBBBBBBK", "KKKKKKKKKKKK", "....KKKK....", "..KKKKKKKK.."],
    envelope: ["KKKKKKKKKKK", "KKWWWWWWWKK", "KWKWWWWWKWK", "KWWKWWWKWWK", "KWWWKRKWWWK", "KWWWWKWWWWK", "KWWWWWWWWWK", "KKKKKKKKKKK"],
    lock: ["..KKKK..", ".K....K.", ".K....K.", "YYYYYYYY", "YyYYKYYY", "YyYYKYYY", "YYYYYYYY", "OOOOOOOO"],
    ball: [".XXXX.", "XLLXXX", "XLXXXX", "XXXXXX", "XXXXXD", ".XXDD."],
    brick: ["XXXXXXXX", "XLLLLLLD", "XLXXXXXD", "XLXXXXXD", "XLXXXXXD", "XLXXXXXD", "XDDDDDDD", "DDDDDDDD"],
    arrow: ["...K...", "..KXK..", ".KXXXK.", "KXXXXXK", "..KXK..", "..KXK..", "..KKK.."],
  };

  /* render a grid as an <svg> (runs merged, crisp edges); o.color = body color */
  function sprite(name, o = {}) {
    const g = SPR[name], body = o.color || "#d77656", map = { ...FIX, X: body, D: shade(body, -0.28), L: shade(body, 0.35), ...(o.map || {}) };
    const h = g.length, w = Math.max(...g.map((r) => r.length));
    let rects = "";
    g.forEach((row, y) => { let x = 0; while (x < row.length) { const c = row[x]; if (c === ".") { x++; continue; } let e = x; while (e < row.length && row[e] === c) e++; rects += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${map[c]}"/>`; x = e; } });
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid meet">${rects}</svg>`;
  }
  const size = (name) => [Math.max(...SPR[name].map((r) => r.length)), SPR[name].length];

  /* ---------------- worlds: pixel scenes generated on a coarse grid ----------------
     kind: "dusk" | "day" | "night" | "room" | "space"; o.p = pixel size (px), o.horizon = 0..1, o.seed */
  const SKY = {
    dusk: ["#3b2559", "#6a2f62", "#a8405c", "#d8604f", "#ef8b4f", "#f6b25d"],
    day: ["#5fa8ef", "#74b6f2", "#8cc4f4", "#a6d2f5", "#c3e1f7"],
    night: ["#0d1030", "#141a45", "#1c2558", "#25316b"],
    space: ["#0a0b24", "#11143a", "#191c4d"],
  };
  const GROUND = { dusk: ["#5a3328", "#6b3d2e", "#4a2a22"], day: ["#e3c48a", "#d6b273", "#ecd39e"], night: ["#1e2a3a", "#253446", "#18222f"], room: ["#3e4f8f", "#4a5ca0", "#33437a"], space: ["#2a7b4f", "#3a9a5f", "#1f5f3c"] };
  function world(sel, kind = "dusk", o = {}) {
    const el = $(sel), W = el.offsetWidth, H = el.offsetHeight, p = o.p || 10, cols = Math.ceil(W / p), rows = Math.ceil(H / p);
    const hz = Math.round(rows * (o.horizon != null ? o.horizon : 0.62)), R = rng(o.seed || 7);
    let s = "";
    const r = (x, y, w, h, c) => (s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);
    if (kind === "room") {
      const wall = o.wall || "#f3e3b8", trim = o.trim || "#c9a86a";
      r(0, 0, cols, hz, wall);
      for (let y = 2; y < hz - 2; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < cols; x += 4) r(x, y, 1, 1, shade(wall, -0.06));   // wallpaper dots
      r(0, hz - 2, cols, 2, trim);
      const [a, b] = GROUND.room; for (let y = hz; y < rows; y += 4) for (let x = 0; x < cols; x += 4) r(x, y, 4, 4, ((x + y) / 4) % 2 ? a : b);   // checker floor
    } else {
      const bands = o.sky || SKY[kind] || SKY.dusk, bh = hz / bands.length;
      bands.forEach((c, i) => r(0, Math.floor(i * bh), cols, Math.ceil(bh) + 1, c));
      // dithered band edges (every other pixel of the next color)
      bands.forEach((c, i) => { if (!i) return; const y = Math.floor(i * bh) - 1; for (let x = i % 2; x < cols; x += 2) r(x, y, 1, 1, c); });
      if (kind === "night" || kind === "space") for (let i = 0; i < cols * 0.8; i++) r(Math.floor(R() * cols), Math.floor(R() * hz * 0.9), 1, 1, R() > 0.8 ? "#ffe9a8" : "#ffffff");
      // sun / moon
      const sx = Math.round(cols * (o.sunX != null ? o.sunX : 0.74)), sy = Math.round(hz * (o.sunY != null ? o.sunY : 0.45)), sr = o.sunR || Math.round(cols * 0.07);
      const sc = kind === "day" ? "#fff3b0" : kind === "dusk" ? "#ffe2a0" : "#e8ecff";
      if (kind !== "space") for (let y = -sr; y <= sr; y++) { const w = Math.round(Math.sqrt(sr * sr - y * y)); r(sx - w, sy + y, 2 * w + 1, 1, sc); }
      else { const pr = Math.round(cols * 0.18), px = Math.round(cols * 0.5), py = hz + pr * 0.35; for (let y = -pr; y <= pr; y++) { const w = Math.round(Math.sqrt(pr * pr - y * y)); r(px - w, py + y, 2 * w + 1, 1, "#2f6fd6"); } }
      // skyline silhouette on the horizon (buildings, deterministic)
      if (kind !== "space" && o.skyline !== false) { const sil = shade(bands[0], -0.25); let x = 0; while (x < cols) { const w = 3 + Math.floor(R() * 6), h = 2 + Math.floor(R() * (rows * 0.12)); r(x, hz - h, w, h, sil); if (kind === "night") for (let k = 0; k < h * w * 0.15; k++) r(x + Math.floor(R() * w), hz - h + Math.floor(R() * h), 1, 1, "#ffd76a"); x += w + Math.floor(R() * 2); } }
      const g = GROUND[kind] || GROUND.dusk;
      r(0, hz, cols, rows - hz, g[0]);
      for (let i = 0; i < cols * (rows - hz) * 0.06; i++) r(Math.floor(R() * cols), hz + 1 + Math.floor(R() * (rows - hz)), 1 + Math.floor(R() * 2), 1, R() > 0.5 ? g[1] : g[2]);
      r(0, hz, cols, 1, shade(g[0], 0.2));
    }
    el.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 ${cols} ${rows}" preserveAspectRatio="none" shape-rendering="crispEdges">${s}</svg>`);
  }

  /* ---------------- hand-drawn marker paths ---------------- */
  // a slightly wavy strike from (x1,y) to (x2,y)
  const strikePath = (x1, y, x2, wob = 3) => { const m = (x1 + x2) / 2; return `M${x1} ${y + wob} Q${(x1 + m) / 2} ${y - wob} ${m} ${y} T${x2} ${y - wob}`; };
  // a loose ellipse that overshoots its start (like a pen circling a word)
  const circlePath = (cx, cy, rx, ry) => { let d = ""; const n = 26; for (let i = 0; i <= n + 3; i++) { const a = -Math.PI * 0.9 + (i / n) * Math.PI * 2, k = 1 + 0.06 * Math.sin(i * 1.7); d += (i ? "L" : "M") + (cx + Math.cos(a) * rx * k).toFixed(1) + " " + (cy + Math.sin(a) * ry * k * (1 + i * 0.004)).toFixed(1); } return d; };
  const rectOf = (el) => { const r = $(el).getBoundingClientRect(), root = document.querySelector("[data-composition-id]").getBoundingClientRect(); return { x: r.left - root.left, y: r.top - root.top, w: r.width, h: r.height }; };

  const A = {
    SPR, sprite, size, world, strikePath, circlePath, shade,
    _layouts: [],

    /* put a sprite into an element: A.art("#bot1", "bot", { color }) */
    art(sel, name, o = {}) { $$(sel).forEach((e) => (e.innerHTML = sprite(name, o))); },

    /* ---------------- layouts: "split" | "face" | "page" | "scene" ----------------
       split = page on top (0-770), face below; face = footage full; page = the page full (no face);
       scene = a full-bleed pixel world (#full) over everything but the captions. Hard cuts. o.shift moves the footage down in split. */
    layout(tl, mode, t, o = {}) {
      const face = $(o.face || "#face"), vid = face.querySelector("video"), full = $(o.full || "#full");
      const clip = { split: "inset(770px 0px 0px 0px)", face: "inset(0px 0px 0px 0px)", page: "inset(1920px 0px 0px 0px)", scene: "inset(1920px 0px 0px 0px)" }[mode];
      const vy = mode === "split" ? (o.shift != null ? o.shift : A._shift || 0) : 0; if (o.shift != null) A._shift = o.shift;
      const tt = A._layouts.length ? t : 0;
      tl.set(face, { clipPath: clip }, tt); tl.set(vid, { y: vy }, tt);
      if (full) tl.set(full, { opacity: mode === "scene" ? 1 : 0 }, tt);
      A._layouts.push([t, mode]);
    },
    modeAt(t) { let m = "split"; A._layouts.forEach(([tt, mm]) => { if (tt <= t + 1e-6) m = mm; }); return m; },
    scene(tl, sel, a, b) { if (a > 0) { tl.set(sel, { autoAlpha: 0 }, 0); tl.set(sel, { autoAlpha: 1 }, a); } if (b != null) tl.set(sel, { autoAlpha: 0 }, b); },
    hide(tl, sel) { tl.set(sel, { opacity: 0 }, 0); },

    /* captions: dark pills, 2-3 words, ON the seam (764) in every layout; o.yAt(t) to move one under a graphic */
    captions(tl, sel, words, o = {}) {
      const max = o.maxWords || 3, gap = o.gap || 0.3, until = o.until || Infinity, box = $(sel);
      const groups = []; let cur = [];
      words.forEach((w, i) => { cur.push(w); const n = words[i + 1]; if (/[.,:!?;]$/.test(w.text) || !n || n.start - w.end > gap || cur.length >= max) { groups.push(cur); cur = []; } });
      groups.forEach((g, i) => {
        const a = g[0].start; if (a >= until) return;
        const nx = groups[i + 1], b = Math.min(until, nx ? Math.min(nx[0].start, g[g.length - 1].end + 0.9) : g[g.length - 1].end + 0.4);
        const el = document.createElement("div"), txt = g.map((w) => w.text.replace(/[.,:;]$/, "")).join(" ");
        el.className = "a-cap" + (/[֐-׿]/.test(txt) ? "" : " ltr"); el.textContent = txt;
        el.style.top = (o.yAt ? o.yAt(a) : o.y || 764) + "px"; box.appendChild(el);
        tl.set(el, { opacity: 0 }, 0); tl.set(el, { opacity: 1 }, a); tl.set(el, { opacity: 0 }, b);
      });
    },

    /* ---------------- verbs (language.md §6) ---------------- */
    // rise: a card / a scene window arrives (from 50px below, .35 s)
    rise(tl, sels, t, step = 0.12) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, y: 50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }, at(t, i, step))); },
    // spawn: a sprite appears in 3 pixel steps (no smooth scaling: it's a game)
    spawn(tl, sels, t, step = 0.08) { $$(sels).forEach((e, i) => ft(tl, e, { opacity: 0, scale: 0.2, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.18, ease: "steps(3)" }, at(t, i, step))); },
    // hop: a sprite jumps (stepped arc)
    hop(tl, sel, t, h = 60, dur = 0.36) { tl.fromTo(sel, { y: 0 }, { keyframes: [{ y: -h * 0.7, duration: dur * 0.25 }, { y: -h, duration: dur * 0.25 }, { y: -h * 0.6, duration: dur * 0.2 }, { y: 0, duration: dur * 0.3 }], ease: "steps(2)", ...IR }, t); },
    // walk: a sprite walks dx px with a 2-frame bob
    walk(tl, sel, t, dx, dur = 0.8) {
      tl.set(sel, { x: -dx }, 0); tl.fromTo(sel, { x: -dx }, { x: 0, duration: dur, ease: "steps(" + Math.max(4, Math.round(dur * 12)) + ")", ...IR }, t);
      tl.fromTo(sel, { y: 0 }, { y: -8, duration: 0.09, repeat: Math.round(dur / 0.09) - 1, yoyo: true, ease: "steps(1)", ...IR }, t);
    },
    // drop: a prop falls into place and lands with a squash (a tombstone, a block, a coin)
    drop(tl, sels, t, step = 0.2, h = 260) { $$(sels).forEach((e, i) => { const tt = at(t, i, step); ft(tl, e, { opacity: 0, y: -h }, { opacity: 1, y: 0, duration: 0.24, ease: "power2.in" }, tt); tl.fromTo(e, { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 0.86, duration: 0.06, yoyo: true, repeat: 1, ...IR }, tt + 0.24); }); },
    // multiply: one creature becomes a crowd (clones spawn in waves); returns the clones
    multiply(tl, boxSel, name, n, t, o = {}) {
      const box = $(boxSel), cols = o.cols || 10, w = o.w || 66, gx = o.gx || 84, gy = o.gy || 66, colors = o.colors || ["#d77656", "#3fbf5b", "#4f74e8", "#c64fc9", "#e8c03a", "#39c3c9", "#e5534b", "#8a5be8"], R = rng(o.seed || 3);
      const [sw, sh] = size(name), out = [];
      for (let i = 0; i < n; i++) { const d = document.createElement("div"); d.className = "a-spr px"; d.style.cssText = `left:${(i % cols) * gx}px;top:${Math.floor(i / cols) * gy}px;width:${w}px;height:${(w * sh) / sw}px`; d.innerHTML = sprite(name, { color: colors[Math.floor(R() * colors.length)] }); box.appendChild(d); out.push(d); }
      const waves = o.waves || 4, dur = o.dur || 0.9; out.forEach((d, i) => { const order = R(); A.spawn(tl, d, t + Math.floor(order * waves) * (dur / waves) + (i % 3) * 0.02); });
      return out;
    },
    // count: a number rolls (e.g. the ×N counter); ends on the payoff word
    count(tl, sel, from, to, t, dur = 0.8, o = {}) {
      const el = $(sel), p = { v: from }, fmt = o.fmt || ((v) => (o.prefix || "") + Math.round(v).toLocaleString("en-US") + (o.suffix || ""));
      el.textContent = fmt(from);
      tl.fromTo(p, { v: from }, { v: to, duration: dur, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(p.v)), ...IR }, t);
    },
    // type: letters appear (in the HUD input, the comment box)
    type(tl, sel, text, t, cps = 14) {
      const el = $(sel), p = { n: 0 }; el.textContent = "";
      tl.fromTo(p, { n: 0 }, { n: text.length, duration: text.length / cps, ease: "none", onUpdate: () => (el.textContent = text.slice(0, Math.round(p.n))), ...IR }, t);
      return t + text.length / cps;
    },
    // bar: HUD blocks switch on one by one
    bar(tl, sels, t, step = 0.1) { $$(sels).forEach((e, i) => A.swapClass(tl, e, at(t, i, step), "on")); },
    // blink: pixel text blinks n times then stays
    blink(tl, sel, t, n = 3, dt = 0.08) { tl.set(sel, { opacity: 0 }, 0); for (let i = 0; i < n; i++) { tl.set(sel, { opacity: 1 }, t + i * 2 * dt); tl.set(sel, { opacity: 0 }, t + (i * 2 + 1) * dt); } tl.set(sel, { opacity: 1 }, t + n * 2 * dt); },
    // shake: a hit (x jitter, stepped)
    shake(tl, sel, t, a = 12) { tl.fromTo(sel, { x: 0 }, { keyframes: [{ x: a }, { x: -a }, { x: a * 0.6 }, { x: -a * 0.6 }, { x: 0 }], duration: 0.25, ease: "steps(1)", ...IR }, t); },
    // punch: a hard camera cut-in on a stressed word (no tween: the frame jumps closer, holds, cuts back)
    punch(tl, sel, t, s = 1.12, hold = 0.5, origin = "50% 50%") { tl.set(sel, { scale: 1, transformOrigin: origin }, 0); tl.set(sel, { scale: s }, t); if (hold != null) tl.set(sel, { scale: 1 }, t + hold); },
    // pan: the game camera scrolls a held world in pixel steps (dx px over dur, one step every 0.1 s)
    pan(tl, sel, t, dur, dx = -80, s = 1.08) { tl.set(sel, { x: 0, scale: s, transformOrigin: "50% 50%" }, 0); tl.fromTo(sel, { x: 0 }, { x: dx, duration: dur, ease: `steps(${Math.max(1, Math.round(dur / 0.1))})`, immediateRender: false }, t); },
    pulse(tl, sel, t, s = 1.08) { tl.fromTo(sel, { scale: 1 }, { scale: s, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", ...IR }, t); },
    out(tl, sel, t) { tl.to(sel, { opacity: 0, duration: 0.15, ease: "power2.in" }, t); },
    // swapClass: seek-safe class change
    swapClass(tl, sel, t, add, remove) {
      $$(sel).forEach((el) => { const cls = el.getAttribute("class"); let n = cls; if (remove) n = n.replace(new RegExp("\\b" + remove + "\\b"), "").trim(); if (add) n += " " + add; tl.set(el, { attr: { class: cls } }, 0); tl.set(el, { attr: { class: n } }, t); });
    },

    /* ---------------- the red pen ---------------- */
    draw(tl, sel, t, dur = 0.3, ease = "power1.inOut") { $$(sel).forEach((p) => { const L = p.getTotalLength(); ft(tl, p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, t); }); },
    // strike: a red line through a phrase (one per text line; RTL draws right to left)
    strike(tl, inkSel, el, t, dur = 0.28) {
      const ink = $(inkSel), rects = Array.from($(el).getClientRects()), root = document.querySelector("[data-composition-id]").getBoundingClientRect(), rtl = getComputedStyle($(el)).direction === "rtl";
      rects.forEach((r, i) => { const x1 = r.left - root.left - 4, x2 = r.right - root.left + 4, y = r.top - root.top + r.height * 0.55; const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", rtl ? strikePath(x2, y, x1) : strikePath(x1, y, x2)); ink.appendChild(p); A.draw(tl, p, t + i * dur, dur); });
    },
    // circle: a red loop around a word
    circle(tl, inkSel, el, t, dur = 0.4) {
      const r = rectOf(el), p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", circlePath(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 + 18, r.h / 2 + 10)); $(inkSel).appendChild(p); A.draw(tl, p, t, dur, "power1.out");
    },
    // scrawl: a handwritten word is written (revealed in the reading direction)
    scrawl(tl, sel, t, dur = 0.45) { const rtl = getComputedStyle($(sel)).direction === "rtl"; ft(tl, sel, { clipPath: rtl ? "inset(-20% 0% -20% 100%)" : "inset(-20% 100% -20% 0%)" }, { clipPath: "inset(-20% 0% -20% 0%)", duration: dur, ease: "steps(" + Math.round(dur * 20) + ")" }, t); },
  };
  window.ARCADE = A;
})();
