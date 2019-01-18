BEGIN;

ALTER TABLE bookbrainz.entity_revision RENAME COLUMN id TO revision_id;
ALTER TABLE bookbrainz.entity_revision ALTER COLUMN entity_data_id SET NOT NULL;

COMMIT;
