"""Audio bed for the approval beat: temporary music + a pop per card, a click per press, a whoosh on the push. Run from the project root."""
import subprocess
DUR = 6.2
ev = [("impact", 0.1, 0.5), ("pop", 0.38, 0.5), ("whoosh", 1.3, 0.5), ("pop", 1.6, 0.4), ("pop", 1.72, 0.4), ("pop", 1.84, 0.4), ("pop", 1.96, 0.5),
      ("click", 2.5, 0.8), ("pop", 3.0, 0.5), ("click", 3.8, 0.8), ("pop", 3.86, 0.5), ("click", 4.28, 0.8), ("click", 4.88, 0.8), ("click", 5.62, 0.9), ("whoosh", 5.6, 0.7)]
cmd = ["ffmpeg", "-y", "-v", "error", "-ss", "8", "-i", "../sonol-spec/assets/audio/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.15,afade=t=out:st=%s:d=0.5,volume=0.5[m]" % (DUR, DUR - 0.5)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed.m4a"], check=True); print("bed ok")
