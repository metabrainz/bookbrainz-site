#!/bin/bash

if [[ ! -d "src" ]]; then
    echo "This script must be run from the top level directory of the bookbrainz-site source."
    exit -1
fi

echo "Checking docker compose version"
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi


$DOCKER_COMPOSE_CMD run --rm startup &&
$DOCKER_COMPOSE_CMD up --build bookbrainz-site
