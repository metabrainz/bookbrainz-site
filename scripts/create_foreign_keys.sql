ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (editor_type_id) REFERENCES bookbrainz.editor_type (id);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);

ALTER TABLE bookbrainz.editor_language ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.editor_language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

ALTER TABLE bookbrainz.message ADD FOREIGN KEY (sender_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (message_id) REFERENCES bookbrainz.message (id);
ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (recipient_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.oauth_client ADD FOREIGN KEY (owner_id) REFERENCES bookbrainz.editor (id);

ALTER TABLE bookbrainz.revision ADD FOREIGN KEY (author_id) REFERENCES bookbrainz.editor (id);
