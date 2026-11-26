#!/bin/bash
# Dense contact sheets of a reference video, for the frame-by-frame study (5 frames per second, 36 frames per sheet).
# Usage: tools/refframes.sh <video> <out-dir> [crop=w:h:x:y]   (pass a crop when the reference is a phone recording of a screen)
set -e
V="$1"; O="$2"; C="${3:+crop=$3,}"; mkdir -p "$O"
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V"); N=$(python3 -c "import math;print(math.ceil($D/7.2))")
for i in $(seq 0 $((N - 1))); do ffmpeg -y -v error -ss "$(python3 -c "print($i*7.2)")" -t 7.2 -i "$V" -vf "fps=5,${C}scale=400:-1,tile=6x6:padding=3" -frames:v 1 -q:v 3 "$O/sheet_$i.jpg"; done
echo "$N sheets in $O"
