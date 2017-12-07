# shell 101-basics
- This lab will walk you through learning some very basic concepts with respect to navigating the command line in most Linux/UNIX distributions.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

# Similarities with DOS/Windows cmd.exe
If you've ever interacted with the command prompt on Windows, there are a few commands and behaviors that are similar.

| Linux | Windows | Effect |
| ------------------------ |
| `cd`    | `cd`      | change **c**urrent **d**irectory |
| `ls`    | `dir`     | **l**i**s**t current **dir**ectory's contents |
| `/`     | `\\`      | Delimiter used for distinguishing between different folder paths |
| `.`     | `.`       | A single dot can be used to represent the current directory in a command |
| `..`    | `..`      | Two dots can be used to represent the directory one level above the current directory |
| `/`     | `C:\\`    | A single forward slash is used in Linux to represent the `root` directory of the filesystem. A drive letter, followed by `:\\` indicates the top level directory of a drive in Windows. |
#### todo: add more here

# The command prompt
After gaining shell access on the machine using `vagrant ssh`, the default prompt for the shell that is launched looks something like this:

`ubuntu@shell-lab101:~$`

The default prompt in Ubuntu provides the following information:

| field | value |
| ------------- |
| current user | `ubuntu` |
| hostname of the machine | `shell-lab101` |
| current working directory | `~` |
| end of prompt | `$` |

- Thus, this prompt indicates we are currently logged into a system with the hostname `shell-lab101` as the user `ubuntu`, in the directory `~`.
- `~` is often used to indicate the current user's `HOME` directory, the directory a user's shell will start in.
- The default `HOME` directory for a user in Ubuntu and many other Linux distributions is `/home/username`.
- The default end of prompt delimiters in Ubuntu are `$` for a normal user, and `#` for the `root` user. In the documentation of my labs, I try to prefix commands with `$` followed by a space for commands which can be ran as a normal user, and `#` for commands which need to be run as `root`.

# Exercise 1
Try running the following commands in order:

```
$ ls
$ ls -A
$ ls -Al
$ ls -Alh
$ pwd
$ ls ../
$ ls ../../
$ ls /
$ cd ..
$ ls -Alh
$ pwd
$ cd ..
$ ls -Alh
$ pwd
$ ls -Alh ~
$ ls -Alh var
$ cd ~
$ ls -Alh /var
```

Review what's different, and what is the same with the output of each command. Try navigating to other folders *Hint*: with the default settings in Ubuntu, the `ls` command prints directories in a dark blue color.

# Exercise 2
Linux distributions often ship with the `man` utility, which you can use for reading the documentation for a command if it is installed. In Ubuntu, most system commands come with the manuals installed.

Use `man` to learn about the different flags that can be passed to the `ls` command:

`$ man ls`


- where do we learn about the root user?

# Trivia

# Further reading

