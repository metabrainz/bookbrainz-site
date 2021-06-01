BEGIN;

ALTER TABLE bookbrainz.relationship DROP COLUMN attribute_set_id;
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_set__relationship_attribute; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_text_value; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute; 
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_set; 
DROP TABLE IF EXISTS bookbrainz.relationship_type__attribute_type;
DROP TABLE IF EXISTS bookbrainz.relationship_attribute_type; 


COMMIT;