#!/usr/bin/env bash

echo "Checking docker compose version"
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

$DOCKER_COMPOSE_CMD build &&
$DOCKER_COMPOSE_CMD run --rm bookbrainz-site scripts/wait-for-postgres.sh scripts/download-import-dump.sh