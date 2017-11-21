# DNS 202-named-rdns
In this lab we'll be standing up two machines, a client from which to perform Reverse DNS requests, and a server running `named` as a nameserver. Below are the IP addresses of both machines in this lab.
- `server - 172.27.27.27`
- `client - 172.27.27.28`

To access one of the machines, you'll need to specify which by providing the name of the machine when invoking `vagrant ssh`:
`vagrant ssh client`

It is recommended that you run through the previous lab, `202-named` before starting this one.

# Reverse DNS
As with the previous lab, we'll be using `named` as our nameserver.

In the majority of the exercises in the previous labs, we've been working with "Forward" DNS, which resolves a given hostname to an IP address.

`Reverse DNS` is the practice of creating DNS entries that allow you to identify a hostname associated with a given IP address, using DNS.

Many email spam filters will check to make sure forward/reverse DNS match before allowing an email to pass through. This is one of many use cases for implementing reverse DNS zones.

Reverse DNS entries use the `PTR` (pointer) record type, and the zones follow the naming convention `zzz.yyy.xxx.in.addr.arpa` where `zzz`, `yyy`, and `xxx` are the last three octets of the IP address in reverse order.

For example:

The IP address `172.27.27.27`, which is the IP of `server` in this lab, would have an entry in the zone `27.27.172.in.addr.arpa`.
The IP address `172.21.22.23` would have an entry in the zone `22.21.172.in.addr.arpa`.
It's possible to create zones that are larger in scope (for both forward and reverse DNS entries):
The zone `21.172.in.addr.arpa` could contain reverse DNS entries for IP addresses between `172.21.0.0` through `172.21.255.255`.
The zone `172.in.addr.arpa` could contain reverse DNS entries for IP addresses between `172.0.0.0` through `172.255.255.255`
The zone `subdomain.example.com` could contain forward entries for hostnames such as `www.subdomain.example.com`, or you could place those entries in the main `example.com` zone - this depends a lot on how your DNS needs to be structured.

# Reverse DNS in a zone
Here's an example zone file that handles `PTR` records for reverse DNS:

    $TTL    604800
    @       IN      SOA     dns-lab202-server. admin.lab202.dyindude. (
                                  4         ; Serial
                             604800         ; Refresh
                              86400         ; Retry
                            2419200         ; Expire
                             604800 )       ; Negative Cache TTL
    ; NS records
            IN      NS      dns-lab202-server.
    ; Zone records
    27                              IN      PTR     server.lab202.dyindude.
    28                              IN      PTR     client.lab202.dyindude.

Remember that the syntax for zone files is strict, and a typo in them can cause DNS to fail for the entire zone.

`PTR` in this case stands for **pointer**, because the entry points to what should be a valid hostname for that IP address.

# Exercise 1
This exercise will be similar to the exercises in the last lab. Log onto `client` with `vagrant ssh client`.

From `client`, query `server` at `172.27.27.27` and ask for the reverse DNS entries for the following IP addresses:
- `172.27.27.27`
- `172.27.27.28`
- `8.8.8.8`
- `8.8.4.4`

# Exercise 2
Now that you've seen what some valid reverse DNS responses are, try your hand at creating your own reverse zone for `8.8.8.8` and `8.8.4.4`.
It's important to realize that while you may not have control over these IPs, you are configuring a DNS server to respond with its own entries for this.

This will be similar to the second exercise in `lab202-named`.

Start by editing `named.conf.local` and copying the entry for `27.27.172.in-addr.arpa`, replacing the name of the zone with `8.8.in-addr.arpa`.

Then make a copy of `db.27.27.172.in-addr.arpa` in `/etc/bind/zones/db.8.8.in-addr.arpa`.

Modify the records in `/etc/bind/zones/db.8.8.in-addr.arpa` to point `8.8` to a hostname of your choice.
Modify the records in `/etc/bind/zones/db.8.8.in-addr.arpa` to point `4.4` to a hostname of your choice.

After making these changes, you're ready to reload the `bind9` service, which controls `named`.

    # service bind9 reload #reloads the bind9 service
    # service bind9 status #will show the current status of bind9 so you can make sure it's still up
    # service bind9 restart #will forcibly restart the service if it's crashed and you need to fix something

Once you've verified that `bind9` starts properly, query the same IP addresses with reverse DNS that you did in the first exercise:

- `172.27.27.27`
- `172.27.27.28`
- `8.8.8.8`
- `8.8.4.4`

# Trivia
- "Reverse DNS" is pretty straightforward. It behaves very similarly to forward DNS, treating the different octets of IP addresses as different domain levels.
