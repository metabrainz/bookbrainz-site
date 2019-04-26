#!/usr/bin/env bash

set -e

source /home/bookbrainz/bookbrainz-site/scripts/config.sh

# Switch directory
pushd /home/bookbrainz/data/dumps


DUMP_FILE=bookbrainz-dump-`date -I`.sql

echo "Creating data dump..."

# Dump new backup to /tmp
pg_dump\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	-T _editor_entity_visits\
	 --serializable-deferrable\
	 bookbrainz > /tmp/$DUMP_FILE
echo "Dump created!"

# Compress new backup and move to dump dir
echo "Compressing..."
rm -f /tmp/$DUMP_FILE.bz2
bzip2 /tmp/$DUMP_FILE
mv /tmp/$DUMP_FILE.bz2 .
echo "Compressed!"

echo "Removing old dumps..."
rm -f /tmp/*.sql
# Remove backups older than 8 days
find ./ -name '*.sql.bz2' -type f -mtime +7 -print | xargs /bin/rm -f
echo "Done!"

rm -f latest.sql.bz2
ln -s $DUMP_FILE.bz2 latest.sql.bz2

# Generate hashes
echo "Generating hashes..."
md5sum *.sql.bz2 > MD5SUMS
sha256sum *.sql.bz2 > SHA256SUMS
echo "Done!"

chown bookbrainz:bookbrainz ./*
chmod 644 ./*

popd

exit 0
