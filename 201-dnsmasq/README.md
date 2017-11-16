# dns 201-dnsmasq
In this lab we'll be standing up two machines, a client to perform DNS requests from, and a server running `dnsmasq` as a nameserver. Below are the IP addresses of both machines in this lab.
- `server - 172.27.27.27`
- `client - 172.27.27.28`

To access one of the machines, you'll need to specify which by providing the name of the machine when invoking `vagrant ssh`:
`vagrant ssh client`

# dnsmasq
`dnsmasq` is a caching/forwarding nameserver, which means:

- DNS lookups can be performed against it (nameserver)
- If a name isn't found in it's configuration or the cache from a previous request, it can forward the request to an external nameserver (caching, forwarding)
- It's useful for simple setups, home office networks due to its simplistic configuration
  - By default, it will respond to names in the server's own `/etc/hosts` file, as well as names explicitly defined in its configuration files

## Exercise 1
Let's start by running some queries against the DNS server from the client.

- Run `vagrant ssh client` to open a shell on the client node
- The IP address for `server` in the lab is `172.27.27.27`
- Using `dig`, query a few hostnames (remember to point to the `server` IP for your requests with `@`)
  - `google.com`
  - `amazon.com`
  - `github.com`
  - `twitch.tv`
- Remember, `dnsmasq` will respond to requests for names in its system's `/etc/hosts` file. Try running queries for the names of the two machines in the lab:
  - `dns-lab201-client`
  - `dns-lab201-server`
  - What's important to understand about these responses?

## Exercise 2
Now let's add the hostname for `client` to the `/etc/hosts` file on `server`, reload the `dnsmasq` service, and test another request from `client`.

- You can open another shell in another terminal window, or just exit your current session on `client` by typing `exit` (or  hitting `ctrl + d` at an empty prompt).
- Run through the following commands:

      $ vagrant ssh server
      $ sudo -i
      # echo 172.27.27.28 dns-lab201-client >> /etc/hosts
      # service dnsmasq restart

- After completing this, go back to `client` and try querying `server` for the resolution of `dns-lab201-client`

# Trivia
- DNS also exists for pointing resolution of IP addresses back to hostnames. This is commonly referred to as "Reverse" DNS.
  - By passing the `-x` flag to `dig`, you can perform reverse DNS lookups.
  - Try performing reverse DNS lookups on the IPs you got from the results of your queries in exercise 1
    - then try performing forward lookups on the hostnames you get back from those results
    - What do you think is interesting about the results here?
