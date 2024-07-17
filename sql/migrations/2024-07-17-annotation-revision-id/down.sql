
BEGIN;

ALTER TABLE bookbrainz.annotation ALTER COLUMN last_revision_id SET NOT NULL;

COMMIT;