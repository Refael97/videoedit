// prints the WebGL backend chromium actually uses, for several launch-flag sets
const { chromium } = require('playwright');
const SETS = { default: [], 'angle-swiftshader': ['--use-angle=swiftshader','--enable-unsafe-swiftshader'], 'angle-vulkan': ['--use-angle=vulkan','--enable-features=Vulkan'], 'gl-egl': ['--use-gl=angle','--use-angle=gl'], 'angle-metal(mac)': ['--use-angle=metal'] };
(async () => {
  for (const [name, args] of Object.entries(SETS)) {
    let b; try {
      b = await chromium.launch({ args, ...(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {}), headless: !process.env.HEADFUL });
      const p = await b.newPage();
      const r = await p.evaluate(() => { const c = document.createElement('canvas'); const g = c.getContext('webgl2'); if (!g) return { webgl2: false };
        const e = g.getExtension('WEBGL_debug_renderer_info'); return { webgl2: true, vendor: e && g.getParameter(e.UNMASKED_VENDOR_WEBGL), renderer: e && g.getParameter(e.UNMASKED_RENDERER_WEBGL), maxSamples: g.getParameter(g.MAX_SAMPLES), maxTex: g.getParameter(g.MAX_TEXTURE_SIZE), halfFloatRT: !!g.getExtension('EXT_color_buffer_float') }; });
      console.log(name.padEnd(18), JSON.stringify(r));
    } catch (e) { console.log(name.padEnd(18), 'FAIL', e.message.split('\n')[0]); } finally { b && await b.close(); }
  }
  console.log('chromium', chromium.executablePath());
})();
