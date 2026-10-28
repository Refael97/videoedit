const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const dir = process.argv[2]; const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const W = +html.match(/data-width="(\d+)"/)[1], H = +html.match(/data-height="(\d+)"/)[1];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(dir, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
srv.listen(0, async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(`http://localhost:${srv.address().port}/index.html`); await p.evaluate(() => window.__hf.buildReady.bench);
  const r = await p.evaluate(() => window.__profile(20)); for (const [k, v] of Object.entries(r)) console.log(k.padEnd(34), Math.round(v)); await b.close(); srv.close(); });
