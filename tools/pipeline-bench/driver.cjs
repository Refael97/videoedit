// proposed frame-driven pipeline: load once per worker, seek by frame index, capture the canvas, encode separately.
// node driver.cjs <projDir> <outDir> --capture=jpeg|png|raw --workers=N --order=seq|shuffle|reverse [--frames=a-b]
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const [dir, outDir, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((a) => { const s = a.replace(/^--/, ''); const i = s.indexOf('='); return i < 0 ? [s, '1'] : [s.slice(0, i), s.slice(i + 1)]; }));
const CAP = opt.capture || 'jpeg', WORKERS = +(opt.workers || 1), ORDER = opt.order || 'seq';
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const W = +html.match(/data-width="(\d+)"/)[1], H = +html.match(/data-height="(\d+)"/)[1];
const FPS = +html.match(/data-fps="(\d+)"/)[1], FRAMES = Math.round(+html.match(/data-duration="([\d.]+)"/)[1] * FPS);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2' };
fs.mkdirSync(outDir, { recursive: true });
let frames = [...Array(FRAMES).keys()];
if (opt.frames) { const [a, b] = opt.frames.split('-').map(Number); frames = frames.filter((f) => f >= a && f <= b); }
if (ORDER === 'reverse') frames.reverse();
if (ORDER === 'shuffle') { let s = 12345; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = frames.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [frames[i], frames[j]] = [frames[j], frames[i]]; } }
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(dir, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
srv.listen(0, async () => {
  const port = srv.address().port; const T = { launch: 0, load: 0, render: 0, capture: 0, write: 0 }; const hashes = {};
  const chunks = [...Array(WORKERS)].map((_, w) => frames.filter((_, i) => i % WORKERS === w)); // interleaved: also exercises non-sequential order per worker
  const t0 = Date.now(); let peakRss = 0;
  await Promise.all(chunks.map(async (list) => {
    let a = Date.now(); const b = await chromium.launch({ args: (opt.args || '').split(',').filter(Boolean), ...(opt.channel ? { channel: opt.channel } : {}), headless: !opt.headful }); T.launch += Date.now() - a;
    a = Date.now(); const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.goto(`http://localhost:${port}/index.html${opt.query ? '?' + opt.query : ''}`); T.goto = (T.goto||0) + Date.now() - a; await p.evaluate(() => window.__hf.buildReady.bench); await p.evaluate(() => window.__renderFrame(0)); T.load += Date.now() - a; const ld = await p.evaluate(() => ({ s: window.__stats.scriptAt, b: window.__stats.builtAt })); T.scriptAt = ld.s; T.builtAt = ld.b;
    const cv = await p.$(opt.sel || '#gl');
    for (const f of list) {
      a = Date.now(); await p.evaluate((f) => window.__renderFrame(f), f); T.render += Date.now() - a;
      a = Date.now(); let buf;
      if (CAP === 'raw') { const b64 = await p.evaluate(() => { const g = document.getElementById('gl').getContext('webgl2'); const px = new Uint8Array(g.drawingBufferWidth * g.drawingBufferHeight * 4); g.readPixels(0, 0, g.drawingBufferWidth, g.drawingBufferHeight, g.RGBA, g.UNSIGNED_BYTE, px); let s = ''; for (let i = 0; i < px.length; i += 0x8000) s += String.fromCharCode.apply(null, px.subarray(i, i + 0x8000)); return btoa(s); }); buf = Buffer.from(b64, 'base64'); }
      else buf = await cv.screenshot({ type: CAP, ...(CAP === 'jpeg' ? { quality: 95 } : {}) });
      T.capture += Date.now() - a;
      a = Date.now(); fs.writeFileSync(path.join(outDir, `f${String(f).padStart(5, '0')}.${CAP === 'raw' ? 'rgba' : CAP === 'jpeg' ? 'jpg' : 'png'}`), buf); T.write += Date.now() - a;
      if (opt.hash) { const raw = CAP === 'raw' ? buf : buf; hashes[f] = crypto.createHash('md5').update(raw).digest('hex'); }
    }
    const st = await p.evaluate(() => ({ renders: window.__stats.renders, renderMs: window.__stats.renderMs, buildMs: window.__stats.buildMs, heap: performance.memory ? performance.memory.usedJSHeapSize : 0 }));
    T.inPageRenderMs = (T.inPageRenderMs || 0) + st.renderMs; T.buildMs = st.buildMs; T.renders = (T.renders || 0) + st.renders; T.heapMB = Math.max(T.heapMB || 0, st.heap / 1e6);
    await b.close();
  }));
  T.wall = Date.now() - t0; T.frames = frames.length; T.W = W; T.H = H; T.capture_mode = CAP; T.workers = WORKERS; T.order = ORDER;
  if (opt.hash) fs.writeFileSync(path.join(outDir, 'hashes.json'), JSON.stringify(hashes));
  console.log(JSON.stringify(T)); srv.close();
});
