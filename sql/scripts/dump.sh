#!/usr/bin/env bash

# Swtich directory
pushd $1

# Dump new backup
pg_dump\
	-U bookbrainz\
	-Ft -E UTF8 -f `date -I`.tar\
	-T _editor_entity_visits\
	 --serializable-deferrable\
	 bookbrainz

# Add this line back in when official server runs >9.2
#	 --exclude-table-data=_editor_entity_visits

# Compress new backup
bzip2 `date -I`.tar

# Remove backups older than 14 days
find ./ -name '*.tar.bz2' -type f -mtime +13 -print | xargs /bin/rm -f

# Generate hashes
md5sum *.tar.bz2 > MD5SUMS
sha256sum *.tar.bz2 > SHA256SUMS

chmod 644 ./*

popd
