-----------------------------------------
-- Add UNIQUE constraint to editor.name
-----------------------------------------

BEGIN;

CREATE UNIQUE INDEX editor_name_idx ON bookbrainz.editor (name);
ALTER TABLE bookbrainz.editor ADD UNIQUE USING INDEX editor_name_idx;

COMMIT;
