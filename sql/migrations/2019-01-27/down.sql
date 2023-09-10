BEGIN;
  ALTER TABLE bookbrainz.editor ADD COLUMN birth_date DATE;
COMMIT;
