"""Audio bed for the full film: temporary music + a pop per card, a click per press, a whoosh per camera move. Run from the project root."""
import subprocess
DUR = 25.2
ev = [("whoosh", 0.0, 0.5), ("impact", 1.0, 0.5), ("whoosh", 1.45, 0.5), ("pop", 1.8, 0.4), ("pop", 1.92, 0.4), ("pop", 2.04, 0.4), ("pop", 2.16, 0.5),
      ("click", 2.5, 0.8), ("pop", 3.0, 0.5), ("click", 3.8, 0.8), ("pop", 3.86, 0.5), ("click", 4.28, 0.8), ("click", 4.88, 0.8), ("click", 5.62, 0.9), ("whoosh", 5.6, 0.7),
      ("whoosh", 2.45, 0.35), ("whoosh", 3.65, 0.35), ("whoosh", 5.15, 0.35)]
ev += [("pop", 6.35 + i * 0.26, 0.45) for i in range(6)] + [("whoosh", 7.8, 0.4), ("whoosh", 8.3, 0.7), ("impact", 8.6, 0.9)]            # map, then the navy card
ev += [("whoosh", 10.3, 0.6)] + [("pop", 10.5 + i * 0.62 + 0.3, 0.35) for i in range(5)] + [("whoosh", 13.4, 0.6)]                     # carousel
ev += [("pop", 13.7, 0.5), ("impact", 14.0, 0.4), ("pop", 14.5, 0.4), ("pop", 15.0, 0.4), ("pop", 15.14, 0.4), ("pop", 15.28, 0.4), ("pop", 15.7, 0.5), ("whoosh", 14.6, 0.3), ("whoosh", 15.9, 0.3), ("whoosh", 17.5, 0.3), ("click", 18.1, 0.9), ("whoosh", 18.1, 0.6)]
ev += [("pop", 18.4, 0.5), ("pop", 19.2, 0.6), ("whoosh", 19.0, 0.3), ("whoosh", 20.0, 0.3), ("click", 20.54, 0.9), ("impact", 20.6, 0.6), ("whoosh", 21.2, 0.6), ("whoosh", 22.5, 0.4), ("impact", 23.5, 0.6)]
cmd = ["ffmpeg", "-y", "-v", "error", "-stream_loop", "1", "-i", "../sonol-spec/assets/audio/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.15,afade=t=out:st=%s:d=1.4,volume=0.5[m]" % (DUR, DUR - 1.4)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v * 0.8, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed.m4a"], check=True); print("bed ok")
