# shell 102-environment
- This lab will walk you through understanding how environment variables are handled in many Linux/UNIX software distributions.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 





# Trivia

- local do not get passed on to other processes (how to print them all?) - set -o posix ; set | grep PS1
- environment variables are "exported" and can be seen by subprocesses
- local vs environment variables in bash?
