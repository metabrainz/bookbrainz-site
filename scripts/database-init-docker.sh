#!/usr/bin/env bash

docker-compose build &&
docker-compose run --rm bookbrainz-site scripts/wait-for-postgres.sh scripts/create-db.sh &&
docker-compose run --rm bookbrainz-site scripts/wait-for-postgres.sh scripts/download-import-dump.sh