#!/usr/bin/env bash

set -e

source /home/bookbrainz/bookbrainz-site/scripts/config.sh

# Switch directory
pushd /home/bookbrainz/data/dumps


DUMP_FILE=bookbrainz-dump-$(date -I).sql

# Explicit allowlist for public database dumps. Keep this in sync with the
# tables that are safe to export.
EXPORTED_TABLES=(
	musicbrainz.gender
	musicbrainz.language
	musicbrainz.area_type
	musicbrainz.area
	musicbrainz.l_area_area
	musicbrainz.country_area
	bookbrainz.editor_type
	bookbrainz.editor
	bookbrainz.editor__language
	bookbrainz.admin_log
	bookbrainz.entity
	bookbrainz.entity_redirect
	bookbrainz.author_header
	bookbrainz.edition_group_header
	bookbrainz.edition_header
	bookbrainz.publisher_header
	bookbrainz.work_header
	bookbrainz.revision_parent
	bookbrainz.revision
	bookbrainz.author_revision
	bookbrainz.edition_group_revision
	bookbrainz.edition_revision
	bookbrainz.publisher_revision
	bookbrainz.work_revision
	bookbrainz.note
	bookbrainz.author_type
	bookbrainz.author_data
	bookbrainz.release_event
	bookbrainz.release_event_set
	bookbrainz.release_event_set__release_event
	bookbrainz.author_credit
	bookbrainz.author_credit_name
	bookbrainz.publisher_set
	bookbrainz.publisher_set__publisher
	bookbrainz.edition_format
	bookbrainz.edition_status
	bookbrainz.edition_data
	bookbrainz.edition_group_type
	bookbrainz.edition_group_data
	bookbrainz.publisher_type
	bookbrainz.publisher_data
	bookbrainz.work_type
	bookbrainz.work_data
	bookbrainz.annotation
	bookbrainz.disambiguation
	bookbrainz.alias
	bookbrainz.identifier_type
	bookbrainz.identifier
	bookbrainz.relationship_type
	bookbrainz.alias_set
	bookbrainz.alias_set__alias
	bookbrainz.identifier_set
	bookbrainz.identifier_set__identifier
	bookbrainz.relationship_set
	bookbrainz.relationship_set__relationship
	bookbrainz.relationship
	bookbrainz.relationship_attribute_set
	bookbrainz.relationship_attribute_type
	bookbrainz.relationship_type__attribute_type
	bookbrainz.relationship_attribute
	bookbrainz.relationship_attribute_text_value
	bookbrainz.relationship_attribute_set__relationship_attribute
	bookbrainz.language_set
	bookbrainz.language_set__language
	bookbrainz.series_header
	bookbrainz.series_ordering_type
	bookbrainz.series_data
	bookbrainz.series_revision
	bookbrainz.title_type
	bookbrainz.title_unlock
	bookbrainz.achievement_type
	bookbrainz.achievement_unlock
	# Imports - TODO: evaluate whether we wwant those exported in the dumps
	bookbrainz.import
	bookbrainz.author_import_header
	bookbrainz.edition_import_header
	bookbrainz.edition_group_import_header
	bookbrainz.publisher_import_header
	bookbrainz.work_import_header
	bookbrainz.discard_votes
	bookbrainz.origin_source
	bookbrainz.link_import
)

PG_DUMP_TABLE_ARGS=()
for table_name in "${EXPORTED_TABLES[@]}"; do
	PG_DUMP_TABLE_ARGS+=("--table=$table_name")
done

echo "Creating data dump..."

# Dump new backup to /tmp
pg_dump \
	-h "$POSTGRES_HOST" \
	-p "$POSTGRES_PORT" \
	-U bookbrainz \
	"${PG_DUMP_TABLE_ARGS[@]}" \
	--serializable-deferrable \
	bookbrainz > "/tmp/$DUMP_FILE"
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
