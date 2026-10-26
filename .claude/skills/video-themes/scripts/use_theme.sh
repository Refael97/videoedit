#!/usr/bin/env bash
# copy a theme into a HyperFrames project: use_theme.sh <theme> <project_dir>  -> <project_dir>/assets/theme/
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
src="$here/themes/$1"; dst="$2/assets/theme"
[ -d "$src" ] || { echo "no theme: $1"; exit 1; }
rm -rf "$dst"; mkdir -p "$dst"
cp -r "$src"/{tokens.css,theme.css,motion.js,fonts,sfx,vendor} "$dst"/
echo "theme $1 -> $dst"
