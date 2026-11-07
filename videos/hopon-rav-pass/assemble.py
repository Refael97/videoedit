# audio mix + mux for the HopOn film: voiceover ("רפאל מקצועי", eleven_v4), ElevenLabs music bed ducked under
# the voice, and one SFX per visual hit. Every cue time comes from the same beat grid as js/core.js: B(n) = n * 0.5
import subprocess
run = lambda *a: subprocess.run(a, check=True)
END = 20.4
B = lambda n: n * 0.5

# each take is cut to start on its first word (word timings from a Scribe pass): eleven_v4 puts a throat-clear /
# breath before the line, so trim/ starts 20 ms before the first word with a 25 ms fade-in. Times = first word.
VO = [("vo/trim/l1b.wav", 0.58), ("vo/trim/lmap.wav", 3.56), ("vo/trim/l2a.wav", 6.81), ("vo/trim/l3b.wav", 10.70),
      ("vo/trim/lticket.wav", 13.70), ("vo/trim/l4a.wav", 17.38)]
# m1 extended to ~21s by repeating its groove on bar boundaries (see assets/music); beats at 0.47 + 0.5n → +30 ms
MUSIC = ("music/m1_long.wav", 0.03, 0.55)
# (file, time, volume) — whooshes start ~0.25s early so their peak lands on the move
SFX = [("sfx/whoosh-short.mp3", 0.05, 0.30),
       *[("sfx/click-soft.mp3", B(n), 0.55) for n in (1, 2, 3, 4)], ("sfx/pop.mp3", 2.12, 0.30),     # parts lock
       ("sfx/whoosh.mp3", 2.85, 0.35),                                                             # icon out, phone in
       ("sfx/whoosh-short.mp3", 3.95, 0.28),                                                       # map lifts and tilts
       ("sfx/click-soft.mp3", B(9), 0.5), ("sfx/click-soft.mp3", B(10), 0.5),                      # pins land
       ("sfx/whoosh-short.mp3", B(10) + 0.05, 0.18),                                               # route draws
       *[("sfx/pop.mp3", B(n), 0.32) for n in (14, 15, 16)],                                       # menu rows lift
       ("sfx/whoosh-short.mp3", 9.9, 0.40),                                                        # spin
       ("sfx/pop.mp3", B(22), 0.32), ("sfx/pop.mp3", B(23), 0.24),                                 # card, Apple Pay lift
       ("sfx/click.mp3", B(24), 0.70), ("sfx/ping.mp3", B(24) + 0.04, 0.28),                       # the press
       ("sfx/pop.mp3", B(27), 0.32), ("sfx/whoosh-short.mp3", B(28) - 0.1, 0.16),                  # ticket lifts, scan line
       ("sfx/whoosh.mp3", 16.35, 0.32)]                                                            # phone out, icon back

def place(inputs, cues, label):
    flt = []
    for i, (src, t, vol) in enumerate(cues):
        inputs += ["-i", f"assets/{src}"]; d = int(round(t * 1000))
        flt.append(f"[{len(inputs)//2 - 1}]asetpts=PTS-STARTPTS,volume={vol},aresample=48000,aformat=channel_layouts=stereo,adelay={d}|{d}[{label}{i}]")
    flt.append("".join(f"[{label}{i}]" for i in range(len(cues))) + f"amix=inputs={len(cues)}:normalize=0:dropout_transition=0[{label}]")
    return flt

args = ["ffmpeg", "-v", "error", "-y"]; inputs = []
flt = place(inputs, [(v, t, 1.0) for v, t in VO], "v")
flt += place(inputs, SFX, "s")
inputs += ["-i", f"assets/{MUSIC[0]}"]; mi = len(inputs) // 2 - 1; d = int(MUSIC[1] * 1000)
flt.append(f"[{mi}]volume={MUSIC[2]},aresample=48000,aformat=channel_layouts=stereo,adelay={d}|{d},afade=t=out:st={END - 1.2}:d=1.2[m]")
flt.append(f"[v]apad=whole_dur={END},asplit=2[v1][vk]")   # pad: the sidechain would otherwise end the music with the last word
flt.append("[m][vk]sidechaincompress=threshold=0.04:ratio=5:attack=20:release=280:makeup=1[md]")   # duck music under the voice
flt.append(f"[v1][md][s]amix=inputs=3:normalize=0:dropout_transition=0,atrim=0:{END},loudnorm=I=-14:TP=-1.0:LRA=9[out]")
run(*args, *inputs, "-filter_complex", ";".join(flt), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", "renders/audio.wav")
run("ffmpeg", "-v", "error", "-y", "-i", "renders/video_v2.mp4", "-i", "renders/audio.wav", "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "renders/hopon-rav-pass.mp4")
print("done")
