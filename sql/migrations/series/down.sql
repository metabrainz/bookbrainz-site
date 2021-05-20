BEGIN;

DROP TABLE IF EXISTS bookbrainz.series_header;
DROP TABLE IF EXISTS bookbrainz.series_ordering_type;
DROP TABLE IF EXISTS bookbrainz.series_data;
DROP TABLE IF EXISTS bookbrainz.series_revision; 
DROP VIEW IF EXISTS bookbrainz.series; 
DELETE FROM pg_enum
    WHERE enumlabel = 'Series'
    AND enumtypid = ( SELECT oid FROM pg_type WHERE typname = 'entity_type');

COMMIT;