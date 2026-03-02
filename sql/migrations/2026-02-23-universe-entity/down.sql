BEGIN;

DROP VIEW IF EXISTS bookbrainz.universe CASCADE;
DROP TABLE IF EXISTS bookbrainz.universe_revision CASCADE;
DROP TABLE IF EXISTS bookbrainz.universe_data CASCADE;
DROP TABLE IF EXISTS bookbrainz.universe_header CASCADE;

COMMIT;
