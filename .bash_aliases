#X1 YOGA 2nd GEN (OLED)
alias b="xrandr --output eDP-1 --brightness $1"

# OS
alias update="sudo apt update && sudo apt upgrade"
alias install="sudo dpkg -i $1"
alias open="nautilus ."

# Supr lazy
alias c="clear"
alias s="yarn start"

# Move around
alias ..="cd .."
alias ...="cd ../.."
alias pr="cd;cd projects"
alias dl="cd;cd Downloads"
alias mc="mkdir $1 && cd $1"

# Personal
alias ww="pr;cd workzilla/web"

# Git related
alias gs="git status"
alias add="git add $1"
alias gr="git reset --hard"
alias pull="git pull"
alias push="git push"
alias gc="gitmoji -c"
alias cb="git checkout $1"

# Text editor
alias code="code ."
