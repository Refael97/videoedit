#!/usr/bin/env bash
# rebuild media/ from videos/rafael-test (the 28–48 s slice: "insane level" → "dozens of designs" → "300–400 → tens of thousands")
set -euo pipefail
cd "$(dirname "$0")"; R=../rafael-test; mkdir -p media
ffmpeg -loglevel error -y -ss 28 -i $R/assets/video/face.mp4 -t 20 -c:v libx264 -crf 18 -pix_fmt yuv420p -an media/face.mp4
ffmpeg -loglevel error -y -ss 28 -i $R/assets/audio/vo.mp3 -t 20 -c:a libmp3lame -b:a 192k media/vo.mp3
ffmpeg -loglevel error -y -c:v libvpx-vp9 -ss 28 -i $R/assets/video/matte.webm -t 20 -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 2M -auto-alt-ref 0 -deadline realtime -cpu-used 8 media/matte.webm
python3 - <<'PY'
import json, shutil
R='../rafael-test'
w=json.load(open(f'{R}/data/words.json'))
json.dump([{'text':x['text'],'start':round(x['start']-28,2),'end':round(x['end']-28,2)} for x in w if x['start']>=28 and x['end']<=48],open('media/words.json','w'),ensure_ascii=False)
f=json.load(open(f'{R}/data/face.json')); f['boxes']=[[round(b[0]-28,3)]+b[1:] for b in f['boxes'] if 27.5<=b[0]<=48.5]
json.dump(f,open('media/face.json','w')); shutil.copy(f'{R}/data/facts.yaml','media/facts.yaml')
PY
