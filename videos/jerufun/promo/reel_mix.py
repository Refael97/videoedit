# audio for the Instagram reel: intro (3.45 s) + film with outro (35.5 s); same music track runs through the intro into the film
import subprocess
F = "/Users/refaellevi/videoedit/videos/jerufun/film"
P = "/Users/refaellevi/videoedit/videos/jerufun/promo"
IN = 10.1
peak = {"whoosh": 0.50, "pop": 0.18, "send": 0.0, "wheel": 0.65, "bell": 0.08, "tap": 0.48}
film = [
  ("wheel", 1.40, 0.55), ("whoosh", 3.75, 0.45), ("whoosh", 4.50, 0.55),
  ("pop", 4.45, 0.35), ("pop", 4.70, 0.3), ("pop", 4.95, 0.3),
  ("send", 5.30, 0.6), ("pop", 5.85, 0.6),
  ("whoosh", 6.62, 0.6), ("pop", 6.95, 0.45), ("whoosh", 7.18, 0.55), ("whoosh", 7.78, 0.6),
  ("whoosh", 10.30, 0.5), ("pop", 12.10, 0.35), ("tap", 12.97, 0.8),
  ("whoosh", 13.65, 0.5), ("whoosh", 15.85, 0.6), ("whoosh", 17.85, 0.55),
  ("pop", 18.70, 0.45), ("pop", 19.20, 0.45), ("pop", 19.70, 0.45),
  ("whoosh", 21.00, 0.55), ("whoosh", 21.70, 0.4), ("whoosh", 23.70, 0.5),
  ("wheel", 25.40, 0.6), ("bell", 25.80, 0.55), ("pop", 26.95, 0.4),
  # outro
  ("whoosh", 28.45, 0.5), ("pop", 28.6, 0.4), ("pop", 30.75, 0.35), ("pop", 30.87, 0.3), ("pop", 30.99, 0.3), ("pop", 31.11, 0.3), ("pop", 31.23, 0.35), ("send", 32.0, 0.6),
]
intro = [("tap", 0.06, 0.8), ("tap", 0.46, 0.7), ("tap", 0.64, 0.8), ("whoosh", 1.55, 0.5), ("pop", 1.62, 0.25), ("whoosh", 3.65, 0.5), ("whoosh", 5.0, 0.35), ("tap", 5.18, 0.8), ("pop", 5.82, 0.25), ("pop", 7.4, 0.25), ("pop", 8.8, 0.3), ("whoosh", 9.9, 0.6)]
cues = intro + [(n, t + IN, g) for n, t, g in film]
args = ["ffmpeg", "-v", "error", "-y",
        "-ss", str(14.5 - IN), "-t", str(IN + 28.4 + 0.6), "-i", f"{F}/assets/music2_b.mp3",
        "-ss", "20.0", "-t", "6.4", "-i", f"{F}/assets/music2_b.mp3",
        "-i", f"{P}/assets/vo_hook3.mp3", "-i", f"{P}/assets/vo_out3.mp3"]
fil = [f"[0]afade=t=out:st={IN + 28.4}:d=0.6[m1]",
       f"[1]volume=0.32,afade=t=in:d=0.4,afade=t=out:st=5.4:d=0.85,adelay={int((IN + 28.35) * 1000)}|{int((IN + 28.35) * 1000)}[m2]",
       "[2]volume=1.6[v1]",
       f"[3]volume=1.6,adelay={int((IN + 28.6) * 1000)}|{int((IN + 28.6) * 1000)}[v2]",
       # duck the music under the intro voice
       "[m1]volume='if(lt(t,9.85),0.5,1)':eval=frame[m1d]"]
for i, (n, t, g) in enumerate(cues):
    args += ["-i", f"{F}/sfx/{n}.wav"]
    d = max(0, int((t - peak[n]) * 1000))
    fil.append(f"[{i + 4}]adelay={d}|{d},volume={g}[s{i}]")
mix = "".join(f"[s{i}]" for i in range(len(cues)))
fil.append(f"{mix}amix=inputs={len(cues)}:normalize=0,volume=0.8[fx]")
fil.append("[m1d][m2][v1][v2][fx]amix=inputs=5:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]")
args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-t", str(IN + 34.6), "-ar", "48000", f"{P}/reel_mix.wav"]
subprocess.run(args, check=True)
print("ok", len(cues))
