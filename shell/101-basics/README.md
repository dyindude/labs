# shell 101-basics
- This lab will walk you through learning some very basic concepts with respect to navigating the command line in most Linux/UNIX distributions.

# Similarities with DOS/Windows cmd.exe
If you've ever interacted with the command prompt on Windows, there are a few commands and behaviors that are similar.

| Linux | Windows | Effect |
| ----- | ------- | ------ |
| `cd`    | `cd`      | change **c**urrent **d**irectory |
| `ls`    | `dir`     | **l**i**s**t current **dir**ectory's contents |
| `rm`    | `del`     | **r**e**m**ove or **del**ete a file |
| `mv`    | `move`    | **m**o**v**e/**move** a file from one path to another |
| `/`     | `\\`      | Delimiter used for distinguishing between different folder paths |
| `.`     | `.`       | A single dot can be used to represent the current directory in a command |
| `..`    | `..`      | Two dots can be used to represent the directory one level above the current directory |
| `/`     | `C:\\`    | A single forward slash is used in Linux to represent the `root` directory of the filesystem. A drive letter, followed by `:\\` indicates the top level directory of a drive in Windows. |

#### todo: add more here, figure out how to render a single backslash as code...

# The command prompt
After gaining shell access on the machine using `vagrant ssh`, the default prompt for the shell that is launched looks something like this:

`ubuntu@shell-lab101:~$`

The default prompt in Ubuntu provides the following information:

| field | value |
| ----- | ----- |
| current user | `ubuntu` |
| hostname of the machine | `shell-lab101` |
| current working directory | `~` |
| end of prompt | `$` |

- Thus, this prompt indicates we are currently logged into a system with the hostname `shell-lab101` as the user `ubuntu`, in the directory `~`.
- `~` is often used to indicate the current user's `HOME` directory, the directory a user's shell will start in.
- The default `HOME` directory for a user in Ubuntu and many other Linux distributions is `/home/username`.
- The default end of prompt delimiters in Ubuntu are `$` for a normal user, and `#` for a `superuser` user. In the documentation of my labs, I try to prefix commands with `$` followed by a space for commands which can be ran as a normal user, and `#` for commands which need to be run as `root`.

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
$ ls -1
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

This opens the documentation for the `ls` command. You can navigate up or down with the arrow keys or PageUp/PageDown.

- In the previous exercise, we provided `ls` with the flags `-Alh`, which is shorthand for `ls -A -l -h`. Referencing this manpage, what do each of these parameters change about the output of `ls`?
- Try out some of the other parameters referenced in the `ls` manual.

# users and groups
Linux/UNIX systems are designed with a multi-user purpose in mind. In the filesystem, permissions to read/write/execute files are determined by the permissions placed on a file in the context of the `user` and `group` ownership of that file.

For the purpose of this lab, you will only need to be aware of the existence of two users:

- our default user, `ubuntu`
- the `superuser` user account, `root`, which is roughly equivalent to `Administrator` access on Windows

However, it's important to understand that many services create separate user accounts for their operation to ensure their users are only capable of modifying files associated with that user.

Users can also be members of `groups`, and in turn be granted access to modify files/paths by changing the `group` ownership of that path.

# changing users
`su` is a utility that can be used to:

    $ man su
    ...
    The su command is used to become another user during a login session.
    Invoked without a username, su defaults to becoming the superuser.
    ...

To change users to `root`, you could run `su` and enter the `root` user's password to become `root`.

However, by default the `root` user's password is not defined in Ubuntu. Without the password, you cannot become `root` with `su`. We'll be setting `root`'s password later in this lab.

`sudo` is a utility that can be used to:

    $ man sudo
    ...
    sudo allows a permitted user to execute a command as the superuser
    or another user, as specified by the security policy.
    ...

- In `sudo`'s default configuration, prefixing a command with `sudo` as a normal user will prompt you for your (the calling user, in this case `ubuntu`) password, and if entered correctly (and that user is configured in `/etc/sudoers` to be allowed to run that command), the command will be executed as the `root` user.
- In Ubuntu by default (as well as in this lab), the default user has been configured to be allowed to run commands as `root` using `sudo` without having to enter a password.

Combined with the `-i` flag:

    $ man sudo
    ...
    Run the shell specified by the target user's password database
    entry as a login shell.
    ...

This means that successfully running `sudo -i` will create an interactive shell session (as a child process of the current shell) as the `root` user.

# the `touch` utility
`touch` is a simple utility that can be used to:

    $ man touch
    ...
    Update the access and modification times of each FILE to the current time.
    ...

If a file does not exist in the path you provide to `touch`, a blank file will be created at that path unless you also provide the `-c` flag. Read more in the `man` page for `touch`.

# Exercise 3
Run `cd ~` to return to the user's `HOME` directory, `/home/ubuntu`.

Run the following commands in order:

```
$ touch test1
$ ls -Alh test1
$ touch /test2
$ ls -Alh /test2
$ sudo -i
# touch /home/ubuntu/test1
# ls -Alh /home/ubuntu/test1
# touch /test2
# ls -Alh /test2
# touch /tmp/test3
# ls -Alh /tmp/test3
$ touch /test2
$ ls -Alh /test2
$ touch /tmp/test4
$ ls -Alh /tmp/test4
$ ls -Alh /tmp
```

Try these commands with different paths, as the two different users. Pay attention to what user/group owns these folders:

```
$ ls -Alhd /
$ ls -Alhd /home
$ ls -Alhd /home/ubuntu
$ ls -Alhd /root
$ ls -Alhd /tmp
```

- What's different about `/tmp`?

# Trivia

- `superuser` and `root` are often used interchangeably. Technically speaking, `root` is the username, while `superuser` is the special class of user assigned to `root`.
- The `HOME` directory for the `root` user is `/root` by default. This is not to be confused with `/`, which is often refered to as the `root directory` of the filesystem.
