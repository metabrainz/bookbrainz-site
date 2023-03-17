#!/bin/bash

DB_HOSTNAME=postgres
DB_PORT=5432
DB_USER=bookbrainz
DB_NAME=bookbrainz

DUMP_DIR=/tmp/bookbrainz-dumps
DUMP_FILE=$DUMP_DIR/latest.sql.bz2

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

bzcat $DUMP_FILE | psql -h $DB_HOSTNAME -p $DB_PORT -U $DB_USER -d $DB_NAME
if [ $? -ne 0 ]
then
    echo "Importing the bookbrainz database failed."
    exit $?
fi

# Clean up the dump file if it imported correctly.
rm -f $DUMP_FILE
