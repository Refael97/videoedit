#!/bin/bash
# Turns a generated clip (usually 24/25 fps) into 60 fps JPEG frames that the page draws on a canvas, one per output frame.
# Usage: tools/clip60.sh <clip.mp4> <frames-dir>     -> frames-dir/f0001.jpg ...   (git-ignore the frames; keep the mp4)
set -e
mkdir -p "$2"
ffmpeg -y -v error -i "$1" -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" -q:v 3 "$2/f%04d.jpg"
echo "$(ls "$2" | wc -l) frames"
