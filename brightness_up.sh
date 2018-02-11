#!/bin/bash
BRIGHTNESS=`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`
BRIGHTNESS=`awk '{print $1+$2}' <<<"$BRIGHTNESS .1"`
xrandr --output eDP-1 --brightness  $BRIGHTNESS