#!/bin/bash

# Find screen name
SCREEN=`xrandr | grep " connected" | awk '{print $1;}'`

# Find current brightness
BRIGHTNESS=`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`

# Add .1 to it
BRIGHTNESS=`awk '{print $1+$2}' <<<"$BRIGHTNESS .1"`

# Set new brightness
xrandr --output $SCREEN --brightness  $BRIGHTNESS
