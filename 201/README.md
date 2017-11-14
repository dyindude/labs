# dns 201
In this lab we'll be covering some initermediate topics related to DNS:
- taking a look at how a few different DNS server software packages work
  - dnsmasq
  - bind
  - nsd
The provided `Vagrantfile` will create two virtual machines for this lab:
- server
- client

To access one of the machines, you'll need to specify which by providing the name of the machine when invoking `vagrant ssh`:
`vagrant ssh client`
