// Isrotel promo, full film: logo -> 3D map of Israel -> a card out of each destination pin -> the card photo opens into a living clip -> outro.
// One draw(t). Stills and motion-blurred frames come from tools/mb.cjs, which awaits window.__settle() after every draw (video frame loading).
const DUR = 24.2, P = 1600;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
const outCubic = (k) => 1 - Math.pow(1 - k, 3), outExpo = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)), inOut = (k) => (k < 0.5 ? 8 * k * k * k * k : 1 - Math.pow(-2 * k + 2, 4) / 2), inCubic = (k) => k * k * k, sine = (k) => -(Math.cos(Math.PI * k) - 1) / 2;
const spring = (k) => (k <= 0 ? 0 : 1 - Math.exp(-7 * k) * Math.cos(9.5 * k));
const $ = (id) => document.getElementById(id), NSV = "http://www.w3.org/2000/svg";
const frameT = (t) => Math.floor(t * 60 + 1e-6) / 60; // numbers change between frames, never inside the shutter

// ---------- logo (used twice): contour rings tighten, the outline draws letter by letter, the fill lands
function mkLogo(svg, ringsEl) {
  const B = LOGO.box; svg.setAttribute("viewBox", (B[0] - 6) + " " + (B[1] - 6) + " " + (B[2] + 12) + " " + (B[3] + 12));
  const letters = [...LOGO.top.map((d, i) => [d, 0, i]), ...LOGO.bot.map((d, i) => [d, 1, i])].map(([d, row, i]) => { const e = document.createElementNS(NSV, "path"); e.setAttribute("d", d); svg.appendChild(e); const L = e.getTotalLength(); e.style.strokeDasharray = L; return { e, L, row, i }; });
  const rings = []; for (let i = 0; i < 6; i++) { const r = document.createElement("i"), w = 560 + i * 80, h = 170 + i * 50; r.style.cssText = "width:" + w + "px;height:" + h + "px;left:" + -w / 2 + "px;top:" + -h / 2 + "px"; ringsEl.appendChild(r); rings.push(r); }
  return (t, t0) => {
    rings.forEach((r, i) => { const q = seg(t, t0 + i * 0.03, t0 + 1 + i * 0.03), e = outCubic(q); r.style.opacity = (seg(t, t0, t0 + 0.12) * (1 - seg(q, 0.62, 1)) * (0.9 - i * 0.1)).toFixed(3); r.style.transform = "rotateX(" + (lerp(78, 0, e) + i * 3).toFixed(1) + "deg) rotateY(" + lerp(-60 + i * 22, 0, e).toFixed(1) + "deg) rotateZ(" + (lerp(i * 40, 0, e) + t * 30).toFixed(1) + "deg) scale(" + lerp(1.5 - i * 0.05, 0.55, e).toFixed(3) + ")"; });
    letters.forEach((l) => { const a = t0 + 0.25 + (l.row ? 0.72 + l.i * 0.05 : l.i * 0.075), d = seg(t, a, a + (l.row ? 0.3 : 0.55)), f = seg(t, a + (l.row ? 0.12 : 0.4), a + (l.row ? 0.34 : 0.7)); l.e.style.strokeDashoffset = (l.L * (1 - sine(d))).toFixed(1); l.e.style.fillOpacity = f.toFixed(3); l.e.style.opacity = d > 0 ? 1 : 0; });
  };
}
const logoA = mkLogo($("logo"), $("rings")), logoB = mkLogo($("logo2"), $("rings2"));

// ---------- the map: a white slab with thickness, a dotted top and standing pins
const M = $("map"), TH = 12;
const svg = (inner, z, extra) => '<svg viewBox="0 0 ' + MAP.w + " " + MAP.h + '" style="transform:translateZ(' + z + "px);" + (extra || "") + '">' + inner + "</svg>";
let mh = svg('<path d="' + MAP.d + '" fill="rgba(0,25,70,0.55)"/>', -80, "filter:blur(30px);left:34px;top:60px");
for (let i = TH; i >= 1; i--) mh += svg('<path d="' + MAP.d + '" fill="' + (i > TH - 3 ? "#93a1bb" : "#b7c1d3") + '" stroke="' + (i > TH - 3 ? "#93a1bb" : "#b7c1d3") + '" stroke-width="3" stroke-linejoin="round"/>', -i * 4);
mh += svg('<defs><pattern id="dots" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="5.5" cy="5.5" r="1.25" fill="#002d74" opacity="0.32"/></pattern><linearGradient id="top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6ebf3"/></linearGradient></defs>' +
  '<path d="' + MAP.d + '" fill="url(#top)" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/><path d="' + MAP.d + '" fill="url(#dots)"/>', 0);
