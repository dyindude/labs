# dns 202-named
In this lab we'll be standing up two machines, a client to perform DNS requests from, and a server running `bind` as a nameserver. Below are the IP addresses of both machines in this lab.
- `server - 172.27.27.27`
- `client - 172.27.27.28`

To access one of the machines, you'll need to specify which by providing the name of the machine when invoking `vagrant ssh`:
`vagrant ssh client`

# named
`named` is a general purpose nameserver. For many years it was the de-facto standard for nameservers in Unix/Linux. It has a powerful suite of options available, but its configuration syntax can be difficult to understand and troubleshoot if you aren't familiar with it.

- `named` stands for nameserver daemon, and is a part of the `bind` suite of utilities. These names are often used interchangeably.
- Records for domains are organized into files called `zone` files
  - a `zone` file controls the resolution hostnames, including the root domain and `subdomains` of that `zone`

# anatomy of a zone file
Here's an example zone file:

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
    server.lab202.dyindude.         IN      A       172.27.27.27
    client.lab202.dyindude.         IN      A       172.27.27.28
    cname-server.lab202.dyindude.   IN      CNAME   server.lab202.dyindude.
    cname-client.lab202.dyindude.   IN      CNAME   client.lab202.dyindude.

Remember that the syntax of zone files is strict, and a typo in them can cause DNS to fail for the entire zone.
Here are some definitions:

- `TTL` - **Time to Live** is a concept that is present not only in DNS, but also in lower level networking protocols like TCP/IP. In the case of DNS, this describes the minimum amount of time in seconds that a client requesting information about this zone can expect it to be valid.
- `@` - When reading a zone file, `@` is used to indicate the root domain of the zone file. In the case of this zone, `@` is equivalent to `lab202.dyindude`.
- `SOA` - **Start of Authority** is a record type that defines #some of this needs clarification
  - `dns-lab202-server.` the hostname of a nameserver that is authoritative for the zone, meaning that other servers in a DNS request chain will defer to this server after all caches have been exhausted due to `TTL` expiry (need better wording, and maybe an example). In this case, the hostname is the same as this server's.
  - `admin.lab202.dyindude.` the hostname of a system that represents the responsible party for administering the domain.

The following values are used to control the behavior of how often slave nameservers attempt to sync information with their masters:
- `Serial` - Indicates the version of the zone file. If a slave nameserver sees this number has incremented, it knows it's time to refresh the zone.
- `Refresh` - The length of time in seconds a slave nameserver should wait before asking the master whether or not the `Serial` has been incremented and the zone needs to be refreshed.
- `Retry` - The length of time in seconds a slave nameserver should wait to retry a connection to the master if it encounters a timeout on any request.
- `Expire` - Slave nameservers will stop providing responses for this zone in the event a slave nameserver has been unable to communicate with its master for this value's duration in seconds.
- `Minimum TTL` - The minimum **Time to Live** for the zone.

- `NS` - `NameServer` records indicate the first authoritative point of contact (nameserver) for external nameservers to obtain information about the zone.
- `A` - An `A` record is a forward DNS record for a hostname, which resolves a name to an IP address.
- `CNAME` - A forward DNS record which resolves a name to another hostname (which then can be looked up and resolved again until the client gets an IP address as a response)


- Like `dnsmasq`, it supports both forward and reverse zones. 
- DNS lookups can be performed against it (nameserver)
- If a name isn't found in it's configuration or the cache from a previous request, it can forward the request to an external nameserver (caching, forwarding)
- It's useful for simple setups, home office networks due to its simplistic configuration
  - By default, it will respond to names in the server's own `/etc/hosts` file, as well as names explicitly defined in its configuration files

## Exercise 1
This exercise will be similar to the exercises in the last lab. Log onto `client` with `vagrant ssh client`.

From `client`, query `server` at `172.27.27.27` and ask for the names shown in the zone file displayed above:
- server.lab202.dyindude
- client.lab202.dyindude
- cname-server.lab202.dyindude
- cname-client.lab202.dyindude

## Exercise 2
- add your own zone and query it
#maybe install an http server on `server` like in the first lab
# Trivia
- As stated in the summary, `named` is the `nameserver daemon`. `bind` stands for the Berkeley Internet Name Domain, which includes a number of other utilities including `named`.
- Many nameserver administrators have configured their nameservers to not honor TTL if the number is lower than their standard, which can cause variances in the completion of DNS propagation.

# Further reading
- https://en.wikipedia.org/wiki/Time_to_live
- https://en.wikipedia.org/wiki/SOA_Resource_Record
- https://tools.ietf.org/html/rfc1035
- https://en.wikipedia.org/wiki/BIND
- https://serverfault.com/questions/132352/difference-between-named-and-bind
- http://manpages.ubuntu.com/manpages/precise/en/man8/named.8.html
