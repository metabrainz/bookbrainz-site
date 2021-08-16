BEGIN;

CREATE TABLE bookbrainz.relationship_attribute_set (
	id SERIAL PRIMARY KEY 
);

ALTER TABLE bookbrainz.relationship ADD COLUMN attribute_set_id INTEGER;
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

INSERT INTO bookbrainz.relationship_type ( id, label, description, link_phrase, source_entity_type, target_entity_type, parent_id, child_order, deprecated, reverse_link_phrase ) 
VALUES 
( 70, 'Author Series', 'Indicates an Author is part of a Series', 'is part of', 'Author', 'Series', NULL, 0, false, 'contains'),
( 71, 'Work Series', 'Indicates a Work is part of a Series', 'is part of', 'Work', 'Series', NULL, 0, false, 'contains'),
( 72, 'Edition Series', 'Indicates an Edition is part of a Series', 'is part of', 'Edition', 'Series', NULL, 0, false, 'contains'),
( 73, 'Edition Group Series', 'Indicates an Edition Group is part of a Series', 'is part of', 'EditionGroup', 'Series', NULL, 0, false, 'contains'),
( 74, 'Publisher Series', 'Indicates a Publisher is part of a Series', 'is part of', 'Publisher', 'Series', NULL, 0, false, 'contains');

INSERT INTO bookbrainz.relationship_attribute_type (id, parent, root, child_order, name, description)
VALUES
	  (1, NULL, 1, 0, 'position', 'This attribute is used to position the entity in a series.'),
	  (2, NULL, 1, 0, 'number', 'This attribute indicates the number of a entity in a series.');

    
INSERT INTO bookbrainz.relationship_type__attribute_type (relationship_type, attribute_type)
VALUES
	  (70, 1),
	  (71, 1),
	  (72, 1),
	  (73, 1),
	  (74, 1),
	  (70, 2),
	  (71, 2),
	  (72, 2),
	  (73, 2),
	  (74, 2);
  	
COMMIT;

BEGIN;

INSERT INTO bookbrainz.relationship_type ( id, label, description, link_phrase, source_entity_type, target_entity_type, parent_id, child_order, deprecated, reverse_link_phrase ) 
VALUES
( 75, 'Inspiration', 'Indicates a Series is inspired by a Work.', 'inspired', 'Work', 'Series', NULL, 0, false, 'was inspired by');

COMMIT;
