BEGIN;

DROP VIEW IF EXISTS bookbrainz.series; 
DROP TABLE IF EXISTS bookbrainz.series_revision CASCADE; 
DROP TABLE IF EXISTS bookbrainz.series_data;
DROP TABLE IF EXISTS bookbrainz.series_header;
DROP TABLE IF EXISTS bookbrainz.series_ordering_type;

COMMIT;