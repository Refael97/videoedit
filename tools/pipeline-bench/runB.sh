cd "$(dirname "$0")"; export NODE_PATH=$(npm root -g)
run() { name=$1; dir=$2; q=$3; sel=$4; rm -rf out/B_$name; node driver.cjs $dir out/B_$name --capture=jpeg --frames=20-29 --query="$q" --sel=$sel | tail -1 | python3 -c "import json,sys; d=json.loads(sys.stdin.read()); print('$name', 'render/frame', round(d['render']/d['frames']), 'capture/frame', round(d['capture']/d['frames']), 'load', d['load'])"; }
run base       hf1080 "x=0"                    '#gl'
run htmlHud    hf1080 "htmlHud=1"              '#root'
run vsmLite    hf1080 "vsmLite=1"              '#gl'
run final_opt  hf1080 "htmlHud=1&vsmLite=1"    '#root'
run draft540   hf540  "noMSAA=1&shadow1k=1&noBloom=1&htmlHud=1" '#root'
run draft540v  hf540  "noMSAA=1&vsmLite=1&noBloom=1&htmlHud=1&noParticles=1" '#root'
for v in htmlHud vsmLite final_opt; do echo -n "$v vs base: "; ffmpeg -v info -framerate 30 -start_number 20 -i out/B_base/f%05d.jpg -framerate 30 -start_number 20 -i out/B_$v/f%05d.jpg -lavfi "[0:v][1:v]ssim;[0:v][1:v]psnr" -f null - 2>&1 | grep -oE "(SSIM All:[0-9.]+|PSNR y:[0-9.]+)" | tr '\n' ' '; echo; done
for v in draft540 draft540v; do echo -n "$v vs base(downscaled): "; ffmpeg -v info -framerate 30 -start_number 20 -i out/B_base/f%05d.jpg -framerate 30 -start_number 20 -i out/B_$v/f%05d.jpg -lavfi "[0:v]scale=540:960:flags=area[a];[a][1:v]ssim" -f null - 2>&1 | grep -oE "SSIM All:[0-9.]+"; done
