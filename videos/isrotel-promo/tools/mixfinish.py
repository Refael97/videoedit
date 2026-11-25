"""Audio bed for the finish-level test beat (finish.html, 9.6 s). Run from the project root."""
import subprocess
DUR = 9.6
ev = [("whoosh", 0.0, 0.6), ("impact", 0.85, 0.35), ("pop", 1.7, 0.4), ("pop", 1.83, 0.4), ("pop", 1.96, 0.45), ("whoosh", 2.5, 0.7), ("pop", 3.05, 0.5), ("whoosh", 4.75, 0.7), ("impact", 5.6, 0.4), ("pop", 6.55, 0.35), ("pop", 6.8, 0.35), ("pop", 7.4, 0.5), ("click", 8.6, 0.9), ("whoosh", 8.7, 0.6), ("impact", 8.8, 0.6)]
cmd = ["ffmpeg", "-y", "-v", "error", "-ss", "8", "-i", "../sonol-spec/assets/audio/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.15,afade=t=out:st=%s:d=0.6,volume=0.5[m]" % (DUR, DUR - 0.6)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v * 0.8, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed_finish.m4a"], check=True); print("bed ok")
