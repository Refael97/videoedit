#!/usr/bin/env bash
# Scaffold a pastel-motion-ad HyperFrames project.
# Usage: bash .claude/skills/pastel-motion-ad/scripts/new.sh <project-name>   (run from the repo root)
# Creates videos/<project-name>/ with the kit in assets/kit/, the starter composition as index.html,
# placeholder music/SFX and the usual HyperFrames project files.
set -euo pipefail
name="${1:?project name required}"
here="$(cd "$(dirname "$0")/.." && pwd)"
repo="$(git -C "$here" rev-parse --show-toplevel)"
dst="$repo/videos/$name"
[ -e "$dst" ] && { echo "exists: $dst" >&2; exit 1; }

mkdir -p "$dst/assets"
cp -r "$here/kit" "$dst/assets/kit"
cp "$here/template/index.html" "$dst/index.html"
cp "$here/template/avatar.jpg" "$dst/assets/avatar.jpg"

# sound: reuse the repo's library when present
lib="$repo/videos/ai-studio-reel/assets/audio"
if [ -d "$lib" ]; then
  for s in whoosh pop riser impact strike; do cp "$lib/$s.wav" "$dst/assets/" 2>/dev/null || true; done
  ffmpeg -y -loglevel error -i "$lib/music-full.mp3" -t 30 -af "afade=t=in:d=0.3,afade=t=out:st=27:d=3" "$dst/assets/music.mp3" || true
fi

cat > "$dst/package.json" <<EOF
{
  "name": "$name",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "npx --yes hyperframes@0.8.150 preview",
    "check": "npx --yes hyperframes@0.8.150 check",
    "render": "npx --yes hyperframes@0.8.150 render",
    "publish": "npx --yes hyperframes@0.8.150 publish"
  }
}
EOF
printf '{\n  "id": "%s",\n  "name": "%s",\n  "createdAt": "%s"\n}\n' "$name" "$name" "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" > "$dst/meta.json"
for f in hyperframes.json CLAUDE.md AGENTS.md; do
  [ -f "$repo/videos/swap-reel/$f" ] && cp "$repo/videos/swap-reel/$f" "$dst/$f"
done
printf 'snapshots/\nrenders/\n.hyperframes/\nnode_modules/\n' > "$dst/.gitignore"
echo "created $dst"
