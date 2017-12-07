# shell 102-filesystem-permissions
File access permissions in Linux are designed to provide server administrators with granular control over which users and processes have access to which files within a system.

The concepts covered in this lab are the most basic level of permissions used in Linux/UNIX filesystems - some operating systems provide other utilities to provide more contextual control over who/what process can access/use files.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

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


# Trivia

