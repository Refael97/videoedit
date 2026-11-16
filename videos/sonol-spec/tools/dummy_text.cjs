// Draws the dummy data over the wiped fuelling screen with the kit fonts and writes assets/crops/fuel.png at 2x the phone's display width.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const root = process.cwd(), img = fs.readFileSync(path.join(root, 'assets/raw/frames/fuel_wiped.png')).toString('base64');
  const font = (f) => 'data:font/woff2;base64,' + fs.readFileSync(path.join(root, 'assets/kit/fonts', f)).toString('base64');
  const html = `<style>@font-face{font-family:A;font-weight:400;src:url(${font('assistant-hebrew-400-normal.woff2')})}@font-face{font-family:A;font-weight:400;src:url(${font('assistant-latin-400-normal.woff2')});unicode-range:U+0000-00FF}@font-face{font-family:A;font-weight:700;src:url(${font('assistant-latin-700-normal.woff2')});unicode-range:U+0000-00FF}
    body{margin:0}#s{position:relative;width:574px;height:1224px;font-family:A;transform:scale(${752 / 574});transform-origin:0 0}#s img{position:absolute;left:0;top:0}
    .t{position:absolute;white-space:nowrap;line-height:1}</style>
    <div id="s"><img src="data:image/png;base64,${img}" width="574" height="1224">
    <div class="t" style="left:150px;width:274px;top:127px;text-align:center;font-size:26.5px;color:#fff;direction:rtl">היי דניאל, נתחיל לתדלק?</div>
    <div class="t" style="left:362px;width:108px;top:648px;text-align:center;font-size:23px;font-weight:700;color:#2f333d;direction:ltr">12-345-67</div>
    <div class="t" style="left:96px;width:116px;top:730px;text-align:center;font-size:23px;font-weight:700;color:#2f333d;direction:ltr">XXXX-1234</div></div>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 752, height: Math.round(1224 * 752 / 574) } });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(root, 'assets/crops/fuel.png') }); await b.close(); console.log('ok');
})();
