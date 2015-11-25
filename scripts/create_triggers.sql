-- Provides functionality for create, update and delete operations on composite
-- entity views
CREATE OR REPLACE FUNCTION process_entity() RETURNS TRIGGER
	AS $process_entity$
	DECLARE
		type entity_types;
		entity_data_id integer := NULL;
	BEGIN
		IF (TG_TABLE_NAME = 'creator') THEN
			type := 'Creator';
		ELSIF (TG_TABLE_NAME = 'edition') THEN
			type := 'Edition';
		ELSIF (TG_TABLE_NAME = 'publication') THEN
			type := 'Publication';
		ELSIF (TG_TABLE_NAME = 'publisher') THEN
			type := 'Publisher';
		ELSIF (TG_TABLE_NAME = 'work') THEN
			type := 'Work';
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO entity_data(annotation_id, disambiguation_id, default_alias_id, _type)
				VALUES(NEW.annotation_id, NEW.disambiguation_id, NEW.default_alias_id, type)
				RETURNING entity_data.id INTO entity_data_id;

			-- Create a _data row for the appropriate entity type
			IF (type = 'Creator') THEN
				INSERT INTO creator_data(
					entity_data_id,
					begin_date, begin_date_precision,
					end_date, end_date_precision, ended,
					country_id, gender_id, creator_type_id
				)
					VALUES(
						entity_data_id,
						NEW.begin_date, NEW.begin_date_precision,
						NEW.end_date, NEW.end_date_precision, NEW.ended,
						NEW.country_id, NEW.gender_id, NEW.creator_type_id
					);
			ELSIF (type = 'Edition') THEN
				INSERT INTO edition_data(
					entity_data_id,
					publication_bbid, creator_credit_id,
					release_date, release_date_precision,
					pages, width, height, depth, weight,
					country_id, language_id,
					edition_format_id, edition_status_id, publisher_bbid
				)
					VALUES(
						entity_data_id,
						NEW.publication_bbid, NEW.creator_credit_id,
						NEW.release_date, NEW.release_date_precision,
						NEW.pages, NEW.width, NEW.height, NEW.depth, NEW.weight,
						NEW.country_id, NEW.language_id,
						NEW.edition_format_id, NEW.edition_status_id, NEW.publisher_bbid
					);
			ELSIF (type = 'Publication') THEN
				INSERT INTO publication_data(entity_data_id, publication_type_id)
					VALUES(entity_data_id, NEW.publication_type_id);
			ELSIF (type = 'Publisher') THEN
				INSERT INTO publisher_data(
					entity_data_id,
					begin_date, begin_date_precision,
					end_date, end_date_precision, ended,
					country_id, publisher_type_id
				)
					VALUES(
						entity_data_id,
						NEW.begin_date, NEW.begin_date_precision,
						NEW.end_date, NEW.end_date_precision, NEW.ended,
						NEW.country_id, NEW.publisher_type_id
					);
			ELSIF (type = 'Work') THEN
				INSERT INTO work_data(entity_data_id, work_type_id)
					VALUES(entity_data_id, NEW.work_type_id);
			END IF;
		END IF;

		-- Create a new entity if needed, or update the existing entity
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO entity(last_updated, master_revision_id, _type)
				VALUES(NOW(), NEW.revision_id, type)
				RETURNING entity.bbid INTO NEW.bbid;
		ELSIF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
			UPDATE entity
				SET last_updated = NOW(), master_revision_id = NEW.revision_id
				WHERE entity.bbid = NEW.bbid;
		END IF;

		INSERT INTO entity_revision(id, entity_bbid, entity_data_id)
			VALUES(NEW.revision_id, NEW.bbid, entity_data_id);

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_entity$ LANGUAGE plpgsql;

CREATE TRIGGER process_entity
	INSTEAD OF INSERT OR UPDATE OR DELETE ON creator
	FOR EACH ROW EXECUTE PROCEDURE process_entity();

CREATE TRIGGER process_entity
	INSTEAD OF INSERT OR UPDATE OR DELETE ON edition
	FOR EACH ROW EXECUTE PROCEDURE process_entity();

CREATE TRIGGER process_entity
	INSTEAD OF INSERT OR UPDATE OR DELETE ON publication
	FOR EACH ROW EXECUTE PROCEDURE process_entity();

CREATE TRIGGER process_entity
	INSTEAD OF INSERT OR UPDATE OR DELETE ON publisher
	FOR EACH ROW EXECUTE PROCEDURE process_entity();

CREATE TRIGGER process_entity
	INSTEAD OF INSERT OR UPDATE OR DELETE ON work
	FOR EACH ROW EXECUTE PROCEDURE process_entity();
