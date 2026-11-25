// "Claude killed ___" — story format (9:16). Top half: the motion piece. Bottom half: Refael's avatar, speaking.
// Everything on top is timed to the narration's measured word times.
const V0 = 0.25, DUR = 29.6;                       // the narration (and the avatar) start V0 into the film
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), seg = (t, a, b) => clamp((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
const outCubic = (x) => 1 - Math.pow(1 - x, 3), outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)), inCubic = (x) => x * x * x, inOut = (x) => -(Math.cos(Math.PI * x) - 1) / 2;
const outBack = (x) => (x <= 0 ? 0 : 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2));
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const tf = (e, x, y, s = 1, r = 0) => (e.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + r.toFixed(2) + "deg) scale(" + Math.max(0.0001, s).toFixed(3) + ")");
const pop = (e, t, a, b) => { const q = outBack(seg(t, a, a + 0.3)), o = b == null ? 0 : seg(t, b, b + 0.15); e.style.opacity = q > 0 && o < 1 ? 1 - o : 0; return q; };
const type = (el, txt, t, a, d) => (el.textContent = txt.slice(0, Math.floor(seg(t, a, a + d) * txt.length + 0.001)));
{ let d = ""; for (let i = 0; i < 12; i++) d += '<rect x="-1.5" y="-11" width="3" height="' + (i % 2 ? 7 : 10) + '" rx="1.5" transform="rotate(' + i * 30 + ')"/>'; $$(".spk").forEach((g) => (g.innerHTML = d)); }

// ---------- scenes on the stage: [id, in, out] on the narration clock ----------
const SC = [["hook", -1, 1.95], ["web", 1.95, 3.25], ["dev", 3.25, 4.75], ["arch", 4.75, 6.08], ["copy", 6.08, 7.36], ["tran", 7.36, 8.46], ["real", 8.46, 9.74], ["soc", 9.74, 11.15], ["bowl", 11.15, 15.85], ["chalk", 15.85, 19.05], ["course", 19.05, 25.4], ["cta", 25.4, 99]];
// ---------- the text band: [time, small line, big line, time the big line lands, strike the previous job] ----------
const TX = [[0.0, "Claude הרג את", "עורכי הווידאו", 0.96, 0], [2.0, null, "מעצבי האתרים", 2.2, 1], [3.28, null, "מפתחי התוכנה", 3.48, 1], [4.8, null, "האדריכלים", 5.0, 1], [6.0, null, "הקופירייטרים", 6.16, 1], [7.28, null, "המתרגמים", 7.41, 1], [8.44, null, "סוכני הנדל״ן", 8.52, 1], [9.68, null, "מנהלי הסושיאל", 9.84, 1],
  [11.28, "אתם מרגישים ש־Claude פשוט", "הרג את כולם?", 12.88, 0], [14.32, "אז זהו,", "שלא.", 15.12, 0], [16.0, "Claude הרג רק את", "מי שלא יודע להשתמש בו", 17.2, 0], [19.2, "לא רוצים שהוא יחליף", "גם אתכם?", 20.64, 0],
  [21.48, "הכנתי לכם קורס", "כל מה שחייבים לדעת", 23.36, 0], [25.52, "רוצים אותו", "במתנה?", 26.03, 0], [26.88, "תגיבו כאן את המילה", "קורס", 28.16, 0]];
const band = $("#band"); let lastL1 = null;
const rows = TX.map((r, i) => { const l1 = r[1] === null ? lastL1 : r[1], same = r[1] === null; lastL1 = l1; const a = document.createElement("div"); a.className = "l1"; a.textContent = l1; const b = document.createElement("div"); b.className = "l2"; b.innerHTML = "<span>" + r[2] + "</span><i></i>"; b.style.fontSize = Math.min(128, Math.floor(1010 / (r[2].length * 0.56))) + "px"; band.appendChild(a); band.appendChild(b); return { a, b, same, i }; });

// ---------- pieces ----------
const webEls = $$("#w1 .b"), code = $$("#code i"), plan = $$("#plan path"), chap = $$(".ch"), cms = $$(".cm");
plan.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p._L = L; });

