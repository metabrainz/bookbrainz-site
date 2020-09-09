#!/bin/bash

DUMP_DIR=/tmp/bookbrainz-dumps
DUMP_FILE=$DUMP_DIR/latest.tar.gz

if [ -f $DUMP_FILE ]; then
    echo "A bookbrainz dump file, already exists. Using that to import."
    echo "To force a re-download of the data, please remove $DUMP_FILE"
else
    mkdir -p $DUMP_DIR
    curl -o $DUMP_FILE ftp://ftp.musicbrainz.org/pub/musicbrainz/bookbrainz/latest.tar.gz
    if [ $? -ne 0 ]
    then
        echo "Downloading the bookbrainz data dump failed."
        exit $?
    fi
fi

tar -xf $DUMP_FILE --directory $DUMP_DIR

for dumpfile in $DUMP_DIR/tmp/*
do
	psql -h localhost -U postgres -d bookbrainz < $dumpfile
done

if [ $? -ne 0 ]
then
    echo "Importing the bookbrainz database failed."
    exit $?
fi

# Clean up the dump file if it imported correctly.
rm -rf $DUMP_FILE $DUMP_DIR/tmp
