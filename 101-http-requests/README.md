# http 101-http-requests
- In this lab, you'll go through a few examples of seeing how raw HTTP requests work.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- Many of the examples in this lab will require root access, so please run `sudo -i` after you gain shell access to the VM
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder 

# It's all text!
Something that wasn't very apparent to me when I started working with web services is the fact that every request and response served up by an HTTP server is simply text being sent to/from the server.

A very basic request from an HTTP client is in the form of `GET /`, which instructs the server to return the content of the data stored at `/` (often called the `root` of a website, since it is analogous to the `root` folder of a linux filesystem.

Because it's all text, you can recreate requests with common utilities such as `netcat` and `telnet` to reproduce issues or aid in troubleshooting (or in the case of this lab, just seeing how it all works)

`netcat` is a utility that allows you to type text (in this case. `netcat` also supports reading from `stdin`, so you could pipe output from another command, a text file, etc to its input and send it over) and send it to the designated hostname/IP on the specified port. The system in this lab has a basic webserver running on it, so you can send requests to `localhost` on the default HTTP port `80`.

# Exercise 1
Get into a shell of the system provided with this lab by running `vagrant ssh`.

Using `netcat`, initiate a connection to `localhost` on port `80`:

`$ nc localhost 80`

After hitting enter, the prompt will move down one line, and you can type your request.

- Type `GET /` followed by another `Enter`, and see the response you get back
- Initiate another connection with `nc localhost 80`. Type `GET / HTTP/1.0` instead.
  - You'll need to add another newline afterwards to terminate the request. Specifying `HTTP/1.0` in the request indicates that we may have some request headers to add to the request ##clarify/citation needed




# Trivia
# Further reading
