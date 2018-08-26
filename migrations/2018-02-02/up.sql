BEGIN;

ALTER TABLE bookbrainz.relationship_type RENAME COLUMN display_template TO link_phrase;
ALTER TABLE bookbrainz.relationship_type ADD COLUMN reverse_link_phrase TEXT CHECK (reverse_link_phrase <> '');

UPDATE bookbrainz.relationship_type SET reverse_link_phrase=' ';

ALTER TABLE bookbrainz.relationship_type ALTER COLUMN reverse_link_phrase SET NOT NULL;

COMMIT;

DROP TRIGGER process_publisher ON bookbrainz.publisher;
DROP TRIGGER process_creator ON bookbrainz.creator;
DROP TRIGGER process_work ON bookbrainz.work;
DROP TRIGGER process_edition ON bookbrainz.edition;
DROP TRIGGER process_publication ON bookbrainz.publication;
