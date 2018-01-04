# shell 102-filesystem-permissions
File access permissions in Linux are designed to provide server administrators with granular control over which users and processes have access to which files within a system.

The concepts covered in this lab are the most basic level of permissions used in Linux/UNIX filesystems - some operating systems provide other utilities to provide more contextual control over who/what process can access/use files.

# Permission Structure
Before getting into the specifics of how permissions can be changed/managed on files, let's take a look at the output of `ls -l text.txt` and analyze each field presented:

```
$ ls -l test.txt
-rwxr--r-- 1 root root 81 Jan 1 12:00 test.txt
```

| Description | Representation |
| ----------- | -------------- |
| A single character indicating the type of file. | `-` |
| Nine characters which represent the permission string, that describbes the total effective permissions on the file. | `rwxr--r--` |
| The number of hard links which exist in the filesystem for this file. | `1` |
| User ownership | `root` |
| Group ownership | `root` |
| The size of the file, in bytes. | `81` |
| A timestamp which indicates the last time the file was modified. | `Jan 1 12:00` |
| The filename | `test.txt` |

## Filetypes
The first character in the output of `ls -l` indicates the type of file listed. The following table describes possible values you could see in this field:

| Symbol | Filetype |
| ------ | -------- |
| `-`    | Any normal file (examples: text files, image files. your data.)
| `d`    | directory |
| `l`    | symbolic link - a logical pointer or alias of another file in the filesystem. |
| `p`    | named pipe - a special type of file that you can use to allow one process to write to (input), and another process to read the data written by the first process. |
| `s`    | socket - similar to named pipes, but allow for bi-directional communication between processes |
| `b`    | block device - a hard disk, floppy disk, cdrom. A physical block device. |
| `c`    | character device - a serial port, parallel port, used to transfer data a single `character` at a time. |

The last four filetypes represent more complex concepts in a Linux/UNIX system - for now, just be aware of their representations. For the purposes of this lab, we'll be working primarily with normal files, directories, and both hard/soft links.

## Permission string
As stated previously, the permission string describes the total effective permissions on the file. These nine characters are three separate sets of characters which indicate the **r**ead, **w**rite, and e**x**ecute permissions within the scope of the file's `user`, `group`, and `world` (all other users on the system). Using the example `ls -l test.txt` output, the permission string `rwxr--r--` evaluates to:

| Permission Scope | Permission string | Permissions |
| ---------------- | ----------------- | ----------- |
| `user`           | `rwx`             | Read, Write, Execute |
| `group`          | `r--`             | Read |
| `world`          | `r--`             | Read |

- `r` indicates `read` access
- `w` indicates `write` access
- `x` indicates `execute` access
- `-` indicates the absence of a permission

Taking what we've learned thus far, the output of `ls -l test.txt` that we saw at the beginning of this lab:

```
$ ls -l test.txt
-rwxr--r-- 1 root root 81 Jan 1 12:00 test.txt
```

provides the following information:

- The file `test.txt` in the current working directory is a normal file which contains 81 bytes of data.
- The user `root` has `read`, `write`, and `execute` permissions on this file.
- Members of the `root` group only have permission to `read` the file.
- All other users on the system have read-only access to the file.

### Octal Permission Representation
The permission strings we've seen thus far are human-readable representations of how the permissions are stored on the filesystem. The nine characters are stored as boolean values in a 9-digit binary number. Each set of three characters can also be represented by an octal number between 0 and 7.

For example, taking another look at our permission string `rwxr--r--`:

| Representation Type | Value |
| ------------------- | ----- |
| Permission String | `rwxr--r--` |
| Binary | `111100100` |

Each set of permissions are represented by three single bits. Since the maximum value of a three digit binary number is `7`, it makes octal representation an easy shorthand for a full permission string. For example, the following table represents the individual permissions that are present in a subset in their simplest:

| String | Binary | Octal |
| ------ | ------ | ----- |
| `r--`  | `100`  | `4`   |
| `-w-`  | `010`  | `2`   |
| `--x`  | `001`  | `1`   |

This means you can find the octal representation for any permission subset by adding the corresponding octal digits. Here are a few examples:

| String | Binary | Octal |
| ------ | ------ | ----- |
| `rw-`  | `110`  | `6 (4 + 2)` |
| `r-x`  | `101`  | `5 (4 + 1)` |
| `-wx`  | `011`  | `3 (1 + 2)` |
| `rwx`  | `111`  | `7 (4 + 2 + 1)` |

