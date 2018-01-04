# http 201-http-api

In this lab, we'll be performing requests against a simple API endpoint that has been configured to return the same JSON payload that is `POST` to it. We'll do requests from the command line on the server, and try it out from the browser as well.

# JSON

Many modern APIs return data in `JSON` (**J**ava**S**cript **O**bject **N**otation) format. This is because the most common consumer of data from those APIs in a web browser are frontend applications written in JavaScript.

This Vagrantfile provided with this lab sets up a simple node.js api endpoint at `/api` that returns the same data you provide to it via `POST`.

The `JSON` payloads we'll be working with in this example are relatively simple key-value pairs:

```
{ "user": "test" }

{
  "someID": "foo",
  "someOtherID": "bar",
  "anotherID": "baz"
}
```

# Exercise 1

Get into a shell of the system provided with this lab by running `vagrant ssh`.

With `curl`, you can provide data to a `POST` request by appending the `-d` flag in the command, followed by the `data` you wish to submit with the request.

Start by providing a simple `JSON` object assigning the value of `test` to the key `name`:

`curl -XPOST -d '{"name": "test"}' http://localhost/api`

You'll notice the output you receive is not the same as that which you provided. This is because no `Content-Type` header was included with the request. While some APIs may assume your input data to always be JSON, it's best practice to assume you have to specify the type of data you are sending by providing `application/json` in a `Content-Type` header.

With `curl`, request headers can be provided using the `-H` flag. Multiple headers can be passed in the same invocation of `curl` if necessary (e.g. `curl -H "header1: foo" -H "header2: bar"`)

Try the same request above, appending the `Content-Type` header to the command:

`curl -XPOST -H "Content-Type: application/json" -d '{"name": "test"}' http://localhost/api`

If you've provided a valid JSON object as the `POST` data, you should receive the same output as provided in the input.

Try this again with a more complex object, like `{ "someID": "foo", "someOtherID": "bar", "anotherID": "baz" }` and see what you get.

# Exercise 2

Along with the simple API endpoint, a web application is listening on the server at http://172.27.27.27

Open this page in your browser. You'll see that by clicking the `submit` button, the values for `someID`, `someOtherID`, and `anotherID` are updated on the page.

- Try providing other values for `someID`, `someOtherID`, `anotherID`.
- Try providing other values in your payload.
- Try removing `someID`, `someOtherID`, `anotherID` from your payload altogether.
- Open your browser's dev console on the page. Construct a JSON object in a variable:

  ```
  var data = { "someID": "foolish", "someOtherID": "barter", "anotherID": "bazaar" }
  ```

  One of the JavaScript functions defined in the webapp is called `postData()`, which will `POST` a provided variable (expecting a JSON object) to our API endpoint. Try providing `data` to this function and see what happens on the page:

  ```
  postData(data)
  ```

# Trivia
- In Exercise 1, the data you got back from the server without `Content-Type: application/json` is still technically valid JSON. Why would it not be useful for you in an application?

# Further Reading
- https://en.wikipedia.org/wiki/JSON
- https://www.json.org/
