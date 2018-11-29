#!/usr/bin/env bash

docker-compose build &&
docker-compose pull &&
docker-compose up -d postgres &&
docker-compose exec bookbrainz-site scripts/create-db.sh &&
docker-compose exec bookbrainz-site scripts/download-import-dump.sh