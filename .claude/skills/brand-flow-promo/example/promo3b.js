// Isrotel promo v3, second half: photo carousel on brand blue -> a space of floating hotel details -> booking -> confirmed -> logo.
// Loaded after promo3.js (which draws logo, map and the three living destination cards as drawA).
const img = (n) => '<img src="assets/img/' + n + '.jpg">';
// ---------- colour: soft drifting blobs behind the white scenes
function mkBlobs(el) { [["#3b7bff", 0.26, 900, 300, 200], ["#ffd21f", 0.3, 700, 1500, 760], ["#39c5ff", 0.2, 760, 760, 900]].forEach(([c, o, s, x, y]) => { const b = document.createElement("i"); b.style.cssText = "background:" + c + ";opacity:" + o + ";width:" + s + "px;height:" + s + "px;left:" + (x - s / 2) + "px;top:" + (y - s / 2) + "px"; el.appendChild(b); }); return (t) => [...el.children].forEach((b, i) => (b.style.transform = "translate(" + (Math.sin(t * 0.35 + i * 2.1) * 150).toFixed(1) + "px," + (Math.cos(t * 0.28 + i * 1.3) * 90).toFixed(1) + "px)")); }
const blobA = mkBlobs($("blA"));
// ---------- floating photo cards around the map (parallax with the map camera, blurred by depth)
const FT = [["ber_09", 1500, 640, 0.9, 300], ["royhero_0", 1640, 880, 0.55, 250], ["nevo_1", 1180, 930, 1.5, 330], ["ber_12", 150, 420, 1.35, 320], ["royhero_3", 330, 880, 0.6, 250], ["nevo_5", 1760, 330, 1.7, 300], ["berhero_1", 60, 760, 0.8, 270]].map(([n, x, y, d, w], i) => {
  const e = document.createElement("div"); e.className = "ft"; e.style.width = w + "px"; e.style.height = Math.round(w * 0.68) + "px"; e.innerHTML = img(n); $("fl").appendChild(e); return { e, x, y, d, w, i };
});
function drawFloat(t) {
  const c = mapCam(t); let cardK = 0; LOC.forEach((L) => { cardK = Math.max(cardK, seg(t, L.tCard, L.tCard + 0.4) * (1 - seg(t, L.tClose + 0.5, L.tClose + 1.0))); });
  FT.forEach((f) => { const k = seg(t, 2.3 + f.i * 0.13, 3.2 + f.i * 0.13), s = spring(k), px = -(c[1] - 330) * f.d * 1.5 - (c[5] + 9) * 9 * f.d, py = -(c[2] - 960) * f.d * 0.75, z = 1 + seg(c[3], -330, 600) * 0.35 * f.d;
    f.e.style.transform = "translate(" + (f.x + px - f.w / 2 + Math.sin(t * 0.8 + f.i * 1.9) * 14) + "px," + (f.y + py + Math.cos(t * 0.7 + f.i) * 12 + lerp(120, 0, s)) + "px) rotate(" + ((f.i % 2 ? 1 : -1) * (3 + f.i) + Math.sin(t * 0.5 + f.i) * 2) + "deg) scale(" + lerp(0.6, 1, s) * z * f.d * 0.9 + ")";
    f.e.style.opacity = Math.min(1, k * 4) * (1 - cardK * 0.75) * (1 - seg(t, 16.2, 16.6)); f.e.style.filter = "blur(" + (Math.abs(f.d - 0.95) * 9 + cardK * 8).toFixed(1) + "px)"; });
}
// ---------- scene 2 markup
const IC = { pool: '<path d="M8 30c4-4 8-4 12 0s8 4 12 0 8-4 12 0M8 40c4-4 8-4 12 0s8 4 12 0 8-4 12 0"/><path d="M18 24V10a4 4 0 018 0M32 24V10a4 4 0 018 0M18 16h14"/>', view: '<circle cx="36" cy="14" r="6"/><path d="M4 40l12-16 8 10 6-7 18 13"/>', bath: '<path d="M6 26h40v4a10 10 0 01-10 10H16A10 10 0 016 30zM12 26V12a4 4 0 018 0M14 40l-2 5M38 40l2 5"/>', cup: '<path d="M10 20h26v10a11 11 0 01-11 11h-4A11 11 0 0110 30zM36 23h4a5 5 0 010 10h-4M17 8v5M24 6v7M31 8v5"/>', bed: '<path d="M6 40V14M6 32h40v8M6 26h40v6M14 24a4 4 0 110-8h8a4 4 0 014 4v4"/>', sun: '<circle cx="26" cy="26" r="9"/><path d="M26 6v6M26 40v6M6 26h6M40 26h6M12 12l4 4M36 36l4 4M40 12l-4 4M12 40l4-4"/>' };
$("s2").innerHTML = '<div id="bgB"></div><div id="bgW"><div class="blobs" id="blB"></div></div><div id="car"><div id="ring"></div></div><div id="carT"><span>מצאו</span><span>את</span><span><b>המקום</b></span><span><b>שלכם.</b></span></div>' +
  '<div id="cam3"><div id="w3"></div></div><div id="bc"></div>' +
  '<div id="bkp"><div id="sh"><div class="hd">סיכום הזמנה</div><div class="ht">' + img("berhero_1") + '<div><b>בראשית</b><span>מצפה רמון · Isrotel Exclusive</span></div></div>' +
  '<div class="rw" style="top:310px"><span>חדר</span><b>חדר בראשית עם מרפסת</b></div><div class="rw" style="top:394px"><span>תאריכים</span><b>20–22.12.26 · 2 לילות</b></div><div class="rw" style="top:478px"><span>אורחים</span><b>2 מבוגרים</b></div><div class="rw t" style="top:570px"><span>סה״כ</span><b>₪3,614</b></div><div id="cfb">אישור הזמנה</div></div></div>' +
  '<div id="sun" class="ch3 y"><em></em><span><b>10% הנחה</b> לחברי חוג השמש</span></div>' +
  '<div id="cf"><svg viewBox="0 0 130 130"><circle id="cfs" cx="65" cy="65" r="56" /><path id="cfk" d="M40 67l17 17 34-36" /></svg><div class="a">ההזמנה אושרה</div><div class="b">בראשית · מצפה רמון</div><div class="c">20–22.12.26 · 2 מבוגרים · ₪3,614</div></div>' +
  '<div id="lp3"><div class="rings" id="rings3"></div></div><svg id="logo3" xmlns="http://www.w3.org/2000/svg"></svg><div id="sl3"><span>החופשה</span><span>המושלמת</span><span>שלכם</span><span><b>מתחילה</b></span><span><b>כאן.</b></span></div><div id="cr3">ספק אד · נוצר על ידי רפאל לוי · <span dir="ltr">@refaelleviii</span></div>' +
  '<svg id="cur2" viewBox="0 0 24 24"><path d="M5 3l14 7.5-6 1.6 3.4 6.2-2.6 1.4-3.4-6.2L6 18z" fill="#fff" stroke="#131a2b" stroke-width="1.4" stroke-linejoin="round" /></svg>';
