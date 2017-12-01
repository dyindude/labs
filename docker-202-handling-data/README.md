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
- Avoiding the use of `host volumes` in general is recommended for similar reasons, since it creates a situation where migration/portability of the data and the containers using the data difficult.
- Because of the many abstraction layers that Docker places around storage, it's more consistent to back up the data you care about from within a container. However, the container you perform the backup from doesn't necessarily have to be the same one that you are using to run the application, which will be shown in the next exercise.

# Exercise 3
Ensure the docker containers you created in exercise 2 are not running by executing `docker-compose down` in `wordpress/volumes`.

By default, `docker-compose` creates volumes with the following naming convention:
- `CURRENTFOLDERNAME_VOLUMENAME`

Look for the volumes following the above naming convention:
- The current working directory you were in when running `docker-compose up -d` is named `volumes`
- The volumes associated with the `wordpress` and `mysql` containers are named `wordpress-data` and `db-data`, respectively
- Use `docker volume ls` to list the current volumes on the system.
- Use the following command (one at a time) with both volumes to open a shell in a temporary `alpine` container with the volume mounted to `/mnt`. Once in the shell, browse to `/mnt` and look through the data.

  ```
  $ docker run --rm -it -v VOLUMENAME:/mnt alpine /bin/sh
  ```

This method can be used as a simple way of inspecting data that is stored on a Docker volume.


# proof of simple command to backup data on a container volume to a tarball
docker run --rm -t -i --name mount -v pihole_pihole-data:/mnt -v $(pwd)/backup:/backup alpine:latest tar cfvj /backup/backup.tar.bz2 -C /mnt .
# proof of simple command to restore data on a container volume from a tarball
docker run --rm -t -i --name mount -v pihole_pihole-data:/mnt -v $(pwd)/backup:/backup alpine:latest tar xfvj /backup/backup.tar.bz2 -C /mnt

# migration oneliner
docker run --rm -v <SOURCE_DATA_VOLUME_NAME>:/from alpine ash -c "cd /from ; tar -cf - . " | ssh <TARGET_HOST> 'docker run --rm -i -v <TARGET_DATA_VOLUME_NAME>:/to alpine ash -c "cd /to ; tar -xpvf - " '

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
- show example using logrotate?



# Trivia
- `named volumes` can be created with tools like `docker-compose`, service descriptions on Kubernetes/ECS/OpenShift and still receive a unique name
# Further reading

- https://docs.docker.com/engine/reference/builder/
- https://docs.docker.com/engine/reference/run/
- simple-api-http

- docker run
- docker-compose



