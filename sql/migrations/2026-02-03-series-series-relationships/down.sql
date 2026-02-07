BEGIN;

DELETE FROM bookbrainz.relationship_type
WHERE id IN (124, 125, 126);

COMMIT;