#!/bin/bash

if [[ ! -d "docker" ]]; then
    echo "This script must be run from the top level directory of the bookbrainz-site source."
    exit -1
fi

docker-compose -f docker/docker-compose.yml -p bookbrainz build && docker-compose -f docker/docker-compose.yml -p bookbrainz up
