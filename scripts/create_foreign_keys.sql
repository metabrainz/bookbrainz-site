ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (editor_type_id) REFERENCES bookbrainz.editor_type (id);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);

ALTER TABLE bookbrainz.editor_language ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.editor_language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

ALTER TABLE bookbrainz.message ADD FOREIGN KEY (sender_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (message_id) REFERENCES bookbrainz.message (id);
ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (recipient_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.oauth_client ADD FOREIGN KEY (owner_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.revision ADD FOREIGN KEY (author_id) REFERENCES bookbrainz.editor (id);

-------------
-- Entities
-------------

ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (entity_data_id) REFERENCES bookbrainz.entity_data (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (creator_type_id) REFERENCES bookbrainz.creator_type (id);

ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (entity_data_id) REFERENCES bookbrainz.entity_data (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (publication_bbid) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (edition_format_id) REFERENCES bookbrainz.edition_format (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (edition_status_id) REFERENCES bookbrainz.edition_status (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (publisher_bbid) REFERENCES bookbrainz.entity (bbid);

ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (entity_data_id) REFERENCES bookbrainz.entity_data (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (publication_type_id) REFERENCES bookbrainz.publication_type (id);

ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (entity_data_id) REFERENCES bookbrainz.entity_data (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (publisher_type_id) REFERENCES bookbrainz.publisher_type (id);

ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (entity_data_id) REFERENCES bookbrainz.entity_data (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (work_type_id) REFERENCES bookbrainz.work_type (id);