function draw(T) {
  T = clamp(T, 0, DUR); const t = T - V0;
  // soft colour clouds behind everything
  [0, 1, 2].forEach((i) => tf($("#b" + i), Math.sin(T * 0.5 + i * 2) * 80, Math.cos(T * 0.4 + i * 1.7) * 60, 1 + 0.08 * Math.sin(T * 0.7 + i)));
  // stage scenes: each pops in, and slides out when the next one arrives
  SC.forEach(([id, a, b]) => { const e = $("#s_" + id), q = id === "hook" ? 1 : outExpo(seg(t, a, a + 0.32)), o = inCubic(seg(t, b - 0.12, b + 0.08)); e.style.display = t >= a - 0.02 && t < b + 0.1 ? "block" : "none"; e.style.opacity = Math.min(seg(t, a, a + 0.1) + (id === "hook" ? 1 : 0), 1) * (1 - o); tf(e, 0, (1 - q) * 60 - o * 50, 0.9 + 0.1 * q + 0.04 * o); e.style.filter = o > 0 ? "blur(" + (o * 8).toFixed(1) + "px)" : "none"; });
  // hook: a camera flash, then a slow pan from the hitman to the victim
  const slam = seg(t, 0.96, 1.04) * (1 - seg(t, 1.04, 1.4)); $("#hookI").style.transform = "translate(" + (lerp(0, -140, inOut(seg(T, 0, 2.2))) + Math.sin(T * 47) * 5 * slam).toFixed(1) + "px," + (Math.cos(T * 53) * 5 * slam).toFixed(1) + "px) scale(" + (1.0 + 0.03 * seg(T, 0, 2.2) + 0.02 * slam).toFixed(4) + ")";
  $("#flash").style.opacity = clamp((1 - seg(T, 0, 0.25)) * 0.9 + slam * 0.3).toFixed(3);
  // web designers: a site builds itself
  const w1 = outBack(seg(t, 1.98, 2.3)); tf($("#w1"), 0, (1 - w1) * 60, 0.85 + 0.15 * w1); const w2 = outBack(seg(t, 2.55, 2.85)); $("#w2").style.opacity = w2 > 0 ? 1 : 0; tf($("#w2"), (1 - w2) * -100, 0, 0.85 + 0.15 * w2, 5);
  webEls.forEach((e, i) => { const q = outBack(seg(t, 2.16 + i * 0.045, 2.4 + i * 0.045)); e.style.opacity = q > 0 ? 1 : 0; tf(e, 0, (1 - q) * 20, 0.6 + 0.4 * q); });
  // developers: the code writes itself
  code.forEach((e, i) => { const q = seg(t, 3.34 + i * 0.075, 3.5 + i * 0.075); e.style.transform = "scaleX(" + q.toFixed(3) + ")"; }); tf($("#okDev"), 0, 0, pop($("#okDev"), t, 4.2));
  // architects: the plan draws itself
  plan.forEach((p, i) => (p.style.strokeDashoffset = (p._L * (1 - inOut(seg(t, 4.82 + i * 0.07, 5.45 + i * 0.07)))).toFixed(1))); tf($("#okArch"), 0, 0, pop($("#okArch"), t, 5.6));
  // copywriters / translators / real estate / social
  type($("#cpH"), "הכותרת שמוכרת את הכול", t, 6.16, 0.55); $$("#s_copy .ln").forEach((e, i) => (e.style.transform = "scaleX(" + outCubic(seg(t, 6.5 + i * 0.1, 6.85 + i * 0.1)).toFixed(3) + ")"));
  tf($("#bbA"), 0, 0, pop($("#bbA"), t, 7.4)); tf($("#bbB"), 0, 0, pop($("#bbB"), t, 7.72)); type($("#bbT"), "Hello, how are you?", t, 7.8, 0.4);
  tf($("#house"), 0, 0, pop($("#house"), t, 8.5)); $("#price").textContent = "₪ " + Math.round(2450000 * outCubic(seg(t, 8.6, 9.2))).toLocaleString("en-US"); const sold = outBack(seg(t, 9.2, 9.45)); $("#sold").style.opacity = sold > 0 ? 1 : 0; tf($("#sold"), 0, 0, 2.2 - 1.2 * sold, -12);
  tf($("#post"), 0, 0, pop($("#post"), t, 9.78)); $("#likes").textContent = (12.4 * outCubic(seg(t, 9.95, 10.8))).toFixed(1) + "K"; tf($("#heart"), 0, 0, 1 + 0.25 * Math.abs(Math.sin(t * 9)) * seg(t, 9.9, 10)); cms.forEach((e, i) => tf(e, 0, 0, pop(e, t, 10.15 + i * 0.22)));
  $("#cnt").textContent = "0" + Math.min(8, 1 + TX.filter((r, i) => i > 0 && i < 8 && t >= r[3]).length); $("#tag").style.opacity = seg(t, 0.96, 1.2) * (1 - seg(t, 11.0, 11.2));
  // "killed everyone?" — the strike; then "well, no" drains its colour
  const no = seg(t, 14.32, 14.7), punch = seg(t, 12.88, 12.96) * (1 - seg(t, 12.96, 13.4)); $("#bowlI").style.transform = "scale(" + (1.04 + 0.1 * seg(t, 11.15, 14.3) + 0.06 * punch - 0.06 * no).toFixed(4) + ")"; $("#bowlI").style.filter = "grayscale(" + no.toFixed(2) + ") brightness(" + (1 + 0.1 * no).toFixed(2) + ")";
  $("#chalkI").style.transform = "scale(" + (1.03 + 0.1 * seg(t, 15.85, 19.1)).toFixed(4) + ")";
  // the course
  tf($("#cover"), 0, Math.sin(t * 1.6) * 6, pop($("#cover"), t, 19.15), -4); chap.forEach((e, i) => { const q = outBack(seg(t, 21.5 + i * 0.42, 21.8 + i * 0.42)); e.style.opacity = q > 0 ? 1 : 0; tf(e, (1 - q) * 80, 0, 1); e.querySelector("b").style.transform = "scale(" + outBack(seg(t, 21.75 + i * 0.42, 22.0 + i * 0.42)).toFixed(3) + ")"; });
  tf($("#gift"), 0, 0, pop($("#gift"), t, 23.4) * (1 + 0.05 * Math.sin(t * 7)), 8);
  // the call to action: the comment types itself
  tf($("#cbar"), 0, 0, pop($("#cbar"), t, 25.5)); type($("#ctype"), "קורס", t, 27.0, 0.45); $("#ccur").style.opacity = t > 26.6 && t < 27.9 && Math.floor(t * 4) % 2 ? 1 : 0; const send = seg(t, 27.9, 28.0) * (1 - seg(t, 28.0, 28.3)); tf($("#csend"), 0, 0, 1 + 0.25 * send);
  tf($("#cposted"), 0, 0, pop($("#cposted"), t, 28.1)); $("#handle").style.opacity = seg(t, 28.3, 28.7);
  // the text band
  rows.forEach((r) => { const X = TX[r.i], nx = TX[r.i + 1], end = nx ? nx[0] : 99, endBig = nx ? (nx[4] ? nx[3] : nx[0]) : 99;
    const qa = outExpo(seg(t, X[0], X[0] + 0.4)), oa = seg(t, end - 0.02, end + 0.14); r.a.style.opacity = r.same ? 0 : qa * (1 - oa) * (nx && nx[1] === null ? 1 : 1); if (nx && nx[1] === null) r.a.style.opacity = r.same ? 0 : qa; if (r.same) r.a.style.opacity = 0;
    r.a.style.transform = "translateY(" + ((1 - qa) * 30).toFixed(1) + "px)"; r.a.style.filter = "blur(" + ((1 - qa) * 10).toFixed(1) + "px)";
    const qb = outExpo(seg(t, X[3], X[3] + 0.34)), st = nx && nx[4] ? outCubic(seg(t, endBig - 0.2, endBig - 0.02)) : 0, ob = inCubic(seg(t, endBig, endBig + 0.2));
    r.b.style.opacity = seg(t, X[3], X[3] + 0.06) * (1 - ob) * (1 - 0.4 * st); r.b.style.transform = "translateY(" + ((1 - qb) * (X[4] ? -90 : 70) + ob * 120).toFixed(1) + "px) scale(" + (1 + 0.35 * (1 - qb)).toFixed(3) + ") rotate(" + (ob * 4).toFixed(2) + "deg)"; r.b.style.filter = "blur(" + ((1 - qb) * 12 + ob * 8).toFixed(1) + "px)"; r.b.querySelector("i").style.transform = "scaleX(" + st.toFixed(3) + ")"; });
  // keep the first small line alive through the whole list of jobs
  rows[0].a.style.opacity = outExpo(seg(t, 0, 0.4)) * (1 - seg(t, 11.1, 11.25));
}
const tl = gsap.timeline({ paused: true }), pr = { t: 0 };
tl.to(pr, { t: DUR, duration: DUR, ease: "none", onUpdate: () => draw(pr.t) }, 0);
draw(0);
window.__timelines = window.__timelines || {}; window.__timelines["main"] = tl; window.__draw = draw;
