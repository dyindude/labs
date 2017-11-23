# docker 201-building-a-container
This lab will walk you through taking an existing webapp and writing a Dockerfile/building a container for it.
We'll start by examining a `Dockerfile` and `docker-compose.yml` built for the app used in the `201-http-api` lab.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder

Log into the system for this lab with `vagrant ssh`, and take a look at the files in the `simple-http-api` folder:

```
app                 # node.js application with our simple API
docker-compose.yml  # docker-compose configuration
Dockerfile          # the Dockerfile for this lab
nginx-default.conf  # nginx container configuration file
                    # (used in docker-compose.yml)
static              # static files for the frontend of the webapp
                    # (used in docker-compose.yml)
```


# Dockerfile
Much like `Vagrantfile`s are used to describe the configuration of a virtual machine, `Dockerfiles` are simple files used to describe the configuration of Docker containers.

Let's take a look at `simple-http-api/Dockerfile`:

```
FROM alpine:latest

WORKDIR /app

COPY app/ /app/

RUN apk -Uuv add nodejs nodejs-npm && \
    npm install -g nodemon && \
    npm install

EXPOSE 3000

CMD [ "nodemon", "index.js" ]
```

- *FROM* - this line indicates the base container image we'll be working with, in this case `alpine` with the tag `latest`
- *WORKDIR* - specifies the directory from which other commands in the Dockerfile will be ran during the build process
- *COPY* - copies specified files and/or folders from our working directory into the specified path in the container
- *RUN* - runs shell commands from within the container during the **build** process. It's important to understand that this directive is during the build context, and not while the container is running.
- *EXPOSE* - defines which ports should be exposed by default to other running containers
- *CMD* - defines the command that will be ran by the container when it starts. Unless you are packaging up a command line utility in a container, this should be a command which runs in the foreground and doesn't exit - otherwise your container will exit when the process exits.

This is a simple example of a Dockerfile that can be used to run a node.js application (there are even simpler examples if you use the official node.js containers, but that makes it a little more difficult to explain the process)

# Exercise 1

Now that we've had a look inside the Dockerfile, let's build a copy of our container.

From the `simple-http-api` folder, run the command:

`$ docker build -t simple-http-api .`

- `docker` - the `docker` command line utility is used to communicate with the `docker` daemon running either on the local machine or another machine
- `build` - is the command we're using here, to `build` our container
- `-t simple-http-api` - instructs the `build` command to `tag` the resulting container with the tag `simple-http-api`
- `.` - the folder containing the `Dockerfile` that we want to `build`, in this case, the current folder (or `.`)

As you watch the container build, you'll see the process step through each of the commands outlined in the Dockerfile.

- try adding another package to install, such as `vim` to the Dockerfile and re-running the `docker build` command.
- try copying another file in the container by adding the following line somewhere in `Dockerfile` before the `CMD` line:
  `COPY nginx-default.conf /nginx-default.conf`
- try to distinguish how this affects the `build` process. Where does it pick up from? (hint: `using cache` indicates that step of the `build` was cached from a previous version)

Now run `docker images` to list the built container images you now have on the local machine. You should see an entry for both `alpine` (the image we used as the basis for our container), as well as the image we built - `simple-http-api`

Run `docker run --rm -d -P simple-http-api`

- `run` - tells `docker` that we want to `run` a container
- `--rm` - we want to `rm` or `remove` the container after it exits (not the image - #expound on this)
- `-d` - after launching our container as a daemon, the `docker` command will exit. Without this flag, the `docker` command will run the container in the foreground (useful for debugging)
- `-P` - expose any ports defined in the `Dockerfile` with the `EXPOSE` directive to the host machine
- `simple-http-api` - the name of the container `image` that we want to run

After the `docker` command exits, it will provide a long string of letters and numbers indicating the ID of the newly launched container:

`6a518a346351d6b6ad70a703c84cb74e07dd9a4ce9b35f2cc9b570bb7a383632`

- You can use this ID when interacting with other `docker` commands to perform tasks on the running container.
- Since this will be the only container running on the machine, you don't have to type out the full ID - you can get away with typing the first 3 or 4 characters and the command line utility is smart enough to complete the ID for you when referencing it internally.
- In the next few examples, I'll be using `6a5` to indicate the container ID. When you work through this lab, be sure to use the first 3 characters of the ID shown on your screen.

In case you've already lost or forgotten your ID, you can get information about running containers by running `docker ps`. The first field shown is the `CONTAINER ID`.


# Exercise 2




# Trivia
# Further reading

- https://docs.docker.com/engine/reference/builder/
- https://docs.docker.com/engine/reference/run/
- simple-api-http

- docker run
- docker-compose


