// stills for the verify loop: node shots.cjs <out-dir> <t1,t2,...> [scale]   (t = film seconds)
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".json": "application/json" };
(async () => {
  const out = process.argv[2], ts = process.argv[3].split(",").map(Number), sc = +(process.argv[4] || 1);
  const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); r.end(d); } }); }).listen(0);
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: sc });
  p.on("pageerror", (e) => console.log("PAGE ERROR", e.message)); p.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE", m.text()); });
  await p.goto("http://127.0.0.1:" + srv.address().port + "/index.html");
  await p.waitForFunction(() => window.__renderAt, null, { timeout: 120000 });
  for (const t of ts) {
    const t0 = Date.now(); await p.evaluate((t) => window.__renderAt(t), t);
    await p.screenshot({ path: path.join(out, "f_" + t.toFixed(2).padStart(5, "0") + ".png") }); console.log(t, Date.now() - t0, "ms");
  }
  await b.close(); srv.close();
})();
