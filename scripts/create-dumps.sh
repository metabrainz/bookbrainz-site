#!/usr/bin/env bash

# NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE 
# This is a saved script that is running in production. We don't know where
this might be kept in repo, so we'e checking a version in here for safe keeping.
# This script will NOT work outside the gcloud hosted bookbrainz.org site. 
# It will need to be adapted for the Hetzner production setup.
# NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE NOTE 

# Switch directory
pushd /home/bookbrainz/bookbrainz.org/bookbrainz-docker-prod/dumps

DUMP_FILE=bookbrainz-dump-`date -I`.sql

export PGPASSWORD="postgres"
# Dump new backup to /tmp
pg_dump\
	-h localhost\
	-U postgres\
	-T _editor_entity_visits\
	 --serializable-deferrable\
	 bookbrainz > /tmp/$DUMP_FILE

# Compress new backup and move to dump dir
rm -f /tmp/$DUMP_FILE.bz2
bzip2 /tmp/$DUMP_FILE
mv /tmp/$DUMP_FILE.bz2 .

rm -f /tmp/*.sql
# Remove backups older than 8 days
find ./ -name '*.sql.bz2' -type f -mtime +7 -print | xargs /bin/rm -f

rm -f latest.sql.bz2
ln -s $DUMP_FILE.bz2 latest.sql.bz2

# Generate hashes
md5sum *.sql.bz2 > MD5SUMS
sha256sum *.sql.bz2 > SHA256SUMS

chown bookbrainz:bookbrainz ./*
chmod 644 ./*

popd
