# dns 101
- This lab will walk you through a variety of basics when it comes to understanding how DNS names are resolved in Linux.
- Keep in mind that many of these concepts apply in other operating systems, but usually using different tools

# setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

# hosts file
The first place most operating systems look for resolving hostnames is in the hosts file. Take a look at `/etc/hosts` by running `cat /etc/hosts`

Each line starts with an IP address, followed by a list of hostnames that should resolve to that IP.
`127.0.0.1       dns-lab101      dns-lab101`

## the ping test
To demonstrate this, try pinging both a hostname that isn't in the `hosts` file, followed by one that is:
- `ping dns-lab999`
- `ping dns-lab101`

You'll see that pinging `dns-lab999` results in no response (hit ctrl+c to cancel)
You'll see that pinging `dns-lab101` results in a response from `127.0.0.1`

## hostname 'poisoning'
Sometimes you'll see documentation refer to hostname 'poisoning' via `/etc/hosts`. This is accomplished by placing a hostname in /etc/hosts that would normally be resolved by your local nameservers instead.

Before poisoning your hosts file for `google.com`, try using `curl` to get a response from google's own servers:
- `curl google.com`
You'll see the raw HTML output, which in this case indicates a redirect to www.google.com

Now add an entry to `/etc/hosts` that changes the DNS resolution of `google.com` to `127.0.0.1`
- `echo 127.0.0.1 google.com >> /etc/hosts`
  - Note: it's important to use double `>>` in this case
- Try running `curl google.com` again. What happens?

# resolv.conf
- manual lookups

# trivia
- In Windows, the hosts file is located in C:\Windows\System32\Drivers\etc\hosts. Do you notice anything familiar about this path?
- OSX uses the same path for the hosts file as Linux
- `127.0.0.1` is known as loopback TODO: networking 101
