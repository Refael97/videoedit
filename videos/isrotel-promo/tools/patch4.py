"""Turns the approval beat into scene A of the full film and loads film.js for the remaining beats."""
p = "index.html"; s = open(p, encoding="utf8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, (a, s.count(a)); s = s.replace(a, b)
rep('data-duration="6.2" data-width', 'data-duration="25.2" data-width')
rep('data-start="0" data-duration="6.2" data-track-index="10"', 'data-start="0" data-duration="25.2" data-track-index="10"')
# scene A wrapper
i = s.index('      <div class="blob" id="b0"'); j = s.index("      <audio id=\"bed\"")
s = s[:i] + '      <div class="scn" id="SA">\n' + s[i:j] + "      </div>\n" + s[j:]
rep("perspective: 2200px; }", "}\n      .scn { position: absolute; inset: 0; overflow: hidden; perspective: 2200px; background: #f5f7fb; }\n      .world { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-style: preserve-3d; }")
rep("      function draw(t) {\n        t = clamp(t, 0, DUR);", "      function drawA(t) {\n        t = clamp(t, 0, DUR);")
i = s.index("      const tl = gsap.timeline({ paused: true })"); j = s.index("    </script>", i); s = s[:i] + s[j:]
rep("    </script>\n  </body>", "    </script>\n    <script src=\"film.js\"></script>\n  </body>")
rep("    </style>", """      .cur { position: absolute; left: 0; top: 0; width: 44px; height: 44px; filter: drop-shadow(0 6px 10px rgba(0, 20, 60, 0.35)); }
      .hud { position: absolute; right: 120px; top: 96px; direction: rtl; font-size: 72px; font-weight: 300; color: var(--n); white-space: nowrap; }
      .hud b { font-weight: 700; }
      /* map */
      .pin { position: absolute; width: 0; height: 0; }
      .pin > i { position: absolute; left: -13px; top: -13px; width: 26px; height: 26px; border-radius: 50%; background: var(--n); box-shadow: 0 0 0 7px rgba(0, 45, 116, 0.18); }
      .pl { top: -40px; height: 80px; padding: 0 26px; display: flex; flex-direction: column; justify-content: center; white-space: nowrap; border-radius: 18px; }
      .pl b { font-size: 30px; font-weight: 700; color: var(--n); line-height: 1.1; } .pl span { font-size: 20px; color: var(--mut); }
      /* navy card */
      #cT { position: absolute; left: 0; right: 0; top: 330px; text-align: center; direction: rtl; color: #fff; font-size: 150px; font-weight: 300; line-height: 1.15; }
      #cT span { display: inline-block; margin: 0 18px; } #cT .b { font-weight: 700; }
      #cR { position: absolute; left: 960px; top: 560px; width: 0; height: 0; } #cR i { position: absolute; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.14); }
      /* carousel */
      #ring { position: absolute; left: 960px; top: 560px; width: 0; height: 0; transform-style: preserve-3d; }
      .ph { left: -260px; top: -330px; width: 520px; height: 660px; overflow: hidden; border-radius: 30px; backface-visibility: hidden; } .ph img { width: 100%; height: 100%; object-fit: cover; }
      #hD { top: auto; bottom: 70px; right: 0; left: 0; text-align: center; font-size: 46px; }
      /* hotel page */
      #eT .t { font-size: 150px; font-weight: 700; color: var(--n); line-height: 1; } #eT .s { font-size: 34px; font-weight: 300; color: var(--ink); margin-top: 14px; }
      .chip { height: 66px; padding: 0 28px; border-radius: 33px; display: flex; align-items: center; font-size: 28px; white-space: nowrap; }
      #eRp { position: absolute; left: 50%; top: 50%; width: 30px; height: 30px; margin: -15px; border-radius: 50%; background: rgba(255, 255, 255, 0.5); }
      /* booking */
      .row { position: absolute; right: 50px; left: 50px; height: 80px; border-bottom: 2px solid #e6eaf3; display: flex; flex-direction: row-reverse; justify-content: space-between; align-items: center; opacity: 0; }
      .row b { font-size: 34px; font-weight: 700; color: var(--ink); } .row span { font-size: 24px; color: var(--mut); }
      #fSun { position: absolute; right: 26px; top: 25px; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #ffe770, #ffd21f 60%, #ffb800); box-shadow: 0 0 0 10px rgba(255, 210, 31, 0.25); }
      /* outro */
      #gT { position: absolute; left: 0; right: 0; top: 470px; text-align: center; direction: rtl; font-size: 84px; font-weight: 300; color: var(--n); white-space: nowrap; } #gT span { display: inline-block; margin: 0 12px; }
      #gL { position: absolute; left: 610px; top: 380px; width: 700px; height: 413px; overflow: visible; transform-origin: 50% 50%; } #gL path { fill: #002d74; fill-rule: evenodd; stroke: #002d74; stroke-width: 1.6; stroke-linejoin: round; }
      #gR { position: absolute; left: 960px; top: 586px; width: 0; height: 0; transform-style: preserve-3d; } #gR i { position: absolute; border-radius: 50%; border: 2.5px solid #002d74; }
      #gC { position: absolute; left: 0; right: 0; bottom: 70px; text-align: center; direction: rtl; font-size: 26px; color: var(--mut); opacity: 0; }
    </style>""")
open(p, "w", encoding="utf8").write(s); print("ok")
