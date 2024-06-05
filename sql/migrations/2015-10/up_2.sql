---------------------
-- Rename ID Fields
---------------------

BEGIN;

ALTER TABLE bookbrainz.rel RENAME TO relationship;
ALTER SEQUENCE bookbrainz.rel_id_seq RENAME TO relationship_id_seq;

ALTER TABLE bookbrainz.rel_data RENAME TO relationship_data;
ALTER SEQUENCE bookbrainz.rel_data_id_seq RENAME TO relationship_data_id_seq;

ALTER TABLE bookbrainz.rel_type RENAME TO relationship_type;
ALTER SEQUENCE bookbrainz.rel_type_id_seq RENAME TO relationship_type_id_seq;

ALTER TABLE bookbrainz.rel_entity RENAME TO relationship_entity;

ALTER TABLE bookbrainz.rel_revision RENAME TO relationship_revision;

DROP TABLE bookbrainz.rel_text;

ALTER TABLE bookbrainz.inactive_users RENAME TO inactive_editor;
ALTER TABLE bookbrainz.inactive_editor RENAME user_id TO editor_id;

ALTER TABLE bookbrainz.suspended_users RENAME TO suspended_editor;
ALTER TABLE bookbrainz.suspended_editor RENAME user_id TO editor_id;

ALTER TABLE bookbrainz.revision_note RENAME TO note;
ALTER SEQUENCE bookbrainz.revision_note_id_seq RENAME TO note_id_seq;

ALTER TABLE bookbrainz.user RENAME TO editor;
ALTER TABLE bookbrainz.editor RENAME user_type_id TO editor_type_id;
ALTER SEQUENCE bookbrainz.user_id_seq RENAME TO editor_id_seq;

ALTER TABLE bookbrainz.user_language RENAME TO editor_language;
ALTER TABLE bookbrainz.editor_language RENAME user_id TO editor_id;

ALTER TABLE bookbrainz.user_type RENAME TO editor_type;
ALTER SEQUENCE bookbrainz.user_type_id_seq RENAME TO editor_type_id_seq;

COMMIT;
