"""Audio bed for promo v3 (promo3.html, 30.4 s): the dedicated 31 s ElevenLabs score + generated effects on every hit. Run from the project root."""
import subprocess
DUR = 30.4
G = {"whoosh": 1.5, "boom": 0.8, "pop": 0.3, "swell": 3.2, "card": 9.0}  # brings each effect file to a comparable level
ev = [("swell", 0.05, 0.8), ("boom", 1.1, 0.9), ("whoosh", 1.7, 0.8)] + [("pop", 2.6 + i * 0.12, 0.8 + 0.06 * i) for i in range(6)] + [
      ("whoosh", 4.05, 1.0), ("card", 4.75, 1.0), ("swell", 5.6, 1.0), ("boom", 6.4, 0.35), ("whoosh", 8.35, 0.8), ("card", 9.15, 1.0), ("swell", 9.75, 1.0), ("whoosh", 11.9, 0.8), ("card", 12.7, 1.0), ("swell", 13.3, 1.0), ("whoosh", 15.45, 0.8),
      ("whoosh", 16.15, 1.0), ("whoosh", 16.6, 0.9), ("boom", 16.75, 0.5), ("card", 17.95, 1.0), ("whoosh", 18.0, 0.9), ("card", 19.75, 0.7), ("card", 19.86, 0.7), ("card", 19.97, 0.7), ("pop", 20.2, 0.8), ("pop", 20.31, 0.9), ("pop", 20.42, 1.0),
      ("card", 20.5, 1.0), ("pop", 20.8, 0.9), ("pop", 20.94, 1.0)] + [("pop", 21.4 + i * 0.07, 0.7 + 0.06 * i) for i in range(6)] + [("whoosh", 22.0, 0.9), ("card", 22.85, 1.0), ("pop", 24.05, 1.2), ("whoosh", 24.12, 0.9), ("card", 24.8, 1.0), ("pop", 25.25, 0.9),
      ("pop", 25.8, 1.2), ("whoosh", 25.88, 0.9), ("swell", 26.3, 0.9), ("boom", 26.85, 0.5), ("whoosh", 27.55, 0.9), ("swell", 28.0, 0.8), ("boom", 29.1, 0.6)]
cmd = ["ffmpeg", "-y", "-v", "error", "-i", "assets/audio/music_lux31.mp3"]
for n, _, _ in ev: cmd += ["-i", "assets/audio/fx_%s.mp3" % n]
f = ["[0:a]aresample=44100,atrim=0:%s,afade=t=in:d=0.1,afade=t=out:st=%s:d=1.2,volume=0.78[m]" % (DUR, DUR - 1.2)]
for i, (n, t, v) in enumerate(ev): f.append("[%d:a]aresample=44100,aformat=channel_layouts=stereo,volume=%.3f,adelay=%d:all=1[s%d]" % (i + 1, v * G[n] * 0.5, t * 1000, i))
f.append("[m]" + "".join("[s%d]" % i for i in range(len(ev))) + "amix=inputs=%d:normalize=0:duration=first,alimiter=limit=0.93[o]" % (len(ev) + 1))
subprocess.run(cmd + ["-filter_complex", ";".join(f), "-map", "[o]", "-ar", "44100", "-c:a", "aac", "-b:a", "256k", "assets/audio/bed_promo_v3.m4a"], check=True); print("bed ok")
