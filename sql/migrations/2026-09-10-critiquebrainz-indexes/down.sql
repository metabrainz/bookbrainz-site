BEGIN;

DROP INDEX IF EXISTS bookbrainz.author_revision_data_id_idx;
DROP INDEX IF EXISTS bookbrainz.author_data_identifier_set_id_idx;

DROP INDEX IF EXISTS bookbrainz.work_revision_data_id_idx;
DROP INDEX IF EXISTS bookbrainz.work_data_identifier_set_id_idx;

DROP INDEX IF EXISTS bookbrainz.identifier_set__identifier_identifier_id_idx;
DROP INDEX IF EXISTS bookbrainz.identifier_type_id_value_idx;

COMMIT;
