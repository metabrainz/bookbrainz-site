---------------------
-- Rename ID Fields
---------------------

BEGIN;

ALTER TABLE bookbrainz.alias RENAME id TO alias_id;
ALTER SEQUENCE bookbrainz.alias_id_seq RENAME TO alias_alias_id_seq;

ALTER TABLE bookbrainz.annotation RENAME id TO annotation_id;
ALTER SEQUENCE bookbrainz.annotation_id_seq RENAME TO annotation_annotation_id_seq;

ALTER TABLE bookbrainz.creator_credit RENAME id TO creator_credit_id;
ALTER SEQUENCE bookbrainz.creator_credit_id_seq RENAME TO creator_credit_creator_credit_id_seq;

ALTER TABLE bookbrainz.creator_credit_name RENAME creator_bbid TO creator_gid;

ALTER TABLE bookbrainz.creator_type RENAME id TO creator_type_id;
ALTER SEQUENCE bookbrainz.creator_type_id_seq RENAME TO creator_type_creator_type_id_seq;

ALTER TABLE bookbrainz.disambiguation RENAME id TO disambiguation_id;
ALTER SEQUENCE bookbrainz.disambiguation_id_seq RENAME TO disambiguation_disambiguation_id_seq;

ALTER TABLE bookbrainz.edition_data RENAME publication_bbid TO publication_gid;
ALTER TABLE bookbrainz.edition_data RENAME publisher_bbid TO publisher_gid;

ALTER TABLE bookbrainz.edition_format RENAME id TO edition_format_id;
ALTER SEQUENCE bookbrainz.edition_format_id_seq RENAME TO edition_format_edition_format_id_seq;

ALTER TABLE bookbrainz.edition_status RENAME id TO edition_status_id;
ALTER SEQUENCE bookbrainz.edition_status_id_seq RENAME TO edition_status_edition_status_id_seq;

ALTER TABLE bookbrainz.entity RENAME bbid TO entity_gid;

ALTER TABLE bookbrainz.entity_data RENAME id TO entity_data_id;
ALTER SEQUENCE bookbrainz.entity_data_id_seq RENAME TO entity_data_entity_data_id_seq;

ALTER TABLE bookbrainz.entity_redirect RENAME source_bbid TO source_gid;
ALTER TABLE bookbrainz.entity_redirect RENAME target_bbid TO target_gid;

ALTER TABLE bookbrainz.entity_revision RENAME entity_bbid TO entity_gid;

ALTER TABLE bookbrainz.identifier RENAME id TO identifier_id;
ALTER SEQUENCE bookbrainz.identifier_id_seq RENAME TO identifier_identifier_id_seq;

ALTER TABLE bookbrainz.identifier_type RENAME id TO identifier_type_id;
ALTER SEQUENCE bookbrainz.identifier_type_id_seq RENAME TO identifier_type_identifier_type_id_seq;

ALTER TABLE bookbrainz.message RENAME id TO message_id;
ALTER SEQUENCE bookbrainz.message_id_seq RENAME TO message_message_id_seq;

ALTER TABLE bookbrainz.oauth_client RENAME id TO client_id;
ALTER TABLE bookbrainz.oauth_client RENAME secret TO client_secret;

ALTER TABLE bookbrainz.publication_type RENAME id TO publication_type_id;
ALTER SEQUENCE bookbrainz.publication_type_id_seq RENAME TO publication_type_publication_type_id_seq;

ALTER TABLE bookbrainz.publisher_type RENAME id TO publisher_type_id;
ALTER SEQUENCE bookbrainz.publisher_type_id_seq RENAME TO publisher_type_publisher_type_id_seq;

ALTER TABLE bookbrainz.rel RENAME id TO relationship_id;
ALTER SEQUENCE bookbrainz.rel_id_seq RENAME TO rel_relationship_id_seq;

ALTER TABLE bookbrainz.rel_data RENAME id TO relationship_data_id;
ALTER SEQUENCE bookbrainz.rel_data_id_seq RENAME TO rel_data_relationship_data_id_seq;

ALTER TABLE bookbrainz.rel_entity RENAME entity_bbid TO entity_gid;
ALTER TABLE bookbrainz.rel_type RENAME id TO relationship_type_id;
ALTER SEQUENCE bookbrainz.rel_type_id_seq RENAME TO rel_type_relationship_type_id_seq;

ALTER TABLE bookbrainz.revision RENAME id TO revision_id;
ALTER TABLE bookbrainz.revision RENAME author_id TO user_id;
ALTER SEQUENCE bookbrainz.revision_id_seq RENAME TO revision_revision_id_seq;

ALTER TABLE bookbrainz.revision_note RENAME id TO revision_note_id;
ALTER TABLE bookbrainz.revision_note RENAME author_id TO user_id;
ALTER SEQUENCE bookbrainz.revision_note_id_seq RENAME TO revision_note_revision_note_id_seq;

ALTER TABLE bookbrainz.user RENAME id TO user_id;
ALTER SEQUENCE bookbrainz.user_id_seq RENAME TO user_user_id_seq;

ALTER TABLE bookbrainz.user_type RENAME id TO user_type_id;
ALTER SEQUENCE bookbrainz.user_type_id_seq RENAME TO user_type_user_type_id_seq;

ALTER TABLE bookbrainz.work_type RENAME	id TO work_type_id;
ALTER SEQUENCE bookbrainz.work_type_id_seq RENAME TO work_type_work_type_id_seq;

COMMIT;
