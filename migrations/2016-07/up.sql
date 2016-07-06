BEGIN;

CREATE TABLE bookbrainz._editor_entity_visits (
	id SERIAL PRIMARY KEY,
	editor_id INT NOT NULL,
	bbid UUID NOT NULL
);

ALTER TABLE bookbrainz._editor_entity_visits ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz._editor_entity_visits ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

COMMIT;
