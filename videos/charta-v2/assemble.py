# final assembly: old opening (0–5.5) + rendered middle segments + old ending (29.3–35), with a fresh audio mix
# built from the same cue list the composition uses (segs/clips.json)
import json, subprocess
OLD = "../charta/renders/charta.mp4"
SEGS = ["renders/s0.mp4", "renders/s1.mp4", "renders/s2.mp4", "renders/s3.mp4"]
run = lambda *a: subprocess.run(a, check=True)
run("ffmpeg", "-v", "error", "-y", "-i", OLD, "-t", "5.5", "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", "60", "renders/p_head.mp4")
run("ffmpeg", "-v", "error", "-y", "-ss", "29.3", "-i", OLD, "-an", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", "60", "renders/p_tail.mp4")
parts = ["renders/p_head.mp4"] + SEGS + ["renders/p_tail.mp4"]
open("renders/concat.txt", "w").write("".join(f"file '{p.split('/')[-1]}'\n" for p in parts))
run("ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "renders/concat.txt", "-an", "-c:v", "libx264", "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", "60", "renders/video.mp4")
# audio: every clip placed at its start with its volume, summed without normalisation
clips = json.load(open("segs/clips.json"))
args, flt = ["ffmpeg", "-v", "error", "-y"], []
for i, (src, t, dur, vol) in enumerate(clips):
    args += ["-i", f"assets/{src}"]
    d = int(round(t * 1000)); flt.append(f"[{i}]atrim=0:{dur},asetpts=PTS-STARTPTS,volume={vol},aresample=48000,aformat=channel_layouts=stereo,adelay={d}|{d}[a{i}]")
flt.append("".join(f"[a{i}]" for i in range(len(clips))) + f"amix=inputs={len(clips)}:normalize=0:dropout_transition=0,atrim=0:35,volume=-7.4dB,alimiter=limit=0.95[out]")
run(*args, "-filter_complex", ";".join(flt), "-map", "[out]", "-c:a", "pcm_s16le", "renders/audio.wav")
run("ffmpeg", "-v", "error", "-y", "-i", "renders/video.mp4", "-i", "renders/audio.wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", "renders/charta-v2.mp4")
print("done")
