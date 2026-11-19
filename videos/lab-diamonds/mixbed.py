"""Mixes the audio bed (music + sound effects on the cuts) -> assets/audio/bed.m4a. Run: python3 mixbed.py"""
import subprocess
DUR = 48.8
cuts = [5.68, 10.16, 12.64, 17.14, 21.28, 24.8, 30.44, 33.22, 34.5, 36.58, 42.58]
steps = [5.68, 10.16, 21.28, 30.44, 36.58]
pops = [19.4, 24.14, 25.3, 39.62, 40.58, 41.46, 43.85, 46.3]
ev = [("whoosh", t - 0.14, 0.5) for t in cuts] + [("impact", t, 0.75) for t in steps] + [("impact", 0.05, 0.6), ("riser", 36.58 - 2.0, 0.45), ("impact", 15.18, 0.5)] + [("pop", t, 0.5) for t in pops]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", "assets/audio/music_full.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.4,afade=t=out:st=%s:d=2.2,volume=0.085[m]" % (DUR, DUR - 2.2)]
for i, (n, t, v) in enumerate(ev):
    f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v * 0.55, max(0, t) * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
cmd += ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed.m4a"]
subprocess.run(cmd, check=True); print("bed ok")
