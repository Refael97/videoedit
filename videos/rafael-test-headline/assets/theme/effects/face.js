/* FACE: place things relative to the speaker's face, not at fixed pixels. Theme-agnostic, seek-safe.
   Data: data/face.json from scripts/face_track.py ({fps, size:[w,h], boxes:[[t,x,y,w,h],...]} in source pixels),
   inlined by build.py as window.FACE_DATA. All distances are in FACE HEIGHTS (h), measured from the anchor.
     anchors: "top" = y · "eyes" = y + 0.4h · "chin" = y + h · "shoulders" = y + 1.55h · "cx" = x + w/2
   Usage:
     FACE.init(window.FACE_DATA, "#faceVid")
     FACE.yAt(tl, { at: "chin", dy: 0.35 })        -> fn(t) giving a screen y (for captions: captions(..., { yAt }))
     FACE.follow(tl, "#card", t0, t1, { at: "shoulders", dy: 0.1, side: "free", gap: 0.5 })
       moves a WRAPPER element (animate its child, not it) every frame from t0 to t1 */
(function () {
  const F = {
    d: null, vid: null,
    init(data, vidSel) { F.d = data; F.vid = document.querySelector(vidSel); return F; },
    // source box at time t (linear between samples)
    src(t) {
      const b = F.d.boxes; if (!b.length) return null;
      if (t <= b[0][0]) return b[0].slice(1); if (t >= b[b.length - 1][0]) return b[b.length - 1].slice(1);
      let lo = 0, hi = b.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (b[m][0] <= t) lo = m; else hi = m; }
      const k = (t - b[lo][0]) / (b[hi][0] - b[lo][0] || 1); return [1, 2, 3, 4].map((i) => b[lo][i] + (b[hi][i] - b[lo][i]) * k);
    },
    // the face box on screen right now (reads the video element's current transform; object-fit: cover)
    screen(t) {
      const s = F.src(t); if (!s || !F.vid) return null;
      const r = F.vid.getBoundingClientRect(), [vw, vh] = F.d.size, sc = Math.max(r.width / vw, r.height / vh);
      const ox = r.left + (r.width - vw * sc) / 2, oy = r.top + (r.height - vh * sc) / 2;
      const x = ox + s[0] * sc, y = oy + s[1] * sc, w = s[2] * sc, h = s[3] * sc;
      return { x, y, w, h, cx: x + w / 2, top: y, eyes: y + 0.4 * h, chin: y + h, shoulders: y + 1.55 * h };
    },
    // the free side: where there is more room between the face and the frame edge
    freeSide(fb) { return fb.cx > 540 ? "left" : "right"; },
    // y on screen for a rule at time t; seeks the timeline to read the layout of that moment, then restores it
    yAt(tl, rule) {
      return (t) => {
        const keep = tl.time(); tl.seek(t, false); const fb = F.screen(t); tl.seek(keep, false);
        if (!fb) return rule.fallback ?? 1270;
        return Math.max(rule.min ?? 140, Math.min(rule.max ?? 1800, fb[rule.at || "chin"] + (rule.dy || 0) * fb.h));
      };
    },
    // keep a wrapper element at a face-relative spot from t0 to t1 (seek-safe: positions are recomputed on every render)
    follow(tl, sel, t0, t1, rule) {
      const el = document.querySelector(sel), p = { v: 0 };
      tl.fromTo(p, { v: 0 }, { v: 1, duration: Math.max(0.01, t1 - t0), ease: "none", immediateRender: false, onUpdate: () => {
        const fb = F.screen(t0 + p.v * (t1 - t0)); if (!fb) return;
        const y = fb[rule.at || "chin"] + (rule.dy || 0) * fb.h;
        let x = fb.cx - el.offsetWidth / 2;
        if (rule.side) { const side = rule.side === "free" ? F.freeSide(fb) : rule.side, g = (rule.gap ?? 0.4) * fb.h;
          x = side === "left" ? fb.x - g - el.offsetWidth : fb.x + fb.w + g; }
        x = Math.max(rule.margin ?? 40, Math.min(1080 - (rule.margin ?? 40) - el.offsetWidth, x));
        gsap.set(el, { x, y: y - (rule.anchorY === "bottom" ? el.offsetHeight : 0) });
      } }, t0);
    },
  };
  window.FACE = F;
})();
