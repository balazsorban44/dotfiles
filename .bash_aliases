#X1 YOGA 2nd GEN (OLED)
alias b="xrandr --output eDP-1 --brightness $1"

# OS
alias update="sudo apt update && sudo apt upgrade"
alias install="sudo dpkg -i $1"
alias open="nautilus ."
alias top="vtop"

# Supr lazy
alias c="clear"
alias s="yarn start"
alias .="vtop"

# Move around
alias ..="cd .."
alias ...="cd ../.."
alias pr="cd ~/projects"
alias dl="cd ~/Downloads"
alias mc="mkdir $1 && cd $1"

# Personal
alias ww="cd ~/projects/workzilla/web"

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

# .
alias dot="cd ~/dotfiles"
alias dup="dot;add -A;git commit -m 'Changes';push;cd -"