const blobB = mkBlobs($("blB")), logoC = mkLogo($("logo3"), $("rings3")), CW = [...document.querySelectorAll("#carT span")], SW = [...document.querySelectorAll("#sl3 span")];
// ---------- carousel: nine photos on a ring, a fast spin that settles on Beresheet
const CR = ["berhero_1", "royhero_0", "ber_12", "nevo_1", "ber_09", "royhero_3", "nevo_5", "ber_02", "royhero_1"].map((n, i) => { const e = document.createElement("div"); e.className = "cc"; e.innerHTML = img(n); $("ring").appendChild(e); return { e, i }; }), RAD = 1050, STEP = 27;
// ---------- the space of details: every object has a place in depth; blur follows the distance from the focus plane
const W3 = $("w3"), O3 = [];
function add(html, cls, x, y, z, w, h, id) { const el = document.createElement("div"); el.className = "o3 " + cls; if (id) el.id = id; el.innerHTML = html; if (w) { el.style.width = w + "px"; el.style.height = h + "px"; } W3.appendChild(el); const o = { el, x, y, z, w: w || el.offsetWidth, h: h || el.offsetHeight }; O3.push(o); return o; }
const hero = add(img("berhero_1"), "ph3", -430, 10, -130, 860, 640);
const ttl = add('<div class="k">MITZPE RAMON · ISROTEL EXCLUSIVE</div><div class="t">' + [..."בראשית"].map((c) => "<span>" + c + "</span>").join("") + '</div><div class="s"><span>מלון</span><span>על</span><span>שפת</span><span>המכתש</span></div>', "", 400, -90, 0, 900, 420, "t3");
const strip = [["ber_09", -960, 800, -40, "2 / 16"], ["ber_12", -370, 870, 60, "3 / 16"], ["ber_04", 230, 790, -10, "4 / 16"]].map(([n, x, y, z, c]) => add(img(n) + "<u>" + c + "</u>", "ph3", x, y, z, 540, 370));
const chips = [add("<b>111</b> חדרים", "ch3", 120, 1130, 110), add("נפתח ב־<b>2011</b>", "ch3", -260, 1130, 150), add("ISROTEL EXCLUSIVE", "ch3 d", -700, 1130, 90)];
const num = add('<div class="v">0</div><div class="u">חדרים וסוויטות</div>', "cd3", 420, 1680, 90, 560, 360, "n3");
const chips2 = [add('<em></em><span>חוג השמש · <b>10% הנחה</b></span>', "ch3 y", 960, 1560, 170), add("<b>3</b> מלונות ישרוטל בנגב", "ch3", 960, 1800, 130)];
const head = add("מה <b>מחכה</b> לכם", "", -200, 2330, 40, 900, 110, "h3");
const tiles = [["pool", "בריכה מול המכתש"], ["view", "נוף למכתש רמון"], ["bath", "אמבט מפנק"], ["cup", "פינת קפה בחדר"], ["bed", "חדרים מרווחים"], ["sun", "מרפסת שמש"]].map(([ic, tx], i) => add('<svg viewBox="0 0 52 52">' + IC[ic] + "</svg><div>" + tx + "</div>", "tl3", -520 + (i % 3) * 320, 2510 + Math.floor(i / 3) * 250, 20 + ((i * 37) % 5) * 22, 290, 220));
const big = add(img("ber_12"), "ph3", 640, 3250, -110, 1150, 740);
const price = add('<div class="p">' + img("ber_11") + '</div><div class="x"><div class="l">YOUR STAY</div><div class="n">חדר בראשית עם מרפסת</div><div class="r"><span>תאריכים</span><b>20–22.12.26</b></div><div class="r"><span>אורחים</span><b>2 מבוגרים</b></div><div class="tt"><span>סה״כ · 2 לילות</span><b>₪<span id="tot">0</span></b></div></div><div id="pb">הזמן</div>', "cd3", 0, 4100, 100, 1120, 600, "p3");
// photos drifting through the whole space: [file, x, y, z, w]
const DB = [["ber_02", -1500, -500, -800, 640], ["ber_00", 1500, 520, -700, 560], ["ber_15", 1380, -430, 520, 360], ["ber_08", -1320, 420, 600, 360], ["ber_13", -1500, 1500, -640, 600], ["ber_10", 1500, 1150, 560, 340], ["ber_07", -1150, 1900, 540, 360], ["ber_05", 1700, 2300, -760, 620],
  ["ber_03", 950, 2650, 560, 360], ["ber_14", -1500, 3000, -600, 600], ["ber_06", -850, 3500, 520, 380], ["ber_01", 1500, 3900, 500, 360], ["ber_09", -1450, 4300, -500, 560], ["ber_04", 1300, 4650, -420, 520]].map(([n, x, y, z, w]) => add(img(n), "ph3", x, y, z, w, Math.round(w * 0.68)));
