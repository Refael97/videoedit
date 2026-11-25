"""Audio bed for the approval scene: music + sound effects on the hits. Run from the project root: python3 tools/mixbed.py"""
import subprocess
DUR, SW = 5.2, 2.85
ev = [("whoosh", 0.7, 0.5), ("impact", 0.78, 0.8), ("pop", 1.8, 0.4), ("pop", 1.95, 0.4), ("pop", 2.1, 0.4), ("pop", 2.32, 0.6), ("whoosh", SW - 0.14, 0.6), ("impact", SW + 0.1, 0.85), ("pop", SW + 0.75, 0.4), ("pop", SW + 0.95, 0.4), ("pop", SW + 1.15, 0.4), ("pop", SW + 1.78, 0.6)]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", "../bit-spec/assets/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]atrim=0:%s,afade=t=in:d=0.2,afade=t=out:st=%s:d=0.5,volume=0.5[m]" % (DUR, DUR - 0.5)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed.m4a"], check=True); print("bed ok")
