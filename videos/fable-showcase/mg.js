// Scene 2 of the Fable 5.2 showcase: the "Motion Graphic" board.
//   The orb's burst washes the frame to a light, living backdrop. A liquid-glass button sits in the middle; a cursor clicks it.
//   Then the camera travels a board six screens big (3 x 2), whipping between areas and settling on each:
//   an iPhone rising with a player, a bento of glass tiles, bold kinetic bands, and a sunset card it pushes into until the card
//   is the whole frame, where "VFX" rises like the sun.
// Everything is DOM on the shared, seekable GSAP timeline; the camera is computed per frame in update(t).
export function initMG({ gsap, tl, T2, DPR }) {
  const IR = { immediateRender: false };
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
  const ft = (sel, from, to, at) => { tl.set(sel, from, 0); tl.fromTo(sel, from, { ...to, ...IR }, at); };
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const inOutExpo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
  const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2), outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

  // ---------- times ----------
  const T = { wash: T2 + 0.32, btn: T2 + 0.8, click: T2 + 1.5, s1: T2 + 1.62, s2: T2 + 2.6, s3: T2 + 3.55, s4: T2 + 4.5, push: T2 + 4.85, full: T2 + 5.55, vfx: T2 + 5.7, end: T2 + 7.2 };
  const WH = 0.32; // whip length
  const H0 = [2880, 540], R1 = [4800, 540], R2 = [4800, 1620], R3 = [2880, 1620], R4 = [960, 1620];
  const SUN = "linear-gradient(120deg,#ff9a3d 0%,#ff5f6d 45%,#b45cff 100%)";

  // ---------- styles ----------
  const css = document.createElement("style"); css.textContent = `
    #mg { position: absolute; inset: 0; overflow: hidden; font-family: "UI", sans-serif; color: #17131c; }
    #mgbg { position: absolute; inset: -260px; background: linear-gradient(155deg, #fbf3ec 0%, #f4ecf6 55%, #eaf1fb 100%); }
    #mgbg i { position: absolute; border-radius: 50%; filter: blur(110px); }
    #mggrain { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(rgba(40,25,60,.9) 0.6px, transparent 0.7px); background-size: 4px 4px; pointer-events: none; }
    #board { position: absolute; left: 0; top: 0; width: 5760px; height: 2160px; transform-origin: 0 0; will-change: transform, filter;
      background-image: radial-gradient(rgba(60,40,90,.16) 1.6px, transparent 1.8px); background-size: 60px 60px; }
    .glass { background: rgba(255,255,255,.46); backdrop-filter: blur(22px) saturate(1.5); border-radius: 44px;
      box-shadow: inset 0 1.5px 0 rgba(255,255,255,.95), inset 0 0 0 1.5px rgba(255,255,255,.55), 0 30px 70px rgba(70,40,110,.16), 0 4px 12px rgba(70,40,110,.07); position: absolute; }
    .grad { background: ${SUN}; -webkit-background-clip: text; background-clip: text; color: transparent; }
    /* the liquid-glass button */
    #lg { position: absolute; left: 2600px; top: 474px; width: 560px; height: 132px; border-radius: 66px; }
    #lg .body { position: absolute; inset: 0; border-radius: 66px; background: linear-gradient(180deg, rgba(60,30,90,.20), rgba(60,30,90,.10)); backdrop-filter: url(#lgf) blur(2.5px) saturate(1.8) brightness(1.06);
      box-shadow: inset 0 2px 1.5px rgba(255,255,255,.95), inset 0 -2px 2px rgba(255,255,255,.45), inset 2px 0 2px rgba(255,255,255,.35), inset -2px 0 2px rgba(255,255,255,.35), inset 0 0 26px rgba(255,255,255,.30), 0 26px 60px rgba(70,35,110,.28), 0 6px 16px rgba(70,35,110,.14); }
    #lg .sheen { position: absolute; left: 22px; right: 22px; top: 7px; height: 46px; border-radius: 40px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); }
    #lg .tx { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 46px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 0 2px 10px rgba(60,25,90,.35); }
    #ripple { position: absolute; left: 2880px; top: 540px; width: 0; height: 0; }
    #ripple i { position: absolute; left: -330px; top: -330px; width: 660px; height: 660px; border-radius: 50%; border: 3px solid rgba(255,255,255,.9); box-shadow: 0 0 40px rgba(255,150,90,.5); }
    #mgcursor { position: absolute; left: 0; top: 0; width: 40px; height: 40px; filter: drop-shadow(0 3px 5px rgba(40,20,60,.4)); }
    /* R1: iPhone */
    #ph { position: absolute; left: 4330px; top: 150px; width: 384px; height: 790px; border-radius: 66px; background: linear-gradient(145deg, #f7b98a, #d9773f 45%, #a8501f); box-shadow: 0 60px 110px rgba(80,40,90,.35), inset 0 0 0 2px rgba(255,255,255,.35); }
    #ph .scr { position: absolute; inset: 11px; border-radius: 56px; overflow: hidden; background: #0f0b14; color: #fff; }
    #ph .art { position: absolute; left: 30px; top: 96px; width: 302px; height: 302px; border-radius: 30px; background: linear-gradient(180deg,#31115e 0%,#8d2c8c 38%,#f0527a 62%,#ff9a3d 82%,#ffd98a 100%); overflow: hidden; }
    #ph .art b { position: absolute; left: 101px; top: 150px; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(#fff6d8, #ffd27a 60%, #ff9a3d); box-shadow: 0 0 60px #ffb35c; }
    #ph .art u { position: absolute; left: 0; right: 0; bottom: 0; height: 84px; background: linear-gradient(180deg, rgba(60,10,70,.75), rgba(20,5,40,.95)); }
    #ph h5 { position: absolute; left: 32px; top: 428px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.4px; }
    #ph h6 { position: absolute; left: 32px; top: 470px; margin: 0; font-size: 21px; font-weight: 500; color: rgba(255,255,255,.55); }
    #eq { position: absolute; right: 34px; top: 440px; width: 46px; height: 40px; display: flex; gap: 5px; align-items: flex-end; }
    #eq i { flex: 1; height: 100%; border-radius: 3px; background: #ff8a4c; transform-origin: 50% 100%; }
    #bar { position: absolute; left: 32px; right: 32px; top: 532px; height: 7px; border-radius: 4px; background: rgba(255,255,255,.18); } #bar i { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; border-radius: 4px; background: #fff; transform-origin: 0 50%; }
    #ctl { position: absolute; left: 0; right: 0; top: 584px; display: flex; justify-content: center; align-items: center; gap: 46px; } #ctl svg { width: 46px; height: 46px; fill: #fff; } #ctl .pl { width: 84px; height: 84px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; } #ctl .pl svg { fill: #0f0b14; width: 38px; height: 38px; }
    #di { position: absolute; left: 50%; top: 18px; width: 118px; height: 34px; margin-left: -59px; border-radius: 24px; background: #000; overflow: hidden; } #di span { position: absolute; left: 14px; top: 9px; width: 30px; height: 30px; border-radius: 9px; background: ${SUN}; } #di em { position: absolute; right: 16px; top: 13px; width: 60px; height: 22px; display: flex; gap: 4px; align-items: center; } #di em i { flex: 1; height: 100%; border-radius: 2px; background: #ff8a4c; }
    #r1t { position: absolute; left: 4800px; top: 318px; width: 760px; font-size: 132px; font-weight: 700; line-height: 1.02; letter-spacing: -5px; }
    #r1t .w, .w { display: inline-block; }
    .chip { position: absolute; height: 68px; padding: 0 30px; border-radius: 34px; display: flex; align-items: center; font-size: 28px; font-weight: 600; }
    /* R2: bento */
    .tile h4 { margin: 30px 34px 0; font-size: 24px; font-weight: 600; color: rgba(30,20,45,.55); }
    #rings { position: absolute; left: 110px; top: 118px; width: 400px; height: 400px; transform: rotate(-90deg); } #rings circle { fill: none; stroke-width: 44; stroke-linecap: round; }
    .big { position: absolute; left: 34px; bottom: 18px; font-size: 168px; font-weight: 700; letter-spacing: -8px; line-height: 1; }
    .big small { font-size: 48px; letter-spacing: -1px; font-weight: 600; color: rgba(30,20,45,.5); margin-left: 12px; }
    .sw { position: absolute; left: 34px; width: 372px; height: 58px; display: flex; align-items: center; justify-content: space-between; font-size: 27px; font-weight: 600; }
    .sw u { position: relative; width: 96px; height: 56px; border-radius: 28px; background: rgba(60,45,80,.18); } .sw u b { position: absolute; left: 0; top: 0; width: 96px; height: 56px; border-radius: 28px; background: ${SUN}; } .sw u i { position: absolute; left: 5px; top: 5px; width: 46px; height: 46px; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(0,0,0,.22); }
    #k4 { position: absolute; left: 0; right: 0; top: 74px; text-align: center; font-family: "Display", "UI", sans-serif; font-size: 150px; font-weight: 800; letter-spacing: -6px; }
    /* R3: bold bands */
    .band { position: absolute; left: 1790px; width: 2070px; height: 190px; display: flex; align-items: center; overflow: hidden; white-space: nowrap; font-family: "Display", "UI", sans-serif; font-size: 118px; font-weight: 800; letter-spacing: -3px; transform-origin: 50% 50%; }
    .band span { display: inline-block; padding-right: 60px; }
    #st { position: absolute; left: 3420px; top: 1180px; width: 300px; height: 300px; }
    #pc { position: absolute; left: 2090px; top: 1900px; height: 118px; padding: 0 46px; border-radius: 60px; background: #17131c; color: #fff; font-size: 62px; font-weight: 700; letter-spacing: -2px; display: flex; align-items: center; gap: 18px; } #pc i { width: 26px; height: 26px; border-radius: 50%; background: #ff8a4c; }
    /* R4: the sunset card -> the VFX sunrise */
    #sun { position: absolute; left: 600px; top: 1395px; width: 720px; height: 450px; border-radius: 46px; overflow: hidden; box-shadow: 0 50px 100px rgba(80,30,110,.35), 0 0 0 2px rgba(255,255,255,.5); background: #1a0b33; }
    #sky { position: absolute; left: 0; right: 0; top: 0; height: 62%; overflow: hidden; background: linear-gradient(180deg,#1c0a3d 0%,#4a1470 26%,#a52c86 52%,#f0527a 72%,#ff9a3d 90%,#ffd98a 100%); }
    #dawn { position: absolute; inset: 0; background: linear-gradient(180deg,#3a6fd8 0%,#7fb4ff 34%,#ffc79a 72%,#ffe9b8 100%); }
    #disc { position: absolute; left: 50%; top: 100%; width: 190px; height: 190px; margin: -95px 0 0 -95px; border-radius: 50%; background: radial-gradient(#fffdf2 0%, #ffe9a8 45%, #ffb35c 100%); box-shadow: 0 0 90px 30px rgba(255,190,110,.75), 0 0 220px 90px rgba(255,150,90,.45); }
    #vfx { position: absolute; left: 0; right: 0; bottom: -6px; text-align: center; font-family: "Display", "UI", sans-serif; font-size: 178px; font-weight: 800; letter-spacing: 6px; line-height: 0.8; color: #fff; text-shadow: 0 0 40px rgba(255,220,160,.9), 0 0 110px rgba(255,150,90,.7); }
    #vfx span { display: inline-block; }
    #sea { position: absolute; left: 0; right: 0; bottom: 0; height: 38%; overflow: hidden; background: linear-gradient(180deg,#b8436f 0%,#5a1c6b 40%,#1c0a3d 100%); }
    #sea .day { position: absolute; inset: 0; background: linear-gradient(180deg,#f2b48f 0%,#6f8fd6 45%,#274a9a 100%); }
    #sea .glit { position: absolute; left: 50%; top: 0; width: 360px; height: 100%; margin-left: -180px; background: repeating-linear-gradient(180deg, rgba(255,235,190,.95) 0 3px, rgba(255,235,190,0) 3px 11px); -webkit-mask-image: radial-gradient(ellipse 50% 100% at 50% 0%, #000 0%, transparent 100%); mask-image: radial-gradient(ellipse 50% 100% at 50% 0%, #000 0%, transparent 100%); }
    #sea .refl { position: absolute; left: 0; right: 0; top: -4px; text-align: center; font-family: "Display", "UI", sans-serif; font-size: 178px; font-weight: 800; letter-spacing: 6px; line-height: 0.8; color: #fff; transform: scaleY(-0.62); transform-origin: 50% 0; filter: blur(5px); opacity: 0.32; }
    #hz { position: absolute; left: 0; right: 0; top: 62%; height: 3px; margin-top: -1.5px; background: rgba(255,240,210,.85); box-shadow: 0 0 18px rgba(255,210,150,.9); }
  `; document.head.appendChild(css);

  // ---------- DOM ----------
  const mg = document.createElement("div"); mg.id = "mg"; $("#root").appendChild(mg);
  const eqBars = (n) => Array.from({ length: n }, () => "<i></i>").join("");
  const star = (n, r1, r2) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (150 + Math.cos(a) * r).toFixed(1) + "," + (150 + Math.sin(a) * r).toFixed(1); } return d + "Z"; };
  const rep = (s, n) => Array.from({ length: n }, () => "<span>" + s + "</span>").join("");
  mg.innerHTML = `
    <svg width="0" height="0" style="position:absolute"><defs><filter id="lgf" x="0" y="0" width="560" height="132" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage id="lgmap" x="0" y="0" width="560" height="132" result="map" preserveAspectRatio="none" /><feDisplacementMap in="SourceGraphic" in2="map" scale="54" xChannelSelector="R" yChannelSelector="G" /></filter>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a3d" /><stop offset=".5" stop-color="#ff5f6d" /><stop offset="1" stop-color="#b45cff" /></linearGradient></defs></svg>
    <div id="mgbg"><i style="left:100px;top:40px;width:900px;height:800px;background:#ffb98f"></i><i style="left:1300px;top:-120px;width:900px;height:760px;background:#c7b5ff"></i><i style="left:640px;top:700px;width:1000px;height:700px;background:#ffa7b4"></i><i style="left:1700px;top:760px;width:800px;height:700px;background:#a9dcff"></i><i style="left:-200px;top:820px;width:760px;height:640px;background:#ffd79a"></i></div>
    <div id="board">
      <div id="ripple"><i></i></div>
      <div id="lg"><div class="body"></div><div class="sheen"></div><div class="tx">Motion Graphic</div></div>

      <div id="r1t"><span class="w">Fluid</span><br /><span class="w">by</span> <span class="w grad">design.</span></div>
      <div class="chip glass" id="c1" style="left:4806px;top:626px">120 Hz</div><div class="chip glass" id="c2" style="left:4990px;top:626px">Spring physics</div><div class="chip glass" id="c3" style="left:4806px;top:714px">Made in code</div>
      <div id="phw" style="position:absolute;left:0;top:0;perspective:2400px;perspective-origin:4520px 545px"><div id="ph"><div class="scr">
        <div id="di"><span></span><em>${eqBars(6)}</em></div>
        <div class="art"><b></b><u></u></div><h5>Golden Hour</h5><h6>Fable 5.2</h6><div id="eq">${eqBars(5)}</div>
        <div id="bar"><i></i></div>
        <div id="ctl"><svg viewBox="0 0 24 24"><path d="M19 5v14l-9-7zM6 5h2.4v14H6z" /></svg><div class="pl"><svg viewBox="0 0 24 24"><path d="M7 4.5h3.6v15H7zM13.4 4.5H17v15h-3.6z" /></svg></div><svg viewBox="0 0 24 24"><path d="M5 5v14l9-7zM15.6 5H18v14h-2.4z" /></svg></div>
      </div></div></div>

      <div class="glass tile" id="tA" style="left:3936px;top:1310px;width:620px;height:620px"><h4>Activity</h4><svg id="rings" viewBox="0 0 400 400"><g opacity=".16"><circle cx="200" cy="200" r="170" stroke="#ff4d6d" /><circle cx="200" cy="200" r="118" stroke="#ff9a3d" /><circle cx="200" cy="200" r="66" stroke="#b45cff" /></g><circle class="rg" cx="200" cy="200" r="170" stroke="#ff4d6d" /><circle class="rg" cx="200" cy="200" r="118" stroke="#ff9a3d" /><circle class="rg" cx="200" cy="200" r="66" stroke="#b45cff" /></svg></div>
      <div class="glass tile" id="tB" style="left:4580px;top:1310px;width:620px;height:298px"><h4>Frame rate</h4><div class="big"><span id="fps">0</span><small>fps</small></div></div>
      <div class="glass tile" id="tC" style="left:4580px;top:1632px;width:620px;height:298px"><h4>Growth</h4><svg viewBox="0 0 620 298" style="position:absolute;left:0;top:0;width:620px;height:298px"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a5c" stop-opacity=".45" /><stop offset="1" stop-color="#ff7a5c" stop-opacity="0" /></linearGradient><clipPath id="cl"><rect id="clr" x="0" y="0" width="620" height="298" /></clipPath></defs>
        <g clip-path="url(#cl)"><path d="M34,236 C120,226 150,170 220,176 S320,120 380,128 S480,60 586,52 L586,266 L34,266 Z" fill="url(#ar)" /><path d="M34,236 C120,226 150,170 220,176 S320,120 380,128 S480,60 586,52" fill="none" stroke="url(#sg)" stroke-width="9" stroke-linecap="round" /></g></svg></div>
      <div class="glass tile" id="tD" style="left:5224px;top:1310px;width:440px;height:298px"><h4>Controls</h4><div class="sw" style="top:88px">Motion blur<u><b></b><i></i></u></div><div class="sw" style="top:156px">Depth<u><b></b><i></i></u></div><div class="sw" style="top:224px">Glass<u><b></b><i></i></u></div></div>
      <div class="glass tile" id="tE" style="left:5224px;top:1632px;width:440px;height:298px"><h4>Resolution</h4><div id="k4" class="grad">4K</div></div>

      <div class="band" id="b1" style="top:1420px;background:#17131c;color:#fff">${rep("MOTION GRAPHICS ✺", 6)}</div>
      <div class="band" id="b2" style="top:1640px;background:${SUN};color:#17131c">${rep("PREMIUM · SMOOTH · 60 FPS ·", 5)}</div>
      <svg id="st" viewBox="0 0 300 300"><path d="${star(14, 148, 92)}" fill="url(#sg)" /></svg>
      <div id="pc"><i></i><span id="pct">+0%</span></div>

      <div id="sun"><div id="sky"><div id="dawn"></div><div id="disc"></div><div id="vfx"><span>V</span><span>F</span><span>X</span></div></div>
        <div id="sea"><div class="day"></div><div class="glit"></div><div class="refl">VFX</div></div><div id="hz"></div></div>
    </div>
    <div id="mggrain"></div>
    <svg id="mgcursor" viewBox="0 0 24 24"><path d="M5 3l14 8.5-6.2 1.3L9.5 19z" fill="#fff" stroke="#17131c" stroke-width="1.3" stroke-linejoin="round" /></svg>`;

  // the lens map for the glass button: neutral in the middle, pushing inward along the rim (a convex bezel)
  { const w = 560, h = 132, r = 66, c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"), im = g.createImageData(w, h), BZ = 30;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const cx = clamp(x, r, w - r), dx = x - cx, dy = y - h / 2, d = Math.hypot(dx, dy), e = clamp((d - (r - BZ)) / BZ), k = e * e, i = (y * w + x) * 4;
      im.data[i] = 128 + (d ? (dx / d) * k * 127 : 0); im.data[i + 1] = 128 + (d ? (dy / d) * k * 127 : 0); im.data[i + 2] = 128; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); $("#lgmap").setAttribute("href", c.toDataURL()); }

  // ---------- reveal: the burst washes the frame to light ----------
  tl.set(mg, { opacity: 1, clipPath: "circle(0px at 960px 540px)" }, 0);
  tl.fromTo(mg, { clipPath: "circle(0px at 960px 540px)" }, { clipPath: "circle(1250px at 960px 540px)", duration: 0.62, ease: "power3.in", ...IR }, T.wash);
  // ---------- the button + cursor ----------
  ft("#lg", { opacity: 0, scale: 0.55, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "back.out(1.6)" }, T.btn);
  tl.set("#mgcursor", { x: 1500, y: 1130, opacity: 1 }, 0);
  tl.to("#mgcursor", { x: 1010, y: 560, duration: 0.5, ease: "power3.out" }, T.click - 0.6);
  tl.to("#mgcursor", { scale: 0.8, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: "20% 15%" }, T.click - 0.05);
  tl.to("#lg", { scale: 0.93, duration: 0.08, ease: "power2.out" }, T.click - 0.04); tl.to("#lg", { scale: 1.08, duration: 0.22, ease: "back.out(3)" }, T.click + 0.04);
  ft("#ripple i", { scale: 0.3, opacity: 0 }, { keyframes: [{ scale: 0.5, opacity: 1, duration: 0.05 }, { scale: 2.4, opacity: 0, duration: 0.5, ease: "power2.out" }] }, T.click);
  tl.to("#mgcursor", { opacity: 0, duration: 0.12 }, T.click + 0.14);
  // ---------- R1: the iPhone rises ----------
  ft("#ph", { y: 900, rotationY: -34, rotationX: 14, rotationZ: 6 }, { y: 0, rotationY: -14, rotationX: 4, rotationZ: 0, duration: 0.95, ease: "expo.out" }, T.s1 + 0.08);
  tl.to("#ph", { rotationY: -6, y: -14, duration: 1.2, ease: "sine.inOut" }, T.s1 + 1.0);
  tl.fromTo("#bar i", { scaleX: 0.12 }, { scaleX: 0.9, duration: 7, ease: "none", ...IR }, T2);
  $$("#eq i, #di em i").forEach((b, i) => tl.fromTo(b, { scaleY: 0.25 }, { scaleY: 1, duration: 0.16 + (i % 3) * 0.05, ease: "sine.inOut", yoyo: true, repeat: 40, ...IR }, T2 + i * 0.07));
  tl.to("#di", { width: 300, marginLeft: -150, height: 50, duration: 0.45, ease: "back.out(1.5)" }, T.s1 + 0.55);
  ft("#di span, #di em", { opacity: 0 }, { opacity: 1, duration: 0.2 }, T.s1 + 0.7);
  $$("#r1t .w").forEach((w, i) => ft(w, { opacity: 0, y: 60, filter: "blur(18px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, T.s1 + 0.22 + i * 0.1));
  ["#c1", "#c2", "#c3"].forEach((c, i) => ft(c, { opacity: 0, scale: 0.5, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, T.s1 + 0.5 + i * 0.08));
  // ---------- R2: bento ----------
  ["#tA", "#tB", "#tD", "#tC", "#tE"].forEach((s, i) => ft(s, { opacity: 0, scale: 0.8, y: 70 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }, T.s2 + 0.06 + i * 0.06));
  $$("#rings .rg").forEach((c, i) => { const L = 2 * Math.PI * +c.getAttribute("r"); ft(c, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: L * [0.16, 0.3, 0.42][i], duration: 0.9, ease: "power3.out" }, T.s2 + 0.2 + i * 0.1); });
  const cnt = { v: 0, p: 0 }; tl.fromTo(cnt, { v: 0 }, { v: 60, duration: 0.75, ease: "power2.out", onUpdate: () => ($("#fps").textContent = Math.round(cnt.v)), ...IR }, T.s2 + 0.2);
  ft("#clr", { attr: { width: 0 } }, { attr: { width: 620 }, duration: 0.85, ease: "power2.inOut" }, T.s2 + 0.22);
  $$(".sw u").forEach((u, i) => { ft(u.querySelector("b"), { opacity: 0 }, { opacity: 1, duration: 0.22 }, T.s2 + 0.34 + i * 0.14); ft(u.querySelector("i"), { x: 0 }, { x: 40, duration: 0.26, ease: "back.out(2)" }, T.s2 + 0.34 + i * 0.14); });
  ft("#k4", { backgroundPosition: "0% 50%", backgroundSize: "220% 100%" }, { backgroundPosition: "100% 50%", duration: 1.2, ease: "sine.inOut" }, T.s2 + 0.2);
  // ---------- R3: bold bands ----------
  ft("#b1", { rotation: -7, x: -2100, opacity: 0 }, { rotation: -7, x: 0, opacity: 1, duration: 0.55, ease: "expo.out" }, T.s3 + 0.1); ft("#b2", { rotation: -7, x: -2300, opacity: 0 }, { rotation: -7, x: 0, opacity: 1, duration: 0.6, ease: "expo.out" }, T.s3 + 0.16);
  tl.fromTo("#b1 span", { x: 0 }, { x: -520, duration: 3, ease: "none", ...IR }, T.s3 - 0.1); tl.fromTo("#b2 span", { x: -700 }, { x: -180, duration: 3, ease: "none", ...IR }, T.s3 - 0.1);
  tl.fromTo("#st", { rotation: 0 }, { rotation: 300, duration: 7, ease: "none", ...IR }, T2); ft("#st", { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(2)", overwrite: false }, T.s3 + 0.1);
  ft("#pc", { scale: 0, rotation: 8 }, { scale: 1, rotation: -7, duration: 0.5, ease: "back.out(1.8)" }, T.s3 + 0.2);
  tl.fromTo(cnt, { p: 0 }, { p: 128, duration: 0.7, ease: "power2.out", onUpdate: () => ($("#pct").textContent = "+" + Math.round(cnt.p) + "%"), ...IR }, T.s3 + 0.25);
  // ---------- R4: the sunset card, then the VFX sunrise ----------
  ft("#sun", { scale: 0.86, y: 60 }, { scale: 1, y: 0, duration: 0.6, ease: "expo.out" }, T.s4 + 0.05);
  tl.to("#sun", { borderRadius: 0, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.5 }, T.push + 0.2);
  tl.set("#dawn, #sea .day", { opacity: 0 }, 0); tl.set("#disc", { y: 60 }, 0); tl.set("#sea .refl", { opacity: 0 }, 0);
  tl.to("#disc", { y: -150, duration: 1.5, ease: "power2.out" }, T.vfx - 0.1);
  tl.to("#dawn", { opacity: 0.85, duration: 1.5, ease: "sine.inOut" }, T.vfx); tl.to("#sea .day", { opacity: 0.8, duration: 1.5, ease: "sine.inOut" }, T.vfx);
  $$("#vfx span").forEach((s, i) => ft(s, { y: 190 }, { y: 0, duration: 0.95, ease: "expo.out" }, T.vfx + 0.12 + i * 0.1));
  tl.to("#sea .refl", { opacity: 0.32, duration: 0.6 }, T.vfx + 0.5);
  tl.fromTo("#sea .glit", { backgroundPositionY: "0px" }, { backgroundPositionY: "44px", duration: 3, ease: "none", ...IR }, T.s4);

  // ---------- camera ----------
  const KEYS = [[T2, H0, 1.0, 0], [T.click, H0, 1.07, 0], [T.s1 - 0.0, H0, 1.07, 1], [T.s1 + WH, R1, 1.0, 0], [T.s2, [R1[0] + 30, R1[1]], 1.05, 1], [T.s2 + WH, R2, 1.0, 0], [T.s3, [R2[0], R2[1] - 20], 1.05, 1],
    [T.s3 + WH, R3, 1.0, 0], [T.s4, [R3[0] - 40, R3[1]], 1.05, 1], [T.s4 + WH, R4, 1.0, 0], [T.push, R4, 1.03, 2], [T.full, [960, 1620], 2.78, 0], [T.end, [960, 1612], 2.9, 0]];
  const camAt = (t) => { let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++; const A = KEYS[i], B = KEYS[i + 1], k0 = seg(t, A[0], B[0]), k = A[3] === 1 ? inOutExpo(k0) : A[3] === 2 ? inOutCubic(k0) : k0;
    return { x: lerp(A[1][0], B[1][0], k), y: lerp(A[1][1], B[1][1], k), s: lerp(A[2], B[2], k) }; };
  const board = $("#board"), bg = $("#mgbg");
  function update(t) {
    if (t < T.wash - 0.05) { mg.style.visibility = "hidden"; return; } mg.style.visibility = "visible";
    const c = camAt(t), p = camAt(t - 1 / 120), v = Math.hypot(c.x - p.x, c.y - p.y) * 120; // px per second on the board
    board.style.transform = "translate(" + (960 - c.x * c.s).toFixed(2) + "px," + (540 - c.y * c.s).toFixed(2) + "px) scale(" + c.s.toFixed(4) + ")";
    const bl = Math.min(16, v * 0.0016); board.style.filter = bl > 0.4 ? "blur(" + bl.toFixed(1) + "px)" : "none";
    bg.style.transform = "translate(" + (-(c.x - 2880) * 0.09).toFixed(1) + "px," + (-(c.y - 540) * 0.09 + Math.sin(t * 0.8) * 14).toFixed(1) + "px)";
  }
  return { update, T };
}
