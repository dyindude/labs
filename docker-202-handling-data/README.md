# docker 202-handling-data

In this lab we'll learn about covering the basics about different ways you can handle persistence of data with Docker containers.

# Setup
- If you haven't already, follow the instructions in https://github.com/dyindude/vagrant-lab to install VirtualBox and Vagrant
- Download a copy of this repo, navigate to its folder and run `vagrant up`, followed by `vagrant ssh`
- You'll now be in a shell of a virtual machine configured for this lab.
- When you're done, if something in the lab messes up, or you just want to restart from scratch, type `exit` in the terminal to leave the SSH connection and run `vagrant destroy` from the project folder

# About data persistence in Docker
By default, containers only have ephemeral storage that is available to them while the container is running. When the container is stopped or destroyed, the data is destroyed along with it.

A lot of applications will require some level of data persistence at one layer or another. Docker handles this with the concept of `volumes`.

# Volumes
In docker, there are three types of volumes. All three volume types behave the same way, but the type of volume will help to determine where on the host machine's filesystem the volume's files are stored.

- `host volumes` - files in the volume are stored on the host's filesystem

   ```
   # example using a host folder as a volume within an alpine container, mounting it at /mnt
   $ ls wordpress
   docker-compose.yml
   $ docker run --rm -it -v /home/ubuntu/wordpress/:/mnt alpine /bin/sh
   / # ls /mnt
   docker-compose.yml
   / # 
   $ docker inspect 1a5
     ...
	"Mounts": [
		{
			"Type": "bind",
			"Source": "/home/ubuntu/wordpress",
			"Destination": "/mnt",
			"Mode": "",
			"RW": true,
			"Propagation": "rprivate"
		}
	],
      ...
     ```
	
- `named volumes` - explicitly named volumes that can be accessed by one or more containers that have been mapped to it

    ```
    # example for creating a named volume, then mounting it at /mnt in an alpine container
    $ docker volume create myvolume
    $ docker volume ls
    DRIVER              VOLUME NAME
    local               myvolume
    $ docker run --rm -it -v myvolume:/mnt alpine /bin/sh
    $ docker inspect e44
      ...
		"Mounts": [
		{
			"Type": "volume",
			"Name": "myvolume",
			"Source": "/var/lib/docker/volumes/myvolume/_data",
			"Destination": "/mnt",
			"Driver": "local",
			"Mode": "z",
			"RW": true,
			"Propagation": ""
		}
   ],
      ...
    ```

- `anonymous volumes` - if no name is defined for a volume when a container is launched, Docker will create a randomly generated name for a volume that is guaranteed to be unique on that Docker host. Anonymous volumes behave the same way within containers as named volumes.

    ```
    # example for creating an anonymous volume, mounted at /mnt in an alpine container
    $ docker run --rm -it -v /mnt alpine /bin/sh
    $ docker volume ls
    DRIVER              VOLUME NAME
    local               39cc665f430b6be72ce90d2e53a5b5b70955a5ae3bbdd85c0586b447df92adfb
    $ docker inspect ab9
      ...
	"Mounts": [
		{
			"Type": "volume",
			"Name": "39cc665f430b6be72ce90d2e53a5b5b70955a5ae3bbdd85c0586b447df92adfb",
			"Source": "/var/lib/docker/volumes/39cc665f430b6be72ce90d2e53a5b5b70955a5ae3bbdd85c0586b447df92adfb/_data",
			"Destination": "/mnt",
			"Driver": "local",
			"Mode": "",
			"RW": true,
			"Propagation": ""
		}
   ],
      ...
    ``` 

Notice that all three of these examples use the default `local` driver, which means the files the container writes/reads from are stored in the folder at the location noted in the `Source` field of the Mounts metadata.

# Exercise 1
Launch the virtual machine included with this lab with `vagrant up` and gain shell access with `vagrant ssh`.

Enter the `wordpress/novolumes` folder and run `docker-compose up -d`

Access Wordpress at http://172.27.27.27 and perform the initial setup of wordpress. Make some changes in the interface. Make a post in the instance of Wordpress.

