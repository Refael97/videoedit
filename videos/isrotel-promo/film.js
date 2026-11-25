// Isrotel brand-flow promo — beats 3 to 9. Beat 1-2 (logo + search) lives in index.html as drawA().
// Every scene is its own layer with its own 3D world; the camera zooms into each element in its turn.
const FILM = 25.2, NAVY = "#002d74";
const root = $("#root"), bedEl = $("#bed");
const scene = (id, html, bg) => { const d = document.createElement("div"); d.className = "scn"; d.id = id; d.style.background = bg || "#f5f7fb"; d.innerHTML = html; root.insertBefore(d, bedEl); return d; };
const camTo = (el, t, KEYS, tx = 6, ty = -5) => { let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++; const a = KEYS[i], b = KEYS[i + 1], k = inOut(seg(t, a[0], b[0]));
  const fx = lerp(a[1], b[1], k), fy = lerp(a[2], b[2], k), z = lerp(a[3], b[3], k), tilt = 1 / (1 + (z - 1) * 1.6); el.style.transformOrigin = "50% 50%"; T3(el, (960 - fx) * z, (540 - fy) * z, 0, z, tx * tilt, ty * tilt * Math.cos(t * 0.5)); };
const popIn = (e, t, a, z = 0, d = 0.45) => { const q = outBack(seg(t, a, a + d)); e.style.opacity = seg(t, a, a + 0.1); T3(e, 0, (1 - q) * 70, z * q, 0.82 + 0.18 * q, (1 - q) * 24, 0); return q; };
const cursorAt = (el, t, CP, CL) => { let i = 0; while (i < CP.length - 2 && t > CP[i + 1][0]) i++; const a = CP[i], b = CP[i + 1], k = inOut(seg(t, a[0], b[0])), pr = Math.max(0, ...CL.map((c) => seg(t, c - 0.06, c) * (1 - seg(t, c, c + 0.16))));
  el.style.opacity = seg(t, CP[0][0], CP[0][0] + 0.2) * (1 - seg(t, CP[CP.length - 1][0], CP[CP.length - 1][0] + 0.15)); el.style.transform = "translate3d(" + lerp(a[1], b[1], k).toFixed(1) + "px," + (lerp(a[2], b[2], k) - Math.sin(k * Math.PI) * 22).toFixed(1) + "px,180px) scale(" + (1 - 0.22 * pr).toFixed(3) + ")"; };
const CUR = '<svg class="cur" viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.500L10 19z" fill="#fff" stroke="#0b1530" stroke-width="1.6" stroke-linejoin="round"/></svg>';
const BLOBS = '<div class="blob" style="left:-200px;top:-260px;width:900px;height:800px;background:#dfe9ff"></div><div class="blob" style="left:1200px;top:480px;width:900px;height:800px;background:#fff3c4;opacity:.8"></div>';

// ---------- B. the map: from the north down to Eilat (6.0 - 8.7) ----------
const PINS = [["צפון", 4, 172, 112, -1], ["תל אביב", 6, 110, 330, 1], ["ירושלים", 2, 160, 392, 1], ["ים המלח", 3, 204, 470, -1], ["מצפה רמון והנגב", 3, 142, 640, 1], ["אילת", 8, 168, 858, -1]];
const MX = 735, MY = -160, MS = 1.5;      // where the 300x900 map sits in the world, and its scale
const SB = scene("SB", BLOBS + '<div class="world" id="wB"><svg id="map" viewBox="0 0 300 900" style="position:absolute;left:' + MX + "px;top:" + MY + "px;width:" + 300 * MS + "px;height:" + 900 * MS + 'px;overflow:visible"><defs><pattern id="md" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.500" cy="4.500" r="1.100" fill="#b9c6e4"/></pattern></defs><path id="isr" d="M150 8 L204 24 L226 62 L214 150 L208 250 L204 330 L214 432 L206 520 L196 640 L182 770 L168 884 L150 800 L124 680 L98 566 L70 474 L88 400 L106 334 L114 250 L122 182 L116 152 L138 122 L134 22Z" fill="#fff" stroke="' + NAVY + '" stroke-width="2.200" stroke-linejoin="round"/><path d="M150 8 L204 24 L226 62 L214 150 L208 250 L204 330 L214 432 L206 520 L196 640 L182 770 L168 884 L150 800 L124 680 L98 566 L70 474 L88 400 L106 334 L114 250 L122 182 L116 152 L138 122 L134 22Z" fill="url(#md)"/><ellipse cx="208" cy="132" rx="7" ry="13" fill="#cfe0ff"/><ellipse cx="210" cy="474" rx="6" ry="30" fill="#cfe0ff"/></svg>' +
  PINS.map((p, i) => '<div class="pin" id="pin' + i + '" style="left:' + (MX + p[2] * MS) + "px;top:" + (MY + p[3] * MS) + 'px"><i></i><div class="c pl" style="' + (p[4] > 0 ? "right:46px" : "left:46px") + '"><b>' + p[0] + "</b><span>" + p[1] + " מלונות</span></div></div>").join("") + '</div><div class="hud" id="hB">מצפון ועד אילת</div>');
