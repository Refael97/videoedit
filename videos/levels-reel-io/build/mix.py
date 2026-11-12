#!/usr/bin/env python3
"""Pre-mix VO + ducked music bed + SFX cues for intro/outro, loudness-normalised (-14 LUFS, -1 dBTP)."""
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
HS = Path("/Users/refaellevi/videoedit/videos/hopon-rav-pass/assets/sfx")
TS = Path("/Users/refaellevi/videoedit/.claude/skills/video-themes/themes/headline/sfx")
MUSIC = Path("/Users/refaellevi/videoedit/videos/hopon-rav-pass/assets/music/m1_long.wav")
S = {"whoosh": HS/"whoosh.mp3", "click": HS/"click.mp3", "clicksoft": HS/"click-soft.mp3", "pop": HS/"pop.mp3", "ping": HS/"ping.mp3",
     "air": TS/"air.wav", "tclick": TS/"click.wav", "ding": TS/"ding.wav", "key": TS/"key.wav", "tpop": TS/"pop.wav", "roll": TS/"roll.wav",
     "swish": TS/"swish.wav", "tick": TS/"tick.wav", "twhoosh": TS/"whoosh.wav"}
CUES = {
 "intro": dict(dur=11.4, vo="intro_a.mp3", music_off=0.0, cues=[
   (0.04,"air",0.5),(1.1,"clicksoft",0.6),(1.2,"tick",0.4),(2.0,"pop",0.7),(2.02,"ding",0.28),(2.68,"swish",0.8),(2.86,"twhoosh",0.55),
   (3.04,"pop",0.9),(3.05,"tclick",0.8),(3.5,"swish",0.4),(3.92,"key",0.8),(4.12,"key",0.8),(4.34,"key",0.8),
   (4.62,"tpop",0.6),(4.74,"tpop",0.6),(4.86,"tpop",0.6),(5.12,"air",0.35),(5.64,"roll",0.45),(6.16,"tick",0.6),(6.46,"clicksoft",0.6),
   (6.8,"roll",0.25),(7.5,"twhoosh",0.5),(7.72,"swish",0.4),(8.05,"roll",0.4),(8.9,"ding",0.55),(8.9,"pop",0.5),(9.88,"tpop",0.6),
   (10.45,"whoosh",0.7),(10.68,"click",0.6)]),
 "outro": dict(dur=8.6, vo="outro_a.mp3", music_off=12.0, cues=[
   (0.06,"air",0.5),(0.82,"twhoosh",0.55),(1.26,"tick",0.6),(1.5,"tick",0.6),(1.74,"tick",0.6),(2.42,"swish",0.45),
   (2.74,"tpop",0.6),(2.92,"tpop",0.6),(3.1,"tpop",0.6),(3.86,"pop",0.6),(4.14,"swish",0.45),(4.62,"clicksoft",0.6),
   (5.52,"key",0.9),(5.64,"key",0.9),(5.76,"key",0.9),(5.52,"tpop",0.4),(5.84,"click",0.7),(5.96,"swish",0.4),
   (6.3,"twhoosh",0.45),(6.8,"ping",0.45),(7.3,"whoosh",0.6),(7.5,"pop",0.6),(7.86,"tpop",0.6),(8.2,"tclick",0.6)]),
}
def run(name):
    c = CUES[name]
    if len(sys.argv) > 2: c["cues"] = json.loads(Path(sys.argv[2]).read_text())
    out = ROOT/name/"assets"/"mix.wav"
    ins = ["-i", str(ROOT/"assets/vo"/c["vo"]), "-ss", str(c["music_off"]), "-t", str(c["dur"]), "-i", str(MUSIC)]
    fl = []
    # VO starts 0.0; music low with sidechain duck from the VO; fade in/out
    fl.append("[0:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=%.2f,asplit=2[vo][sc]" % c["dur"])
    fl.append("[1:a]aresample=48000,volume=0.22,afade=t=in:d=0.3,afade=t=out:st=%.2f:d=0.6[mus]" % (c["dur"]-0.6))
    fl.append("[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=250[duck]")
    mixes = ["[vo]", "[duck]"]
    for i, (t, k, v) in enumerate(c["cues"]):
        ins += ["-i", str(S[k])]
        ms = int(round(t*1000))
        fl.append(f"[{i+2}:a]aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]")
        mixes.append(f"[s{i}]")
    fl.append("".join(mixes) + f"amix=inputs={len(mixes)}:normalize=0:duration=first,atrim=0:{c['dur']}[m]")
    fc = ";".join(fl)
    tmp = ROOT/"build"/f"{name}_pre.wav"
    subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",fc,"-map","[m]","-ar","48000",str(tmp)], check=True)
    # two-pass loudnorm
    r = subprocess.run(["ffmpeg","-hide_banner","-i",str(tmp),"-af","loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json","-f","null","-"],capture_output=True,text=True).stderr
    js = json.loads(r[r.rfind("{"):r.rfind("}")+1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
          f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.84:level=false")
    subprocess.run(["ffmpeg","-v","error","-y","-i",str(tmp),"-af",af,"-ar","48000",str(out)], check=True)
    print("wrote", out)
run(sys.argv[1])
