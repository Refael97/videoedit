// Stills or a motion-blurred frame sequence of a draw(t) page.
// Stills:  node tools/mb.cjs shots <page> <out-dir> <t1> <t2> ...
// Frames:  node tools/mb.cjs seq <page> <out-dir> <from> <to> [sub=6]   (60 fps, 180 degree shutter, sub samples per frame)
const { chromium } = require("playwright");
(async () => {
  const [mode, page, out, ...rest] = process.argv.slice(2);
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } }), errs = [];
  p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto("http://localhost:8767/" + page); await p.waitForTimeout(1200); await p.waitForFunction(() => window.__ready !== false && (window.__ready || !document.getElementById("vid")), null, { timeout: 120000 });
  if (mode === "shots") { for (const t of rest) { await p.evaluate(async (t) => { window.__draw(+t); if (window.__settle) await window.__settle(); }, t); await p.screenshot({ path: out + "/f" + t + ".png" }); } }
  else {
    const from = +rest[0], to = +rest[1], sub = +(rest[2] || 6); let n = 0;
    for (let f = Math.round(from * 60); f < Math.round(to * 60); f++) for (let j = 0; j < sub; j++) {
      await p.evaluate(async (t) => { window.__draw(t); if (window.__settle) await window.__settle(); }, f / 60 + (j / sub) * (0.5 / 60));
      await p.screenshot({ path: out + "/s" + String(n++).padStart(6, "0") + ".jpg", type: "jpeg", quality: 96 });
    }
    console.log(n + " samples");
  }
  console.log(errs.slice(0, 8).join("\n") || "no errors"); await b.close();
})();