const KB = [[6.0, 960, 20, 1.25], [6.5, 960, 60, 1.3], [7.75, 960, 1090, 1.3], [8.25, 950, 800, 1.5], [8.7, 948, 800, 3.2]];
function drawB(t) { camTo($("#wB"), t, KB, 5, -6); SB.style.opacity = seg(t, 6.0, 6.3);
  PINS.forEach((p, i) => { const a = 6.35 + i * 0.26, q = outBack(seg(t, a, a + 0.4)), e = $("#pin" + i), hot = i === 4 ? seg(t, 8.0, 8.3) : 0; e.style.opacity = seg(t, a, a + 0.08); T3(e, 0, (1 - q) * -40, 40 + hot * 60, (0.6 + 0.4 * q) * (1 + 0.14 * hot)); e.querySelector("i").style.transform = "scale(" + (1 + 0.5 * Math.abs(Math.sin((t - a) * 5)) * (1 - seg(t, a + 0.6, a + 1)) + hot).toFixed(3) + ")"; });
  const h = $("#hB"), q = outExpo(seg(t, 6.2, 6.7)); h.style.opacity = q * (1 - seg(t, 8.3, 8.5)); h.style.transform = "translateY(" + ((1 - q) * 40).toFixed(1) + "px)"; h.style.filter = "blur(" + ((1 - q) * 12).toFixed(1) + "px)"; }

// ---------- C. the attention reset: one line on navy (8.6 - 10.5) ----------
const SC = scene("SC", '<div id="cR"></div><div id="cT"><div><span>דמיינו</span><span>להתעורר</span></div><div class="b"><span>מול</span><span>המכתש.</span></div></div>', "linear-gradient(135deg,#001f52,#002d74 45%,#0a47b0)");
{ for (let i = 0; i < 6; i++) { const r = document.createElement("i"), w = 700 + i * 220; r.style.cssText = "width:" + w + "px;height:" + w * 0.36 + "px;left:" + -w / 2 + "px;top:" + (-w * 0.18) + "px"; $("#cR").appendChild(r); } }
function drawC(t) { const w = outCubic(seg(t, 8.55, 9.0)), out = inCubic(seg(t, 10.2, 10.55)); SC.style.clipPath = "circle(" + (w * 1400).toFixed(0) + "px at 50% 50%)"; SC.style.opacity = 1 - out; SC.style.transform = "scale(" + (1 + out * 0.5).toFixed(3) + ")";
  $$("#cT span").forEach((s, i) => { const q = outExpo(seg(t, 8.8 + i * 0.14, 9.3 + i * 0.14)); s.style.opacity = q; s.style.transform = "translateY(" + ((1 - q) * 70).toFixed(1) + "px) scale(" + (1 + 0.12 * (1 - q)).toFixed(3) + ")"; s.style.filter = "blur(" + ((1 - q) * 16).toFixed(1) + "px)"; });
  $("#cT").style.transform = "scale(" + (0.96 + 0.07 * seg(t, 8.6, 10.5)).toFixed(4) + ")"; [...$("#cR").children].forEach((r, i) => (r.style.transform = "rotateX(68deg) rotateZ(" + (t * (12 + i * 5) + i * 30).toFixed(1) + "deg)")); }