const TL = [...ttl.el.querySelectorAll(".t span")], TS = [...ttl.el.querySelectorAll(".s span")];
// camera keys: [t, cx, cy, cz, focus z, rx, ry]
const CK = [[18.3, -430, 10, -470, -130, 0, 8], [19.2, 30, 20, -70, 0, 2, -5], [19.7, -10, 60, -110, 0, 2, -2], [20.3, -360, 900, -150, 20, 1, 5], [20.95, 620, 1680, -200, 100, 2, -6], [21.85, -200, 2560, -130, 40, 1, 4], [22.55, 560, 3260, -360, -110, 0, -5], [23.35, 0, 4100, -70, 100, 2, 3], [24.05, 250, 4260, -230, 100, 0, 0], [31, 250, 4260, -230, 100, 0, 0]];
const cam3 = (t) => { let i = 0; while (i < CK.length - 2 && t > CK[i + 1][0]) i++; const a = CK[i], b = CK[i + 1], k = inOut(seg(t, a[0], b[0])); return a.map((v, j) => lerp(v, b[j], k)); };
function put(o, c, e) {
  e = e || {}; const z = o.z + (e.dz || 0), d = Math.abs(z - c[4]), bl = Math.min(34, Math.max(0, d - 70) * 0.03) + (e.blur || 0), near = clamp((z - c[3] - 900) / 300);
  o.el.style.transform = "translate3d(" + (o.x - o.w / 2 + (e.dx || 0)) + "px," + (o.y - o.h / 2 + (e.dy || 0)) + "px," + z + "px) rotateX(" + (e.rx || 0) + "deg) rotateY(" + (e.ry || 0) + "deg) scale(" + (e.s === undefined ? 1 : e.s) + ")";
  o.el.style.filter = bl > 0.3 ? "blur(" + bl.toFixed(2) + "px)" : "none"; o.el.style.opacity = (e.op === undefined ? 1 : e.op) * (1 - near);
}
const pop = (o, c, t, t0, i, extra) => { const k = seg(t, t0, t0 + 0.75), s = spring(k); put(o, c, Object.assign({ s: lerp(0.5, 1, s), dy: lerp(90, 0, s) + Math.sin(t * 1.3 + i * 2) * 6, rx: lerp(-32, 0, s), op: Math.min(1, k * 6), blur: lerp(10, 0, Math.min(1, k * 3)) }, extra || {})); };
function rectTo(el, x, y, w, h, r) { el.style.transform = "translate(" + x + "px," + y + "px)"; el.style.width = w + "px"; el.style.height = h + "px"; el.style.borderRadius = r + "px"; }

