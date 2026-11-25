"""Audio bed for the story cut: music under the voice + sound effects on the hits. Run from the project root: python3 tools/mixstory.py"""
import subprocess
DUR, V = 29.6, 0.25
jobs = [0.96, 2.2, 3.48, 5.0, 6.16, 7.41, 8.52, 9.84]
ev = [("impact", 0.0, 0.6)] + [("impact", t + V, 0.5) for t in jobs] + [("whoosh", t + V - 0.2, 0.4) for t in jobs[1:]]
ev += [("riser", 11.3 + V, 0.4), ("impact", 12.88 + V, 0.9), ("whoosh", 14.2 + V, 0.5), ("impact", 15.12 + V, 0.6), ("whoosh", 15.75 + V, 0.5), ("impact", 17.2 + V, 0.7),
       ("whoosh", 19.0 + V, 0.5), ("pop", 21.75 + V, 0.5), ("pop", 22.17 + V, 0.5), ("pop", 22.59 + V, 0.5), ("pop", 23.01 + V, 0.5), ("pop", 23.4 + V, 0.7), ("whoosh", 25.3 + V, 0.5),
       ("pop", 27.0 + V, 0.4), ("pop", 27.15 + V, 0.4), ("pop", 27.3 + V, 0.4), ("pop", 27.45 + V, 0.4), ("impact", 28.1 + V, 0.6)]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", "../bit-spec/assets/music.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/%s.wav" % n]
f = ["[0:a]aloop=loop=1:size=2000000,atrim=0:%s,afade=t=in:d=0.2,afade=t=out:st=%s:d=1.2,volume=0.16[m]" % (DUR, DUR - 1.2)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,volume=%s,adelay=%d:all=1[s%d]" % (i + 1, v * 0.5, max(0, t) * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.9[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "192k", "assets/audio/bed.m4a"], check=True)
# the narration, brought up to a steady level
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "assets/audio/vo_raw.mp3", "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "192k", "assets/audio/vo.mp3"], check=True)
print("bed ok")
