---------------------
-- Rename ID Fields
---------------------

BEGIN;

ALTER TABLE bookbrainz.alias RENAME alias_id TO id;
ALTER SEQUENCE bookbrainz.alias_alias_id_seq RENAME TO alias_id_seq;

ALTER TABLE bookbrainz.annotation RENAME annotation_id TO id;
ALTER SEQUENCE bookbrainz.annotation_annotation_id_seq RENAME TO annotation_id_seq;

ALTER TABLE bookbrainz.creator_credit RENAME creator_credit_id TO id;
ALTER SEQUENCE bookbrainz.creator_credit_creator_credit_id_seq RENAME TO creator_credit_id_seq;

ALTER TABLE bookbrainz.creator_credit_name RENAME creator_gid TO creator_bbid;

ALTER TABLE bookbrainz.creator_type RENAME creator_type_id TO id;
ALTER SEQUENCE bookbrainz.creator_type_creator_type_id_seq RENAME TO creator_type_id_seq;

ALTER TABLE bookbrainz.disambiguation RENAME disambiguation_id TO id;
ALTER SEQUENCE bookbrainz.disambiguation_disambiguation_id_seq RENAME TO disambiguation_id_seq;

ALTER TABLE bookbrainz.edition_data RENAME publication_gid TO publication_bbid;
ALTER TABLE bookbrainz.edition_data RENAME publisher_gid TO publisher_bbid;

ALTER TABLE bookbrainz.edition_format RENAME edition_format_id TO id;
ALTER SEQUENCE bookbrainz.edition_format_edition_format_id_seq RENAME TO edition_format_id_seq;

ALTER TABLE bookbrainz.edition_status RENAME edition_status_id TO id;
ALTER SEQUENCE bookbrainz.edition_status_edition_status_id_seq RENAME TO edition_status_id_seq;

ALTER TABLE bookbrainz.entity RENAME entity_gid TO bbid;

ALTER TABLE bookbrainz.entity_data RENAME entity_data_id TO id;
ALTER SEQUENCE bookbrainz.entity_data_entity_data_id_seq RENAME TO entity_data_id_seq;

ALTER TABLE bookbrainz.entity_redirect RENAME source_gid TO source_bbid;
ALTER TABLE bookbrainz.entity_redirect RENAME target_gid TO target_bbid;

ALTER TABLE bookbrainz.entity_revision RENAME entity_gid TO entity_bbid;

ALTER TABLE bookbrainz.identifier RENAME identifier_id TO id;
ALTER SEQUENCE bookbrainz.identifier_identifier_id_seq RENAME TO identifier_id_seq;

ALTER TABLE bookbrainz.identifier_type RENAME identifier_type_id TO id;
ALTER SEQUENCE bookbrainz.identifier_type_identifier_type_id_seq RENAME TO identifier_type_id_seq;

ALTER TABLE bookbrainz.message RENAME message_id TO id;
ALTER SEQUENCE bookbrainz.message_message_id_seq RENAME TO message_id_seq;

ALTER TABLE bookbrainz.oauth_client RENAME client_id TO id;
ALTER TABLE bookbrainz.oauth_client RENAME client_secret TO secret;

ALTER TABLE bookbrainz.publication_type RENAME publication_type_id TO id;
ALTER SEQUENCE bookbrainz.publication_type_publication_type_id_seq RENAME TO publication_type_id_seq;

ALTER TABLE bookbrainz.publisher_type RENAME publisher_type_id TO id;
ALTER SEQUENCE bookbrainz.publisher_type_publisher_type_id_seq RENAME TO publisher_type_id_seq;

ALTER TABLE bookbrainz.rel RENAME relationship_id TO id;
ALTER SEQUENCE bookbrainz.rel_relationship_id_seq RENAME TO rel_id_seq;

ALTER TABLE bookbrainz.rel_data RENAME relationship_data_id TO id;
ALTER SEQUENCE bookbrainz.rel_data_relationship_data_id_seq RENAME TO rel_data_id_seq;

ALTER TABLE bookbrainz.rel_entity RENAME entity_gid TO entity_bbid;

ALTER TABLE bookbrainz.rel_type RENAME relationship_type_id TO id;
ALTER SEQUENCE bookbrainz.rel_type_relationship_type_id_seq RENAME TO rel_type_id_seq;

ALTER TABLE bookbrainz.revision RENAME revision_id TO id;
ALTER TABLE bookbrainz.revision RENAME user_id TO author_id;
ALTER SEQUENCE bookbrainz.revision_revision_id_seq RENAME TO revision_id_seq;

ALTER TABLE bookbrainz.revision_note RENAME revision_note_id TO id;
ALTER TABLE bookbrainz.revision_note RENAME user_id TO author_id;
ALTER SEQUENCE bookbrainz.revision_note_revision_note_id_seq RENAME TO revision_note_id_seq;

ALTER TABLE bookbrainz.user RENAME user_id TO id;
ALTER SEQUENCE bookbrainz.user_user_id_seq RENAME TO user_id_seq;

ALTER TABLE bookbrainz.user_type RENAME user_type_id TO id;
ALTER SEQUENCE bookbrainz.user_type_user_type_id_seq RENAME TO user_type_id_seq;

ALTER TABLE bookbrainz.work_type RENAME	work_type_id TO id;
ALTER SEQUENCE bookbrainz.work_type_work_type_id_seq RENAME TO work_type_id_seq;

COMMIT;
