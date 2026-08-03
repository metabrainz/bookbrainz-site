#!/usr/bin/env bash

set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

source /home/monkey/Work/BookBrainz/bookbrainz-site-test/scripts/config.sh

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
	# User collections are processed to only export public collections info
	bookbrainz.user_collection
	bookbrainz.user_collection_item
	bookbrainz.user_collection_collaborator
)

PG_DUMP_TABLE_ARGS=()
for table_name in "${EXPORTED_TABLES[@]}"; do
	PG_DUMP_TABLE_ARGS+=("--table=$table_name")
done

append_copy_from_query() {
	local table_name=$1
	local columns=$2
	local query=$3

	{
		echo
		echo "COPY $table_name ($columns) FROM stdin;"
		psql \
			-h "$POSTGRES_HOST" \
			-p "$POSTGRES_PORT" \
			-U bookbrainz \
			-d bookbrainz \
			-v ON_ERROR_STOP=1 \
			--tuples-only \
			--no-align \
			--command "COPY ($query) TO STDOUT;"
		echo "\\."
	} >> "/tmp/$DUMP_FILE"
}

append_public_collection_data() {
	append_copy_from_query \
		bookbrainz.user_collection \
		"id, owner_id, name, description, entity_type, public, created_at, last_modified" \
		"
			SELECT
				id,
				owner_id,
				name,
				description,
				entity_type,
				public,
				created_at,
				last_modified
			FROM bookbrainz.user_collection
			WHERE public = TRUE
		"

	append_copy_from_query \
		bookbrainz.user_collection_item \
		"collection_id, bbid, added_at" \
		"
			SELECT
				item.collection_id,
				item.bbid,
				item.added_at
			FROM bookbrainz.user_collection_item item
			JOIN bookbrainz.user_collection collection
				ON collection.id = item.collection_id
			WHERE collection.public = TRUE
		"
}

echo "Creating data dump..."

# We do the dump in 3 steps because --table used for allowlisting does not create schema objects, indexes, constraints etc..
# So we first dump the schema objects, then the allowlisted table data, and finally the indexes, constraints and triggers.

# Dump schema objects that must exist before data.
pg_dump \
	-h "$POSTGRES_HOST" \
	-p "$POSTGRES_PORT" \
	-U bookbrainz \
	--schema=bookbrainz \
	--schema=musicbrainz \
	--exclude-table=bookbrainz._editor_entity_visits \
	--section=pre-data \
	bookbrainz > "/tmp/$DUMP_FILE"

# Dump allowlisted table data to /tmp.
pg_dump \
	-h "$POSTGRES_HOST" \
	-p "$POSTGRES_PORT" \
	-U bookbrainz \
	"${PG_DUMP_TABLE_ARGS[@]}" \
	--exclude-table-data=bookbrainz.user_collection \
	--exclude-table-data=bookbrainz.user_collection_item \
	--exclude-table-data=bookbrainz.user_collection_collaborator \
	--data-only \
	--serializable-deferrable \
	bookbrainz >> "/tmp/$DUMP_FILE"
echo "Main dump created"

echo "Exporting public collections..."
append_public_collection_data
echo "Public collections exported"

echo "Adding indexes, constraints and triggers..."
pg_dump \
	-h "$POSTGRES_HOST" \
	-p "$POSTGRES_PORT" \
	-U bookbrainz \
	--schema=bookbrainz \
	--schema=musicbrainz \
	--exclude-table=bookbrainz._editor_entity_visits \
	--section=post-data \
	bookbrainz >> "/tmp/$DUMP_FILE"
echo "Indexes, constraints and triggers added"

# Compress new backup and move to dump dir
echo "Successfully created public dump: $DUMP_FILE"
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
