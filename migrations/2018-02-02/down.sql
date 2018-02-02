BEGIN;

ALTER TABLE bookbrainz.relationship_type RENAME COLUMN link_phrase TO display_template;
ALTER TABLE bookbrainz.relationship_type DROP COLUMN reverse_link_phrase;

COMMIT;
