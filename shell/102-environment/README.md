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





# Trivia

- local do not get passed on to other processes (how to print them all?) - set -o posix ; set | grep PS1
- environment variables are "exported" and can be seen by subprocesses
- local vs environment variables in bash?
