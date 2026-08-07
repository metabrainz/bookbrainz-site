#!/usr/bin/env bash

set -e

BB_SERVER_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../" && pwd)

source $BB_SERVER_ROOT/scripts/config.sh
source $BB_SERVER_ROOT/scripts/functions.sh

PRIVATE_DUMP_FILE=bookbrainz-full-dump-$(date -I).sql

# Check that the directory exists
if [ -d $PRIVATE_BACKUP_FOLDER ]; then
    echo "Private backup folder exists at $PRIVATE_BACKUP_FOLDER"
else
    echo "Private backup folder does not exist at $PRIVATE_BACKUP_FOLDER, aborting"
	exit 1
fi

echo "Creating full private dump..."
pg_dump \
	-h "$POSTGRES_HOST" \
	-p "$POSTGRES_PORT" \
	-U bookbrainz \
	--serializable-deferrable \
	bookbrainz > "/tmp/$PRIVATE_DUMP_FILE"
echo "Full private dump created"

echo "Compressing and moving full private dump"
bzip2 /tmp/$PRIVATE_DUMP_FILE
mv /tmp/$PRIVATE_DUMP_FILE.bz2 $PRIVATE_BACKUP_FOLDER
echo "Full private dump compressed and moved"


echo "Removing old private dumps..."
# Remove private backups older than 14 days, provided there are at least 2 full dumps in there 
if [ "$(find "$PRIVATE_BACKUP_FOLDER" -maxdepth 1 -name '*.sql.bz2' -type f | sed -n '2p')" ]; then
	find "$PRIVATE_BACKUP_FOLDER" -maxdepth 1 -name '*.sql.bz2' -type f -mtime +14 -delete
fi
echo "Done!"

chmod 600 $PRIVATE_BACKUP_FOLDER/*

exit 0
