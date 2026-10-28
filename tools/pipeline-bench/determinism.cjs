// out-of-order test for any page exposing a frame/time seek: renders the same list in several orders,
// each in a FRESH page, and compares a hash of the canvas pixels.
// node determinism.cjs <dir> <fn: __renderAt|__renderFrame> <canvasSel> v1,v2,... [--query=..]
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const [dir, fn, sel, list, ...rest] = process.argv.slice(2); const q = (rest.find((a) => a.startsWith('--query=')) || '').slice(8);
const vals = list.split(',').map(Number);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const W = +html.match(/data-width="(\d+)"/)[1], H = +html.match(/data-height="(\d+)"/)[1];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff': 'font/woff', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((qq, r) => { const u = decodeURIComponent(qq.url.split('?')[0]); const f = path.join(dir, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const shuffle = (a) => { a = a.slice(); let s = 99; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
srv.listen(0, async () => {
  const b = await chromium.launch(); const orders = { seq: vals, reverse: vals.slice().reverse(), shuffle: shuffle(vals), repeat: vals.flatMap((v) => [v, v]) };
  const res = {};
  for (const [name, ord] of Object.entries(orders)) {
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.goto(`http://localhost:${srv.address().port}/index.html${q ? '?' + q : ''}`);
    await p.waitForFunction(() => window.__hf && window.__hf.buildReady && Object.keys(window.__hf.buildReady).length, null, { timeout: 60000 });
    await p.evaluate(() => Promise.all(Object.values(window.__hf.buildReady)));
    res[name] = {};
    for (const v of ord) {
      const h = await p.evaluate(async ([fn, v, sel]) => { await window[fn](v); const c = document.querySelector(sel); const g = c.getContext('webgl2');
        const px = new Uint8Array(c.width * c.height * 4); g.readPixels(0, 0, c.width, c.height, g.RGBA, g.UNSIGNED_BYTE, px);
        const d = await crypto.subtle.digest('SHA-256', px); return [...new Uint8Array(d)].slice(0, 6).map((x) => x.toString(16).padStart(2, '0')).join(''); }, [fn, v, sel]);
      if (res[name][v] && res[name][v] !== h) res[name][v + '_2nd'] = h; else res[name][v] = h;
    }
    await p.close();
  }
  let bad = 0; for (const v of vals) { const hs = new Set(Object.values(res).map((r) => r[v])); Object.values(res).forEach((r) => r[v + '_2nd'] && hs.add(r[v + '_2nd'])); const ok = hs.size === 1; if (!ok) bad++; console.log(String(v).padEnd(8), ok ? 'IDENTICAL' : 'DIFFERS  ', Object.entries(res).map(([n, r]) => n + ':' + r[v] + (r[v + '_2nd'] ? '/' + r[v + '_2nd'] : '')).join(' ')); }
  console.log(bad ? `FAIL: ${bad}/${vals.length} values depend on render order` : `PASS: ${vals.length} values identical across seq / reverse / shuffle / repeat`);
  await b.close(); srv.close();
});
