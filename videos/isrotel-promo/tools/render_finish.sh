#!/bin/bash
# Motion-blurred render of finish.html from <from> seconds on, reusing earlier samples in <prev-dir> for the part before it.
# Usage: tools/render_finish.sh <work-dir> <prev-dir> <from>
set -e
cd "$(dirname "$0")/.."
W="$1"; PREV="$2"; FROM="$3"; mkdir -p "$W/new" "$W/all"
curl -s -o /dev/null localhost:8767/finish.html || { python3 -m http.server 8767 >/dev/null 2>&1 & sleep 1; }
node tools/mb.cjs seq finish.html "$W/new" "$FROM" 9.6 6
python3 - "$W" "$PREV" "$FROM" <<'PY'
import os, sys
w, prev, frm = sys.argv[1], sys.argv[2], float(sys.argv[3]); n0 = round(frm * 60) * 6
for i in range(n0): os.link("%s/s%06d.jpg" % (prev, i), "%s/all/s%06d.jpg" % (w, i))
for i, f in enumerate(sorted(os.listdir(w + "/new"))): os.rename("%s/new/%s" % (w, f), "%s/all/s%06d.jpg" % (w, n0 + i))
PY
ffmpeg -y -v error -framerate 360 -i "$W/all/s%06d.jpg" -i assets/audio/bed_finish.m4a -vf "tmix=frames=6,select='not(mod(n+1\,6))',setpts=N/60/TB" -r 60 -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -c:a copy -shortest renders/isrotel-finish-test-v2.mp4
echo RENDER_DONE
