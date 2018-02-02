BEGIN;

ALTER TABLE bookbrainz.relationship_type RENAME COLUMN display_template TO link_phrase;
ALTER TABLE bookbrainz.relationship_type ADD COLUMN reverse_link_phrase TEXT CHECK (reverse_link_phrase <> '');

UPDATE bookbrainz.relationship_type SET reverse_link_phrase=' ';

ALTER TABLE bookbrainz.relationship_type ALTER COLUMN reverse_link_phrase SET NOT NULL;

COMMIT;
