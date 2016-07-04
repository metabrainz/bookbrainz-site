BEGIN;

ALTER TABLE bookbrainz.title_unlock
	DROP CONSTRAINT title_unlock_editor_id_fkey;

ALTER TABLE bookbrainz.title_unlock
	DROP CONSTRAINT title_unlock_title_id_fkey;

ALTER TABLE bookbrainz.achievement_unlock
	DROP CONSTRAINT achievement_unlock_achievement_id_fkey;

ALTER TABLE bookbrainz.achievement_unlock
	DROP CONSTRAINT achievement_unlock_editor_id_fkey;

ALTER TABLE bookbrainz.editor
	DROP CONSTRAINT editor_title_unlock_id_fkey;

ALTER TABLE bookbrainz.editor
	DROP COLUMN title_unlock_id;

DROP TABLE bookbrainz.title_unlock;
DROP TABLE bookbrainz.achievement_unlock;
DROP TABLE bookbrainz.title_type;
DROP TABLE bookbrainz.achievement_type;

COMMIT;
