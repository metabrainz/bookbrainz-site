-- Allow NULL values for annotation.last_revision_id (foreing key to revision table)
-- so that we can use annotations for entities pending import, which do not have revisions.
BEGIN;

ALTER TABLE bookbrainz.annotation ALTER COLUMN last_revision_id DROP NOT NULL;

COMMIT;