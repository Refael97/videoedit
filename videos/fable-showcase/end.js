// Closing scene: the last filmed frame freezes, shrinks into a Claude conversation as the answer to the prompt from scene 1,
// then the dot sphere returns with the model name and the credit. DOM + one 2D canvas, driven by update(t). Seek-safe.
export function initEnd({ E0, DPR }) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
  const inOutExpo = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
  const outCubic = (x) => 1 - Math.pow(1 - x, 3), outBack = (x) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2), smooth = (x) => x * x * (3 - 2 * x);
  const T = { freeze: E0 - 0.04, shrink0: E0 + 0.25, shrink1: E0 + 1.15, out0: E0 + 2.25, out1: E0 + 2.95, end: E0 + 4.7 };
  const CARD = { x: 510, y: 286, w: 900, h: 506, r: 22 };
  const rays = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, r0 = 5, r1 = i % 2 ? 15 : 18; return '<line x1="' + (20 + Math.cos(a) * r0).toFixed(1) + '" y1="' + (20 + Math.sin(a) * r0).toFixed(1) + '" x2="' + (20 + Math.cos(a) * r1).toFixed(1) + '" y2="' + (20 + Math.sin(a) * r1).toFixed(1) + '" />'; }).join("");
  const css = document.createElement("style"); css.textContent = `
    #end { position: absolute; inset: 0; z-index: 9; overflow: hidden; background: #131312; font-family: "UI", sans-serif; color: #ecebe8; display: none; }
    #endpage { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 46%, #262624 0%, #1f1f1d 55%, #171716 100%); transform-origin: 50% 46%; }
    #eu { position: absolute; right: 510px; top: 112px; padding: 16px 26px; border-radius: 22px; background: #30302e; font-size: 27px; line-height: 1.25; direction: rtl; box-shadow: inset 0 0 0 1px rgba(255,255,255,.06); }
    #ea { position: absolute; left: 510px; top: 212px; display: flex; align-items: center; gap: 16px; font-size: 27px; }
    #ea svg { width: 40px; height: 40px; stroke: #d97757; stroke-width: 3.2; stroke-linecap: round; }
    #ecardbg { position: absolute; left: ${CARD.x}px; top: ${CARD.y}px; width: ${CARD.w}px; height: ${CARD.h}px; border-radius: ${CARD.r}px; background: #0c0c0b; box-shadow: 0 30px 70px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08); }
    #efile { position: absolute; left: 510px; top: 812px; display: flex; align-items: center; gap: 14px; font-size: 21px; color: #a8a7a2; }
    #efile b { font-weight: 500; color: #ecebe8; } #efile i { width: 5px; height: 5px; border-radius: 50%; background: #6b6a66; }
    #ecomp { position: absolute; left: 510px; top: 884px; width: 900px; height: 124px; border-radius: 26px; background: #30302e; box-shadow: inset 0 0 0 1px rgba(255,255,255,.09), 0 12px 30px rgba(0,0,0,.25); }
    #ecomp span { position: absolute; left: 30px; top: 24px; font-size: 25px; color: #7c7b77; } #ecomp em { position: absolute; right: 86px; bottom: 26px; font-style: normal; font-size: 21px; color: #b9b8b3; }
    #ecomp u { position: absolute; right: 22px; bottom: 18px; width: 44px; height: 44px; border-radius: 12px; background: #d97757; text-decoration: none; }
    #ecomp u::after { content: ""; position: absolute; left: 14px; top: 16px; width: 12px; height: 12px; border-left: 3px solid #fff; border-top: 3px solid #fff; transform: rotate(45deg); }
    #eshot { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; background: #000; }
    #eshot img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; }
    #ebar { position: absolute; left: 0; right: 0; bottom: 0; height: 110px; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.62)); }
    #ebar s { position: absolute; left: 26px; right: 26px; bottom: 52px; height: 5px; border-radius: 3px; background: rgba(255,255,255,.28); } #ebar s::after { content: ""; position: absolute; inset: 0; border-radius: 3px; background: #fff; }
    #ebar b { position: absolute; left: 28px; bottom: 16px; font-size: 19px; font-weight: 500; color: #fff; } #ebar em { position: absolute; right: 28px; bottom: 16px; font-size: 19px; font-style: normal; font-weight: 600; color: #fff; }
    #ecredit { position: absolute; inset: 0; background: radial-gradient(ellipse 58% 52% at 50% 40%, #4a2c1a 0%, #2a1a12 42%, #150f0c 78%, #0d0a09 100%); }
    #eorb { position: absolute; left: 730px; top: 160px; width: 460px; height: 460px; }
    #etitle { position: absolute; left: 0; right: 0; top: 648px; text-align: center; font-family: "Greeting", serif; font-size: 118px; line-height: 1; color: #f3ead9; letter-spacing: -1px; }
    #esub { position: absolute; left: 0; right: 0; top: 806px; text-align: center; font-size: 27px; font-weight: 500; letter-spacing: 6px; text-transform: uppercase; color: #d9a27f; }
    #ehandle { position: absolute; left: 0; right: 0; top: 860px; text-align: center; font-size: 24px; color: #9c8f84; }
  `; document.head.appendChild(css);
  const el = document.createElement("div"); el.id = "end"; el.innerHTML = `
    <div id="endpage">
      <div id="eu">היי פייבל, צור לי סרטון לפנים!</div>
      <div id="ea"><svg viewBox="0 0 40 40" fill="none">${rays}</svg><span>Done. Here's your video.</span></div>
      <div id="ecardbg"></div>
      <div id="efile"><b>fable-5-2-showcase.mp4</b><i></i><span>0:30</span><i></i><span>4K · 60 fps</span></div>
      <div id="ecomp"><span>Reply to Claude…</span><em>Fable 5.2</em><u></u></div>
    </div>
    <div id="eshot"><img src="assets/seedance/s3_freeze.jpg" alt="" /><div id="ebar"><s></s><b>0:30 / 0:30</b><em>4K</em></div></div>
    <div id="ecredit"><canvas id="eorb" width="${460 * DPR}" height="${460 * DPR}"></canvas><div id="etitle">Fable 5.2</div><div id="esub">Created by Refael Levi</div><div id="ehandle">@refaelleviii</div></div>`;
  document.getElementById("root").appendChild(el);
  const $ = (s) => el.querySelector(s), page = $("#endpage"), shot = $("#eshot"), bar = $("#ebar"), credit = $("#ecredit"), orb = $("#eorb"), g = orb.getContext("2d");
  // dot sphere: Fibonacci lattice, amber to cream by depth
  const N = 1700, P = []; for (let i = 0; i < N; i++) { const y = 1 - (2 * (i + 0.5)) / N, r = Math.sqrt(1 - y * y), a = i * 2.399963; P.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
  const drawOrb = (t, k) => { const S = 460 * DPR, R = S * 0.4 * k, ry = t * 0.55, rx = 0.34, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx); g.clearRect(0, 0, S, S);
    const gl = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gl.addColorStop(0, "rgba(255,150,70," + (0.20 * k).toFixed(3) + ")"); gl.addColorStop(1, "rgba(255,150,70,0)"); g.fillStyle = gl; g.fillRect(0, 0, S, S);
    for (let i = 0; i < N; i++) { const p = P[i], x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy, y2 = p[1] * cx - z1 * sx, z2 = p[1] * sx + z1 * cx, d = (z2 + 1) / 2, pr = 1 / (1.9 - z2 * 0.5);
      const br = 1 + 0.06 * Math.sin(t * 2.1 + i * 0.37); g.fillStyle = "rgba(" + Math.round(lerp(190, 255, d)) + "," + Math.round(lerp(92, 222, d)) + "," + Math.round(lerp(40, 178, d)) + "," + (0.22 + 0.78 * d).toFixed(2) + ")";
      g.beginPath(); g.arc(S / 2 + x1 * R * pr * 1.75 * br, S / 2 - y2 * R * pr * 1.75 * br, DPR * (0.7 + 1.5 * d), 0, 6.2832); g.fill(); } };
  function update(t) {
    if (t < T.freeze) { el.style.display = "none"; return; } el.style.display = "block";
    const k = inOutExpo(seg(t, T.shrink0, T.shrink1));
    shot.style.left = lerp(0, CARD.x, k).toFixed(2) + "px"; shot.style.top = lerp(0, CARD.y, k).toFixed(2) + "px"; shot.style.width = lerp(1920, CARD.w, k).toFixed(2) + "px"; shot.style.height = lerp(1080, CARD.h, k).toFixed(2) + "px"; shot.style.borderRadius = lerp(0, CARD.r, k).toFixed(1) + "px";
    bar.style.opacity = smooth(seg(t, T.shrink1 - 0.25, T.shrink1 + 0.2)).toFixed(3);
    [["#eu", 0.1], ["#ea", 0.3], ["#efile", 0.62], ["#ecomp", 0.5]].forEach(([s, d]) => { const a = outCubic(seg(t, T.shrink0 + d, T.shrink0 + d + 0.5)), e = $(s); e.style.opacity = a.toFixed(3); e.style.transform = "translateY(" + ((1 - a) * 26).toFixed(1) + "px)"; });
    const o = inOutExpo(seg(t, T.out0, T.out1)), chat = "scale(" + lerp(1, 0.9, o).toFixed(4) + ")";
    page.style.transform = chat; shot.style.transform = "translate(" + ((960 - (CARD.x + CARD.w / 2)) * 0).toFixed(1) + "px,0px) scale(" + (k >= 1 ? lerp(1, 0.9, o) : 1).toFixed(4) + ")"; shot.style.transformOrigin = (960 - CARD.x) + "px " + (1080 * 0.46 - CARD.y) + "px";
    page.style.filter = shot.style.filter = o > 0.01 ? "blur(" + (o * 14).toFixed(1) + "px)" : "none";
    credit.style.opacity = smooth(seg(t, T.out0 + 0.15, T.out1)).toFixed(3); credit.style.display = t < T.out0 ? "none" : "block";
    if (t >= T.out0) { drawOrb(t - T.out0, clamp(outBack(seg(t, T.out0 + 0.2, T.out0 + 1.1)), 0, 1.2));
      [["#etitle", 0.55], ["#esub", 0.8], ["#ehandle", 0.95]].forEach(([s, d]) => { const a = outCubic(seg(t, T.out0 + d, T.out0 + d + 0.6)), e = $(s); e.style.opacity = a.toFixed(3); e.style.transform = "translateY(" + ((1 - a) * 30).toFixed(1) + "px)"; e.style.filter = a < 0.99 ? "blur(" + ((1 - a) * 10).toFixed(1) + "px)" : "none"; }); }
  }
  return { update, T };
}
