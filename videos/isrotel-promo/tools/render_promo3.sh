#!/bin/bash
# Full motion-blurred render of promo3.html: four browsers render a quarter each (finished samples are kept, so a stopped run can be resumed), then the samples are blended 6:1 into 60 fps.
# Usage: tools/render_promo.sh <work-dir>
set -e
cd "$(dirname "$0")/.."
W="$1"; mkdir -p "$W/a" "$W/b" "$W/c" "$W/d" "$W/all"
curl -s -o /dev/null localhost:8767/promo3.html || { python3 -m http.server 8767 >/dev/null 2>&1 & sleep 1; }
node tools/mb.cjs seq promo3.html "$W/a" 0 7.6 6 & node tools/mb.cjs seq promo3.html "$W/b" 7.6 15.2 6 & node tools/mb.cjs seq promo3.html "$W/c" 15.2 22.8 6 & node tools/mb.cjs seq promo3.html "$W/d" 22.8 30.4 6 & wait
python3 - "$W" <<'PY'
import os, sys
w = sys.argv[1]; n = 0
for d in "abcd":
    for f in sorted(os.listdir("%s/%s" % (w, d))): os.rename("%s/%s/%s" % (w, d, f), "%s/all/s%06d.jpg" % (w, n)); n += 1
print(n, "samples")
PY
ffmpeg -y -v error -framerate 360 -i "$W/all/s%06d.jpg" -i assets/audio/bed_promo_v3.m4a -vf "tmix=frames=6,select='not(mod(n+1\,6))',setpts=N/60/TB" -r 60 -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -c:a copy -shortest renders/isrotel-promo-v3.mp4
echo RENDER_DONE
