#!/bin/bash
# render one background variant with narration + music: bash render_bg.sh sky|navy|""
set -euo pipefail
cd "$(dirname "$0")"
v="$1"; tag="${v:-light}"
sed -i "s/const BG_DEFAULT = \"[a-z]*\";/const BG_DEFAULT = \"$v\";/" index.html
npx --yes hyperframes@0.8.150 render -o "renders/elal_video_only_$tag.mp4" --fps 60
bash mix.sh "renders/elal_video_only_$tag.mp4" assets/vo_v2.mp3 assets/music_v2.mp3 "renders/elal_final_v4_$tag.mp4" 21.4 0.42
sed -i "s/const BG_DEFAULT = \"[a-z]*\";/const BG_DEFAULT = \"\";/" index.html
