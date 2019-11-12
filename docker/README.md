# Installation with docker

## First Time

+ Download the repo and go into the folder docker
+ Replace the data in the *.env_file*  with your own values and save the *.env_file* as *.env* in the docker container
+ Build the docker images with `docker-compose build`
+ Deploy the build images with `docker-compose up`

## Replace running image
+ To update a container `docker-compose up -d --no-deps --build <service_name>`
