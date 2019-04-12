------------------------------------------------------------------------
-- Rename entities Author -> Creator and Edition Group -> Publication --
------------------------------------------------------------------------


---------------------- ****** NOTICE ****** ----------------------
-- Don't forget to run the create_trigger.sql script afterwards --
------------------------------------------------------------------

BEGIN TRANSACTION;

	-- rename tables
	ALTER TABLE IF EXISTS bookbrainz.author_data RENAME TO creator_data;
	ALTER TABLE IF EXISTS bookbrainz.author_header RENAME TO creator_header;
	ALTER TABLE IF EXISTS bookbrainz.author_revision RENAME TO creator_revision;
	ALTER TABLE IF EXISTS bookbrainz.author_type RENAME TO creator_type;

	ALTER TABLE IF EXISTS bookbrainz.author_credit RENAME TO creator_credit;
	ALTER TABLE IF EXISTS bookbrainz.author_credit_name RENAME TO creator_credit_name;

	ALTER TABLE IF EXISTS bookbrainz.edition_group_data RENAME TO publication_data;
	ALTER TABLE IF EXISTS bookbrainz.edition_group_header RENAME TO publication_header;
	ALTER TABLE IF EXISTS bookbrainz.edition_group_revision RENAME TO publication_revision;
	ALTER TABLE IF EXISTS bookbrainz.edition_group_type RENAME TO publication_type;

	ALTER TABLE IF EXISTS bookbrainz.author_import_header RENAME TO creator_import_header;
	ALTER TABLE IF EXISTS bookbrainz.edition_group_import_header RENAME TO publication_import_header;

	-- rename columns
	ALTER TABLE IF EXISTS bookbrainz.edition_data RENAME COLUMN edition_group_bbid TO publication_bbid;
	ALTER TABLE IF EXISTS bookbrainz.edition_data RENAME COLUMN author_credit_id TO creator_credit_id;

	ALTER TABLE IF EXISTS bookbrainz.creator_credit RENAME COLUMN author_count TO creator_count;
	ALTER TABLE IF EXISTS bookbrainz.creator_credit_name RENAME COLUMN author_credit_id TO creator_credit_id;
	ALTER TABLE IF EXISTS bookbrainz.creator_credit_name RENAME COLUMN author_bbid TO creator_bbid;

	-- rename awards and description
	UPDATE bookbrainz.achievement_type SET name = replace(name,'Author Creator','Creator Creator');
	UPDATE bookbrainz.achievement_type SET description = replace(description,'author','creator');
	UPDATE bookbrainz.achievement_type SET description = replace(description,'edition group','publication');


	-- rename the existing enum type
	ALTER TYPE bookbrainz.entity_type RENAME TO entity_type_old;

	-- create the new enum with corrected labels
	CREATE TYPE bookbrainz.entity_type AS ENUM (
		'Creator',
		'Publication',
		'Edition',
		'Publisher',
		'Work'
	);

	CREATE OR REPLACE FUNCTION rename_enum_label(old_type bookbrainz.entity_type_old) RETURNS bookbrainz.entity_type
	AS $rename_enum_label$
	BEGIN
		IF ($1::text = 'Author') THEN
			RETURN 'Creator'::bookbrainz.entity_type;
		ELSIF ($1::text = 'EditionGroup') THEN
			RETURN 'Publication'::bookbrainz.entity_type;
		ELSE
			RETURN $1::text::bookbrainz.entity_type;
		END IF;
	END
	$rename_enum_label$ LANGUAGE plpgsql;


	-- drop triggers and functions whose names will change before dropping associated views
	DROP TRIGGER IF EXISTS process_author ON bookbrainz.author;
	DROP TRIGGER IF EXISTS process_edition_group ON bookbrainz.edition_group;
	DROP FUNCTION IF EXISTS bookbrainz.process_author();
	DROP FUNCTION IF EXISTS bookbrainz.process_edition_group();

	-- drop old views before altering column type
	DROP VIEW IF EXISTS
		bookbrainz.author,
		bookbrainz.edition_group,
		bookbrainz.edition,
		bookbrainz.publisher,
		bookbrainz.work,
		bookbrainz.author_import,
		bookbrainz.edition_group_import,
		bookbrainz.edition_import,
		bookbrainz.publisher_import,
		bookbrainz.work_import;

	-- update the relevant columns type to use the new enum
	ALTER TABLE IF EXISTS bookbrainz.relationship_type
		ALTER COLUMN source_entity_type TYPE bookbrainz.entity_type USING rename_enum_label(source_entity_type),
		ALTER COLUMN target_entity_type TYPE bookbrainz.entity_type USING rename_enum_label(target_entity_type);

	ALTER TABLE IF EXISTS bookbrainz.entity
		ALTER COLUMN type TYPE bookbrainz.entity_type USING rename_enum_label(type);

	ALTER TABLE IF EXISTS bookbrainz.identifier_type
		ALTER COLUMN entity_type TYPE bookbrainz.entity_type USING rename_enum_label(entity_type);

	ALTER TABLE IF EXISTS bookbrainz.import
		ALTER COLUMN type TYPE bookbrainz.entity_type USING rename_enum_label(type);

	-- remove the old type
	DROP FUNCTION IF EXISTS rename_enum_label(bookbrainz.entity_type_old);
	DROP TYPE IF EXISTS bookbrainz.entity_type_old;


	-- Recreate views with the corrected enum type and column names
	CREATE OR REPLACE VIEW bookbrainz.creator AS
		SELECT
			e.bbid, cd.id AS data_id, cr.id AS revision_id, (cr.id = c.master_revision_id) AS master, cd.annotation_id, cd.disambiguation_id,
			als.default_alias_id, cd.begin_year, cd.begin_month, cd.begin_day, cd.begin_area_id,
			cd.end_year, cd.end_month, cd.end_day, cd.end_area_id, cd.ended, cd.area_id,
			cd.gender_id, cd.type_id, cd.alias_set_id, cd.identifier_set_id, cd.relationship_set_id, e.type
		FROM bookbrainz.creator_revision cr
		LEFT JOIN bookbrainz.entity e ON e.bbid = cr.bbid
		LEFT JOIN bookbrainz.creator_header c ON c.bbid = e.bbid
		LEFT JOIN bookbrainz.creator_data cd ON cr.data_id = cd.id
		LEFT JOIN bookbrainz.alias_set als ON cd.alias_set_id = als.id
		WHERE e.type = 'Creator';

	CREATE OR REPLACE VIEW bookbrainz.publication AS
		SELECT
			e.bbid, pcd.id AS data_id, pcr.id AS revision_id, (pcr.id = pc.master_revision_id) AS master, pcd.annotation_id, pcd.disambiguation_id,
			als.default_alias_id, pcd.type_id, pcd.alias_set_id, pcd.identifier_set_id,
			pcd.relationship_set_id, e.type
		FROM bookbrainz.publication_revision pcr
		LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
		LEFT JOIN bookbrainz.publication_header pc ON pc.bbid = e.bbid
		LEFT JOIN bookbrainz.publication_data pcd ON pcr.data_id = pcd.id
		LEFT JOIN bookbrainz.alias_set als ON pcd.alias_set_id = als.id
		WHERE e.type = 'Publication';

	CREATE OR REPLACE VIEW bookbrainz.edition AS
		SELECT
			e.bbid, edd.id AS data_id, edr.id AS revision_id, (edr.id = ed.master_revision_id) AS master, edd.annotation_id, edd.disambiguation_id,
			als.default_alias_id, edd.publication_bbid, edd.creator_credit_id, edd.width, edd.height,
			edd.depth, edd.weight, edd.pages, edd.format_id, edd.status_id,
			edd.alias_set_id, edd.identifier_set_id, edd.relationship_set_id, e.type,
			edd.language_set_id, edd.release_event_set_id, edd.publisher_set_id
		FROM bookbrainz.edition_revision edr
		LEFT JOIN bookbrainz.entity e ON e.bbid = edr.bbid
		LEFT JOIN bookbrainz.edition_header ed ON ed.bbid = e.bbid
		LEFT JOIN bookbrainz.edition_data edd ON edr.data_id = edd.id
		LEFT JOIN bookbrainz.alias_set als ON edd.alias_set_id = als.id
		WHERE e.type = 'Edition';

	CREATE OR REPLACE VIEW bookbrainz.work AS
		SELECT
			e.bbid, wd.id AS data_id, wr.id AS revision_id, (wr.id = w.master_revision_id) AS master, wd.annotation_id, wd.disambiguation_id,
			als.default_alias_id, wd.type_id, wd.alias_set_id, wd.identifier_set_id,
			wd.relationship_set_id, e.type, wd.language_set_id
		FROM bookbrainz.work_revision wr
		LEFT JOIN bookbrainz.entity e ON e.bbid = wr.bbid
		LEFT JOIN bookbrainz.work_header w ON w.bbid = e.bbid
		LEFT JOIN bookbrainz.work_data wd ON wr.data_id = wd.id
		LEFT JOIN bookbrainz.alias_set als ON wd.alias_set_id = als.id
		WHERE e.type = 'Work';

	CREATE OR REPLACE VIEW bookbrainz.publisher AS
		SELECT
			e.bbid, psd.id AS data_id, psr.id AS revision_id, (psr.id = ps.master_revision_id) AS master, psd.annotation_id, psd.disambiguation_id,
			als.default_alias_id, psd.begin_year, psd.begin_month, psd.begin_day,
			psd.end_year, psd.end_month, psd.end_day, psd.ended, psd.area_id,
			psd.type_id, psd.alias_set_id, psd.identifier_set_id, psd.relationship_set_id, e.type
		FROM bookbrainz.publisher_revision psr
		LEFT JOIN bookbrainz.entity e ON e.bbid = psr.bbid
		LEFT JOIN bookbrainz.publisher_header ps ON ps.bbid = e.bbid
		LEFT JOIN bookbrainz.publisher_data psd ON psr.data_id = psd.id
		LEFT JOIN bookbrainz.alias_set als ON psd.alias_set_id = als.id
		WHERE e.type = 'Publisher';

	CREATE OR REPLACE VIEW bookbrainz.creator_import AS
		SELECT
			import.id AS import_id,
			creator_data.id as data_id,
			creator_data.annotation_id,
			creator_data.disambiguation_id,
			alias_set.default_alias_id,
			creator_data.begin_year,
			creator_data.begin_month,
			creator_data.begin_day,
			creator_data.end_year,
			creator_data.end_month,
			creator_data.end_day,
			creator_data.begin_area_id,
			creator_data.end_area_id,
			creator_data.ended,
			creator_data.area_id,
			creator_data.gender_id,
			creator_data.type_id,
			creator_data.alias_set_id,
			creator_data.identifier_set_id,
			import.type
		FROM bookbrainz.import import
		LEFT JOIN bookbrainz.creator_import_header creator_import_header ON import.id = creator_import_header.import_id
		LEFT JOIN bookbrainz.creator_data creator_data ON creator_import_header.data_id = creator_data.id
		LEFT JOIN bookbrainz.alias_set alias_set ON creator_data.alias_set_id = alias_set.id
		WHERE import.type = 'Creator';


	CREATE OR REPLACE VIEW bookbrainz.edition_import AS
		SELECT
			import.id AS import_id,
			edition_data.id as data_id,
			edition_data.disambiguation_id,
			alias_set.default_alias_id,
			edition_data.width,
			edition_data.height,
			edition_data.depth,
			edition_data.weight,
			edition_data.pages,
			edition_data.format_id,
			edition_data.status_id,
			edition_data.alias_set_id,
			edition_data.identifier_set_id,
			import.type,
			edition_data.language_set_id,
			edition_data.release_event_set_id
		FROM bookbrainz.import import
		LEFT JOIN bookbrainz.edition_import_header edition_import_header ON import.id = edition_import_header.import_id
		LEFT JOIN bookbrainz.edition_data edition_data ON edition_import_header.data_id = edition_data.id
		LEFT JOIN bookbrainz.alias_set alias_set ON edition_data.alias_set_id = alias_set.id
		WHERE import.type = 'Edition';

	CREATE OR REPLACE VIEW bookbrainz.publisher_import AS
		SELECT
			import.id AS import_id,
			publisher_data.id as data_id,
			publisher_data.disambiguation_id,
			alias_set.default_alias_id,
			publisher_data.begin_year,
			publisher_data.begin_month,
			publisher_data.begin_day,
			publisher_data.end_year,
			publisher_data.end_month,
			publisher_data.end_day,
			publisher_data.ended,
			publisher_data.area_id,
			publisher_data.type_id,
			publisher_data.alias_set_id,
			publisher_data.identifier_set_id,
			import.type
		FROM
			bookbrainz.import import
			LEFT JOIN bookbrainz.publisher_import_header publisher_import_header ON import.id = publisher_import_header.import_id
			LEFT JOIN bookbrainz.publisher_data publisher_data ON publisher_import_header.data_id = publisher_data.id
			LEFT JOIN bookbrainz.alias_set alias_set ON publisher_data.alias_set_id = alias_set.id
			WHERE import.type = 'Publisher';

	CREATE OR REPLACE VIEW bookbrainz.publication_import AS
		SELECT
			import.id AS import_id,
			publication_data.id as data_id,
			publication_data.disambiguation_id,
			alias_set.default_alias_id,
			publication_data.type_id,
			publication_data.alias_set_id,
			publication_data.identifier_set_id,
			import.type
		FROM bookbrainz.import import
		LEFT JOIN bookbrainz.publication_import_header publication_import_header ON import.id = publication_import_header.import_id
		LEFT JOIN bookbrainz.publication_data publication_data ON publication_import_header.data_id = publication_data.id
		LEFT JOIN bookbrainz.alias_set alias_set ON publication_data.alias_set_id = alias_set.id
		WHERE import.type = 'Publication';

	CREATE OR REPLACE VIEW bookbrainz.work_import AS
		SELECT
			import.id as import_id,
			work_data.id AS data_id,
			work_data.annotation_id,
			work_data.disambiguation_id,
			alias_set.default_alias_id,
			work_data.type_id,
			work_data.alias_set_id,
			work_data.identifier_set_id,
			import.type,
			work_data.language_set_id
		FROM bookbrainz.import import
		LEFT JOIN bookbrainz.work_import_header work_import_header ON import.id = work_import_header.import_id
		LEFT JOIN bookbrainz.work_data work_data ON work_import_header.data_id = work_data.id
		LEFT JOIN bookbrainz.alias_set alias_set ON work_data.alias_set_id = alias_set.id
		WHERE import.type = 'Work';
---------------------- ****** NOTICE ****** ----------------------
-- Don't forget to run the create_trigger.sql script afterwards --
------------------------------------------------------------------
 
COMMIT TRANSACTION;