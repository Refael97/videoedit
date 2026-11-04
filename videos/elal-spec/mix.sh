#!/bin/bash
# mix narration + music + SFX onto the silent render:
#   bash mix.sh renders/elal_video_only.mp4 assets/vo_raw.mp3 assets/music.mp3 renders/elal_final.mp4
# narration: Itamar (eleven_v4), deepening chain + loudnorm, cut into sentence clips placed on the words the headlines land on
set -euo pipefail
V="$1"; VO="$2"; MU="$3"; OUT="$4"
cd "$(dirname "$0")"
ffmpeg -nostdin -y -v error -i "$VO" -af "asetrate=44100*0.95,aresample=44100,atempo=1.0526,bass=g=3:f=140,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 assets/vo.wav

# sentence clips: film start | offset in vo | length   (from scribe word timings, data/words.json)
CLIPS="1.635 0 1.25|3.68 1.345 1.2|6.05 2.652 1.13|8.7 3.745 1.75|11.3 5.558 3.05|14.85 8.732 2.87|17.85 11.545 2.5"
# SFX: file | film time | volume   (whoosh = camera pans and push-in, pop = pop-outs, impact = logo)
SFX="whoosh 3.35 0.35|pop 4.36 0.25|pop 4.75 0.22|whoosh 5.75 0.35|pop 7.1 0.3|pop 7.75 0.2|whoosh 8.45 0.35|pop 9.75 0.3|whoosh 11.1 0.35|pop 11.97 0.22|pop 12.3 0.22|whoosh 14.2 0.35|pop 14.8 0.3|whoosh 17.0 0.55|impact 17.9 0.3|whoosh 20.4 0.22"

in=(-i "$V" -i assets/vo.wav -i "$MU"); f=""; vo=""; sx=""; n=3; k=0
IFS='|' read -ra C <<< "$CLIPS"
for c in "${C[@]}"; do read -r st off len <<< "$c"; d=$(python3 -c "print(int($st*1000))")
  f+="[1:a]atrim=start=$off:duration=$len,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=$(python3 -c "print($len-0.06)"):d=0.06,adelay=$d|$d[v$k];"; vo+="[v$k]"; k=$((k+1)); done
f+="${vo}amix=inputs=$k:normalize=0,asplit=2[vo][sc];"
IFS='|' read -ra S <<< "$SFX"; j=0
for s in "${S[@]}"; do read -r nm t vol <<< "$s"; in+=(-i "assets/$nm.wav"); d=$(python3 -c "print(int($t*1000))")
  f+="[$n:a]aresample=48000,volume=$vol,adelay=$d|$d[s$j];"; sx+="[s$j]"; n=$((n+1)); j=$((j+1)); done
f+="${sx}amix=inputs=$j:normalize=0[sfx];"
f+="[2:a]aresample=48000,volume=0.32,afade=t=in:d=0.6,afade=t=out:st=22.0:d=1.3[mu0];[sc]apad[sc2];[mu0][sc2]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=300[mu];"
f+="[vo][mu][sfx]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=duration=23.3[a]"
ffmpeg -nostdin -y -v error "${in[@]}" -filter_complex "$f" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 23.3 "$OUT"
echo "done: $OUT"
