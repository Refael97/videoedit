cd "$(dirname "$0")"; export NODE_PATH=$(npm root -g)
HF="npx --yes hyperframes@0.8.150 render"
for w in 1 2 4; do ./meas.sh hf_w$w $HF hf1080 -o $PWD/out/hf_w$w.mp4 --fps 30 --workers $w --quality looks; done
for w in 1 2 4; do rm -rf out/drv_w$w; ./meas.sh drv_w$w node driver.cjs hf1080 out/drv_w$w --capture=jpeg --workers=$w; tail -1 out/drv_w$w.log; done
for p in medium veryfast; do ./meas.sh enc_$p ffmpeg -y -framerate 30 -i out/drv_w1/f%05d.jpg -c:v libx264 -preset $p -crf 16 -pix_fmt yuv420p -movflags +faststart out/drv_$p.mp4; done
