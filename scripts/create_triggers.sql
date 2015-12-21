-- Provides functionality for create, update and delete operations on composite
-- entity views
CREATE OR REPLACE FUNCTION bookbrainz.process_creator() RETURNS TRIGGER
	AS $process_creator$
	DECLARE
		creator_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			IF (NEW.bbid IS NULL) THEN
				INSERT INTO bookbrainz.entity(type) VALUES('Creator') RETURNING bookbrainz.entity.bbid INTO NEW.bbid;
			ELSE
				INSERT INTO bookbrainz.entity(bbid, type) VALUES(NEW.bbid, 'Creator');
			END IF;
			INSERT INTO bookbrainz.creator_header(bbid) VALUES(NEW.bbid);
		END IF;

		IF (NEW.ended IS NULL) THEN
			NEW.ended = false;
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.creator_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, begin_year, begin_month, begin_day, begin_area_id,
				end_year, end_month, end_day, end_area_id, ended, area_id, gender_id,
				type_id
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id, NEW.begin_year,
				NEW.begin_month, NEW.begin_day, NEW.begin_area_id, NEW.end_year,
				NEW.end_month, NEW.end_day, NEW.end_area_id, NEW.ended, NEW.area_id, NEW.gender_id,
				NEW.type_id
			) RETURNING bookbrainz.creator_data.id INTO creator_data_id;
		END IF;

		INSERT INTO bookbrainz.creator_revision VALUES(NEW.revision_id, NEW.bbid, creator_data_id);

		UPDATE bookbrainz.creator_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		UPDATE bookbrainz.entity
			SET last_updated = timezone('UTC'::TEXT, now())
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_creator$ LANGUAGE plpgsql;

BEGIN;

CREATE TRIGGER process_creator
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.creator
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_creator();

COMMIT;