// ---------- D. the photos: a 3D carousel (10.4 - 13.7) ----------
const PH = ["berhero_0", "berhero_2", "ber_12", "berhero_8", "ber_09"], RAD = 1000, ANG = 36;
const SD = scene("SD", BLOBS + '<div class="world" id="wD"><div id="ring">' + PH.map((p, i) => '<div class="ph c" id="ph' + i + '"><img src="assets/img/' + p + '.jpg"/></div>').join("") + '</div></div><div class="hud" id="hD"><b>בראשית</b> · מצפה רמון</div>');
function drawD(t) { SD.style.opacity = seg(t, 10.3, 10.6) * (1 - seg(t, 13.55, 13.75));
  // the ring turns one photo at a time, with a small push on each stop
  const step = (t - 10.5) / 0.62, n = Math.floor(clamp(step, 0, 4.999)), f = inOut(seg(step - n, 0.35, 1)), rot = -(n + f) * ANG, stop = 1 - Math.abs(Math.sin(Math.PI * clamp(step - n, 0, 1)));
  const zoom = lerp(0.86, 1.0, outCubic(seg(t, 10.4, 11.0))) + 0.05 * (1 - Math.abs(Math.sin(Math.PI * (step - Math.floor(step))))) + inCubic(seg(t, 13.3, 13.75)) * 1.6;
  T3($("#wD"), 0, 0, 0, zoom, 4, 0); $("#ring").style.transform = "translateZ(" + -RAD + "px) rotateY(" + rot.toFixed(2) + "deg)";
  PH.forEach((p, i) => { const e = $("#ph" + i), q = outBack(seg(t, 10.45 + i * 0.07, 10.95 + i * 0.07)); e.style.opacity = seg(t, 10.45 + i * 0.07, 10.6 + i * 0.07); e.style.transform = "rotateY(" + i * ANG + "deg) translateZ(" + RAD + "px) translateY(" + ((1 - q) * 160).toFixed(1) + "px) scale(" + (0.8 + 0.2 * q).toFixed(3) + ")"; });
  const h = $("#hD"), q = outExpo(seg(t, 10.7, 11.2)); h.style.opacity = q * (1 - seg(t, 13.3, 13.5)); h.style.transform = "translateY(" + ((1 - q) * 30).toFixed(1) + "px)"; }

// ---------- E. the hotel page, taken apart (13.6 - 18.4) ----------
const SE = scene("SE", BLOBS + '<div class="world" id="wE">' +
  '<div class="c" id="eP" style="left:120px;top:200px;width:880px;height:600px;overflow:hidden"><img src="assets/img/berhero_1.jpg" style="width:100%;height:100%;object-fit:cover"/></div>' +
  '<div id="eT" style="position:absolute;right:140px;top:170px;direction:rtl;text-align:right"><div class="t">בראשית</div><div class="s">מצפה רמון והנגב</div></div>' +
  '<div class="c chip" id="eX" style="right:470px;top:322px;background:#1b2233;color:#fff;direction:ltr">Isrotel Exclusive</div>' +
  '<div class="c chip" id="e1" style="right:140px;top:416px">111 חדרים</div><div class="c chip" id="e2" style="right:356px;top:416px">שנת הקמה 2011</div><div class="c chip" id="e3" style="right:632px;top:416px">מול מכתש רמון</div>' +
  '<div class="c" id="eR" style="right:140px;top:500px;width:760px;height:330px;direction:rtl"><img src="assets/img/ber_04.jpg" style="position:absolute;right:18px;top:18px;width:300px;height:294px;object-fit:cover;border-radius:14px"/>' +
  '<div style="position:absolute;right:346px;top:34px;font-size:34px;font-weight:700;color:#002d74;white-space:nowrap">חדר בראשית עם מרפסת</div><div style="position:absolute;right:346px;top:98px;font-size:24px;color:#7b8499">החל מ:</div>' +
  '<div id="ePr" style="position:absolute;right:346px;top:122px;font-size:92px;font-weight:700;color:#1b2233;line-height:1.1;direction:ltr">₪1,807</div><div style="position:absolute;right:346px;top:232px;font-size:24px;color:#7b8499">לזוג ללילה</div>' +
  '<div id="eB" style="position:absolute;left:28px;bottom:28px;width:190px;height:70px;border-radius:14px;background:#002d74;color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;overflow:hidden">הזמן<i id="eRp"></i></div></div>' + CUR + "</div>");
const KE = [[13.6, 960, 520, 0.92], [14.2, 960, 520, 1.0], [14.9, 1440, 290, 1.5], [15.5, 1380, 420, 1.45], [16.2, 1400, 660, 1.4], [17.3, 1400, 670, 1.5], [17.8, 1130, 760, 1.7], [18.1, 1126, 762, 1.75], [18.45, 1126, 762, 4.5]];
function drawE(t) { SE.style.opacity = seg(t, 13.55, 13.85) * (1 - seg(t, 18.25, 18.45)); camTo($("#wE"), t, KE, 6, -5);
  popIn($("#eP"), t, 13.7, 0); const q = outExpo(seg(t, 14.0, 14.5)), T = $("#eT"); T.style.opacity = q; T.style.transform = "translate3d(0," + ((1 - q) * 50).toFixed(1) + "px,60px)"; T.style.filter = "blur(" + ((1 - q) * 12).toFixed(1) + "px)";
  popIn($("#eX"), t, 14.5, 90, 0.35); [["#e1", 15.0], ["#e2", 15.14], ["#e3", 15.28]].forEach(([id, a]) => popIn($(id), t, a, 50, 0.35));
  const r = popIn($("#eR"), t, 15.7, 80); $("#ePr").textContent = "₪" + Math.round(1807 * outCubic(seg(t, 16.0, 16.7))).toLocaleString("en-US");
  const press = seg(t, 18.04, 18.1) * (1 - seg(t, 18.1, 18.3)), rp = seg(t, 18.1, 18.45); $("#eB").style.transform = "scale(" + (1 - 0.07 * press).toFixed(3) + ")"; $("#eRp").style.transform = "scale(" + (rp * 14).toFixed(2) + ")"; $("#eRp").style.opacity = rp > 0 ? 1 - rp : 0;
  cursorAt(SE.querySelector(".cur"), t, [[17.2, 1500, 980], [17.95, 1138, 770], [18.4, 1138, 770]], [18.1]); }

