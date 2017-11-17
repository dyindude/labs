# DNS 202-named
In this lab we'll be standing up two machines, a client from which to perform DNS requests, and a server running `named` as a nameserver. Below are the IP addresses of both machines in this lab.
- `server - 172.27.27.27`
- `client - 172.27.27.28`

To access one of the machines, you'll need to specify which by providing the name of the machine when invoking `vagrant ssh`:
`vagrant ssh client`

# named
`named` is a general purpose nameserver. For many years it was the de-facto standard for nameservers in Unix/Linux. It has a powerful suite of options available, but its configuration syntax can be difficult to understand and troubleshoot if you aren't familiar with it.

- `named` stands for nameserver daemon, and is a part of the `bind` suite of utilities. These names are often colloquially used interchangeably.
- Records for domains are organized into files called `zone` files
  - a `zone` file controls the resolution hostnames, including the root domain and `subdomains` of that `zone`

# Anatomy of a zone file
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

Remember that the syntax for zone files is strict, and a typo in them can cause DNS to fail for the entire zone.
Here are some definitions:

- `TTL` - **Time to Live** is a concept that is present not only in DNS, but also in lower level networking protocols like TCP/IP. In the case of DNS, this describes the minimum amount of time in seconds that a client requesting information about this zone can expect it to be valid.
- `@` - When reading a zone file, `@` is used to indicate the root domain of the zone file. In the case of this zone, `@` is equivalent to `lab202.dyindude`.
- `IN` - Defines that an entry in the zone file is an **IN**ternet class record.
- `SOA` - **Start of Authority** 
  - `dns-lab202-server.` - `MNAME` - is a deprecated record type<sup>1</sup> that is now only used for updating dynamic DNS records (such as with DHCP in home networks). It indicates an authoritative source for DNS records for the zone. In practice, this record has been superseded by `NS` records for Internet class records.
  - `admin.lab202.dyindude.` - `Mailing address` - the e-mail address of administrators responsible for the domain.
    - Since `@` is a special character representing the root domain of the zone, in a zone file convention it is replaced with another `.` symbol.
    - If there is a literal `.` in the username of the email address, it must be escaped in this field with `\`.
      - For example, in the case of `admin@lab202.dyindude`, the entry in the zone file is `admin.lab202.dyindude.com`
      - In the case of an email address like `dns.admin@lab202.dyindude`, the entry in the zone file would be `dns\.admin.lab202.dyindude.com`

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

# Exercise 1
This exercise will be similar to the exercises in the last lab. Log onto `client` with `vagrant ssh client`.

From `client`, query `server` at `172.27.27.27` and ask for the names shown in the zone file displayed above:
- `server.lab202.dyindude`
- `client.lab202.dyindude`
- `cname-server.lab202.dyindude`
- `cname-client.lab202.dyindude`

# Exercise 2
For this exercise, you'll be creating a copy of the `lab202.dyindude` zone file on `server` and creating your own zone. Once that's done, you can test the resolution of the names from `client`.

Start by logging onto `server` with `vagrant ssh server`. Become root and navigate to `/etc/bind`.

Decide what you want your zone to be. Use one of the following examples or come up with your own. For now, avoid using proper top level domains like `.com`, `.net`, `.org`, `.tv`. We'll get into what determines a valid top level domain in another lesson - just have fun with it.

- `kit.boga`
- `mighty.heffer`
- `dizzy.dizaster`
- `linux.isthebest`
- `whatisdns.local`

The primary configuration file for `named` is `/etc/bind/named.conf`. In Ubuntu, this file simply includes other configuration files - this is a convention you will see in many service packages in Unix/Linux software distributions.

    include "/etc/bind/named.conf.options";
    include "/etc/bind/named.conf.local";
    include "/etc/bind/named.conf.default-zones"

The files included here are:

- `named.conf.options` - has the `options{};` configuration block containing nameserver-wide options.
- `named.conf.local` - includes information about the zones local to this machine. This is where you'll place your custom zone configuration.
- `named.conf.default-zones` - contains hints to the root DNS servers ##expound on this somewhere, as well as reverse DNS entries for `localhost` IP addresses to avoid some edge-case DNS misconfiguration errors. #citation needed

Open `named.conf.local` in the command line editor of your choice (`vim`, `nano`, etc)
Create a new zone configuration in the lines below the zone for `lab202.dyindude` using your desired hostname.
- **REMEMBER**: syntax is important. Retain the same format with braces, semicolons, and spacing. The zone filename you reference here doesn't *have* to start with `db.`, but it's good to follow the convention.

After you've made these changes in `named.conf.local`, navigate to `/etc/bind/zones`. Create a copy of `db.lab202.dyindude` with the filename you referenced in `named.conf.local`.

Open your zonefile in your editor. Replace all occurrences of `lab202.dyindude` in the file with your desired hostname.

After making these changes, you're ready to reload the `bind9` service, which controls `named`.

    # service bind9 reload #reloads the bind9 service
    # service bind9 status #will show the current status of bind9 so you can make sure it's still up
    # service bind9 restart #will forcibly restart the service if it's crashed and you need to fix something

Now that your zone is set up, move to `client` and perform dns lookups on the hostnames you created in your zone.

# Trivia
- As stated in the summary, `named` is the `nameserver daemon`. `bind` stands for the Berkeley Internet Name Domain, which includes a number of other utilities including `named`.
- Many nameserver administrators have configured their nameservers to not honor TTL if the number is lower than their standard, which can cause variances in the completion of DNS propagation.

# WIP notes plz ignore
- Root DNS servers - ref: https://www.iana.org/domains/root/servers
- There are a lot of TLDs these days,
  ~~but some have been reserved as "local" domains~~
  nope bruh, no one seems to know: https://en.wikipedia.org/wiki/.local

  glue records? (more advanced topic, we haven't gotten to setting up a real domain yet)
  what are the other zone classes? (IN for Internet)


# Further reading
- https://serverfault.com/questions/85408/soa-and-primary-ns-record-dns https://tools.ietf.org/html/draft-jabley-dnsop-missing-mname-00 <sup>1</sup>
- https://en.wikipedia.org/wiki/Time_to_live
- https://en.wikipedia.org/wiki/SOA_Resource_Record
- https://tools.ietf.org/html/rfc1035
- https://en.wikipedia.org/wiki/BIND
- https://serverfault.com/questions/132352/difference-between-named-and-bind
- http://manpages.ubuntu.com/manpages/precise/en/man8/named.8.html
