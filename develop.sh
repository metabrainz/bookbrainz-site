#!/bin/bash

if [[ ! -d "src" ]]; then
    echo "This script must be run from the top level directory of the bookbrainz-site source."
    exit -1
fi

docker-compose -f ./docker/docker-compose.dev.yml run --rm startup &&
docker-compose -f ./docker/docker-compose.dev.yml up --build bookbrainz-site
