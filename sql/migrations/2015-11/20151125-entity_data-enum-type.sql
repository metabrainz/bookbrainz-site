-----------------------------------------------
-- Use entity_type ENUM for entity_data _type
-----------------------------------------------

ALTER TYPE entity_types RENAME TO entity_type;

ALTER TABLE entity_data
	RENAME COLUMN _type TO _type_tmp,
	ADD COLUMN _type entity_type;

UPDATE entity_data SET _type = 'Publication' WHERE _type_tmp = 1;
UPDATE entity_data SET _type = 'Creator' WHERE _type_tmp = 2;
UPDATE entity_data SET _type = 'Publisher' WHERE _type_tmp = 3;
UPDATE entity_data SET _type = 'Edition' WHERE _type_tmp = 4;
UPDATE entity_data SET _type = 'Work' WHERE _type_tmp = 5;

ALTER TABLE entity_data
	ALTER COLUMN _type SET NOT NULL,
	DROP COLUMN _type_tmp;
