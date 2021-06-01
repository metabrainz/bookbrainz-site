BEGIN;

CREATE TABLE bookbrainz.relationship_attribute_set (
	id SERIAL PRIMARY KEY 
);

ALTER TABLE bookbrainz.relationship ADD attribute_set_id INTEGER;
ALTER TABLE bookbrainz.relationship ADD FOREIGN KEY (attribute_set_id) REFERENCES bookbrainz.relationship_attribute_set (id);

CREATE TABLE bookbrainz.relationship_attribute_type (
  id serial NOT NULL PRIMARY KEY,
  parent INT DEFAULT NULL,
  root INT NOT NULL,
  child_order INT NOT NULL DEFAULT 0,
  name varchar(255) NOT NULL,
  description TEXT DEFAULT NULL,
  last_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);

CREATE TABLE bookbrainz.relationship_type__attribute_type (
  relationship_type INT NOT NULL REFERENCES bookbrainz.relationship_type(id),
  attribute_type INT NOT NULL REFERENCES bookbrainz.relationship_attribute_type(id),
  min SMALLINT DEFAULT NULL,
  max SMALLINT DEFAULT NULL,
  last_updated TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);

CREATE TABLE bookbrainz.relationship_attribute (
  id SERIAL PRIMARY KEY, 
  attribute_type INT NOT NULL REFERENCES bookbrainz.relationship_attribute_type(id)
);

CREATE TABLE bookbrainz.relationship_attribute_text_value (
  attribute_id INT NOT NULL REFERENCES bookbrainz.relationship_attribute (id),
  text_value TEXT DEFAULT NULL
);

CREATE TABLE bookbrainz.relationship_attribute_set__relationship_attribute (
	set_id INTEGER REFERENCES bookbrainz.relationship_attribute_set (id),
	attribute_id INTEGER REFERENCES bookbrainz.relationship_attribute (id),
  PRIMARY KEY (
    set_id, 
    attribute_id
  )
);
	
COMMIT;