function drawB(t) {
  blobB(t);
  // blue grows out of the Dead Sea card, the ring spins in and settles
  $("bgB").style.clipPath = "circle(" + lerp(0, 2300, inCubic(seg(t, 16.15, 16.8))) + "px at 960px 540px)";
  CW.forEach((s, i) => { const k = seg(t, 16.75 + i * 0.08, 17.25 + i * 0.08), e = outExpo(k); s.style.opacity = Math.min(1, k * 2.4) * (1 - seg(t, 18.0, 18.2)); s.style.transform = "translateY(" + lerp(26, 0, e) + "px)"; s.style.filter = k < 1 ? "blur(" + lerp(16, 0, e).toFixed(1) + "px)" : "none"; });
  const rot = lerp(-470, 0, outExpo(seg(t, 16.55, 18.0))), rin = outCubic(seg(t, 16.5, 17.0)), go = seg(t, 18.0, 18.5), ge = inOut(go);
  $("ring").style.transform = "translateZ(" + (-RAD + lerp(-900, 0, rin)) + "px) rotateY(" + -rot + "deg)"; $("ring").style.opacity = seg(t, 16.5, 16.7);
  CR.forEach((c) => { const w = c.i ? 480 : lerp(480, 1030, ge), h = c.i ? 640 : lerp(640, 770, ge), out = c.i ? inCubic(go) : 0;
    c.e.style.width = w + "px"; c.e.style.height = h + "px"; c.e.style.left = -w / 2 + "px"; c.e.style.top = -h / 2 + (c.i ? 0 : lerp(0, -20, ge)) + "px";
    c.e.style.transform = "rotateY(" + (c.i <= 4 ? c.i : c.i - 9) * STEP + "deg) translateZ(" + (RAD + out * 1500) + "px) translateY(" + out * (c.i % 2 ? -260 : 260) + "px)"; c.e.style.opacity = c.i ? 1 - seg(go, 0.5, 1) : 1 - seg(t, 18.5, 18.62); });
  $("car").style.opacity = t < 18.62 ? 1 : 0; $("bgW").style.clipPath = "inset(" + lerp(100, 0, inOut(seg(t, 18.0, 18.5))) + "% 0 0 0)";
}
function drawC(t) {
  const c = cam3(t), fade = 1 - seg(t, 24.15, 24.5);
  W3.style.transform = "translate3d(960px,540px,0) rotateX(" + c[5] + "deg) rotateY(" + c[6] + "deg) translate3d(" + -c[1] + "px," + -c[2] + "px," + -c[3] + "px)"; $("cam3").style.opacity = seg(t, 18.42, 18.58) * fade; $("cam3").style.filter = fade < 1 ? "blur(" + ((1 - fade) * 16).toFixed(1) + "px)" : "none";
  put(hero, c, { ry: lerp(0, 9, outCubic(seg(t, 18.6, 19.6))) });
  put(ttl, c); ttl.el.firstChild.style.opacity = seg(t, 18.8, 19.1);
  TL.forEach((s, i) => { const k = seg(t, 18.85 + i * 0.05, 19.35 + i * 0.05), e = outExpo(k); s.style.opacity = Math.min(1, k * 2.5); s.style.transform = "translate3d(" + lerp(90, 0, e) + "px," + lerp(30, 0, e) + "px,0) scale(" + lerp(1.18, 1, e) + ")"; s.style.filter = k < 1 ? "blur(" + lerp(26, 0, e).toFixed(1) + "px)" : "none"; });
  TS.forEach((s, i) => { const k = seg(t, 19.2 + i * 0.06, 19.6 + i * 0.06), e = outCubic(k); s.style.opacity = k; s.style.transform = "translateY(" + lerp(28, 0, e) + "px)"; s.style.filter = k < 1 ? "blur(" + lerp(12, 0, e).toFixed(1) + "px)" : "none"; });
  strip.forEach((o, i) => { const k = seg(t, 19.75 + i * 0.11, 20.6 + i * 0.11), s = spring(k); put(o, c, { dx: lerp(700, 0, s), ry: lerp(-40, (i - 1) * -7, s), op: Math.min(1, k * 5), dy: Math.sin(t * 1.1 + i) * 8 }); });
  chips.forEach((o, i) => pop(o, c, t, 20.2 + i * 0.11, i));
  pop(num, c, t, 20.5, 0); num.el.firstChild.textContent = Math.round(111 * outExpo(seg(frameT(t), 20.6, 21.35)));
  chips2.forEach((o, i) => pop(o, c, t, 20.8 + i * 0.14, i));
  { const k = seg(t, 21.25, 21.75), e = outExpo(k); put(head, c, { op: Math.min(1, k * 2.5), dy: lerp(40, 0, e), blur: lerp(18, 0, e) }); }
  tiles.forEach((o, i) => pop(o, c, t, 21.4 + i * 0.07, i, { ry: (i % 3 - 1) * -6 }));
  put(big, c, { ry: -8, dy: Math.sin(t * 0.9) * 8 });
  pop(price, c, t, 22.85, 0); $("tot").textContent = Math.round(3614 * outExpo(seg(frameT(t), 23.0, 23.75))).toLocaleString("en-US");
  DB.forEach((o, i) => put(o, c, { dy: Math.sin(t * 0.7 + i * 1.7) * 16, dx: Math.cos(t * 0.5 + i) * 10, ry: (i % 2 ? -1 : 1) * (9 + (i % 4) * 3), rx: (i % 3) * 3 - 3 }));
}
function drawD(t) {
  // click -> the button grows into a blue card -> flips into the summary sheet -> confirm -> blue card with a spinner -> confirmed -> shrinks to a dot -> logo
  const press1 = seg(t, 24.05, 24.12) - seg(t, 24.12, 24.25), press2 = seg(t, 25.8, 25.87) - seg(t, 25.87, 26.0), PB = $("pb"), CF = $("cfb"), CUR = $("cur2");
  PB.style.transform = "scale(" + (1 - press1 * 0.07) + ")"; CF.style.transform = "scale(" + (1 - press2 * 0.06) + ")";
  const b = PB.getBoundingClientRect(), g1 = inOut(seg(t, 24.12, 24.6)), BC = $("bc");
  rectTo(BC, lerp(b.left, 460, g1), lerp(b.top, 240, g1), lerp(b.width, 1000, g1), lerp(b.height, 600, g1), lerp(b.height / 2, 50, g1)); const f1 = seg(t, 24.6, 24.85);
  BC.style.opacity = t >= 24.12 && f1 < 1 ? 1 : 0; BC.style.transform += " perspective(1700px) rotateX(" + f1 * 88 + "deg)";
  const SH = $("sh"), f2 = spring(seg(t, 24.8, 25.5)), g2 = inOut(seg(t, 25.88, 26.35)), away = seg(t, 25.95, 26.3);
  SH.style.opacity = t >= 24.8 ? 1 - away : 0; SH.style.transform = "rotateX(" + lerp(-80, 0, f2) + "deg) translateY(" + (lerp(120, 0, f2) + away * 140) + "px) scale(" + (lerp(0.9, 1, f2) - away * 0.08) + ")"; SH.style.filter = away > 0 ? "blur(" + (away * 10).toFixed(1) + "px)" : "none";
  [...SH.querySelectorAll(".ht, .rw")].forEach((r, i) => { const k = seg(t, 25.0 + i * 0.07, 25.35 + i * 0.07); r.style.opacity = k; r.style.transform = "translateX(" + lerp(50, 0, outCubic(k)) + "px)"; });
  const sk = seg(t, 25.25, 26.0), ss = spring(sk); $("sun").style.opacity = Math.min(1, sk * 5) * (1 - away); $("sun").style.transform = "translateY(" + (lerp(80, 0, ss) + Math.sin(t * 2) * 6) + "px) rotate(" + lerp(-14, 5, ss) + "deg) scale(" + lerp(0.5, 1, ss) + ")";
  const cr = CF.getBoundingClientRect(), CC = $("cf"), dot = inOut(seg(t, 27.55, 28.15)), W = lerp(cr.width, 920, g2), H = lerp(cr.height, 520, g2);
  rectTo(CC, lerp(cr.left, 500, g2), lerp(cr.top, 250, g2), W, H, lerp(54, 44, g2)); CC.style.opacity = t >= 25.88 && t < 28.2 ? 1 : 0;
  CC.style.transform += " perspective(1700px) rotateY(" + dot * 80 + "deg) rotateZ(" + dot * -8 + "deg) scale(" + lerp(1, 0.015, dot) + ")";
  const spin = seg(t, 26.2, 26.3) * (1 - seg(t, 26.75, 26.85)), done = seg(t, 26.8, 27.1); $("cfs").style.strokeDasharray = spin > 0 && done === 0 ? "90 262" : "352"; $("cfs").style.transform = "rotate(" + (done === 0 ? t * 620 : -90) + "deg)"; $("cfs").style.transformOrigin = "65px 65px"; $("cfs").style.strokeDashoffset = done > 0 ? 352 * (1 - outCubic(done)) : 0; $("cfs").style.opacity = Math.max(spin, done > 0 ? 1 : 0);
  $("cfk").style.strokeDasharray = 75; $("cfk").style.strokeDashoffset = 75 * (1 - outCubic(seg(t, 26.95, 27.2))); $("cfk").style.opacity = t > 26.95 ? 1 : 0;
  [".a", ".b", ".c"].forEach((q, i) => { const e = CC.querySelector(q), k = seg(t, 26.9 + i * 0.1, 27.3 + i * 0.1); e.style.opacity = k * (i === 0 ? 1 : i === 1 ? 0.92 : 0.75); e.style.transform = "translateY(" + lerp(26, 0, outCubic(k)) + "px)"; e.style.filter = k < 1 ? "blur(" + lerp(10, 0, k).toFixed(1) + "px)" : "none"; });
  // cursor: to the first button, away, then to the confirm button
  const k1 = inOut(seg(t, 23.55, 24.02)), k2 = inOut(seg(t, 25.3, 25.78)), on1 = seg(t, 23.55, 23.7) * (1 - seg(t, 24.2, 24.35)), on2 = seg(t, 25.3, 25.45) * (1 - seg(t, 25.92, 26.05));
  const cx = on2 > 0 ? lerp(1500, cr.left + cr.width * 0.42, k2) : lerp(1620, b.left + b.width * 0.45, k1), cy = on2 > 0 ? lerp(1100, cr.top + cr.height * 0.55, k2) : lerp(1150, b.top + b.height * 0.55, k1);
  CUR.style.opacity = Math.max(on1, on2); CUR.style.transform = "translate(" + cx + "px," + cy + "px) scale(" + (1 - (press1 + press2) * 0.14) + ")";
  // logo out of the dot, the line, the credit
  logoC(t, 28.0); wordsIn(SW, t, 29.0, 0.09, 0.55, 50); $("cr3").style.opacity = seg(t, 29.6, 30.0);
}
function draw(t) {
  t = clamp(t, 0, DUR); blobA(t);
  if (t < 17.3) { drawA(t); drawFloat(t); }
  $("s2").style.display = t < 16.1 ? "none" : "block";
  if (t >= 16.1) { drawB(t); drawC(t); drawD(t); }
}
window.__draw = draw; draw(0);
