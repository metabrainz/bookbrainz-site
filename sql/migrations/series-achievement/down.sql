BEGIN;

DELETE FROM bookbrainz.title_type WHERE id=13;
DELETE FROM bookbrainz.achievement_type WHERE id BETWEEN 28 and 30;

COMMIT;