// ---------- F. the booking, and the club discount (18.3 - 21.6) ----------
const SF = scene("SF", BLOBS + '<div class="world" id="wF"><div class="c" id="fC" style="left:560px;top:220px;width:800px;height:600px;direction:rtl">' +
  '<div style="position:absolute;right:50px;top:44px;font-size:44px;font-weight:700;color:#002d74">ההזמנה שלכם</div>' +
  ['<b>בראשית</b><span>מלון</span>', '<b style="direction:ltr">20/12/26 - 22/12/26</b><span>תאריכים</span>', "<b>2 מבוגרים · חדר 1</b><span>אורחים</span>"].map((r, i) => '<div class="row" id="fr' + i + '" style="top:' + (136 + i * 96) + 'px">' + r + "</div>").join("") +
  '<div id="fB" style="position:absolute;left:50px;right:50px;bottom:44px;height:92px;border-radius:18px;background:#002d74;color:#fff;font-size:36px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:16px;overflow:hidden"><span id="fBt">אישור הזמנה</span></div></div>' +
  '<div class="c" id="fS" style="left:310px;top:150px;width:400px;height:150px;direction:rtl"><div id="fSun"></div><div style="position:absolute;right:150px;top:22px;font-size:54px;font-weight:700;color:#002d74;line-height:1"><span style="direction:ltr;display:inline-block">10%</span> הנחה</div><div style="position:absolute;right:150px;top:88px;font-size:22px;color:#1b2233;white-space:nowrap">לחברי מועדון חוג השמש</div></div>' + CUR + "</div>");
const KF = [[18.3, 960, 520, 1.25], [18.9, 960, 520, 0.98], [19.3, 760, 300, 1.5], [19.9, 780, 310, 1.55], [20.3, 960, 720, 1.4], [21.0, 960, 700, 1.3], [21.6, 960, 520, 1.1]];
function drawF(t) { SF.style.opacity = seg(t, 18.3, 18.55) * (1 - seg(t, 21.45, 21.65)); camTo($("#wF"), t, KF, 5, -5);
  const flip = inCubic(seg(t, 21.2, 21.65)); const c = popIn($("#fC"), t, 18.4, 0); if (flip > 0) T3($("#fC"), 0, -flip * 120, -flip * 400, 1 - flip * 0.3, flip * 70, flip * -25);
  [0, 1, 2].forEach((i) => { const e = $("#fr" + i), q = outExpo(seg(t, 18.6 + i * 0.1, 19.0 + i * 0.1)); e.style.opacity = q; e.style.transform = "translateX(" + ((1 - q) * 40).toFixed(1) + "px)"; });
  const s = outBack(seg(t, 19.2, 19.65)), S = $("#fS"); S.style.opacity = seg(t, 19.2, 19.3) * (1 - flip); T3(S, 0, (1 - s) * -60, 120, (0.6 + 0.4 * s) * (1 + 0.04 * Math.sin(t * 6)), 0, 0); S.style.transform += " rotate(-4deg)"; $("#fSun").style.transform = "rotate(" + (t * 40).toFixed(1) + "deg)";
  const done = seg(t, 20.55, 20.75), press = seg(t, 20.48, 20.54) * (1 - seg(t, 20.54, 20.7)), B = $("#fB"); B.style.background = done > 0.5 ? "#12a05c" : NAVY; B.style.transform = "scale(" + (1 - 0.05 * press + 0.04 * Math.sin(done * Math.PI)).toFixed(3) + ")"; $("#fBt").textContent = done > 0.5 ? "ההזמנה אושרה ✓" : "אישור הזמנה";
  cursorAt(SF.querySelector(".cur"), t, [[19.9, 1300, 420], [20.42, 960, 742], [20.9, 968, 748]], [20.54]); }

