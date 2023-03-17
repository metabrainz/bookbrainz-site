BEGIN;

DELETE FROM bookbrainz.identifier_type WHERE id BETWEEN 30 and 34;

COMMIT;
