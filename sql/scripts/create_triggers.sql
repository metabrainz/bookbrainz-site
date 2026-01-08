-- Provides functionality for create, update and delete operations on composite
-- entity views
CREATE OR REPLACE FUNCTION bookbrainz.process_author() RETURNS TRIGGER
	AS $process_author$
	DECLARE
		author_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.author_header(bbid) VALUES(NEW.bbid);
		END IF;

		IF (NEW.ended IS NULL) THEN
			NEW.ended = false;
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.author_data(
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
			) RETURNING bookbrainz.author_data.id INTO author_data_id;

			INSERT INTO bookbrainz.author_revision VALUES(NEW.revision_id, NEW.bbid, author_data_id);
		ELSE
			INSERT INTO bookbrainz.author_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.author_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_author$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bookbrainz.process_edition() RETURNS TRIGGER
	AS $process_edition$
	DECLARE
		edition_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.edition_header(bbid) VALUES(NEW.bbid);
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.edition_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, edition_group_bbid, author_credit_id,
				publisher_set_id, release_event_set_id, language_set_id, width,
				height, depth, weight, pages, format_id, status_id, credit_section
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id, NEW.edition_group_bbid,
				NEW.author_credit_id, NEW.publisher_set_id,
				NEW.release_event_set_id, NEW.language_set_id, NEW.width,
				NEW.height, NEW.depth, NEW.weight, NEW.pages, NEW.format_id,
				NEW.status_id, NEW.credit_section
			) RETURNING bookbrainz.edition_data.id INTO edition_data_id;

			INSERT INTO bookbrainz.edition_revision VALUES(NEW.revision_id, NEW.bbid, edition_data_id);
		ELSE
			INSERT INTO bookbrainz.edition_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.edition_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_edition$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bookbrainz.process_series() RETURNS TRIGGER
	AS $process_series$
	DECLARE
		series_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.series_header(bbid) VALUES(NEW.bbid);
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.series_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, entity_type, ordering_type_id
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id,
				NEW.entity_type, NEW.ordering_type_id
			) RETURNING bookbrainz.series_data.id INTO series_data_id;

			INSERT INTO bookbrainz.series_revision VALUES(NEW.revision_id, NEW.bbid, series_data_id);
		ELSE
			INSERT INTO bookbrainz.series_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.series_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_series$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bookbrainz.process_work() RETURNS TRIGGER
	AS $process_work$
	DECLARE
		work_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.work_header(bbid) VALUES(NEW.bbid);
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.work_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, language_set_id, type_id
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id, NEW.language_set_id,
				NEW.type_id
			) RETURNING bookbrainz.work_data.id INTO work_data_id;

			INSERT INTO bookbrainz.work_revision VALUES(NEW.revision_id, NEW.bbid, work_data_id);
		ELSE
			INSERT INTO bookbrainz.work_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.work_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_work$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION bookbrainz.process_publisher() RETURNS TRIGGER
	AS $process_publisher$
	DECLARE
		publisher_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.publisher_header(bbid) VALUES(NEW.bbid);
		END IF;

		IF (NEW.ended IS NULL) THEN
			NEW.ended = false;
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.publisher_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, type_id, begin_year, begin_month, begin_day, end_year,
				end_month, end_day, ended, area_id
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id, NEW.type_id, NEW.begin_year,
				NEW.begin_month, NEW.begin_day, NEW.end_year, NEW.end_month, NEW.end_day,
				NEW.ended, NEW.area_id
			) RETURNING bookbrainz.publisher_data.id INTO publisher_data_id;

			INSERT INTO bookbrainz.publisher_revision VALUES(NEW.revision_id, NEW.bbid, publisher_data_id);
		ELSE
			INSERT INTO bookbrainz.publisher_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.publisher_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_publisher$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION bookbrainz.process_edition_group() RETURNS TRIGGER
	AS $process_edition_group$
	DECLARE
		edition_group_data_id INT;
	BEGIN
		IF (TG_OP = 'INSERT') THEN
			INSERT INTO bookbrainz.edition_group_header(bbid) VALUES(NEW.bbid);
		END IF;

		-- If we're not deleting, create new entity data rows as necessary
		IF (TG_OP <> 'DELETE') THEN
			INSERT INTO bookbrainz.edition_group_data(
				alias_set_id, identifier_set_id, relationship_set_id, annotation_id,
				disambiguation_id, type_id, author_credit_id, credit_section
			) VALUES (
				NEW.alias_set_id, NEW.identifier_set_id, NEW.relationship_set_id,
				NEW.annotation_id, NEW.disambiguation_id, NEW.type_id, NEW.author_credit_id, NEW.credit_section
			) RETURNING bookbrainz.edition_group_data.id INTO edition_group_data_id;

			INSERT INTO bookbrainz.edition_group_revision VALUES(NEW.revision_id, NEW.bbid, edition_group_data_id);
		ELSE
			INSERT INTO bookbrainz.edition_group_revision VALUES(NEW.revision_id, NEW.bbid, NULL);
		END IF;

		UPDATE bookbrainz.edition_group_header
			SET master_revision_id = NEW.revision_id
			WHERE bbid = NEW.bbid;

		IF (TG_OP = 'DELETE') THEN
			RETURN OLD;
		ELSE
			RETURN NEW;
		END IF;
	END;
$process_edition_group$ LANGUAGE plpgsql;


BEGIN;

CREATE TRIGGER process_author
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.author
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_author();

COMMIT;

BEGIN;

CREATE TRIGGER process_edition
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.edition
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_edition();

COMMIT;

BEGIN;

CREATE TRIGGER process_series
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.series
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_series();

COMMIT;

BEGIN;

CREATE TRIGGER process_work
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.work
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_work();

COMMIT;

BEGIN;

CREATE TRIGGER process_publisher
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.publisher
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_publisher();

COMMIT;

BEGIN;

CREATE TRIGGER process_edition_group
	INSTEAD OF INSERT OR UPDATE OR DELETE ON bookbrainz.edition_group
	FOR EACH ROW EXECUTE PROCEDURE bookbrainz.process_edition_group();

COMMIT;
