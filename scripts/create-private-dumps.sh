#!/usr/bin/env bash

set -e

source /home/bookbrainz/bookbrainz-site/scripts/config.sh

PRIVATE_BACKUP_FOLDER=/mnt/private_backup
PRIVATE_DUMP_FILE=bookbrainz-full-dump-$(date -I).sql

# Switch directory
pushd $PRIVATE_BACKUP_FOLDER

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

chmod 600 ./*

popd

exit 0
