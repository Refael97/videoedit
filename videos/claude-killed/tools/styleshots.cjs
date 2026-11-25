const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("http://localhost:8766/styleframes/styles.html"); await p.waitForTimeout(900);
  for (let i = 1; i <= 5; i++) await (await p.$("#s" + i)).screenshot({ path: "styleframes/s" + i + ".png" });
  await b.close();
})();
