# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH=/home/balazs/.oh-my-zsh

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="spaceship"
# Set list of themes to load
# Setting this variable when ZSH_THEME=random
# cause zsh load theme from this variable instead of
# looking in ~/.oh-my-zsh/themes/
# An empty array have no effect
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion. Case
# sensitive completion must be off. _ and - will be interchangeable.
HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# The optional three formats: "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-zsh/plugins/*)
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git emoji zsh-autosuggestions zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
export SSH_KEY_PATH="~/.ssh/rsa_id"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# brightness_up() {
#   BRIGHTNESS=$((`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`+0.2))
#   xrandr --output eDP-1 --brightness $((`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`+0.2))
# }
# brightness_down() {
#   BRIGHTNESS=$((`stdbuf -o0 xrandr --verbose | grep -m 1 -i brightness | cut -f2 -d ' '`-0.2))
#   xrandr --output eDP-1 --brightness $BRIGHTNESS
# }

source ~/.aliases
source ~/.functions

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Auto load nvm use when entering a folder with .nvmrc
autoload -U add-zsh-hook
load-nvmrc() {
  if [[ -f .nvmrc && -r .nvmrc ]]; then
    nvm use
  elif [[ $(nvm version) != $(nvm version default)  ]]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc


# The next line updates PATH for the Google Cloud SDK.
if [ -f '/home/balazs/Downloads/google-cloud-sdk/path.zsh.inc' ]; then source '/home/balazs/Downloads/google-cloud-sdk/path.zsh.inc'; fi

# The next line enables shell command completion for gcloud.
if [ -f '/home/balazs/Downloads/google-cloud-sdk/completion.zsh.inc' ]; then source '/home/balazs/Downloads/google-cloud-sdk/completion.zsh.inc'; fi

# added by travis gem
[ -f /home/balazs/.travis/travis.sh ] && source /home/balazs/.travis/travis.sh


fpath=($fpath "/home/balazs/.zfunctions")

# Set Spaceship ZSH as a prompt
# SPACESHIP_BATTERY_SHOW="always"
# SPACESHIP_DIR_TRUNC="2"
SPACESHIP_TIME_SHOW="true"
SPACESHIP_TIME_SUFFIX=" · "
SPACESHIP_DIR_COLOR="208"
SPACESHIP_DIR_TRUNC="2"
SPACESHIP_CHAR_SYMBOL="Ⅳ "
SPACESHIP_USER_SHOW="always"
SPACESHIP_USER_PREFIX=""
SPACESHIP_USER_COLOR="166"
# SPACESHIP_DIR_TRUNC_REPO="false"

SPACESHIP_PROMPT_ORDER=(
  # dir # Current directory section
  # git # Git section (git_branch + git_status)
  # package # Package version
  # node # Node.js section
  # exec_time # Execution time
  # battery # Battery level and status
  char # Prompt character
  time # Show time
  user
)

export PATH="$HOME/.local/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"