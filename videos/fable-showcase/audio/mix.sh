#!/bin/bash
# Soundtrack v2: dramatic intro -> viral beat after the voice -> quiet (sea only) from the dive into the phone -> rhythmic cue for the filmed shots -> bold last chord.
set -e
cd "$(dirname "$0")"
python3 synth_sfx.py sfx_synth.wav
ffmpeg -v error -y -i m_intro.mp3 -i m_viral.mp3 -i m_end.mp3 -i sfx_synth.wav -i beach.mp3 -i splash.mp3 -filter_complex "
 [0:a]atrim=start=2.2:end=8.7,asetpts=PTS-STARTPTS,compand=attacks=0.03:decays=0.5:points=-80/-80|-50/-16|-30/-9|-14/-5|0/-3,volume=1.05,volume='if(between(t,4.9,5.95),0.6,1)':eval=frame,afade=t=in:st=0:d=0.12,afade=t=out:st=5.95:d=0.55[a];
 [1:a]atrim=start=0:end=5.6,asetpts=PTS-STARTPTS,volume=0.78,afade=t=out:st=5.0:d=0.6,adelay=6400|6400[b];
 [2:a]volume=3.4,afade=t=in:st=0:d=0.08,afade=t=out:st=7.9:d=1.0,adelay=19300|19300[c];
 [3:a]volume=0.9[s];
 [4:a]afade=t=in:st=0:d=0.5,afade=t=out:st=5.6:d=0.4,volume=0.6,adelay=19300|19300[be];
 [5:a]asetrate=44100*0.6,aresample=48000,afade=t=in:st=0:d=0.05,afade=t=out:st=2.4:d=0.8,volume=0.9,adelay=21760|21760[p];
 [a][b][c][s][be][p]amix=inputs=6:normalize=0:duration=longest,alimiter=limit=0.89:level=false,apad=whole_dur=30.2,atrim=0:30.2[o]" -map "[o]" -ar 48000 -c:a aac -b:a 256k ../assets/audio_bed.m4a
echo "written ../assets/audio_bed.m4a"