M.innerHTML = mh;
const PINS = [["north", "הגליל והצפון", "4 מלונות"], ["tlv", "תל אביב", "6 מלונות"], ["jer", "ירושלים", "2 מלונות"], ["dead", "ים המלח", "3 מלונות"], ["ramon", "מצפה רמון והנגב", "3 מלונות"], ["eilat", "אילת", "8 מלונות"]].map(([k, name, sub], i) => {
  const e = document.createElement("div"); e.className = "pin"; e.style.left = MAP.pins[k][0] + "px"; e.style.top = MAP.pins[k][1] + "px";
  e.innerHTML = '<div class="pb"><div class="gr"></div><div class="st"></div><div class="dt"></div><div class="lb"><b>' + name + "</b><span>" + sub + "</span></div></div>"; $("pins").appendChild(e);
  if (["jer", "dead", "eilat", "north"].includes(k)) { const lb = e.querySelector(".lb"); lb.style.right = "auto"; lb.style.left = "-14px"; }
  return { k, i, e, pb: e.firstChild, lb: e.querySelector(".lb"), dt: e.querySelector(".dt"), x: MAP.pins[k][0], y: MAP.pins[k][1] };
});
const pinOf = (k) => PINS.find((p) => p.k === k);
// map camera keys: [t, focus x, focus y (map units), push z, tilt, turn]
const MK = [[2.2, 330, 1000, -1300, 76, -16], [4.1, 330, 960, -330, 54, -9], [4.75, 330, 960, -290, 53, -8], [5.6, 215, 1130, 560, 50, 6], [10.4, 215, 1130, 600, 50, 7], [11.5, 262, 1560, 600, 50, -6], [15.3, 262, 1560, 640, 50, -7], [16.3, 400, 900, 600, 50, 5], [24.2, 400, 900, 640, 50, 6]];
const mapCam = (t) => { let i = 0; while (i < MK.length - 2 && t > MK[i + 1][0]) i++; const a = MK[i], b = MK[i + 1], k = (i === 0 ? outExpo : i % 2 ? (x) => x : inOut)(seg(t, a[0], b[0])); return a.map((v, j) => lerp(v, b[j], k)); };

// ---------- locations
const LOC = [
  { k: "ramon", dir: "magi_room", nf: 308, img: "ber_11_169", tCard: 5.55, tOpen: 6.9, tClose: 10.25, v0: 6.5, lab: "MITZPE RAMON · ISROTEL EXCLUSIVE", name: "בראשית", room: "חדר בראשית עם מרפסת", price: 1807, t1: "להתעורר", t2: "במכתש רמון.", place: "מצפה רמון" },
  { k: "eilat", dir: "magi_eilat", nf: 250, img: "eilat_169", tCard: 11.4, tOpen: 12.35, tClose: 15.15, v0: 11.9, lab: "EILAT · ISROTEL EXCLUSIVE", name: "רויאל ביץ׳", room: "חדר בלוויסטה", price: 817, t1: "לנשום", t2: "באילת.", place: "אילת" },
  { k: "dead", dir: "magi_dead", nf: 250, img: "dead_169", tCard: 16.2, tOpen: 17.15, tClose: 99, v0: 16.7, lab: "DEAD SEA · ISROTEL COLLECTION", name: "נבו", room: "חדר נוף לים המלח", price: 892, t1: "להירגע", t2: "בים המלח.", place: "ים המלח" },
];
LOC.forEach((L) => {
  const c = document.createElement("div"); c.className = "lc";
  c.innerHTML = '<div class="p"><img src="assets/magi/' + L.img + '.jpg"></div><div class="x"><div class="l">' + L.lab + '</div><div class="n">' + L.name + '</div><div class="r">' + L.room + '</div><div class="f">החל מ:</div><div class="pr"><i>₪</i><span class="num">0</span></div><div class="u">לזוג ללילה</div></div>';
  $("ov").appendChild(c); L.c = c; L.ph = c.querySelector(".p"); L.num = c.querySelector(".num");
  const v = document.createElement("div"); v.innerHTML = '<div class="vt"><span>' + L.t1 + "</span><br /><span><b>" + L.t2.split(" ")[0] + "</b></span>" + (L.t2.split(" ")[1] ? "<span><b>" + L.t2.split(" ")[1] + "</b></span>" : "") + '</div><div class="vb"><div class="a"><b>' + L.name + "</b> · " + L.place + '</div><div class="b">החל מ־<b>₪' + L.price.toLocaleString("en-US") + "</b> לזוג ללילה</div></div>";
  $("vts").appendChild(v); L.vt = [...v.querySelectorAll(".vt span")]; L.vb = v.querySelector(".vb");
});

