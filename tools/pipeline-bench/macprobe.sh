#!/bin/bash
# Apple Silicon check: is headless Chromium on the GPU, and does it pay off? Run from this folder on the Mac.
# Needs: node 20+, ffmpeg (brew install ffmpeg), playwright (npm i -D playwright && npx playwright install chromium)
set -e; cd "$(dirname "$0")"; mkdir -p out
echo "== machine"; sysctl -n machdep.cpu.brand_string; sysctl -n hw.ncpu; sw_vers -productVersion
echo "== ffmpeg hardware encoders"; ffmpeg -hide_banner -encoders | grep -i videotoolbox || echo "no videotoolbox"
echo "== WebGL backend per launch mode (look for 'Apple M' vs 'SwiftShader')"
node gpuprobe.cjs; CHANNEL=chromium node gpuprobe.cjs; HEADFUL=1 node gpuprobe.cjs
python3 mk.py hf1080 1080 1920 30 60 >/dev/null
echo "== render 30 frames 1080x1920, by backend"
for a in "--use-angle=metal" "--use-angle=swiftshader,--enable-unsafe-swiftshader" "--use-angle=gl"; do
  for ch in "" "--channel=chromium"; do echo -n "args=$a $ch : "; node driver.cjs hf1080 out/mac --frames=0-29 --args="$a" $ch | tail -1; done; done
echo "== concurrency (metal): more workers is NOT assumed faster"
for w in 1 2 4; do echo -n "workers=$w : "; node driver.cjs hf1080 out/mac_w$w --workers=$w --args=--use-angle=metal --channel=chromium | tail -1; done
echo "== encode 60 frames: software vs VideoToolbox"
for e in "libx264 -preset medium -crf 16" "h264_videotoolbox -b:v 20M" "hevc_videotoolbox -b:v 14M -tag:v hvc1"; do
  /usr/bin/time -p ffmpeg -loglevel error -y -framerate 30 -i out/mac_w1/f%05d.jpg -c:v $e -pix_fmt yuv420p out/enc_test.mp4 2>&1 | grep real | sed "s|^|$e : |"; done
echo "== HyperFrames own GPU detection"; npx --yes hyperframes@0.8.150 render hf1080 -o out/hf_mac.mp4 --fps 30 --browser-gpu --gpu --debug 2>&1 | grep -iE "gpu|angle|metal|swiftshader|videotoolbox|frame|elapsed|took" | head -40