run `docker-compose down`
run `docker-compose up -d` again, and visit http://172.27.27.27
What happened here?
run `docker-compose down` to ensure these containers are destroyed.

# Volumes in docker-compose
Take a look at these two `docker-compose.yml` files:

- `wordpress/novolumes/docker-compose.yml`
- `wordpress/volumes/docker-compose.yml`

You'll see that one of them defines `volumes` for application data persistence for both the Wordpress and mysql containers:

```
volumes:
  db-data:
  wordpress-data:
```

As well as mappings within the `wordpress` and `mysql` services that mount these volumes to locations within their containers:

```
...
    volumes:
      - wordpress-data:/var/www/html/wp-content
...
    volumes:
      - db-data:/var/lib/mysql
...
```

Note how this syntax is the same as when defining a volume for a container on the command line. Compare these with the `docker-compose.yml` from the previous lab.

# Exercise 2
Switch to the `wordpress/volumes` folder and run `docker-compose up -d`

Access Wordpress at http://172.27.27.27 and perform the initial setup of wordpress. Make some changes in the interface. Make a post in the instance of Wordpress.

run `docker-compose down`
run `docker-compose up -d` again, and visit http://172.27.27.27
What happened here?

Take a look at `docker volume ls` to see the list of volumes that were created.
Take a look at the `Mounts` section of the output for `docker inspect` of these two containers. Look at the contents of the folders on the host *hint*: you will need to be `root` or use `sudo` to view the contents of these folders.

# A note on data backup within Docker
As indicated before, the contents of the folders of `volumes` is visible from the host filesystem. Technically speaking, you could just run a job on the host system to back up the contents of these folders to ensure the data was backed up. However, this is bad practice for the following reasons:

- Running a container on the local Docker host is only one of many ways that a container can be used. Tying backup logic to the host system means that the long-term persistence of the data relies on the existence of that host, and breaks the ability to move that data to another system (another Docker host, kubernetes/ECS cluster, etc)
- 


- handy stuff
# run a simple shell in an alpine container to inspect what's on a docker volume
# docker run --rm -t -i --name mount -v simplehttpapi_pihole-data:/mnt alpine:latest /bin/sh

# proof of simple command to backup data on a container volume to a tarball
docker run --rm -t -i --name mount -v pihole_pihole-data:/mnt -v $(pwd)/backup:/backup alpine:latest tar cfvj /backup/backup.tar.bz2 -C /mnt .
# proof of simple command to restore data on a container volume from a tarball
docker run --rm -t -i --name mount -v pihole_pihole-data:/mnt -v $(pwd)/backup:/backup alpine:latest tar xfvj /backup/backup.tar.bz2 -C /mnt

lab steps:

- run backup commands manually
  - docker volume ls, get volume names (wordpress_db-data, wordpress_wordpress-data)
  ```
  for volume in wordpress_db-data wordpress_wordpress-data;do
  docker run --rm -t -i --name mount -v $volume:/mnt -v $(pwd)/backup:/backup alpine:latest tar cfvj /backup/$volume.tar.bz2 -C /mnt .
  done
  ```
- destroy volumes
- docker-compose up #show the app doesn't work / is back to square one
- docker-compose down
- restore data from volume backups
  ```
  for volume in wordpress_db-data wordpress_wordpress-data;do
  docker run --rm -t -i --name mount -v $volume:/mnt -v $(pwd)/backup:/backup alpine:latest sh -c "rm -rf /mnt/* && tar xfvj /backup/$v.tar.bz2 -C /mnt"
  done
  ```
- docker-compose up
- see our changes still there
- show example using logrotate


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

In case you've already lost or forgotten your ID, you can get information about running containers by running `docker ps`.

