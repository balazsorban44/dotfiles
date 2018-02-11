#!/bin/bash

# As far as I understood from different forums,
# OLED screens does not have a backlight as normal LCD screens,
# so as of now, you cannot change brightness as on a regular screen.
# I have an OLED laptop, so I needed a workaround.
# This method only works on X.Org, not on Wayland

# Find screen name
SCREEN=`xrandr | grep " connected" | awk '{print $1;}'`

# Find current brightness
BRIGHTNESS=`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`

# Change BRIGHTNESS value based on arguments
if [ $1 == "up" ]; then
  BRIGHTNESS=`awk '{print ($1+$2)}' <<<"$BRIGHTNESS .1"`
elif [ $1 == "down" ]; then
  BRIGHTNESS=`awk '{print ($1-$2)}' <<<"$BRIGHTNESS .1"`
elif [ $1 == "-h" ] || [ $1 == "help" ]; then
  echo "List of commands:
  up        -   Add .1 to the the brightness
  down      -   Remove .1 from the the brightness
  -h, help  -   Get help"
else
  echo -e "\n Unknown argument. Use '-h' or 'help' to see the available options."
fi

# Set new brightness
xrandr --output $SCREEN --brightness  $BRIGHTNESS

# TIPS:
#   - You can make a custom shortcut to be able to
#     change the brightness much easier.

# Balázs Orbán
# info@balazsorban.com