From there, you can represent a full permission string with a three digit octal number:

| String | Binary | Octal |
| ----------- | ----------- | ----- |
| `rwxrwxrwx` | `111111111` | `777` |
| `rwxr-xr-x` | `111101101` | `755` |
| `rwxr-x---` | `111101000` | `750` |
| `rwx------` | `111000000` | `700` |
| `rw-r--r--` | `110100100` | `644` |

# Changing File Ownership and Permissions
In order for permission strings to have any context, we need to understand how to assign specific user/group ownership to files. When a file is created, it inherits the same user and (default) group ownership as the user who owns the process that is creating the file.

There are instances where it's desirable to change the ownership of a file, like in the case where the file was originally created by root and the permissions need to be adjusted to the context of a normal user.

To assign user and group ownership of a file, use the `chown` command. The syntax is as follows:

```
$ chown [user]:[group] [filename]
```

For example, to set the ownership of the file `test.txt` to the `root` user and `root` group:

```
$ chown root:root test.txt
```

To change the effective permissions on the file, use the `chmod` command. The syntax is as follows:

```
$ chmod [octal permission code] [filename]
```

For example, to set the permission string `rwxr--r--` on `test.txt`, use the following:

```
$ chmod 744 test.txt
```

In some distributions, `chmod` also supports changing permissions in a more human-readable format:

```
$ chmod [u][g][o][a] [+|-|=] [r][w][x] [filename]
```
Where:

- u = `user`
- g = `group`
- o = `other` (world)
- a = `all` (equivalent to `ugo`)
- \+ = allow permission
- \- = deny permission
- = = changes are made as specified. Any omitted modes are denied
- rwx = read, write, or execute permissions to be applied

For example:

| Command | Effect |
| ------- | ------ |
| `chmod u=rwx,go=r test.txt` | Equivalent to `chmod 744`, assigning permissions `rwxr--r--` |
| `chmod ugo+r test.txt` | Adds an octal `4`, or binary `100` to each permission subset. In other words, adds `read` access to `user`, `group`, and `world`. |
| `chmod ug=rwx,o-rwx test.txt` |  Sets `user` and `group` permissions on the file to `rwx`, and removes all permissions from `world`. |

- `chmod` and `chown` both support applying changes recursively with the `-R` flag. Be careful when using `chmod -R`, as execute permissions are required on directories in order to access any content/browse to that level of the filesystem. As you can imagine, there would be devestating effects if you applied incorrect permissions recursively to the root level of the filesystem (e.g. `chmod 0644 -R /`)

# Exercise 1
Gain shell access to the machine you spun up for this lab with `vagrant ssh`.

Run the following commands in order:

```
$ touch test1
$ ls -Alh test1
$ sudo -i
# touch /test2
# ls -Alh /test2
# chown root:root /home/ubuntu/test1
# exit
$ touch test1
$ sudo -i
# chmod 666 /home/ubuntu/test1
# exit
$ touch test1
$ ls -Alh test1
$ sudo -i
# touch /test2
# ls -Alh /test2
# exit
$ touch /test2
$ sudo -i
# chown ubuntu:ubuntu /test2
# chmod 600 /test2
# ls -Alh /test2
# touch /test2 #(what's different here?)
# exit
$ touch /test2 #(what changed?)
# touch /tmp/test3
# ls -Alh /tmp/test3
$ touch /test2
$ ls -Alh /test2
$ touch /tmp/test4
$ ls -Alh /tmp/test4
$ ls -Alh /tmp
$ ls -Alhd /tmp
```

- Pay attention to how the permission strings change. A normal user will need `write` access to `touch` a file.
- Like the last lab, there's something different about `/tmp`. What is it?


# Trivia
- the `stat` command can be used to describe a lot useful information about a file:

    ```
    $ stat /test2
	  File: '/test2'
	  Size: 0               Blocks: 0          IO Block: 4096   regular empty file
	Device: 801h/2049d      Inode: 57328       Links: 1
	Access: (0644/-rw-r--r--)  Uid: ( 1000/  ubuntu)   Gid: ( 1000/  ubuntu)
	Access: 2017-12-07 05:13:57.528119251 +0000
	Modify: 2017-12-07 05:13:57.528119251 +0000
	Change: 2017-12-07 05:13:57.528119251 +0000
	 Birth: -
    ```
    
    In this output, you see the permission string, the octal representation of the permissions, as well as more detailed information about the file ownership, its last access/modify/change times, etc.
