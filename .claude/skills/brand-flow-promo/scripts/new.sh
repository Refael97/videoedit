#!/bin/bash
# Scaffolds a brand-flow promo project and captures the site.
# Usage (from the repo root): .claude/skills/brand-flow-promo/scripts/new.sh <project-name> <site-url> [more page urls...]
set -e
SK="$(cd "$(dirname "$0")/.." && pwd)"; NAME="$1"; shift; P="videos/$NAME"
mkdir -p "$P/tools" "$P/assets/fonts" "$P/assets/audio" "$P/assets/img" "$P/assets/raw" "$P/assets/video" "$P/assets/magi" "$P/renders" "$P/example"
cp "$SK"/tools/* "$P/tools/"; chmod +x "$P"/tools/*.sh; cp "$SK"/assets/fonts/* "$P/assets/fonts/"; cp "$SK"/assets/sfx/* "$P/assets/audio/"; cp "$SK"/example/* "$P/example/"
printf 'assets/raw/\nrenders/\nassets/video/*/\n' > "$P/.gitignore"
i=0; for U in "$@"; do (cd "$P" && node tools/capture.cjs assets/raw "$U" "page$i" || echo "capture failed for $U (if the proxy refuses the host, add it to the environment's allowed hosts)"); i=$((i + 1)); done
echo "Project at $P. Next: read assets/raw/*.json and the screenshots, write brief.md (facts table with sources), then storyboard."
