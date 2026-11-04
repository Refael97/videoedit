#!/bin/bash
# scaffold a new app spec ad: bash .claude/skills/app-spec-ad/scripts/new.sh <name>   (run from the repo root)
# copies the kit (GSAP, fonts, kit.css), the SFX set and the HyperFrames files from the Bit build,
# plus the Bit and Yellow compositions as reference/ — brand crops, narration and music are NOT copied.
set -euo pipefail
name="${1:?usage: new.sh <name>}"
root="$(git rev-parse --show-toplevel)"
src="$root/videos/bit-spec"
dst="$root/videos/$name"
[ -e "$dst" ] && { echo "videos/$name already exists"; exit 1; }

mkdir -p "$dst"/{assets/raw,assets/crops,assets/video,data,reference,refs,renders,snapshots}
cp -r "$src/assets/kit" "$dst/assets/kit"
cp "$src"/assets/{whoosh,pop,impact,riser,click}.wav "$dst/assets/"
cp "$src/hyperframes.json" "$dst/"
cp "$src/index.html" "$dst/reference/bit.html"
cp "$root/videos/yellow-spec/index.html" "$dst/reference/yellow.html"
sed "s/\"bit-spec\"/\"$name\"/" "$src/package.json" > "$dst/package.json"
printf '{"id":"%s","name":"%s","createdAt":"%s"}\n' "$name" "$name" "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" > "$dst/meta.json"
printf 'assets/raw/\nsnapshots/\nrenders/\n.hyperframes/\nnode_modules/\nassets/hq/\n' > "$dst/.gitignore"
cat > "$dst/brief.md" <<EOF
# $name: spec ad brief

- App / brand:
- Brand colour (accent, line, bloom):
- Backdrop: black / graphite #15191b
- Format: 16:9 1920x1080 @60fps
- Voice: Itamar (eleven_v4) + deepening chain
- Comment word for ManyChat:

## Facts (every claim needs a source screen)
| Claim | Source (file, second) | OK? |
|---|---|---|

## Beats (one panel per sentence)
| # | Sentence | On screen | Pops out / framed | Line in → out |
|---|---|---|---|---|
EOF
echo "created videos/$name"
echo "next: put recordings/screenshots in videos/$name/assets/raw/, then follow .claude/skills/app-spec-ad/SKILL.md §2"
