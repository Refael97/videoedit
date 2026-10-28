#!/bin/bash
# meas.sh <label> <cmd...> : wall time, avg CPU% across all cores, peak total RSS of the process tree (MB)
label=$1; shift
read -r _ u n s i rest < /proc/stat; c0=$((u+n+s)); i0=$i
"$@" > out/$label.log 2>&1 & pid=$!
peak=0; t0=$(date +%s.%N)
while kill -0 $pid 2>/dev/null; do
  rss=$(ps -eo rss,comm | awk '/chrome|node|ffmpeg|headless/ {s+=$1} END {print int(s/1024)}'); [ "$rss" -gt "$peak" ] && peak=$rss; sleep 0.5
done
wait $pid; rc=$?; t1=$(date +%s.%N)
read -r _ u n s i rest < /proc/stat; c1=$((u+n+s)); i1=$i
cpu=$(python3 -c "b=$c1-$c0; idle=$i1-$i0; print(round(100*b/(b+idle)))")
echo "$label wall=$(python3 -c "print(round($t1-$t0,1))")s cpu=${cpu}% peakRSS=${peak}MB rc=$rc"
