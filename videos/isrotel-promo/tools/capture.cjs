// Captures the real Isrotel site for the promo: page screenshots at desktop width, and a list of links and images.
// Usage: node tools/capture.cjs <out-dir> <url> [name]
const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const out = process.argv[2], url = process.argv[3], name = process.argv[4] || "page";
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ["--ignore-certificate-errors"] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, locale: "he-IL", ignoreHTTPSErrors: true,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" });
  const p = await ctx.newPage();
  const failed = new Set(); p.on("requestfailed", (r) => { try { failed.add(new URL(r.url()).host); } catch (e) {} });
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(6000);
  // close cookie / popup layers if any
  for (const sel of ["button:has-text('אישור')", "button:has-text('מאשר')", "[aria-label='סגור']", ".close", "button:has-text('הבנתי')"]) { try { const e = await p.$(sel); if (e && await e.isVisible()) await e.click({ timeout: 1500 }); } catch (e) {} }
  await p.waitForTimeout(800);
  await p.screenshot({ path: out + "/" + name + "_top.png" });
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 1; for (let y = 1000; y < Math.min(H, 9000); y += 1000) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(1200); await p.screenshot({ path: out + "/" + name + "_s" + String(i++).padStart(2, "0") + ".png" }); }
  const data = await p.evaluate(() => ({
    links: [...document.querySelectorAll("a[href]")].map((a) => [a.innerText.trim().slice(0, 60), a.href]).filter((x) => x[0]),
    imgs: [...document.images].map((im) => [im.currentSrc || im.src, im.naturalWidth, im.naturalHeight, (im.alt || "").slice(0, 60)]).filter((x) => x[1] > 300),
    bg: [...document.querySelectorAll("*")].map((e) => getComputedStyle(e).backgroundImage).filter((s) => s && s.startsWith("url")).slice(0, 60),
    fonts: [...new Set([...document.querySelectorAll("h1,h2,h3,p,a,button")].slice(0, 200).map((e) => getComputedStyle(e).fontFamily))],
  }));
  fs.writeFileSync(out + "/" + name + ".json", JSON.stringify(data, null, 1));
  console.log(name, "height", H, "links", data.links.length, "imgs", data.imgs.length, "failed hosts:", [...failed].join(", "));
  await b.close();
})();
