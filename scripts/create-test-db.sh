#!/bin/bash

# set up variables with defaults
: "${POSTGRES_USER:=bookbrainz}"
: "${POSTGRES_PASSWORD:=}"
: "${POSTGRES_DB:=bookbrainz_test}"
: "${POSTGRES_HOST:=postgres}"

export PGPASSWORD=$POSTGRES_PASSWORD

psql -c "CREATE DATABASE ${POSTGRES_DB};" -U $POSTGRES_USER -h $POSTGRES_HOST
psql -c 'CREATE EXTENSION "uuid-ossp"; CREATE SCHEMA musicbrainz; CREATE SCHEMA bookbrainz;' -d $POSTGRES_DB -U $POSTGRES_USER -h $POSTGRES_HOST
psql -f sql/schemas/musicbrainz.sql -d $POSTGRES_DB -U $POSTGRES_USER -h $POSTGRES_HOST
psql -f sql/schemas/bookbrainz.sql -d $POSTGRES_DB -U $POSTGRES_USER -h $POSTGRES_HOST
psql -f sql/scripts/create_triggers.sql -d $POSTGRES_DB -U $POSTGRES_USER -h $POSTGRES_HOST
