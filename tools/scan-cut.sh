#!/bin/bash
# Contact-sheet a finished cut so the whole timeline gets looked at, not just its duration.
# Twice a render passed on duration and codec while showing rate-limit notices on screen.
set -e
CUT="${1:-.airlock-video/airlock-demo.mp4}"
DIR=$(mktemp -d)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$CUT" | cut -d. -f1)
STEP=$(( DUR / 26 + 1 ))
i=0
for t in $(seq 4 $STEP $DUR); do
  ffmpeg -y -loglevel error -ss "$t" -i "$CUT" -frames:v 1 \
    -vf "crop=iw*0.42:ih*0.82:iw*0.57:ih*0.10" "$DIR/f$(printf %03d $i).png"
  i=$((i+1))
done
montage "$DIR"/f*.png -tile 7x -geometry +2+2 "${2:-/tmp/scan.png}"
echo "${2:-/tmp/scan.png}  ($i frames, every ${STEP}s of ${DUR}s)"
