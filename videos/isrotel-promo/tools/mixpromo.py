"""Audio bed for the full promo (promo.html, 24.2 s): temporary music + a sound per hit. Run from the project root."""
import subprocess
DUR = 24.2
ev = [("whoosh", 0.15, 0.5), ("impact", 1.2, 0.5), ("whoosh", 2.05, 0.5), ("whoosh", 2.3, 0.4)] + [("pop", 3.0 + i * 0.16, 0.4) for i in range(6)] + [("whoosh", 4.8, 0.6), ("pop", 5.55, 0.55), ("whoosh", 6.9, 0.7), ("impact", 7.7, 0.4),
      ("whoosh", 10.25, 0.6), ("whoosh", 10.7, 0.4), ("pop", 11.4, 0.55), ("whoosh", 12.35, 0.7), ("impact", 13.15, 0.4), ("whoosh", 15.15, 0.6), ("whoosh", 15.6, 0.4), ("pop", 16.2, 0.55), ("whoosh", 17.15, 0.7), ("impact", 17.95, 0.4),
      ("whoosh", 20.2, 0.7), ("impact", 20.9, 0.6), ("whoosh", 21.35, 0.4), ("impact", 22.45, 0.5), ("pop", 22.65, 0.5)]
cmd = ["ffmpeg", "-y", "-v", "error", "-stream_loop", "1", "-i", "../sonol-spec/assets/audio/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.15,afade=t=out:st=%s:d=1.4,volume=0.5[m]" % (DUR, DUR - 1.4)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v * 0.8, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed_promo.m4a"], check=True); print("bed ok")