// ---------- video frames: one decoded image at a time, loaded on demand
const ctx = $("vid").getContext("2d"); let want = null, shown = "", pend = null;
window.__settle = async () => {
  if (!want || want === shown) return; const key = want, im = new Image(); im.src = key; await im.decode(); if (key === want) { ctx.drawImage(im, 0, 0, 1920, 1080); shown = key; }
};

const HW = [...document.querySelectorAll("#hud span")], OW = [...document.querySelectorAll("#oT span")];
function wordsIn(list, t, t0, step, dur, dx) { list.forEach((s, i) => { const k = seg(t, t0 + i * step, t0 + i * step + dur), e = outExpo(k); s.style.opacity = Math.min(1, k * 2.4); s.style.transform = "translate3d(" + lerp(dx, 0, e) + "px," + lerp(22, 0, e) + "px,0) scale(" + lerp(1.1, 1, e) + ")"; s.style.filter = k < 1 ? "blur(" + lerp(20, 0, e).toFixed(1) + "px)" : "none"; }); }

function draw(t) {
  t = clamp(t, 0, DUR);
  // 1. logo, then it parks small in the corner
  logoA(t, 0.15); const lk = inOut(seg(t, 2.05, 2.85)), LG = $("logo");
  LG.style.transform = "translate(" + lerp(0, -760, lk) + "px," + lerp(0, -430, lk) + "px) scale(" + lerp(1, 0.24, lk) + ")"; LG.style.opacity = 1 - seg(t, 20.35, 20.65);
  // 2. map
  const c = mapCam(t), mapIn = seg(t, 2.2, 3.0);
  const mtx = "translate3d(" + lerp(700, 960, seg(c[3], -330, 400)) + "px,600px," + c[3] + "px) rotateX(" + c[4] + "deg) rotateZ(" + c[5] + "deg) translate(" + -c[1] + "px," + -c[2] + "px)", psc = lerp(1.45, 1, seg(c[3], -330, 500));
  M.style.transform = mtx; $("pins").style.transform = mtx; M.style.opacity = mapIn;
  let cardK = 0; LOC.forEach((L) => { cardK = Math.max(cardK, seg(t, L.tCard, L.tCard + 0.5) * (1 - seg(t, L.tClose + 0.45, L.tClose + 0.95))); });
  $("cam").style.filter = mapIn < 1 || cardK > 0 ? "blur(" + (lerp(24, 0, outCubic(mapIn)) + cardK * 11).toFixed(1) + "px)" : "none"; $("cam").style.opacity = t > 21 ? 0 : 1;
  PINS.forEach((p) => {
    const k = seg(t, 3.0 + p.i * 0.16, 3.8 + p.i * 0.16), s = spring(k), far = Math.abs(p.y - c[2]) + Math.abs(p.x - c[1]) * 0.5, bl = Math.max(0, far - 330) * 0.012 * seg(c[3], 0, 500);
    p.pb.style.transform = "rotateZ(" + -c[5] + "deg) rotateX(" + -c[4] + "deg) translateY(" + lerp(-160, 0, s) + "px) scale(" + lerp(0.3, 1, s) * psc + ")"; p.pb.style.opacity = Math.min(1, k * 5);
    p.pb.style.filter = bl > 0.4 ? "blur(" + Math.min(9, bl).toFixed(1) + "px)" : "none";
    const act = LOC.find((L) => L.k === p.k), pulse = act ? seg(t, act.tCard - 0.5, act.tCard) * (1 - seg(t, act.tCard + 0.2, act.tCard + 0.5)) : 0; p.dt.style.transform = "scale(" + (1 + pulse * 0.55) + ")";
  });
  $("hud").style.opacity = 1 - seg(t, 4.75, 5.15); $("hud").firstElementChild.style.opacity = seg(t, 3.0, 3.4); wordsIn(HW, t, 3.1, 0.1, 0.6, 60);
  // 3. location cards and their clips
  let PO = $("portal"), poOp = 0, shade = 0; want = want;
  LOC.forEach((L) => {
    const kin = seg(t, L.tCard, L.tCard + 0.95), s = spring(kin), ko = inOut(seg(t, L.tClose + 0.5, L.tClose + 1.05)), k = s * (1 - ko), vis = kin > 0 && ko < 1;
    L.c.style.opacity = vis ? Math.min(1, kin * 5) * (1 - seg(ko, 0.7, 1)) : 0; if (!vis) { L.vt.forEach((x) => (x.style.opacity = 0)); L.vb.style.opacity = 0; return; }
    const pr = pinOf(L.k).dt.getBoundingClientRect(), px = pr.left + pr.width / 2, py = pr.top + pr.height / 2;
    L.c.style.transform = "translate(" + lerp(px - 960, 0, k) + "px," + lerp(py - 540, 0, k) + "px) rotateX(" + lerp(38, 0, k) + "deg) scale(" + lerp(0.04, 1, k) + ")"; L.c.style.filter = kin < 0.4 ? "blur(" + lerp(12, 0, kin / 0.4).toFixed(1) + "px)" : "none";
    L.num.textContent = Math.round(L.price * outExpo(seg(frameT(t), L.tCard + 0.4, L.tCard + 1.25))).toLocaleString("en-US");
    // the photo is alive inside the card, then opens to the full frame (and closes back before the card returns to its pin)
    const r = L.ph.getBoundingClientRect(), ek = inOut(seg(t, L.tOpen, L.tOpen + 0.85)) * (1 - inOut(seg(t, L.tClose, L.tClose + 0.75))), w = lerp(r.width, 1920, ek), h = lerp(r.height, 1080, ek);
    PO.style.transform = "translate(" + lerp(r.left, 0, ek) + "px," + lerp(r.top, 0, ek) + "px)"; PO.style.width = w + "px"; PO.style.height = h + "px"; PO.style.borderRadius = lerp((28 * r.width) / 560, 0, ek) + "px";
    $("vid").style.transform = "scale(" + Math.max(w / 1920, h / 1080) + ")"; poOp = seg(t, L.tCard + 0.55, L.tCard + 0.85) * (1 - seg(ko, 0.55, 1)); shade = ek;
    want = "assets/video/" + L.dir + "/f" + String(clamp(Math.round((t - L.v0) * 60), 0, L.nf - 1) + 1).padStart(4, "0") + ".jpg";
    const tin = L.tOpen + 0.75, tout = Math.min(L.tClose, 20.2) - 0.3, off = 1 - seg(t, tout, tout + 0.3);
    L.vt.forEach((x, i) => { const q = seg(t, tin + i * 0.12, tin + 0.6 + i * 0.12), e = outExpo(q); x.style.opacity = Math.min(1, q * 2.2) * off; x.style.transform = "translate3d(" + lerp(70, 0, e) + "px," + lerp(24, 0, e) + "px,0) scale(" + lerp(1.12, 1, e) + ")"; x.style.filter = q < 1 ? "blur(" + lerp(22, 0, e).toFixed(1) + "px)" : off < 1 ? "blur(" + ((1 - off) * 14).toFixed(1) + "px)" : "none"; });
    const bq = seg(t, tin + 0.35, tin + 1.15), bs = spring(bq); L.vb.style.opacity = Math.min(1, bq * 5) * off; L.vb.style.transform = "translateY(" + (lerp(160, 0, bs) + (1 - off) * 60) + "px) scale(" + lerp(0.9, 1, bs) + ")";
  });
  PO.style.opacity = poOp; $("shade").style.opacity = shade;
  // 4. outro: navy grows out of the price bar, the line, the logo, the button
  $("fill").style.clipPath = "circle(" + lerp(0, 2300, inCubic(seg(t, 20.2, 20.95))) + "px at 960px 944px)";
  $("out").style.opacity = t > 20.45 ? 1 : 0; wordsIn(OW, t, 20.8, 0.1, 0.6, 60); logoB(t, 21.35);
  const bk = seg(t, 22.65, 23.45), bsp = spring(bk); $("oB").style.opacity = Math.min(1, bk * 5); $("oB").style.transform = "translateY(" + lerp(70, 0, bsp) + "px) scale(" + lerp(0.8, 1, bsp) + ")"; $("oC").style.opacity = seg(t, 23.05, 23.55);
}
window.__draw = draw; window.__ready = true; draw(0);
