

ALTER TABLE bookbrainz.user ADD FOREIGN KEY (user_type_id) REFERENCES bookbrainz.user_type (user_type_id);
ALTER TABLE bookbrainz.user ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);

ALTER TABLE bookbrainz.user_language ADD FOREIGN KEY (user_id) REFERENCES bookbrainz.user (user_id);
ALTER TABLE bookbrainz.user_language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (language_id);

ALTER TABLE bookbrainz.message ADD FOREIGN KEY (sender_id) REFERENCES bookbrainz.user (user_id);

ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (message_id) REFERENCES bookbrainz.message (message_id);
ALTER TABLE bookbrainz.message_receipt ADD FOREIGN KEY (recipient_id) REFERENCES bookbrainz.user (user_id);

ALTER TABLE bookbrainz.oauth_client ADD FOREIGN KEY (owner_id) REFERENCES bookbrainz.user (user_id);
