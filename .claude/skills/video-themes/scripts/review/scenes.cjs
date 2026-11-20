/* Scene map for the review loop. Loads <project>/index.html, seeks the GSAP timeline (window.__timelines.main) and
   reports when each scene is on screen, plus its entrance moments (clusters of tween starts inside it).
   A scene is [data-qa-scene] or an element whose class has a "scene" token (h-scene, scene, n-scene…), top-level
   only. Stretches where no scene is visible are reported as "face" beats (the speaker owns the frame).
   usage: node scenes.cjs <index.html> <out.json> */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [html, outPath] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.addInitScript(() => { window.__timelines = window.__timelines || {}; });
  await page.goto("file://" + path.resolve(html));
  await page.waitForFunction(() => !!(window.__timelines && window.__timelines.main), null, { timeout: 30000, polling: 200 });
  const out = await page.evaluate(() => {
    const tl = window.__timelines.main;
    const root = document.querySelector("[data-composition-id]");
    const DUR = parseFloat(root.getAttribute("data-duration")) || tl.duration();
    const SC = /(^|[-_\s])scene($|[-_\s])/i;
    // scenes: elements with a "scene" class token, plus anything marked data-qa-scene (a dark stage, a page section)
    let els = Array.from(document.querySelectorAll("*")).filter((e) => e.hasAttribute("data-qa-scene") || (typeof e.className === "string" && SC.test(e.className)));
    els = els.filter((e) => !els.some((o) => o !== e && o.contains(e)));
    const opa = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= parseFloat(cs.opacity); } return o; };
    const vis = (el) => { if (opa(el) <= 0.5) return false; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.right > 0 && r.bottom > 0 && r.left < 1080 && r.top < 1920; };
    const STEP = 0.1, on = els.map(() => []), none = [];
    tl.seek(0.05, false); tl.seek(0, false);
    for (let t = 0; t < DUR; t += STEP) {
      tl.seek(t, false);
      let any = false;
      els.forEach((e, i) => { if (vis(e)) { on[i].push(+t.toFixed(2)); any = true; } });
      if (!any) none.push(+t.toFixed(2));
    }
    const runs = (ts) => { const r = []; let a = null, p = null; for (const t of ts) { if (a === null) a = t; else if (t - p > STEP * 1.5) { r.push([a, +(p + STEP).toFixed(2)]); a = t; } p = t; } if (a !== null) r.push([a, +(p + STEP).toFixed(2)]); return r; };
    const absStart = (t) => { let s = t.startTime(), p = t.parent; while (p && p !== tl) { s += p.startTime(); p = p.parent; } return s; };
    const tweens = tl.getChildren(true, true, false).filter((t) => t.duration() > 0).map((t) => ({ s: absStart(t), d: t.duration(), tg: t.targets().filter((x) => x && x.nodeType === 1) }));
    const scenes = [];
    els.forEach((e, i) => runs(on[i]).forEach(([a, b]) => {
      if (b - a < 0.4) return;
      // entrances: tween starts on elements inside this scene, clustered within 0.25 s; the busiest clusters first
      const st = tweens.filter((w) => w.s >= a - 0.05 && w.s < b && w.tg.some((x) => e.contains(x))).map((w) => w.s).sort((x, y) => x - y);
      const cl = []; for (const s of st) { const c = cl[cl.length - 1]; if (c && s - c.at <= 0.25) c.n++; else cl.push({ at: +s.toFixed(2), n: 1 }); }
      cl.sort((x, y) => y.n - x.n);
      const pay = Array.from(e.querySelectorAll("[data-qa-payoff]")).map((p) => p.getAttribute("data-qa-payoff"));
      scenes.push({ id: e.id || e.className.split(" ")[0] + "#" + i, start: a, end: b, kind: "graphics", entrances: cl.slice(0, 3).map((c) => c.at).sort((x, y) => x - y), payoffs: pay });
    }));
    runs(none).forEach(([a, b]) => { if (b - a >= 0.8) scenes.push({ id: "face@" + a.toFixed(1), start: a, end: b, kind: "face", entrances: [], payoffs: [] }); });
    scenes.sort((x, y) => x.start - y.start);
    return { duration: DUR, scenes };
  });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
