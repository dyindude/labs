# DNS 101-hosts
- This lab will walk you through a variety of basics when it comes to understanding how DNS names are resolved in Linux.
- Keep in mind that many of these concepts apply in other operating systems, but usually using different tools

# Hosts file
The first place most operating systems look for resolving hostnames is in the hosts file. Take a look at `/etc/hosts` by running `cat /etc/hosts`

Each line starts with an IP address, followed by a list of hostnames that should resolve to that IP.
`127.0.0.1       dns-lab101      dns-lab101`

## Ping test
To demonstrate this, try pinging both a hostname that isn't in the `hosts` file, followed by one that is:
- `ping dns-lab999`
- `ping dns-lab101`

You'll see that pinging `dns-lab999` results in no response (hit ctrl+c to cancel)
You'll see that pinging `dns-lab101` results in a response from `127.0.0.1`

## Hostname "poisoning"
Sometimes you'll see documentation refer to hostname 'poisoning' via `/etc/hosts`. This is accomplished by placing a hostname in `/etc/hosts` that would normally be resolved by your local nameservers instead.

Before poisoning your hosts file for `google.com`, try using `curl` to get a response from google's own servers:
- `curl google.com`
You'll see the raw HTML output, which in this case indicates a redirect to `www.google.com`

Now add an entry to `/etc/hosts` that changes the DNS resolution of `google.com` to `127.0.0.1`
- `echo 127.0.0.1 google.com >> /etc/hosts`
  - Note: it's important to use double `>>` in this case
- Try running `curl google.com` again. What happens?

# resolv.conf
The next place an operating system will look for a hostname is the default nameserver configured on the system. In Linux and OSX this is configured in `/etc/resolv.conf`

Get the IP address of your VM's default nameserver by looking at `/etc/resolv.conf`:
- `cat /etc/resolv.conf`

You can use the `dig` utility to manually lookup hostnames (and other DNS records, which will be covered in another lab). Try these:
- `dig google.com`
- `dig amazon.com`
- `dig github.com`
- `dig twitch.tv`

- Note that some of these have multiple entries. When this happens, your system will pick one to perform other requests with. These specifics will be covered later, just know it's often the case.
- Note that google.com will provide you with the real IP for one of google's servers, and not `127.0.0.1` as we placed in `/etc/hosts`. This is because dig ignores `/etc/hosts` and by default will start with querying the system's default nameserver.

With `dig`, you can specify the nameserver to query by appending `@[ip address]` to the end of the command. #not needed if you querying default nameserver bruv
- Try this with the IP address in your VM's `/etc/resolv.conf`
- Now try it with some other publicly known nameservers:
  - `8.8.8.8` (these are Google's)
  - `8.8.4.4`
- Are there any differences in the results?

# Trivia
- In Windows, the hosts file is located in `C:\Windows\System32\Drivers\etc\hosts`. Do you notice anything familiar about this path?
- OSX uses the same path for the hosts file as Linux
- `127.0.0.1` is known as the loopback or `localhost` address. Most operating systems will have an entry in their hosts file pointing `127.0.0.1` to the hostname `localhost`
- Vagrant does a lot for you. The nameserver set up in `/etc/resolv.conf` in the VM is simply forwarding requests to your host OS. Try running queries against your host OS nameservers. Are there any differences? 

# Further reading
- https://en.wikipedia.org/wiki/Hosts_(file)
- http://manpages.ubuntu.com/manpages/zesty/man5/hosts.5.html

