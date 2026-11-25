"""Audio bed for the full promo (promo.html, 24.2 s): the dedicated ElevenLabs score + generated effects on every hit. Run from the project root."""
import subprocess
DUR = 24.2
G = {"whoosh": 1.5, "boom": 0.8, "pop": 0.3, "swell": 3.2, "card": 9.0}  # brings each effect file to a comparable level
ev = [("swell", 0.15, 0.8), ("boom", 1.25, 0.9), ("whoosh", 2.05, 0.8)] + [("pop", 3.0 + i * 0.16, 0.8 + 0.06 * i) for i in range(6)] + [
      ("whoosh", 4.8, 1.0), ("card", 5.55, 1.0), ("swell", 6.75, 1.0), ("boom", 7.7, 0.4),
      ("whoosh", 10.25, 0.9), ("card", 11.4, 1.0), ("swell", 12.2, 1.0), ("boom", 13.15, 0.35),
      ("whoosh", 15.15, 0.9), ("card", 16.2, 1.0), ("swell", 17.0, 1.0), ("boom", 17.95, 0.35),
      ("whoosh", 20.2, 1.0), ("boom", 20.85, 0.7), ("swell", 21.35, 0.8), ("boom", 22.6, 0.55), ("pop", 22.65, 1.0)]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", "assets/audio/music_lux.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/fx_%s.mp3" % n]
f = ["[0:a]aresample=44100,atrim=0:%s,afade=t=in:d=0.1,afade=t=out:st=%s:d=1.3,volume=0.78[m]" % (DUR, DUR - 1.3)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,aformat=channel_layouts=stereo,volume=%.3f,adelay=%d:all=1[s%d]" % (i + 1, v * G[n] * 0.55, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.93[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "256k", "assets/audio/bed_promo_v2.m4a"], check=True); print("bed ok")
