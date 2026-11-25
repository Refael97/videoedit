# places each effect so its peak lands on the cue, then mixes them under the music
import subprocess, sys
peak = {"whoosh": 0.50, "pop": 0.18, "send": 0.0, "wheel": 0.65, "bell": 0.08, "tap": 0.48}
cues = [
  ("wheel", 1.40, 0.55),
  ("whoosh", 3.75, 0.45), ("whoosh", 4.50, 0.55),
  ("pop", 4.45, 0.35), ("pop", 4.70, 0.3), ("pop", 4.95, 0.3),
  ("send", 5.30, 0.6), ("pop", 5.85, 0.6),
  ("whoosh", 6.62, 0.6), ("pop", 6.95, 0.45), ("whoosh", 7.18, 0.55), ("whoosh", 7.78, 0.6),
  ("whoosh", 10.30, 0.5), ("pop", 12.10, 0.35), ("tap", 12.97, 0.8),
  ("whoosh", 13.65, 0.5), ("whoosh", 15.85, 0.6), ("whoosh", 17.85, 0.55),
  ("pop", 18.70, 0.45), ("pop", 19.20, 0.45), ("pop", 19.70, 0.45),
  ("whoosh", 21.00, 0.55), ("whoosh", 21.70, 0.4), ("whoosh", 23.70, 0.5),
  ("wheel", 25.40, 0.6), ("bell", 25.80, 0.55), ("pop", 26.95, 0.4),
]
args = ["ffmpeg", "-v", "error", "-y", "-i", "sfx/music.wav"]
fil = []
for i, (n, t, g) in enumerate(cues):
    args += ["-i", f"sfx/{n}.wav"]
    d = max(0, int((t - peak[n]) * 1000))
    fil.append(f"[{i+1}]adelay={d}|{d},volume={g}[s{i}]")
mix = "".join(f"[s{i}]" for i in range(len(cues)))
fil.append(f"{mix}amix=inputs={len(cues)}:normalize=0,volume=0.8[fx]")
fil.append("[0]volume=0.85[m];[m][fx]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]")
args += ["-filter_complex", ";".join(fil), "-map", "[out]", "-t", "30.5", "-ar", "48000", "sfx/mix.wav"]
subprocess.run(args, check=True)
print("mixed", len(cues), "cues")
