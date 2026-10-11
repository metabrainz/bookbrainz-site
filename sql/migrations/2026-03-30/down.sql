BEGIN;
ALTER TABLE bookbrainz.alias DROP COLUMN IF EXISTS script_id;
DROP TABLE IF EXISTS musicbrainz.script;
COMMIT;
