#!/bin/bash
# Motion-blurred render of a draw(t) page: N browsers render a slice each (6 samples per frame, 180 degree shutter),
# the samples are blended 6:1 into 60 fps and the audio bed is muxed in. Finished samples are kept, so a stopped run resumes.
# Usage (from the project root): tools/render.sh <page.html> <duration-seconds> <audio-file> <out.mp4> <work-dir> [chunks=4]
set -e
PAGE="$1"; DUR="$2"; AUDIO="$3"; OUT="$4"; W="$5"; N="${6:-4}"
PORT="${PORT:-8767}"
curl -s -o /dev/null "localhost:$PORT/$PAGE" || { python3 -m http.server "$PORT" >/dev/null 2>&1 & sleep 1; }
mkdir -p "$W/all" "$(dirname "$OUT")"
for i in $(seq 0 $((N - 1))); do
  A=$(python3 -c "print(round($DUR*$i/$N*60)/60)"); B=$(python3 -c "print(round($DUR*($i+1)/$N*60)/60)")
  mkdir -p "$W/c$i"; PORT=$PORT node "$(dirname "$0")/mb.cjs" seq "$PAGE" "$W/c$i" "$A" "$B" 6 &
done
wait
python3 - "$W" "$N" <<'PY'
import os, sys
w, k = sys.argv[1], int(sys.argv[2]); n = 0
for i in range(k):
    for f in sorted(os.listdir("%s/c%d" % (w, i))): os.link("%s/c%d/%s" % (w, i, f), "%s/all/s%06d.jpg" % (w, n)) if not os.path.exists("%s/all/s%06d.jpg" % (w, n)) else None; n += 1
print(n, "samples")
PY
ffmpeg -y -v error -framerate 360 -i "$W/all/s%06d.jpg" -i "$AUDIO" -vf "tmix=frames=6,select='not(mod(n+1\,6))',setpts=N/60/TB" -r 60 -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -c:a copy -shortest "$OUT"
echo RENDER_DONE
