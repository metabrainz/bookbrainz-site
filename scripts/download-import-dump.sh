#!/bin/bash

# set up variables with defaults
: "${POSTGRES_USER:=bookbrainz}"
: "${POSTGRES_PASSWORD:=""}"
: "${POSTGRES_DB:=bookbrainz}"
: "${POSTGRES_HOST:=postgres}"
: "${POSTGRES_PORT:=5432}"

DUMP_DIR=/tmp/bookbrainz-dumps
DUMP_FILE=$DUMP_DIR/latest.sql.bz2

# Create the DB before restoring the dump
export PGPASSWORD=$POSTGRES_PASSWORD
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d postgres \
-c "CREATE DATABASE $POSTGRES_DB;"

if [ -f $DUMP_FILE ]; then
    echo "A bookbrainz dump file, already exists. Using that to import."
    echo "To force a re-download of the data, please remove $DUMP_FILE"
else
    mkdir -p $DUMP_DIR
    curl -o $DUMP_FILE ftp://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.sql.bz2
    if [ $? -ne 0 ]
    then
        echo "Downloading the bookbrainz data dump failed."
        exit $?
    fi
fi

bzcat $DUMP_FILE | psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB
if [ $? -ne 0 ]
then
    echo "Importing the bookbrainz database failed."
    exit $?
fi

# Clean up the dump file if it imported correctly.
rm -f $DUMP_FILE
