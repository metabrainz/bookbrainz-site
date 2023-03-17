BEGIN;

ALTER TABLE bookbrainz.relationship_type RENAME COLUMN link_phrase TO display_template;
ALTER TABLE bookbrainz.relationship_type DROP COLUMN reverse_link_phrase;

COMMIT;

DROP TRIGGER process_publisher ON bookbrainz.publisher;
DROP TRIGGER process_creator ON bookbrainz.creator;
DROP TRIGGER process_work ON bookbrainz.work;
DROP TRIGGER process_edition ON bookbrainz.edition;
DROP TRIGGER process_publication ON bookbrainz.publication;
