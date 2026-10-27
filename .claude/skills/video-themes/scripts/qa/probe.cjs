/* DOM probe for the theme QA. Loads <project>/index.html in Chromium, seeks the GSAP timeline
   (window.__timelines.main) and reads layout facts at sample times. Theme-agnostic: it relies only on
   computed styles, a few naming conventions (captions: class *cap*, charts: class/id *axis|chart|curve|graph|plot*)
   and opt-in attributes (data-qa="caption|chart|not-chart|face|bg", data-qa-payoff, data-qa-stamp).
   usage: node probe.cjs <index.html> <in.json> <out.json>
   in.json: { step, faces: {t: [x,y,w,h] in source px}, faceSize: [w,h], words: [...] } */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [html, inPath, outPath] = process.argv.slice(2);
  const IN = JSON.parse(fs.readFileSync(inPath, "utf8"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.addInitScript(() => { window.__timelines = window.__timelines || {}; });
  await page.goto("file://" + path.resolve(html));
  await page.waitForFunction(() => !!(window.__timelines && window.__timelines.main), null, { timeout: 30000, polling: 200 });
  await page.addStyleTag({ content: "*{pointer-events:auto !important} audio{display:none}" });

  const out = await page.evaluate(async (IN) => {
    const tl = window.__timelines.main;
    const root = document.querySelector("[data-composition-id]");
    const DUR = parseFloat(root.getAttribute("data-duration")) || tl.duration();
    const VW = 1080, VH = 1920;
    const CAP = /(^|[-_\s])(cap|caps|caption|captions)($|[-_\s])/i;
    const CHART = /axis|chart|curve|graph|plot/i;
    const isCap = (el) => { for (let e = el; e && e !== document.body; e = e.parentElement) { if (e.dataset && e.dataset.qa === "caption") return true; if (typeof e.className === "string" && CAP.test(e.className)) return true; } return false; };
    const faceVid = document.querySelector('video[data-qa="face"]') || Array.from(document.querySelectorAll("video")).find((v) => /face/i.test(v.id)) || document.querySelector('video[data-track-index="0"]');
    const faceRoot = faceVid ? (faceVid.closest('[class*="face"]') || faceVid.parentElement) : null;
    const opa = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= parseFloat(cs.opacity); } return o; };
    const scaleOf = (el) => { let s = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const t = getComputedStyle(e).transform; if (t && t !== "none") { const m = new DOMMatrix(t); s *= Math.hypot(m.a, m.b); } const sc = getComputedStyle(e).scale; if (sc && sc !== "none") s *= parseFloat(sc); } return s; };
    const R = (r) => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
    const onScreen = (r) => r.width > 2 && r.height > 2 && r.right > 0 && r.bottom > 0 && r.left < VW && r.top < VH;
    const clipBox = (el) => { // visible region after inset() clip-paths of el and its ancestors
      let box = [0, 0, VW, VH];
      for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
        const cp = getComputedStyle(e).clipPath; const m = cp && cp.match(/inset\(([^)]*)\)/);
        if (m) { const er = e.getBoundingClientRect(); const raw = m[1].split("round")[0].trim().split(/\s+/);
          const px = (x, base) => (/%$/.test(x) ? (parseFloat(x) / 100) * base : parseFloat(x));  // % insets are relative to the box
          const q = [raw[0], raw[1] ?? raw[0], raw[2] ?? raw[0], raw[3] ?? raw[1] ?? raw[0]]; const [t, r, b, l] = [px(q[0], er.height), px(q[1], er.width), px(q[2], er.height), px(q[3], er.width)];
          const nb = [er.left + l, er.top + t, er.right - r, er.bottom - b]; box = [Math.max(box[0], nb[0]), Math.max(box[1], nb[1]), Math.min(box[2], nb[2]), Math.min(box[3], nb[3])]; }
      }
      return box;
    };
    const shown = (el) => { if (opa(el) <= 0.5) return false; const r = el.getBoundingClientRect(); if (!onScreen(r)) return false; const c = clipBox(el); return Math.min(r.right, c[2]) - Math.max(r.left, c[0]) > 4 && Math.min(r.bottom, c[3]) - Math.max(r.top, c[1]) > 4; };
    const bgVisible = (cs) => { const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/); const a = m ? (m[1].split(",")[3] !== undefined ? parseFloat(m[1].split(",")[3]) : 1) : 0; return a > 0.3 || (cs.backgroundImage && cs.backgroundImage !== "none"); };
    const ancestorsOfCaption = new Set();
    document.querySelectorAll("*").forEach((e) => { if (isCap(e)) for (let p = e.parentElement; p; p = p.parentElement) ancestorsOfCaption.add(p); });

    // ---- GSAP tweens (for actions / s) ----
    const absStart = (t) => { let s = t.startTime(), p = t.parent; while (p && p !== tl) { s += p.startTime(); p = p.parent; } return s; };
    const tweens = tl.getChildren(true, true, false).filter((t) => t.duration() > 0).map((t) => {
      const tg = t.targets().filter((x) => x && x.nodeType === 1);
      return { start: +absStart(t).toFixed(3), dur: +t.duration().toFixed(3), cap: tg.length > 0 && tg.every(isCap), dom: tg.length > 0 };
    });

    // ---- payoff elements: dense text sampling ----
    const payEls = Array.from(document.querySelectorAll("[data-qa-payoff]"));
    const payoffs = [];
    for (const el of payEls) {
      const word = el.getAttribute("data-qa-payoff"), at = el.getAttribute("data-qa-payoff-at");
      const norm = (s) => s.replace(/[.,:;!?"'״׳()]/g, "").trim().toLowerCase();
      const w = at ? { start: parseFloat(at), text: word } : IN.words.find((x) => norm(x.text) === norm(word)) || IN.words.find((x) => norm(x.text).includes(norm(word)));
      const rec = { word, wordStart: w ? w.start : null, sel: el.id ? "#" + el.id : el.className };
      if (w) {
        let prev = null, end = null; const seen = [];
        for (let t = Math.max(0, w.start - 4); t <= Math.min(DUR, w.start + 3); t += 1 / 60) { tl.seek(t, false); const tx = el.textContent.trim(); if (prev !== null && tx !== prev) end = t; prev = tx; }
        rec.end = end;
        if (end != null) {
          let hold = 0; for (let t = end; t <= Math.min(DUR, end + 1.5); t += 0.05) { tl.seek(t, false); if (shown(el)) hold = t - end; else break; }
          rec.hold = +hold.toFixed(2); rec.untilEnd = +(DUR - end).toFixed(2);
          const st = el.getAttribute("data-qa-stamp");
          if (st) { const se = document.querySelector(st); rec.stamp = st; if (se) { let first = null; for (let t = Math.max(0, end - 3); t <= Math.min(DUR, end + 3); t += 1 / 60) { tl.seek(t, false); if (shown(se)) { first = t; break; } } rec.stampAt = first; } }
        }
      }
      payoffs.push(rec);
    }

    tl.seek(0.05, false); tl.seek(0, false);  // force the t=0 state to render (a fresh paused timeline has not rendered its sets yet)
    // ---- samples ----
    const samples = []; const digitTexts = {}; const uid = new WeakMap(); let nUid = 0; const keyOf = (el) => { if (!uid.has(el)) uid.set(el, (el.id || el.className || el.tagName) + "#" + (nUid++)); return uid.get(el); };
    for (let t = 0; t < DUR - 0.05; t += IN.step) {
      tl.seek(t, false);
      const S = { t: +t.toFixed(2), texts: [], boxes: [], media: [], charts: [], face: null };
      // face video region
      if (faceVid) {
        const r = faceVid.getBoundingClientRect(), o = opa(faceVid), cb = clipBox(faceVid);
        S.face = { rect: R(r), clip: cb.map(Math.round), op: +o.toFixed(2), fit: getComputedStyle(faceVid).objectFit };
        const fb = IN.faces[S.t.toFixed(2)];
        if (fb && o > 0.5 && IN.faceSize) {
          const [vw, vh] = IN.faceSize, sc = S.face.fit === "contain" ? Math.min(r.width / vw, r.height / vh) : Math.max(r.width / vw, r.height / vh);
          const ox = r.left + (r.width - vw * sc) / 2, oy = r.top + (r.height - vh * sc) / 2;
          let fx = ox + fb[0] * sc, fy = oy + fb[1] * sc, fw = fb[2] * sc, fh = fb[3] * sc;
          // eyes-to-mouth core of the face box
          const core = [fx + fw * 0.18, fy + fh * 0.22, fw * 0.64, fh * 0.7];
          const vis = [Math.max(core[0], cb[0]), Math.max(core[1], cb[1]), Math.min(core[0] + core[2], cb[2]), Math.min(core[1] + core[3], cb[3])];
          if (vis[2] - vis[0] > 20 && vis[3] - vis[1] > 20) {
            S.face.core = [vis[0], vis[1], vis[2] - vis[0], vis[3] - vis[1]].map(Math.round);
            // who is on top inside the core? sample a 5x5 grid
            const hits = {};
            for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
              const x = vis[0] + (vis[2] - vis[0]) * (i + 0.5) / 5, y = vis[1] + (vis[3] - vis[1]) * (j + 0.5) / 5;
              const top = document.elementFromPoint(x, y); if (!top) continue;
              if (top.tagName === "VIDEO" && (top === faceVid || /matte|face/i.test(top.id + " " + (top.parentElement && top.parentElement.className)))) continue;
              if (top === faceVid || top.contains(faceVid)) continue;
              if (opa(top) < 0.3) continue;  // hit-testing ignores opacity: an invisible element is not covering anything
              const cs = getComputedStyle(top); const cap = isCap(top);
              const ownText = Array.from(top.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
              if (!cap && !bgVisible(cs) && cs.backdropFilter === "none" && top.tagName !== "IMG" && top.tagName !== "svg" && !top.closest("svg") && !ownText) continue;
              const key = (cap ? "caption " : "") + (top.id ? "#" + top.id : top.tagName.toLowerCase() + "." + String(top.className.baseVal ?? top.className).split(" ")[0]);
              hits[key] = (hits[key] || 0) + 1;
            }
            S.face.covered = hits;
          }
        }
      }
      for (const el of document.body.querySelectorAll("*")) {
        if (["SCRIPT", "STYLE", "AUDIO", "SOURCE"].includes(el.tagName)) continue;
        if (faceVid && (el === faceVid || el.contains(faceVid))) continue;  // the footage and its wrappers (graphics may share the wrapper)
        if (el.dataset && el.dataset.qa === "bg") continue;
        let r = el.getBoundingClientRect(); if (!onScreen(r)) continue;
        const o = opa(el); const po = el.parentElement ? opa(el.parentElement) : 1; if (o < 0.05 && !(po > 0.5 && (el.tagName === "svg" || el.offsetWidth >= 120))) continue;
        const cb = clipBox(el); if (cb[2] - cb[0] < 2 || cb[3] - cb[1] < 2 || r.right < cb[0] || r.left > cb[2] || r.bottom < cb[1] || r.top > cb[3]) continue;
        const cs = getComputedStyle(el), cap = isCap(el);
        // text: elements with their own non-empty text nodes
        for (const n of el.childNodes) {
          if (n.nodeType !== 3 || !n.textContent.trim()) continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const tr = rg.getBoundingClientRect(); if (!onScreen(tr)) continue;
          const fsz = parseFloat(cs.fontSize) * scaleOf(el);
          const txt = n.textContent.trim().slice(0, 40);
          S.texts.push({ r: R(tr), fs: +fsz.toFixed(1), op: +o.toFixed(2), cap, tx: txt, id: el.id || "" });
          if (/\d/.test(txt) && !cap && !el.closest("[data-qa-payoff]")) { const key = keyOf(el); (digitTexts[key] = digitTexts[key] || new Set()).add(txt); }
        }
        if (cap || ancestorsOfCaption.has(el)) continue;
        const full = r.width * r.height > 0.85 * VW * VH;
        const tag = el.tagName.toLowerCase();
        if (tag === "img" || tag === "canvas" || (tag === "video" && el !== faceVid && !/matte/i.test(el.id)) || (cs.backgroundImage && /url\(/.test(cs.backgroundImage))) {
          if (!full) S.media.push({ r: R(r), op: +o.toFixed(2), po: +po.toFixed(2), tag, id: el.id || "" });
        } else if (tag === "svg" && !el.parentElement.closest("svg")) {
          let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
          el.querySelectorAll("path,circle,rect,line,polyline,polygon,ellipse,text,image").forEach((c) => { if (c.closest("defs,mask,clipPath")) return; if (opa(c) < 0.05) return; const cr = c.getBoundingClientRect(); if (cr.width < 1 && cr.height < 1) return; x1 = Math.min(x1, cr.left); y1 = Math.min(y1, cr.top); x2 = Math.max(x2, cr.right); y2 = Math.max(y2, cr.bottom); });
          if (x2 > x1) { const rr = { left: x1, top: y1, width: x2 - x1, height: y2 - y1, right: x2, bottom: y2 }; Object.defineProperty(rr, "x", { value: x1 }); r = rr; }
          const full = false;
          const big = r.width >= 80 && r.height >= 80; const lbl = (el.id || "") + " " + (el.getAttribute("class") || "") + " " + Array.from(el.querySelectorAll("*")).map((c) => (c.id || "") + " " + (c.getAttribute("class") || "")).join(" ");
          const qa = el.dataset.qa;
          if (big) S.media.push({ r: R(r), op: +o.toFixed(2), po: +po.toFixed(2), tag, id: el.id || "" });
          if ((qa === "chart" || CHART.test(lbl)) && qa !== "not-chart" && big && o > 0.3) S.charts.push({ r: R(r), id: el.id || "" });
        } else if (!full && r.width >= 120 && r.height >= 60 && (bgVisible(cs) || (cs.backdropFilter && cs.backdropFilter !== "none") || (parseFloat(cs.borderTopWidth) >= 2 && cs.borderTopStyle !== "none") || cs.boxShadow !== "none")) {
          const textIn = (el.innerText || "").trim().length;
          const visualIn = el.querySelector("img,svg,canvas,video") ? 1 : 0;
          if (r.width >= 0.95 * VW && r.height >= 0.25 * VH && !textIn && !visualIn) continue;  // a full-width band / veil is background, not a card
          S.boxes.push({ r: R(r), op: +o.toFixed(2), po: +po.toFixed(2), id: el.id || "", cls: String(el.className).slice(0, 40), textIn, visualIn });
        }
      }
      // graphic-on-graphic overlaps between major items (cards >= 160x100, media, titles >= 40px), unless both sit in
      // the same [data-qa-stack] (stacking the language allows) or one contains the other
      const majors = [];
      for (const el of document.body.querySelectorAll("*")) {
        if (["SCRIPT", "STYLE", "AUDIO", "SOURCE"].includes(el.tagName) || isCap(el)) continue;
        if (faceVid && (el === faceVid || el.contains(faceVid) || /matte/i.test(el.id))) continue;
        if (el.dataset && (el.dataset.qa === "bg" || el.dataset.qa === "overlay")) continue;
        const o = opa(el); if (o <= 0.5) continue;
        const cs = getComputedStyle(el), tag = el.tagName.toLowerCase();
        let r = null;
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim());
        const alphaOf = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return 1; const v = m[1].split(","); return v.length > 3 ? parseFloat(v[3]) : 1; };
        const ghost = alphaOf(cs.color) < 0.3 && (parseFloat(cs.webkitTextStrokeWidth || 0) === 0 || alphaOf(cs.webkitTextStrokeColor) < 0.3);  // watermark text = background
        if (own.length && !ghost && parseFloat(cs.fontSize) * scaleOf(el) >= 40 && !el.closest("svg")) {
          let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9; own.forEach((n) => { const rg = document.createRange(); rg.selectNodeContents(n); const q = rg.getBoundingClientRect(); x1 = Math.min(x1, q.left); y1 = Math.min(y1, q.top); x2 = Math.max(x2, q.right); y2 = Math.max(y2, q.bottom); });
          r = [x1, y1, x2 - x1, y2 - y1];
        } else {
          const q = el.getBoundingClientRect(); if (q.width < 160 || q.height < 100 || q.width * q.height > 0.85 * VW * VH) continue;
          const isMedia = tag === "img" || tag === "canvas" || (tag === "video") || (tag === "svg" && !el.parentElement.closest("svg"));
          const isCard = bgVisible(cs) || (cs.backdropFilter && cs.backdropFilter !== "none") || (parseFloat(cs.borderTopWidth) >= 2 && cs.borderTopStyle !== "none") || cs.boxShadow !== "none";
          if (!isMedia && !isCard) continue;
          if (q.width >= 0.95 * VW && q.height >= 0.25 * VH && !(el.innerText || "").trim()) continue;
          if (tag === "svg") { let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9; el.querySelectorAll("path,circle,rect,line,polyline,polygon,ellipse,text,image").forEach((c) => { if (c.closest("defs,mask,clipPath") || opa(c) < 0.05) return; const cr = c.getBoundingClientRect(); if (cr.width < 1 && cr.height < 1) return; x1 = Math.min(x1, cr.left); y1 = Math.min(y1, cr.top); x2 = Math.max(x2, cr.right); y2 = Math.max(y2, cr.bottom); }); if (x2 <= x1 || x2 - x1 < 160 && y2 - y1 < 100) continue; r = [x1, y1, x2 - x1, y2 - y1]; }
          else r = [q.left, q.top, q.width, q.height];
        }
        const cb = clipBox(el); const v = [Math.max(r[0], cb[0], 0), Math.max(r[1], cb[1], 0), Math.min(r[0] + r[2], cb[2], VW), Math.min(r[1] + r[3], cb[3], VH)];
        if (v[2] - v[0] < 4 || v[3] - v[1] < 4) continue;
        majors.push({ el, r: [v[0], v[1], v[2] - v[0], v[3] - v[1]], label: el.id ? "#" + el.id : tag + "." + String(el.className.baseVal ?? el.className).split(" ")[0] });
      }
      S.overlaps = [];
      for (let i = 0; i < majors.length; i++) for (let j = i + 1; j < majors.length; j++) {
        const A = majors[i], B = majors[j];
        if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const sa = A.el.closest("[data-qa-stack]"), sb = B.el.closest("[data-qa-stack]"); if (sa && sa === sb) continue;
        const ix = Math.max(0, Math.min(A.r[0] + A.r[2], B.r[0] + B.r[2]) - Math.max(A.r[0], B.r[0])), iy = Math.max(0, Math.min(A.r[1] + A.r[3], B.r[1] + B.r[3]) - Math.max(A.r[1], B.r[1]));
        const ia = ix * iy, small = Math.min(A.r[2] * A.r[3], B.r[2] * B.r[3]);
        if (!(ia > 400 && ia > 0.04 * small)) continue;
        // fully placed ON a larger surface and painted above it = sitting on it, not colliding
        if (ia >= 0.9 * small) {
          const S_ = A.r[2] * A.r[3] <= B.r[2] * B.r[3] ? A : B;
          const top = document.elementFromPoint(S_.r[0] + S_.r[2] / 2, S_.r[1] + S_.r[3] / 2);
          if (top && (top === S_.el || S_.el.contains(top))) continue;
        }
        S.overlaps.push({ a: A.label, b: B.label, share: +(ia / small).toFixed(2) });
      }
      // digits near charts
      S.charts.forEach((c) => { const [x, y, w, h] = c.r; c.digits = S.texts.some((tx) => /\d/.test(tx.tx) && !tx.cap && tx.r[0] < x + w + 40 && tx.r[0] + tx.r[2] > x - 40 && tx.r[1] < y + h + 40 && tx.r[1] + tx.r[3] > y - 40); });
      samples.push(S);
    }
    const changing = Object.entries(digitTexts).filter(([, s]) => s.size > 2).map(([k, s]) => ({ key: k, values: Array.from(s).slice(0, 6) }));
    return { duration: DUR, tweens, payoffs, samples, changingDigits: changing };
  }, IN);
  fs.writeFileSync(outPath, JSON.stringify(out));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
