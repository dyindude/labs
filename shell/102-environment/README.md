# shell 102-environment
- This lab will walk you through understanding how environment variables are handled in many Linux/UNIX software distributions.

# environment variables
An `environment` variable is any variable that is available to the current shell process. There are a number of variables that get set by default on distributions like Ubuntu, but to demonstrate variables in action, one can simply set a variable on the command line:

```
$ foo="bar"
$ echo $foo
bar
```

In the above example, the first command sets the `local` environment variable `foo` to the value `bar`. The second command prints the value of `foo` after it has been set.

The differences between `local` and `exported` environment variables will be explored in later sections.

# Exercise 1
Log into a shell on the machine provided with this lab using `vagrant ssh`.

Execute the following commands:

```
$ echo $foo
$ foo="bar"
$ echo $foo
$ echo $bar
$ bar="foo"
$ echo $bar
```

# default variables
There are a number of default variables that get set by your system when spawning a new shell process. Some commonly known ones are things like:

- `TERM` - tells the shell how control characters should be printed for your terminal
- `PS1` - defines the look/style of your shell's prompt
- `PATH` - defines where your shell will look for commands when not typing the full path
- `SHELL` - the full path to the executable that owns this shell process
- `HOME` - the `HOME` directory of the current user

Keep in mind that we are using Ubuntu 16.04 as an example, and there are a number of other default variables that get set within the environment.

Some of these examples are `local` variables, and some are `exported` variables which would be available to subprocesses within the current shell (more on this in the next section)

# Exercise 2
Explore your environment. Take a look at the values of some of these variables.

Execute the following commands:

```
$ echo $TERM
$ echo $PS1
$ echo $PATH
$ echo $SHELL
$ echo $HOME
$ pwd
```

# local vs exported variables
`local` variables are only available to the current running shell.
`exported` variables are `exported` when spawning child processes (such as scripts, other programs, etc), and are made available to these child processes.

In the first exercise, we created a `local` variable named `foo`, with the value `bar`.

Because the variable is `local` in scope, any scripts spawned from the current shell would not have access to the value stored in this variable in the current process.

```
$ foo="bar"
$ echo echo \$foo > foo.sh # creates a script with the contents "echo $foo"
$ echo $foo #ran from the current shell process, let's see the value of $foo
bar
$ bash foo.sh #run foo.sh with bash as the shell interpreter

$ #we got a blank response because foo was not "exported" to the child process
$ export foo #export will export the local variable as an exported variable, making it available to child processes
$ bash foo.sh
bar
```

Keep in mind that when `export`ing a variable, a copy of that variable is created for the child process. Any changes made to the variable in the child process will not be available to the parent process.

```
$ cat foo.sh 
foo=baz
echo $foo
$ bash foo.sh 
baz
$ echo $foo
bar
```

However, once a variable has been `export`ed, changes to it in the current shell will persist when passed to child processes:

```
$ cat foo.sh
echo $foo
$ echo $foo
bar
$ bash foo.sh 
bar
$ foo=baz
$ echo $foo
baz
$ bash foo.sh 
baz
```

# printing default variables
You can view a list of all of the `export`ed variables in your shell with the `env` command. Many of the ones shown here are defaults (`LS_COLORS`, for example, controls what colors are used to print different filetypes with the `ls` command), but you will also see our exported variable `foo=bar`:

```
$ env
XDG_SESSION_ID=3
TERM=screen-256color
SHELL=/bin/bash
SSH_CLIENT=10.0.2.2 57236 22
SSH_TTY=/dev/pts/0
USER=ubuntu
LS_COLORS=rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.jpg=01;35:*.jpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:
MAIL=/var/mail/ubuntu
PATH=/home/ubuntu/bin:/home/ubuntu/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
PWD=/home/ubuntu
LANG=en_US.UTF-8
foo=bar
SHLVL=1
HOME=/home/ubuntu
LOGNAME=ubuntu
XDG_DATA_DIRS=/usr/local/share:/usr/share:/var/lib/snapd/desktop
SSH_CONNECTION=10.0.2.2 57236 10.0.2.15 22
LESSOPEN=| /usr/bin/lesspipe %s
XDG_RUNTIME_DIR=/run/user/1000
LESSCLOSE=/usr/bin/lesspipe %s %s
_=/usr/bin/env
```

# Exercise 3

Let's explore the environment further.

Run the following commands in your shell:

```
$ env
```

Take a look at each variable using `echo`. Try modifying `foo.sh` or creating your own script to print the contents of these variables. Play around with it!

Local variables can be printed (be warned, there are a lot of default local variables - a lot more than the exported ones shown with `env`!) using the following:

```
$ set -o posix ; set
```

Explore these variables. Try using `export` on some of them, and using a simple script to print its contents.

# Where defaults get set
#### this can get squirrelly, even on Ubuntu

# Trivia
