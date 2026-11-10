// stills for the verify loop: node shots.cjs <out-dir> <t1,t2,...> [scale]   (t = film seconds on the master clock)
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const out = process.argv[2], ts = process.argv[3].split(",").map(Number), sc = +(process.argv[4] || 1);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: sc });
  p.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
  await p.goto("file://" + path.resolve(__dirname, "index.html"));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  for (const t of ts) {
    await p.evaluate((t) => { const m = window.__timelines.main; m.pause(); m.seek(t, false); document.querySelectorAll(".clip").forEach((c) => { const a = +c.dataset.start, d = +c.dataset.duration; c.style.visibility = t >= a && t < a + d ? "visible" : "hidden"; }); }, t);
    await p.waitForTimeout(120);
    await p.screenshot({ path: path.join(out, "f_" + t.toFixed(2).padStart(5, "0") + ".png") });
  }
  await b.close();
})();
