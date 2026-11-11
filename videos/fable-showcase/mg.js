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
  const T = { wash: T2 + 0.32, btn: T2 + 0.8, click: T2 + 1.5, s1: T2 + 1.62, s2: T2 + 2.62, s3: T2 + 3.75, push: T2 + 4.7, full: T2 + 5.5, vfx: T2 + 5.6, end: T2 + 7.2 };
  const WH = 0.32; // whip length
  const H0 = [2880, 540], R1 = [4800, 540], R2 = [4800, 1620], R3 = [2880, 1620], PH = [2659, 1631]; // home, widgets, glass, iPhone, the phone screen
  const SUN = "linear-gradient(120deg,#1f6bff 0%,#4f9dff 50%,#8f7bff 100%)"; // the one accent: Apple blue

  // ---------- styles ----------
  const css = document.createElement("style"); css.textContent = `
    #mg { position: absolute; inset: 0; overflow: hidden; font-family: "UI", sans-serif; color: #17131c; }
    #mgbg { position: absolute; inset: -260px; background: linear-gradient(180deg, #ffffff 0%, #fbfcff 42%, #e3eeff 78%, #cfe2ff 100%); }
    .wash { position: absolute; border-radius: 50%; filter: blur(120px); }
    .rings { position: absolute; width: 0; height: 0; } .rings i { position: absolute; border-radius: 50%; border: 1.5px solid rgba(70,120,220,.13); }
    #mggrain { position: absolute; inset: 0; opacity: 0.05; background-image: radial-gradient(rgba(40,25,60,.9) 0.6px, transparent 0.7px); background-size: 4px 4px; pointer-events: none; }
    #board { position: absolute; left: 0; top: 0; width: 5760px; height: 2160px; transform-origin: 0 0; will-change: transform, filter;
      background-image: radial-gradient(rgba(40,80,160,.13) 1.5px, transparent 1.7px); background-size: 64px 64px; }
    .glass { background: rgba(255,255,255,.72); backdrop-filter: blur(22px) saturate(1.4); border-radius: 44px; position: absolute;
      box-shadow: inset 0 1.5px 0 #fff, inset 0 0 0 1.5px rgba(255,255,255,.7), 0 26px 60px rgba(30,60,130,.14), 0 3px 10px rgba(30,60,130,.07); }
    .wd { position: absolute; border-radius: 46px; background: linear-gradient(160deg, #2c2c2f 0%, #1a1a1c 100%); color: #fff;
      box-shadow: inset 0 1.5px 0 rgba(255,255,255,.16), inset 0 0 0 1.5px rgba(255,255,255,.06), 0 40px 80px rgba(10,20,50,.30), 0 6px 16px rgba(10,20,50,.16); }
    .grad { background: ${SUN}; -webkit-background-clip: text; background-clip: text; color: transparent; }
    /* the liquid-glass button */
    #lg { position: absolute; left: 2600px; top: 474px; width: 560px; height: 132px; border-radius: 66px; }
    #lg .body { position: absolute; inset: 0; border-radius: 66px; background: linear-gradient(180deg, rgba(20,70,190,.20), rgba(20,70,190,.08)); backdrop-filter: url(#lgf) blur(2.5px) saturate(1.8) brightness(1.06);
      box-shadow: inset 0 2px 1.5px rgba(255,255,255,.95), inset 0 -2px 2px rgba(255,255,255,.45), inset 2px 0 2px rgba(255,255,255,.35), inset -2px 0 2px rgba(255,255,255,.35), inset 0 0 26px rgba(255,255,255,.30), 0 26px 60px rgba(20,70,190,.30), 0 6px 16px rgba(20,70,190,.16); }
    #lg .sheen { position: absolute; left: 22px; right: 22px; top: 7px; height: 46px; border-radius: 40px; background: linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0)); }
    #lg .tx { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 46px; font-weight: 600; letter-spacing: -0.5px; text-shadow: 0 2px 10px rgba(10,50,150,.4); }
    #ripple { position: absolute; left: 2880px; top: 540px; width: 0; height: 0; }
    #ripple i { position: absolute; left: -330px; top: -330px; width: 660px; height: 660px; border-radius: 50%; border: 3px solid rgba(255,255,255,.9); box-shadow: 0 0 40px rgba(80,150,255,.6); }
    #mgcursor { position: absolute; left: 0; top: 0; width: 40px; height: 40px; filter: drop-shadow(0 3px 5px rgba(40,20,60,.4)); }
    /* R1: iPhone */
    #ph { position: absolute; left: 2470px; top: 1225px; width: 384px; height: 790px; border-radius: 66px; background: linear-gradient(145deg, #5a5b60, #2a2b2f 45%, #121214); box-shadow: 0 60px 110px rgba(10,25,70,.38), inset 0 0 0 2px rgba(255,255,255,.22); }
    #ph .scr { position: absolute; inset: 11px; border-radius: 56px; overflow: hidden; background: #0b0d14; color: #fff; }
    #ph .art { position: absolute; left: 30px; top: 96px; width: 302px; height: 302px; border-radius: 30px; background: radial-gradient(ellipse 90% 40% at 50% 74%, #6fb2ff 0%, #1f5fe0 34%, #06123a 70%, #02040c 100%); overflow: hidden; }
    #ph .art b { position: absolute; left: -200px; top: 218px; width: 702px; height: 702px; border-radius: 50%; background: radial-gradient(circle at 50% 0%, #0b2c7c 0%, #030a24 22%, #010309 50%); box-shadow: 0 -2px 4px rgba(210,235,255,.95), 0 -6px 22px rgba(90,160,255,.9); }
    #ph .art u { display: none; }
    #ph h5 { position: absolute; left: 32px; top: 428px; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.4px; }
    #ph h6 { position: absolute; left: 32px; top: 470px; margin: 0; font-size: 21px; font-weight: 500; color: rgba(255,255,255,.55); }
    #eq { position: absolute; right: 34px; top: 440px; width: 46px; height: 40px; display: flex; gap: 5px; align-items: flex-end; }
    #eq i { flex: 1; height: 100%; border-radius: 3px; background: #4f9dff; transform-origin: 50% 100%; }
    #bar { position: absolute; left: 32px; right: 32px; top: 532px; height: 7px; border-radius: 4px; background: rgba(255,255,255,.18); } #bar i { position: absolute; left: 0; top: 0; bottom: 0; width: 100%; border-radius: 4px; background: #fff; transform-origin: 0 50%; }
    #ctl { position: absolute; left: 0; right: 0; top: 584px; display: flex; justify-content: center; align-items: center; gap: 46px; } #ctl svg { width: 46px; height: 46px; fill: #fff; } #ctl .pl { width: 84px; height: 84px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; } #ctl .pl svg { fill: #0b0d14; width: 38px; height: 38px; }
    #di { position: absolute; left: 50%; top: 18px; width: 118px; height: 34px; margin-left: -59px; border-radius: 24px; background: #000; overflow: hidden; } #di span { position: absolute; left: 14px; top: 9px; width: 30px; height: 30px; border-radius: 9px; background: ${SUN}; } #di em { position: absolute; right: 16px; top: 13px; width: 60px; height: 22px; display: flex; gap: 4px; align-items: center; } #di em i { flex: 1; height: 100%; border-radius: 2px; background: #4f9dff; }
    #r1t { position: absolute; left: 2950px; top: 1398px; width: 760px; font-size: 132px; font-weight: 700; line-height: 1.02; letter-spacing: -5px; }
    #r1t .w, .w { display: inline-block; }
    .chip { position: absolute; height: 68px; padding: 0 30px; border-radius: 34px; display: flex; align-items: center; font-size: 28px; font-weight: 600; }
    /* R2: bento */
    .tile h4 { margin: 30px 34px 0; font-size: 24px; font-weight: 600; color: rgba(255,255,255,.5); }
    #rings { position: absolute; left: 44px; top: 96px; width: 300px; height: 300px; transform: rotate(-90deg); } #rings circle { fill: none; stroke-width: 44; stroke-linecap: round; }
    #act { position: absolute; left: 44px; bottom: 34px; font-size: 50px; font-weight: 600; line-height: 1.16; letter-spacing: -1.5px; } #act small { font-size: 26px; letter-spacing: 0; margin-left: 4px; }
    #abars { position: absolute; right: 40px; top: 110px; width: 190px; height: 280px; display: flex; flex-direction: column; gap: 34px; } #abars div { height: 70px; display: flex; align-items: flex-end; gap: 5px; border-bottom: 2px solid rgba(255,255,255,.14); } #abars i { flex: 1; border-radius: 2px; transform-origin: 50% 100%; }
    .big { position: absolute; left: 34px; bottom: 18px; font-size: 168px; font-weight: 700; letter-spacing: -8px; line-height: 1; }
    .big small { font-size: 48px; letter-spacing: -1px; font-weight: 600; color: rgba(255,255,255,.5); margin-left: 12px; }
    .sw { position: absolute; left: 34px; width: 372px; height: 58px; display: flex; align-items: center; justify-content: space-between; font-size: 27px; font-weight: 600; }
    .sw u { position: relative; width: 96px; height: 56px; border-radius: 28px; background: rgba(255,255,255,.16); } .sw u b { position: absolute; left: 0; top: 0; width: 96px; height: 56px; border-radius: 28px; background: #34c759; } .sw u i { position: absolute; left: 5px; top: 5px; width: 46px; height: 46px; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px rgba(0,0,0,.22); }
    #k4 { position: absolute; left: 0; right: 0; top: 70px; text-align: center; font-size: 170px; font-weight: 700; letter-spacing: -8px; }
    /* R3: bold bands */
    .band { position: absolute; left: 1790px; width: 2070px; height: 190px; display: flex; align-items: center; overflow: hidden; white-space: nowrap; font-family: "Display", "UI", sans-serif; font-size: 118px; font-weight: 800; letter-spacing: -3px; transform-origin: 50% 50%; }
    .band span { display: inline-block; padding-right: 60px; }
    #st { position: absolute; left: 3420px; top: 1180px; width: 300px; height: 300px; }
    #pc { position: absolute; left: 2090px; top: 1900px; height: 118px; padding: 0 46px; border-radius: 60px; background: #17131c; color: #fff; font-size: 62px; font-weight: 700; letter-spacing: -2px; display: flex; align-items: center; gap: 18px; } #pc i { width: 26px; height: 26px; border-radius: 50%; background: #1ed760; }
    /* the phone's screen: a lock screen over a planet's limb at dawn. The camera goes into it and VFX rises there. */
    #hzn { position: absolute; inset: 0; background: #000208; overflow: hidden; }
    #stars { position: absolute; left: 0; top: 0; width: 362px; height: 768px; }
    #atm { position: absolute; inset: 0; background: radial-gradient(ellipse 62% 10% at 50% 55.3%, rgba(90,160,255,.95) 0%, rgba(30,95,235,.55) 34%, rgba(10,40,150,.22) 62%, rgba(0,0,0,0) 80%); }
    #flare { position: absolute; left: 50%; top: 418px; width: 0; height: 0; } #flare i { position: absolute; left: -105px; top: -13px; width: 210px; height: 26px; border-radius: 50%; background: radial-gradient(ellipse, #fff 0%, rgba(190,225,255,.9) 28%, rgba(90,160,255,0) 70%); }
    #flare b { position: absolute; left: -30px; top: -30px; width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(#fff 0%, rgba(200,230,255,.85) 30%, rgba(90,160,255,0) 70%); }
    #vfx { position: absolute; left: 0; right: 0; top: 334px; text-align: center; font-size: 75px; font-weight: 700; letter-spacing: 7px; padding-left: 7px; line-height: 1; color: #fff; text-shadow: 0 0 15px rgba(150,200,255,.95), 0 0 45px rgba(60,130,255,.85); }
    #vfx span { display: inline-block; }
    #planet { position: absolute; left: 50%; top: 420px; width: 1258px; height: 1258px; margin-left: -629px; border-radius: 50%; background: radial-gradient(circle at 50% 0%, #0a2a78 0%, #041038 5%, #020820 11%, #01030c 22%, #000208 45%);
      box-shadow: 0 -1px 1.5px rgba(225,240,255,.98), 0 -2.5px 9px rgba(110,175,255,.95), 0 -8px 30px rgba(40,110,255,.75), 0 -20px 70px rgba(20,70,220,.45); }
    #lock { position: absolute; left: 0; right: 0; top: 78px; text-align: center; color: #fff; } #lock small { display: block; font-size: 21px; font-weight: 600; opacity: .85; } #lock b { display: block; font-size: 96px; font-weight: 600; letter-spacing: -3px; line-height: 1.05; }
    .lkb { position: absolute; bottom: 44px; width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,.16); backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 rgba(255,255,255,.5); }
    /* the liquid-glass area */
    .lq { position: absolute; background: rgba(255,255,255,.20); backdrop-filter: blur(9px) saturate(1.9) brightness(1.06); color: #0b0d14;
      box-shadow: inset 0 2px 1.5px rgba(255,255,255,.95), inset 0 -2px 2px rgba(255,255,255,.4), inset 0 0 0 1.5px rgba(255,255,255,.42), inset 0 0 30px rgba(255,255,255,.22), 0 30px 60px rgba(20,50,130,.22), 0 4px 14px rgba(20,50,130,.12); }
    .orb { position: absolute; border-radius: 50%; }
    #gh { position: absolute; left: 3840px; top: 1166px; width: 1920px; text-align: center; font-size: 216px; font-weight: 700; letter-spacing: -10px; line-height: 1; color: #0b0d14; }
    #gp h4 { margin: 30px 36px 14px; font-size: 34px; font-weight: 700; letter-spacing: -0.8px; } #gp h4 small { display: block; font-size: 19px; font-weight: 500; opacity: .55; letter-spacing: 0; margin-top: 2px; }
    .row { position: relative; margin: 0 22px 12px; height: 82px; border-radius: 26px; background: rgba(255,255,255,.34); box-shadow: inset 0 1.5px 0 rgba(255,255,255,.8); display: flex; align-items: center; gap: 18px; padding: 0 20px; font-size: 27px; font-weight: 600; }
    .row i { width: 48px; height: 48px; border-radius: 14px; } .row small { margin-left: auto; font-size: 20px; font-weight: 500; opacity: .5; }
    #gt { display: flex; align-items: center; justify-content: space-around; padding: 0 22px; } #gt svg { width: 46px; height: 46px; fill: none; stroke: #0b0d14; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round; position: relative; z-index: 2; }
    #gtl { left: 14px; top: 10px; width: 150px; height: 92px; border-radius: 46px; background: rgba(255,255,255,.5); }
    #gs i { position: absolute; left: 10px; top: 10px; bottom: 10px; width: 600px; border-radius: 32px; background: ${SUN}; transform-origin: 0 50%; } #gsk { top: -6px; left: 0; width: 120px; height: 96px; border-radius: 48px; background: rgba(255,255,255,.55); }
    #gn { display: flex; align-items: center; gap: 22px; padding: 0 30px; } #gn i { flex: 0 0 76px; height: 76px; border-radius: 22px; background: ${SUN}; } #gn b { display: block; font-size: 27px; font-weight: 700; } #gn span { display: block; font-size: 23px; font-weight: 500; opacity: .6; margin-top: 2px; }
    .gc { display: flex; align-items: center; justify-content: center; } .gc svg { width: 50px; height: 50px; fill: #0b0d14; }
    #gm { background: rgba(255,255,255,.06); }
  `; document.head.appendChild(css);

  // ---------- DOM ----------
  const mg = document.createElement("div"); mg.id = "mg"; $("#root").appendChild(mg);
  const eqBars = (n) => Array.from({ length: n }, () => "<i></i>").join("");
  const star = (n, r1, r2) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? r2 : r1; d += (i ? "L" : "M") + (150 + Math.cos(a) * r).toFixed(1) + "," + (150 + Math.sin(a) * r).toFixed(1); } return d + "Z"; };
  const rep = (s, n) => Array.from({ length: n }, () => "<span>" + s + "</span>").join("");
  mg.innerHTML = `
    <svg width="0" height="0" style="position:absolute"><defs><filter id="lgf" x="0" y="0" width="560" height="132" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feImage id="lgmap" x="0" y="0" width="560" height="132" result="map" preserveAspectRatio="none" /><feDisplacementMap in="SourceGraphic" in2="map" scale="54" xChannelSelector="R" yChannelSelector="G" /></filter>
      <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f6bff" /><stop offset=".5" stop-color="#4f9dff" /><stop offset="1" stop-color="#8f7bff" /></linearGradient></defs></svg>
    <div id="mgbg"></div>
    <div id="board">
      <i class="wash" style="left:2480px;top:230px;width:800px;height:620px;background:#3f8cff;opacity:0.85"></i><div class="rings" style="left:2880px;top:540px"><i style="left:-260px;top:-260px;width:520px;height:520px"></i><i style="left:-430px;top:-430px;width:860px;height:860px"></i><i style="left:-620px;top:-620px;width:1240px;height:1240px"></i><i style="left:-840px;top:-840px;width:1680px;height:1680px"></i></div><i class="wash" style="left:3850px;top:170px;width:760px;height:560px;background:#b7ff5a;opacity:0.5"></i><i class="wash" style="left:5000px;top:480px;width:760px;height:520px;background:#58a6ff;opacity:0.55"></i><i class="wash" style="left:2300px;top:1330px;width:760px;height:600px;background:#3f8cff;opacity:0.5"></i><div class="rings" style="left:2662px;top:1620px"><i style="left:-260px;top:-260px;width:520px;height:520px"></i><i style="left:-430px;top:-430px;width:860px;height:860px"></i><i style="left:-620px;top:-620px;width:1240px;height:1240px"></i><i style="left:-840px;top:-840px;width:1680px;height:1680px"></i></div>
      <div id="ripple"><i></i></div>
      <div id="lg"><div class="body"></div><div class="sheen"></div><div class="tx">Motion Graphic</div></div>

      <div class="wd tile" id="tA" style="left:3936px;top:230px;width:620px;height:620px"><h4>Activity</h4><svg id="rings" viewBox="0 0 400 400"><g opacity=".2"><circle cx="200" cy="200" r="170" stroke="#fa114f" /><circle cx="200" cy="200" r="118" stroke="#a6ff00" /><circle cx="200" cy="200" r="66" stroke="#00e0ff" /></g><circle class="rg" cx="200" cy="200" r="170" stroke="#fa114f" /><circle class="rg" cx="200" cy="200" r="118" stroke="#a6ff00" /><circle class="rg" cx="200" cy="200" r="66" stroke="#00e0ff" /></svg><div id="abars"><div data-c="#fa114f"></div><div data-c="#a6ff00"></div><div data-c="#00e0ff"></div></div><div id="act"><span style="color:#fa114f">198/280<small>CAL</small></span><br /><span style="color:#a6ff00">19/30<small>MIN</small></span><br /><span style="color:#00e0ff">7/12<small>HRS</small></span></div></div>
      <div class="wd tile" id="tB" style="left:4580px;top:230px;width:620px;height:298px"><h4>Frame rate</h4><div class="big"><span id="fps">0</span><small>fps</small></div></div>
      <div class="wd tile" id="tC" style="left:4580px;top:552px;width:620px;height:298px"><h4>Growth</h4><svg viewBox="0 0 620 298" style="position:absolute;left:0;top:0;width:620px;height:298px"><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f9dff" stop-opacity=".5" /><stop offset="1" stop-color="#4f9dff" stop-opacity="0" /></linearGradient><clipPath id="cl"><rect id="clr" x="0" y="0" width="620" height="298" /></clipPath></defs>
        <g clip-path="url(#cl)"><path d="M34,236 C120,226 150,170 220,176 S320,120 380,128 S480,60 586,52 L586,266 L34,266 Z" fill="url(#ar)" /><path d="M34,236 C120,226 150,170 220,176 S320,120 380,128 S480,60 586,52" fill="none" stroke="url(#sg)" stroke-width="9" stroke-linecap="round" /></g></svg></div>
      <div class="wd tile" id="tD" style="left:5224px;top:230px;width:440px;height:298px"><h4>Controls</h4><div class="sw" style="top:88px">Motion blur<u><b></b><i></i></u></div><div class="sw" style="top:156px">Depth<u><b></b><i></i></u></div><div class="sw" style="top:224px">Glass<u><b></b><i></i></u></div></div>
      <div class="wd tile" id="tE" style="left:5224px;top:552px;width:440px;height:298px"><h4>Resolution</h4><div id="k4" class="grad">4K</div></div>

      <div class="orb" id="o1" style="left:4020px;top:1500px;width:380px;height:380px;background:radial-gradient(circle at 32% 28%, #9cc8ff 0%, #2f7bff 55%, #0b3fb5 100%);box-shadow:0 40px 80px #2f7bff55"></div><div class="orb" id="o2" style="left:4700px;top:1380px;width:260px;height:260px;background:radial-gradient(circle at 32% 28%, #ffb3d1 0%, #ff4f93 55%, #b3125a 100%);box-shadow:0 40px 80px #ff4f9355"></div><div class="orb" id="o3" style="left:5200px;top:1560px;width:420px;height:420px;background:radial-gradient(circle at 32% 28%, #c9b8ff 0%, #7a5cff 55%, #3b1fb8 100%);box-shadow:0 40px 80px #7a5cff55"></div><div class="orb" id="o4" style="left:4480px;top:1760px;width:230px;height:230px;background:radial-gradient(circle at 32% 28%, #a8f0ff 0%, #22c8f0 55%, #0a7fa8 100%);box-shadow:0 40px 80px #22c8f055"></div><div class="orb" id="o5" style="left:5080px;top:1250px;width:170px;height:170px;background:radial-gradient(circle at 32% 28%, #ffe1a8 0%, #ffab2e 55%, #c46a00 100%);box-shadow:0 40px 80px #ffab2e55"></div>
      <div id="gh"><span class="w">Liquid</span> <span class="w">Glass</span></div>
      <div class="lq" id="gm" style="left:4050px;top:1150px;width:250px;height:250px;border-radius:50%"></div>
      <div id="gpw" style="position:absolute;left:0;top:0;perspective:2200px;perspective-origin:4260px 1700px"><div class="lq" id="gp" style="left:4010px;top:1440px;width:500px;height:500px;border-radius:56px"><h4>Library<small>Everything in motion</small></h4><div class="row"><i style="background:#2f7bff"></i>Motion<small>3 hr</small></div><div class="row"><i style="background:#1ed760"></i>Sound<small>2 hr</small></div><div class="row"><i style="background:#7a5cff"></i>Colour<small>1 hr</small></div><div class="row"><i style="background:#ff4f93"></i>Light<small>40 min</small></div></div></div>
      <div class="lq" id="gs" style="left:4590px;top:1470px;width:620px;height:84px;border-radius:42px"><i></i><div class="lq" id="gsk"></div></div>
      <div class="lq" id="gn" style="left:4590px;top:1612px;width:620px;height:150px;border-radius:46px"><i></i><div><b>Render complete</b><span>4K · 60 fps · just now</span></div></div>
      <div class="lq" id="gt" style="left:4590px;top:1820px;width:620px;height:112px;border-radius:56px"><div class="lq" id="gtl"></div><svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z"/></svg><svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.9-3.8 3.9-5.6 7.5-5.6s6.600 1.800 7.500 5.600"/></svg></div>
      <div class="lq gc" id="gc1" style="left:5290px;top:1462px;width:132px;height:132px;border-radius:50%"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.500z"/></svg></div>
      <div class="lq gc" id="gc2" style="left:5450px;top:1462px;width:132px;height:132px;border-radius:50%"><svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg></div>
      <div class="lq" id="gb" style="left:5290px;top:1640px;width:292px;height:96px;border-radius:48px;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700">Continue</div>

      <div id="r1t"><span class="w">Fluid</span><br /><span class="w">by</span> <span class="w grad">design.</span></div>
      <div class="chip glass" id="c1" style="left:2956px;top:1706px">120 Hz</div><div class="chip glass" id="c2" style="left:3140px;top:1706px">Spring physics</div><div class="chip glass" id="c3" style="left:2956px;top:1794px">Made in code</div>
      <div id="phw" style="position:absolute;left:0;top:0;perspective:2400px;perspective-origin:2662px 1620px"><div id="ph"><div class="scr"><div id="hzn">
        <canvas id="stars" width="2172" height="4608"></canvas><div id="atm"></div><div id="flare"><i></i><b></b></div><div id="vfx"><span>V</span><span>F</span><span>X</span></div><div id="planet"></div>
        <div id="lock"><small>Wednesday, November 11</small><b>9:41</b></div><div class="lkb" style="left:38px"></div><div class="lkb" style="right:38px"></div></div>
        <div id="di"></div>
      </div></div></div>
    </div>
    <div id="mggrain"></div>
    <svg id="mgcursor" viewBox="0 0 24 24"><path d="M5 3l14 8.5-6.2 1.3L9.5 19z" fill="#fff" stroke="#17131c" stroke-width="1.3" stroke-linejoin="round" /></svg>`;

  // the lens map for the glass button: neutral in the middle, pushing inward along the rim (a convex bezel)
  { const w = 560, h = 132, r = 66, c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"), im = g.createImageData(w, h), BZ = 30;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const cx = clamp(x, r, w - r), dx = x - cx, dy = y - h / 2, d = Math.hypot(dx, dy), e = clamp((d - (r - BZ)) / BZ), k = e * e, i = (y * w + x) * 4;
      im.data[i] = 128 + (d ? (dx / d) * k * 127 : 0); im.data[i + 1] = 128 + (d ? (dy / d) * k * 127 : 0); im.data[i + 2] = 128; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0); $("#lgmap").setAttribute("href", c.toDataURL()); }
  // further lenses for the glass area: one SVG filter per shape (a pill/circle whose rim bends what is behind it)
  const lens = (sel, w, h, r, bz, scale, pow = 2, blur = 3) => { const id = "lz" + sel.replace(/\W/g, ""), c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"), im = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const cx = clamp(x, r, w - r), cy = clamp(y, r, h - r), dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), e = clamp((d - (r - bz)) / bz), k = Math.pow(e, pow), i = (y * w + x) * 4;
      im.data[i] = 128 + (d ? (dx / d) * k * 127 : 0); im.data[i + 1] = 128 + (d ? (dy / d) * k * 127 : 0); im.data[i + 2] = 128; im.data[i + 3] = 255; }
    g.putImageData(im, 0, 0);
    mg.querySelector("defs").insertAdjacentHTML("beforeend", '<filter id="' + id + '" x="0" y="0" width="' + w + '" height="' + h + '" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feImage x="0" y="0" width="' + w + '" height="' + h + '" result="m" preserveAspectRatio="none" href="' + c.toDataURL() + '" /><feDisplacementMap in="SourceGraphic" in2="m" scale="' + scale + '" xChannelSelector="R" yChannelSelector="G" /></filter>');
    $(sel).style.backdropFilter = "url(#" + id + ") blur(" + blur + "px) saturate(1.9) brightness(1.06)"; };
  lens("#gm", 250, 250, 125, 90, 56, 2.2, 0.4); lens("#gc1", 132, 132, 66, 34, 60); lens("#gc2", 132, 132, 66, 34, 60); lens("#gtl", 150, 92, 46, 30, 50, 2, 1.5); lens("#gsk", 120, 96, 48, 30, 50, 2, 1.5); lens("#gb", 292, 96, 48, 28, 50); lens("#gs", 620, 84, 42, 24, 40); lens("#gt", 620, 112, 56, 28, 46); lens("#gn", 620, 150, 46, 26, 44);

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
  // ---------- R2: bento ----------
  ["#tA", "#tB", "#tD", "#tC", "#tE"].forEach((s, i) => ft(s, { opacity: 0, scale: 0.8, y: 70 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }, T.s1 + 0.06 + i * 0.06));
  $$("#rings .rg").forEach((c, i) => { const L = 2 * Math.PI * +c.getAttribute("r"); ft(c, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: L * [0.29, 0.37, 0.42][i], duration: 0.9, ease: "power3.out" }, T.s1 + 0.2 + i * 0.1); });
  const cnt = { v: 0, p: 0 }; tl.fromTo(cnt, { v: 0 }, { v: 60, duration: 0.75, ease: "power2.out", onUpdate: () => ($("#fps").textContent = Math.round(cnt.v)), ...IR }, T.s1 + 0.2);
  ft("#clr", { attr: { width: 0 } }, { attr: { width: 620 }, duration: 0.85, ease: "power2.inOut" }, T.s1 + 0.22);
  $$(".sw u").forEach((u, i) => { ft(u.querySelector("b"), { opacity: 0 }, { opacity: 1, duration: 0.22 }, T.s1 + 0.34 + i * 0.14); ft(u.querySelector("i"), { x: 0 }, { x: 40, duration: 0.26, ease: "back.out(2)" }, T.s1 + 0.34 + i * 0.14); });
  ft("#k4", { backgroundPosition: "0% 50%", backgroundSize: "220% 100%" }, { backgroundPosition: "100% 50%", duration: 1.2, ease: "sine.inOut" }, T.s1 + 0.2);
  // ---------- the liquid-glass area ----------
  $$(".orb").forEach((o, i) => tl.fromTo(o, { x: 0, y: 0 }, { x: [60, -50, -70, 40, -30][i], y: [-40, 50, -30, -50, 40][i], duration: 2.4, ease: "sine.inOut", ...IR }, T.s2 - 0.4));
  $$("#gh .w").forEach((w, i) => ft(w, { opacity: 0, y: 70, filter: "blur(20px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, T.s2 + 0.16 + i * 0.1));
  ft("#gp", { opacity: 0, y: 120, rotationY: -34, rotationX: 16 }, { opacity: 1, y: 0, rotationY: -12, rotationX: 5, duration: 0.8, ease: "expo.out" }, T.s2 + 0.12); tl.to("#gp", { rotationY: 6, rotationX: 2, duration: 1.0, ease: "sine.inOut" }, T.s2 + 0.9);
  $$("#gp .row").forEach((r, i) => ft(r, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.4, ease: "expo.out" }, T.s2 + 0.34 + i * 0.07));
  ["#gs", "#gn", "#gt"].forEach((e, i) => ft(e, { opacity: 0, scale: 0.8, y: 50 }, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(1.6)" }, T.s2 + 0.2 + i * 0.09));
  ["#gc1", "#gc2", "#gb"].forEach((e, i) => ft(e, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.2)" }, T.s2 + 0.3 + i * 0.08));
  ft("#gs i", { scaleX: 0.22 }, { scaleX: 0.8, duration: 0.8, ease: "power3.inOut" }, T.s2 + 0.45); ft("#gsk", { x: 80 }, { x: 430, duration: 0.8, ease: "power3.inOut" }, T.s2 + 0.45);
  tl.set("#gtl", { x: 0 }, 0); tl.to("#gtl", { x: 148, duration: 0.34, ease: "back.out(1.6)" }, T.s2 + 0.5); tl.to("#gtl", { x: 296, duration: 0.34, ease: "back.out(1.6)" }, T.s2 + 0.86);
  tl.to("#gc1", { scale: 0.88, duration: 0.09, yoyo: true, repeat: 1 }, T.s2 + 0.75);
  ft("#gm", { x: -40, opacity: 0, scale: 0.6 }, { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.8)" }, T.s2 + 0.22); tl.to("#gm", { x: 1320, duration: 1.0, ease: "sine.inOut" }, T.s2 + 0.38);
  // ---------- the iPhone ----------
  ft("#ph", { y: 900, rotationY: -34, rotationX: 14, rotationZ: 6 }, { y: 0, rotationY: -14, rotationX: 4, rotationZ: 0, duration: 0.95, ease: "expo.out" }, T.s3 + 0.06);
  tl.to("#ph", { rotationY: 0, rotationX: 0, duration: 0.6, ease: "power2.inOut" }, T.push - 0.1);
  $$("#r1t .w").forEach((w, i) => ft(w, { opacity: 0, y: 60, filter: "blur(18px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, T.s3 + 0.2 + i * 0.1));
  ["#c1", "#c2", "#c3"].forEach((c, i) => ft(c, { opacity: 0, scale: 0.5, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, T.s3 + 0.46 + i * 0.08));
  { const sc = $("#stars").getContext("2d"); let sd = 11; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 420; i++) { const a = 0.25 + r() * 0.7, z = (0.3 + r() * 0.8) * 6; sc.fillStyle = "rgba(210,228,255," + a.toFixed(2) + ")"; sc.beginPath(); sc.arc(r() * 2172, r() * 2520, z, 0, 7); sc.fill(); } }
  $$("#abars div").forEach((d, k) => { for (let i = 0; i < 14; i++) { const b = document.createElement("i"); b.style.background = d.dataset.c; b.style.height = 12 + ((i * 37 + k * 53) % 58) + "px"; d.appendChild(b); ft(b, { scaleY: 0 }, { scaleY: 1, duration: 0.4, ease: "back.out(2)" }, T.s1 + 0.3 + k * 0.08 + i * 0.018); } });
  // dawn over the limb: the lock screen clears, the atmosphere brightens, the flare breaks, and VFX rises from behind the planet
  tl.to("#lock, .lkb, #di", { opacity: 0, duration: 0.3 }, T.push + 0.1);
  tl.set("#atm", { opacity: 0.5, scaleY: 0.8, transformOrigin: "50% 55.3%" }, 0); tl.set("#flare", { opacity: 0, scale: 0.4 }, 0);
  tl.to("#atm", { opacity: 1, scaleY: 1.25, duration: 1.4, ease: "sine.out" }, T.vfx - 0.1);
  tl.to("#flare", { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" }, T.vfx); tl.to("#flare", { scale: 1.35, duration: 0.9, ease: "sine.inOut" }, T.vfx + 0.7);
  $$("#vfx span").forEach((sp, i) => ft(sp, { y: 108 }, { y: 0, duration: 1.05, ease: "expo.out" }, T.vfx + 0.1 + i * 0.11));

  // ---------- camera ----------
  const KEYS = [[T2, H0, 1.0, 0], [T.click, H0, 1.07, 0], [T.s1, H0, 1.07, 1], [T.s1 + WH, R1, 1.0, 0], [T.s2, [R1[0] + 30, R1[1]], 1.05, 1], [T.s2 + WH, R2, 1.0, 0], [T.s3, [R2[0] - 20, R2[1]], 1.05, 1],
    [T.s3 + WH, R3, 1.0, 0], [T.push, [R3[0] - 30, R3[1]], 1.04, 2], [T.full, PH, 5.56, 0], [T.end, [PH[0], PH[1] - 2], 5.74, 0]];
  const camAt = (t) => { let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++; const A = KEYS[i], B = KEYS[i + 1], k0 = seg(t, A[0], B[0]), k = A[3] === 1 ? inOutExpo(k0) : A[3] === 2 ? inOutCubic(k0) : k0;
    return { x: lerp(A[1][0], B[1][0], k), y: lerp(A[1][1], B[1][1], k), s: lerp(A[2], B[2], k) }; };
  const board = $("#board"), bg = $("#mgbg");
  function update(t) {
    if (t < T.wash - 0.05) { mg.style.visibility = "hidden"; return; } mg.style.visibility = "visible";
    const c = camAt(t), p = camAt(t - 1 / 120), v = Math.hypot(c.x - p.x, c.y - p.y) * 120; // px per second on the board
    board.style.transform = "translate(" + (960 - c.x * c.s).toFixed(2) + "px," + (540 - c.y * c.s).toFixed(2) + "px) scale(" + c.s.toFixed(4) + ")";
    const bl = Math.min(16, v * 0.0016); board.style.filter = bl > 0.4 ? "blur(" + bl.toFixed(1) + "px)" : "none";
    bg.style.transform = "translate(0px," + (-(c.y - 540) * 0.05).toFixed(1) + "px)";
  }
  return { update, T };
}
