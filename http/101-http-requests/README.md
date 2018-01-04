# http 101-http-requests
- In this lab, you'll go through a few examples of seeing how raw HTTP requests work.

# It's all (mostly) text!
Something that wasn't very apparent to me when I started working with web services is the fact that most requests and responses served up by an HTTP server is simply text being sent to/from the server.

Binary data, such as images, are sent in their binary form - but these are handled in separate requests by your web browser. #wording?

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
  - The output of this request will include what are called `response` headers

- Try all of this again using `HEAD` instead of `GET` in your requests

# Exercise 2
In the same shell, take a look at the content of the page and its headers using `curl`:

`$ curl http://localhost`

With curl, you can request only the `headers` of the response with the `-I` or `--head` flag:

`$ curl -I http://localhost`

Try the same with a few other hostnames you may recognize:

- `www.google.com`
- `www.twitch.tv`
- `www.twitter.com`

Try loading `http://172.27.27.27/` in your web browser. Open your browser's developer tools and refresh the page. Compare the headers you see to the ones you got in the terminal.

# Trivia
- Using `HEAD` as your request method instructs the server to only return the headers of the request. This can be useful when troubleshooting if you just want to check for the response code or look for a specific response header and don't necessarily care about seeing the full content of the page in your terminal.
- Data stored in the headers of a request is not shown in the main view of most web browsers. It's important to understand that the headers and content are served up separately - the content is what is displayed to the user, the headers can be used to store information for the frontend application to use (session ID, for example)
- The headers you get in a browser may be different from the ones you get doing it with `netcat` or `curl`, because no `User-Agent` header has been set. `User-Agent` is a header implemented by most web browsers to indicate the software and version of the software to make the request, to help web developers design webpages that render similarly regardless of which browser is making the request.

# Further reading
- https://www.ietf.org/rfc/rfc2616.txt
