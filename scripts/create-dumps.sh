#!/usr/bin/env bash

set -e

source /home/bookbrainz/bookbrainz-site/scripts/config.sh

# Switch directory
pushd /home/bookbrainz/data/dumps


DUMP_FILE=bookbrainz-dump-`date -I`.sql
COLLECTIONS_DUMP_FILE=bookbrainz-collections-dump-`date -I`.sql

echo "Creating data dump..."

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
echo "Main dump created!"

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
	-t public_user_collection\
	-t public_user_collection_item\
	-t public_user_collection_collaborator\
	--serializable-deferrable\
	bookbrainz \
	| sed 's/public_user_collection/user_collection/' > /tmp/$COLLECTIONS_DUMP_FILE
echo "Public collections dump created!"

echo "Cleaning up temporary public collections tables"
psql\
	-h $POSTGRES_HOST \
	-p $POSTGRES_PORT \
	-U bookbrainz \
	bookbrainz < /home/bookbrainz/bookbrainz-site/scripts/clean-public-collection-dump-tables.sql
echo "Temporary public collections tables removed"


# Compress new backups and move to dump dir
echo "Combining and compressing..."
rm -f /tmp/$DUMP_FILE.tar.gz
tar -czvf /tmp/$DUMP_FILE.tar.gz /tmp/$DUMP_FILE /tmp/$COLLECTIONS_DUMP_FILE
mv /tmp/$DUMP_FILE.tar.gz .
echo "Compressed!"

echo "Removing old dumps..."
rm -f /tmp/*.sql
# Remove backups older than 8 days
find ./ -name '*.tar.gz' -type f -mtime +7 -print | xargs /bin/rm -f
echo "Done!"

rm -f latest.tar.gz
ln -s $DUMP_FILE.tar.gz latest.tar.gz

# Generate hashes
echo "Generating hashes..."
md5sum *.sql.tar.gz > MD5SUMS
sha256sum *.sql.tar.gz > SHA256SUMS
echo "Done!"

chown bookbrainz:bookbrainz ./*
chmod 644 ./*

popd

exit 0