- `CONTAINER ID` - the ID of the running container
- `IMAGE` - the docker `image` that was copied for the running container
- `COMMAND` - the command running as the primary process of the container (we defined this in the `Dockerfile`)
- `CREATED` - the time that has elapsed since the container (not the image) was first created
- `STATUS` - the time that has elapsed since the container was last started (often the same timeframe as `CREATED` unless the container was stopped and then started again
- `PORTS` - if any ports have been `EXPOSE`d in the `Dockerfile` of the `image`, they will be listed here. Since we passed the `-P` flag when we ran the container, you also see the port number on the host that has been mapped to the exposed port:
  `0.0.0.0:32776->3000/tcp`
- `NAMES` - any names assigned to the running container. A name can be specified at the command line when launching the container with `--name`, otherwise `docker` will generate a name for you. This name can be used in the place of the container ID when trying to run other commands.

Since the port of our application has been `EXPOSE`d to the host, try running some of the commands from the lab `201-http-api` against `localhost:[port]/api`:

  `$ curl -XPOST -H "Content-Type: application/json" -d '{"user": "test"}' http://localhost:32776/api`

You'll see that the application behaves the same - but this time it's running in a Docker container instead of on the host machine.

# docker-compose

In the next exercise, we'll be packinging up our frontend and placing it in a container running `nginx`.

However, instead of building a second container for `nginx` by writing a Dockerfile, we'll override some of the existing contents of the official `nginx` container image using `docker-compose`.

Take a look at `docker-compose.yml`:

```
version: '2'
services:
  simple-http-api:
    build: .
    expose:
      - "3000"
  nginx:
    image: nginx:latest
    links:
      - simple-http-api
    volumes:
      - "./nginx-default.conf:/etc/nginx/conf.d/default.conf"
      - "./static/:/static"
    ports:
      - "80:80"
```

`docker-compose` allows one to describe more complex container environments, building relationships between different containers isntead of having to create `links` between them by hand using the command line `docker` utility.

- `version` - the `version` spec that this `docker-compose.yml` conforms to #expound on this?
- `services` - a configuration block containing all of the descriptions of the containers, ports they expose, links, and other configuration options. Each section within `services` defines a name for a service, followed by any other options associated with that service. In this case, our two `services` are `simple-http-api` and `nginx`.
- `simple-http-api` - In this service, we define that
  - we want to run the container from an image that is built using `docker build` in the current folder `.`
  - this container exposes port `3000` to other running containers. #is this any container on the server, or just within the scope of this `docker-compose.yml`?
- `nginx` - In this service, we define that
  - we want to run the container from the public dockerhub image `nginx` with the tag `latest`
  - this service creates a `link` to `simple-http-api`, which means that it needs access to any ports `EXPOSE`d by `simple-http-api`
  - this service relies on a volume that maps files/folders (`nginx-default.conf` and `static/`) to locations within the filesystem of the running container
    - mounting volumes this way will overwrite files that exist in the container image. In this case, we are effectively replacing `/etc/nginx/conf.d/default.conf` with the copy that is in our working folder with the name `nginx-default.conf` and mounting `/static` to a new folder in the container.
  - This service exposes port `80` and maps it to port `80` on the host.

# Exercise 2

Now that we understand how the `docker-compose.yml` file describes our environment, let's deploy it! Run the following command from the `simple-http-api` folder:

`$ docker-compose up -d`

This instructs `docker-compose` to build/fetch the containers described in `docker-compose.yml` and launch them in daemon mode (similar to `docker run -d` with a single container image)

- Once the containers are up and running, you can inspect information about both containers by running `docker ps`.
  - notice that the `NAMES` fields for these containers has been built from information in `docker-compose.yml`: `[foldername]_[servicename]_[#]`
  - the `simple-http-api` container shows an exposed port, but it is not mapped to any port on the host. As such, it is not accessible from the host network, only from other containers.
- Like the `201-http-api` lab, you should be able to now access the same webapp from `http://172.27.27.27` and run through the exercises in that lab, seeing the same behavior. The only difference is that the application for the API endpoint is now running in a container, and we've split `nginx` into its own container as well.

Run `docker-compose down` to destroy both containers.




# Trivia
- `named volumes` can be created with tools like `docker-compose`, service descriptions on Kubernetes/ECS/OpenShift and still receive a unique name
# Further reading

- https://docs.docker.com/engine/reference/builder/
- https://docs.docker.com/engine/reference/run/
- simple-api-http

- docker run
- docker-compose



