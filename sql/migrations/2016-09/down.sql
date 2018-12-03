BEGIN;


-- Remove passwords
ALTER TABLE bookbrainz.editor ADD password CHAR(60) CHECK (password <> '');
/* password/metabrainz account NOT NULL constraint not re-established because
   passwords will be blank */


-- Explorer achievement
ALTER TABLE bookbrainz._editor_entity_visits
	DROP CONSTRAINT _editor_entity_visits_bbid_fkey;

ALTER TABLE bookbrainz._editor_entity_visits
	DROP CONSTRAINT _editor_entity_visits_editor_id_fkey;

DROP TABLE bookbrainz._editor_entity_visits;


-- Remove core achievement system
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


-- Remove OAuth
ALTER TABLE bookbrainz.editor
	DROP COLUMN metabrainz_user_id;
ALTER TABLE bookbrainz.editor
	DROP COLUMN cached_metabrainz_name;
ALTER TABLE bookbrainz.editor
	ADD COLUMN email VARCHAR(255) CHECK (email <> '');


COMMIT;
