#!/bin/bash
# mix narration + music + SFX onto the silent render:
#   bash mix.sh renders/elal_video_only.mp4 assets/vo_raw.mp3 assets/music.mp3 renders/elal_final.mp4
# narration: Itamar (eleven_v4), deepening chain + loudnorm, cut into sentence clips placed on the words the headlines land on
set -euo pipefail
V="$1"; VO="$2"; MU="$3"; OUT="$4"; D="${5:-21.4}"; MV="${6:-0.42}"
cd "$(dirname "$0")"
ffmpeg -nostdin -y -v error -i "$VO" -af "asetrate=44100*0.95,aresample=44100,atempo=1.0526,bass=g=3:f=140,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 assets/vo.wav

# narration clip(s): film start | offset in vo | length   (v2: the whole take as one clip; the visuals are timed to it)
CLIPS="1.65 0 16.95"
# SFX: file | film time | volume   (whoosh = camera pans and push-in, pop = pop-outs, impact = logo)
SFX="whoosh 2.55 0.35|pop 3.25 0.22|pop 3.98 0.25|pop 4.53 0.25|pop 5.28 0.25|whoosh 5.6 0.35|pop 6.95 0.28|pop 7.7 0.22|whoosh 8.0 0.35|pop 8.95 0.28|whoosh 9.82 0.35|pop 10.1 0.25|pop 10.85 0.22|pop 11.5 0.2|whoosh 13.15 0.35|pop 13.32 0.28|whoosh 15.78 0.55|impact 16.3 0.3|whoosh 18.6 0.22"

in=(-i "$V" -i assets/vo.wav -i "$MU"); f=""; vo=""; sx=""; n=3; k=0
IFS='|' read -ra C <<< "$CLIPS"
for c in "${C[@]}"; do read -r st off len <<< "$c"; d=$(python3 -c "print(int($st*1000))")
  f+="[1:a]atrim=start=$off:duration=$len,asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st=$(python3 -c "print($len-0.06)"):d=0.06,adelay=$d|$d[v$k];"; vo+="[v$k]"; k=$((k+1)); done
f+="${vo}amix=inputs=$k:normalize=0,asplit=2[vo][sc];"
IFS='|' read -ra S <<< "$SFX"; j=0
for s in "${S[@]}"; do read -r nm t vol <<< "$s"; in+=(-i "assets/$nm.wav"); d=$(python3 -c "print(int($t*1000))")
  f+="[$n:a]aresample=48000,volume=$vol,adelay=$d|$d[s$j];"; sx+="[s$j]"; n=$((n+1)); j=$((j+1)); done
f+="${sx}amix=inputs=$j:normalize=0[sfx];"
f+="[2:a]aresample=48000,volume=$MV,afade=t=in:d=0.15,afade=t=out:st=$(python3 -c "print($D-1.3)"):d=1.3[mu0];[sc]apad[sc2];[mu0][sc2]sidechaincompress=threshold=0.06:ratio=3:attack=20:release=300[mu];"
f+="[vo][mu][sfx]amix=inputs=3:normalize=0,volume=4.5dB,alimiter=limit=0.93:level=false,atrim=duration=$D[a]"
ffmpeg -nostdin -y -v error "${in[@]}" -filter_complex "$f" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t $D "$OUT"
echo "done: $OUT"
