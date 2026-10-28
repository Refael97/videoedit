// times load/build and per-frame render (GPU-synced) of the real charta-v2 composition at several timestamps
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const dir = process.argv[2], times = process.argv[3].split(',').map(Number);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(dir, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
srv.listen(0, async () => {
  let a = Date.now(); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`http://localhost:${srv.address().port}/index.html`); const gotoMs = Date.now() - a;
  await p.waitForFunction(() => window.__hf && window.__hf.buildReady && Object.keys(window.__hf.buildReady).length);
  await p.evaluate(() => Promise.all(Object.values(window.__hf.buildReady))); const builtMs = Date.now() - a;
  console.log('goto', gotoMs, 'ms; build+first frame', builtMs, 'ms; heap', await p.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1e6)), 'MB');
  for (const t of times) for (const pass of ['first', 'again']) {
    const ms = await p.evaluate((t) => { const g = document.getElementById('gl').getContext('webgl2'); const px = new Uint8Array(4); const a = performance.now(); window.__renderAt(t); g.readPixels(0, 0, 1, 1, g.RGBA, g.UNSIGNED_BYTE, px); return performance.now() - a; }, t);
    console.log('t', String(t).padEnd(6), pass.padEnd(6), Math.round(ms), 'ms');
  }
  console.log('heap after', await p.evaluate(() => Math.round(performance.memory.usedJSHeapSize / 1e6)), 'MB');
  await b.close(); srv.close();
});
