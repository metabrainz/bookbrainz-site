BEGIN;

ALTER TABLE bookbrainz.relationship DROP COLUMN attribute_set_id;
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_set__relationship_attribute; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_text_value; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_set; 
DROP TABLE IF EXISTS bookbrainz.relationship_type__attribute_type;
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_type; 
DELETE FROM bookbrainz.relationship_type WHERE id BETWEEN 70 and 74;

COMMIT;

BEGIN;

DELETE FROM bookbrainz.relationship_type WHERE id = 75;

COMMIT;