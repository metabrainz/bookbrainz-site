BEGIN;

ALTER TABLE bookbrainz._editor_entity_visits
	DROP CONSTRAINT _editor_entity_visits_bbid_fkey;

ALTER TABLE bookbrainz._editor_entity_visits
	DROP CONSTRAINT _editor_entity_visits_editor_id_fkey;

DROP TABLE bookbrainz._editor_entity_visits;

COMMIT;
