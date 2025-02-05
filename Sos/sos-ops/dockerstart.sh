#!/bin/bash

if [ "$DATABASE_DEPLOYMENT" = "local" ]
then
      echo "\$DATABASE_DEPLOYMENT is local, need to run local ${DATABASE_TYPE} container."
      CONTAINERS_TO_RUN="-f docker-node.yml -f docker-${DATABASE_TYPE}.yml"
else
      echo "\$DATABASE_DEPLOYMENT is empty, using DATABASE_URI : ${DATABASE_URI}"
      CONTAINERS_TO_RUN="-f docker-node.yml"
fi

echo "THIS IS WHAT IMRAN SAYS IS NOT HAPPING: ${DATABASE_USER}"

docker-compose -f docker-node.yml -f docker-postgres.yml down

docker-compose $CONTAINERS_TO_RUN up  -d