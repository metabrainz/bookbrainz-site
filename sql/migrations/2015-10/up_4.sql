BEGIN;

ALTER TABLE bookbrainz.entity_revision ALTER COLUMN entity_data_id DROP NOT NULL;
ALTER TABLE bookbrainz.entity_revision RENAME COLUMN revision_id TO id;

COMMIT;