// ---------- G. the slogan and the logo (21.5 - 25.2) ----------
const SG = scene("SG", BLOBS + '<div id="gT"><span>החופשה</span><span>המושלמת</span><span>שלכם</span><span>מתחילה</span><span>כאן.</span></div><div id="gR"></div><svg id="gL" xmlns="http://www.w3.org/2000/svg"></svg><div id="gC">ספק אד · נוצר על ידי רפאל לוי · @refaelleviii</div>');
const GL = $("#gL"); GL.setAttribute("viewBox", (LOGO.box[0] - 6) + " " + (LOGO.box[1] - 6) + " " + (LOGO.box[2] + 12) + " " + (LOGO.box[3] + 12));
const gLet = [...LOGO.top.map((d, i) => [d, 0, i]), ...LOGO.bot.map((d, i) => [d, 1, i])].map(([d, row, i]) => { const e = document.createElementNS("http://www.w3.org/2000/svg", "path"); e.setAttribute("d", d); GL.appendChild(e); const L = e.getTotalLength(); e.style.strokeDasharray = L; return { e, L, row, i }; });
{ for (let i = 0; i < 6; i++) { const r = document.createElement("i"), w = 560 + i * 80, h = 170 + i * 50; r.style.cssText = "width:" + w + "px;height:" + h + "px;left:" + -w / 2 + "px;top:" + -h / 2 + "px"; $("#gR").appendChild(r); } }
function drawG(t) { SG.style.opacity = seg(t, 21.45, 21.75);
  $$("#gT span").forEach((s, i) => { const q = outExpo(seg(t, 21.7 + i * 0.1, 22.2 + i * 0.1)); s.style.opacity = q; s.style.transform = "translateY(" + ((1 - q) * 40).toFixed(1) + "px)"; s.style.filter = "blur(" + ((1 - q) * 14).toFixed(1) + "px)"; });
  const up = inOut(seg(t, 22.5, 23.0)); $("#gT").style.transform = "translateY(" + (-up * 250).toFixed(1) + "px) scale(" + (1 - 0.32 * up).toFixed(3) + ")";
  [...$("#gR").children].forEach((r, i) => { const q = seg(t, 22.5 + i * 0.03, 23.5 + i * 0.03), e = outCubic(q); r.style.opacity = (seg(t, 22.5, 22.62) * (1 - seg(q, 0.62, 1)) * (0.9 - i * 0.1)).toFixed(3); r.style.transform = "rotateX(" + (lerp(78, 0, e) + i * 3).toFixed(1) + "deg) rotateY(" + lerp(-60 + i * 22, 0, e).toFixed(1) + "deg) rotateZ(" + (lerp(i * 40, 0, e) + t * 30).toFixed(1) + "deg) scale(" + lerp(1.5 - i * 0.05, 0.55, e).toFixed(3) + ")"; });
  gLet.forEach((l) => { const a = 22.75 + (l.row ? 0.72 + l.i * 0.05 : l.i * 0.075), d = seg(t, a, a + (l.row ? 0.3 : 0.55)), f = seg(t, a + (l.row ? 0.12 : 0.4), a + (l.row ? 0.34 : 0.7)); l.e.style.strokeDashoffset = (l.L * (1 - inOut(d))).toFixed(1); l.e.style.fillOpacity = f.toFixed(3); l.e.style.opacity = d > 0 ? 1 : 0; });
  GL.style.transform = "scale(" + (0.94 + 0.06 * outBack(seg(t, 23.4, 23.8)) + 0.02 * seg(t, 23.8, FILM)).toFixed(4) + ")"; $("#gC").style.opacity = seg(t, 24.0, 24.4); }

// ---------- master ----------
const SA = $("#SA");
function draw(T) { T = clamp(T, 0, FILM); SA.style.display = T < 6.35 ? "block" : "none"; if (T < 6.35) drawA(Math.min(T, 6.2));
  [[SB, 5.95, 8.75, drawB], [SC, 8.5, 10.6, drawC], [SD, 10.25, 13.8, drawD], [SE, 13.5, 18.5, drawE], [SF, 18.25, 21.7, drawF], [SG, 21.4, 99, drawG]].forEach(([el, a, b, fn]) => { const on = T >= a && T < b; el.style.display = on ? "block" : "none"; if (on) fn(T); }); }
const tl = gsap.timeline({ paused: true }), pr = { t: 0 };
tl.to(pr, { t: FILM, duration: FILM, ease: "none", onUpdate: () => draw(pr.t) }, 0);
draw(0);
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; window.__draw = draw;
