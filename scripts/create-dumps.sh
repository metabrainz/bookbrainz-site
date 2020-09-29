#!/usr/bin/env bash

set -e

source /home/bookbrainz/bookbrainz-site/scripts/config.sh

# Switch directory
pushd /home/bookbrainz/data/dumps


PRIVATE_DUMP_FILE=bookbrainz-full-dump-`date -I`.sql
DUMP_FILE=bookbrainz-dump-`date -I`.sql
COLLECTIONS_DUMP_FILE=bookbrainz-collections-dump-`date -I`.sql
BACKUP_FOLDER=/home/bookbrainz/backup

echo "Creating private data dump..."
# Dump new backup to /tmp
pg_dump\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	 --serializable-deferrable\
	 bookbrainz > /tmp/$PRIVATE_DUMP_FILE
echo "Main private dump created!"

echo "Creating public data dump..."
# Dump new backup to /tmp
pg_dump\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	-T _editor_entity_visits\
	-T user_collection\
	-T user_collection_collaborator\
	-T user_collection_item\
	 --serializable-deferrable\
	 bookbrainz > /tmp/$DUMP_FILE
echo "Main public dump created!"

echo "Creating public collections dump..."
# Create tables with public collections and items
psql -h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	-d bookbrainz \
	< /home/bookbrainz/bookbrainz-site/scripts/create-public-collection-dumps.sql
	
# Dump public collections backup to /tmp
pg_dump\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	-t tmp_public_user_collection\
	-t tmp_public_user_collection_item\
	-t tmp_public_user_collection_collaborator\
	--serializable-deferrable\
	bookbrainz \
	> /tmp/$COLLECTIONS_DUMP_FILE
echo "Public collections dump created!"

echo "Concatenating dump files"
sed 's/[pP]ublic_user_collection/user_collection/g' /tmp/$COLLECTIONS_DUMP_FILE >> /tmp/$DUMP_FILE

echo "Cleaning up temporary public collections tables"
psql\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	bookbrainz < /home/bookbrainz/bookbrainz-site/scripts/clean-public-collection-dump-tables.sql
rm /tmp/$COLLECTIONS_DUMP_FILE
echo "Temporary public collections tables removed"

# Compress new backup and move to dump dir
echo "Compressing..."
rm -f /tmp/$DUMP_FILE.bz2
bzip2 /tmp/$DUMP_FILE
mv /tmp/$DUMP_FILE.bz2 .
echo "Compressed!"

echo "Compressing and moving full private dump"
bzip2 /tmp/$PRIVATE_DUMP_FILE
mv /tmp/$PRIVATE_DUMP_FILE.bz2 $BACKUP_FOLDER
echo "Full private dump compressed and moved"

echo "Removing old dumps..."
rm -f /tmp/*.sql
# Remove backups older than 8 days both in this directory and the full dump backup directory
find ./ $BACKUP_FOLDER -name '*.sql.bz2' -type f -mtime +7 -print | xargs /bin/rm -f
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
