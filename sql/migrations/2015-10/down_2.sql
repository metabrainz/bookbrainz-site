---------------------
-- Rename ID Fields
---------------------

BEGIN;

CREATE TABLE bookbrainz.rel_text (
	relationship_data_id INT,
	position SMALLINT,
	text TEXT NOT NULL,
	PRIMARY KEY (
		relationship_data_id,
		position
	)
);

ALTER TABLE bookbrainz.relationship RENAME TO rel;
ALTER SEQUENCE bookbrainz.relationship_id_seq RENAME TO rel_id_seq;

ALTER TABLE bookbrainz.relationship_data RENAME TO rel_data;
ALTER SEQUENCE bookbrainz.relationship_data_id_seq RENAME TO rel_data_id_seq;

ALTER TABLE bookbrainz.relationship_type RENAME TO rel_type;
ALTER SEQUENCE bookbrainz.relationship_type_id_seq RENAME TO rel_type_id_seq;

ALTER TABLE bookbrainz.relationship_entity RENAME TO rel_entity;

ALTER TABLE bookbrainz.relationship_revision RENAME TO rel_revision;

ALTER TABLE bookbrainz.inactive_editor RENAME editor_id TO user_id;
ALTER TABLE bookbrainz.inactive_editor RENAME TO inactive_users;


ALTER TABLE bookbrainz.suspended_editor RENAME editor_id TO user_id;
ALTER TABLE bookbrainz.suspended_editor RENAME TO suspended_users;


ALTER TABLE bookbrainz.note RENAME TO revision_note;
ALTER SEQUENCE bookbrainz.note_id_seq RENAME TO revision_note_id_seq;

ALTER TABLE bookbrainz.editor RENAME editor_type_id TO user_type_id;
ALTER TABLE bookbrainz.editor RENAME TO "user";
ALTER SEQUENCE bookbrainz.editor_id_seq RENAME TO user_id_seq;

ALTER TABLE bookbrainz.editor_language RENAME editor_id TO user_id;
ALTER TABLE bookbrainz.editor_language RENAME TO user_language;

ALTER TABLE bookbrainz.editor_type RENAME TO user_type;
ALTER SEQUENCE bookbrainz.editor_type_id_seq RENAME TO user_type_id_seq;

COMMIT;
