#!/bin/bash
# Screenshots at given times, tiled into one sheet. Usage: tools/frames.sh <out-dir> <t1> <t2> ...
set -e
cd "$(dirname "$0")/.."
OUT="$1"; shift
mkdir -p "$OUT"
curl -s -o /dev/null localhost:8766/index.html || { python3 -m http.server 8766 >/dev/null 2>&1 & sleep 1; }
node tools/shots.cjs "$OUT" "$@"
python3 tools/sheet.py "$OUT"
