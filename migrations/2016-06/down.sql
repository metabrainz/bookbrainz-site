BEGIN;

ALTER TABLE bookbrainz.editor
	DROP COLUMN title_unlock_id;

DROP TABLE bookbrainz.title_unlock;
DROP TABLE bookbrainz.achievement_unlock;
DROP TABLE bookbrainz.title_type;
DROP TABLE bookbrainz.achievement_type;

COMMIT;
