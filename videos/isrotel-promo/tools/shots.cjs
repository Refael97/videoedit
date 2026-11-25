const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } }), errs = [];
  p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await p.goto("http://localhost:8767/index.html"); await p.waitForTimeout(800);
  for (const t of process.argv.slice(3)) { await p.evaluate((t) => window.__draw(+t), t); await p.screenshot({ path: process.argv[2] + "/f" + t + ".png" }); }
  console.log(errs.slice(0, 8).join("\n") || "no errors"); await b.close();
})();
