# audio for the PREMIUM HopOn film: music-driven, NO voiceover. m1 is extended on bar boundaries (bars start at
# 0.47 + 2n s in the file): [0, 16.47) + [8.47, end) → ~29 s, delayed 30 ms so its beats land on B(n) = n * 0.5.
# One SFX per visual hit; times match js/film.js + index.html.
import subprocess
run = lambda *a: subprocess.run(a, check=True)
END = 23.0
B = lambda n: n * 0.5

run("ffmpeg", "-v", "error", "-y", "-i", "assets/music/m1_long.wav", "-filter_complex",
    "[0]atrim=0:16.47,asetpts=PTS-STARTPTS[a];[0]atrim=8.47,asetpts=PTS-STARTPTS[b];[a][b]acrossfade=d=0.02:c1=tri:c2=tri[o]",
    "-map", "[o]", "assets/music/m1_premium.wav")
MUSIC = ("music/m1_premium.wav", 0.03, 0.8)
SFX = [*[("sfx/click-soft.mp3", t, 0.35) for t in (0.55, 1.05, 1.55, 2.05)],          # wheel ticks: cities
       ("sfx/pop.mp3", 2.75, 0.32), ("sfx/click-soft.mp3", 3.75, 0.5), ("sfx/ping.mp3", 3.78, 0.22),   # בכל ישראל, brand
       *[("sfx/click-soft.mp3", 2.0 + B(n), 0.45) for n in (1, 2, 3, 4)],                 # icon parts lock
       ("sfx/whoosh.mp3", 4.75, 0.34),                                                    # dive to the map
       ("sfx/click-soft.mp3", 5.75, 0.5), ("sfx/whoosh-short.mp3", 5.9, 0.2),             # pin A, route starts
       ("sfx/click-soft.mp3", 8.0, 0.5), ("sfx/ping.mp3", 8.03, 0.2),                     # pin B
       ("sfx/whoosh.mp3", 8.45, 0.3),                                                     # map folds into the phone
       ("sfx/whoosh-short.mp3", 9.95, 0.32),                                              # to the stop
       *[("sfx/whoosh-short.mp3", t - 0.35, 0.3) for t in (10.75, 11.75, 12.75)],         # bus, train, light rail pull in
       *[("sfx/pop.mp3", t, 0.3) for t in (10.75, 11.75, 12.75)],                         # pills light
       ("sfx/whoosh.mp3", 13.0, 0.3),                                                     # phone back
       ("sfx/pop.mp3", 14.6, 0.3), ("sfx/pop.mp3", 15.1, 0.24),                           # card, Apple Pay
       ("sfx/click.mp3", 15.5, 0.7), ("sfx/ping.mp3", 15.54, 0.28),                       # the press
       ("sfx/whoosh-short.mp3", 16.75, 0.36),                                             # spin to ticket
       ("sfx/pop.mp3", 17.95, 0.3), ("sfx/whoosh-short.mp3", 18.1, 0.16),                 # ticket, scan
       ("sfx/ping.mp3", 19.0, 0.3),                                                       # scan OK
       ("sfx/whoosh.mp3", 20.05, 0.32),                   # ride leaves, phone out
       ("sfx/click-soft.mp3", 21.2, 0.45), ("sfx/whoosh-short.mp3", 21.3, 0.16), ("sfx/ping.mp3", 21.9, 0.18)]                  # lockup, sheen

def place(inputs, cues, label):
    flt = []
    for i, (src, t, vol) in enumerate(cues):
        inputs += ["-i", f"assets/{src}"]; d = int(round(t * 1000))
        flt.append(f"[{len(inputs)//2 - 1}]asetpts=PTS-STARTPTS,volume={vol},aresample=48000,aformat=channel_layouts=stereo,adelay={d}|{d}[{label}{i}]")
    flt.append("".join(f"[{label}{i}]" for i in range(len(cues))) + f"amix=inputs={len(cues)}:normalize=0:dropout_transition=0[{label}]")
    return flt

inputs = []
flt = place(inputs, SFX, "s")
inputs += ["-i", f"assets/{MUSIC[0]}"]; mi = len(inputs) // 2 - 1; d = int(MUSIC[1] * 1000)
flt.append(f"[{mi}]volume={MUSIC[2]},aresample=48000,aformat=channel_layouts=stereo,adelay={d}|{d},afade=t=out:st={END - 1.6}:d=1.6[m]")
flt.append(f"[m][s]amix=inputs=2:normalize=0:dropout_transition=0,atrim=0:{END},loudnorm=I=-14:TP=-1.0:LRA=9[out]")
run("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(flt), "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", "renders/audio.wav")
run("ffmpeg", "-v", "error", "-y", "-i", "renders/video.mp4", "-i", "renders/audio.wav", "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "renders/hopon-premium.mp4")
print("done")
