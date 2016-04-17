BEGIN;

CREATE TYPE bookbrainz.lang_proficiency AS ENUM (
	'BASIC',
	'INTERMEDIATE',
	'ADVANCED',
	'NATIVE'
);

CREATE TYPE bookbrainz.entity_type AS ENUM (
	'Creator',
	'Publication',
	'Edition',
	'Publisher',
	'Work'
);

CREATE TABLE bookbrainz.editor_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL CHECK (label <> '')
);

CREATE TABLE bookbrainz.editor (
	id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL UNIQUE CHECK (name <> ''),
	email VARCHAR(255) NOT NULL CHECK (email <> ''),
	reputation INT NOT NULL DEFAULT 0,
	bio TEXT NOT NULL DEFAULT '',
	birth_date DATE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	active_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	type_id INT NOT NULL,
	gender_id INT,
	area_id INT,
	password CHAR(60) NOT NULL CHECK (password <> ''),
	revisions_applied INT NOT NULL DEFAULT 0 CHECK (revisions_applied >= 0),
	revisions_reverted INT NOT NULL DEFAULT 0 CHECK (revisions_reverted >= 0),
	total_revisions INT NOT NULL DEFAULT 0 CHECK (total_revisions >= 0)
);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.editor_type (id);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (area_id) REFERENCES musicbrainz.area (id);

CREATE TABLE bookbrainz.editor__language (
	editor_id INT,
	language_id INT,
	proficiency bookbrainz.lang_proficiency NOT NULL,
	PRIMARY KEY (
		editor_id,
		language_id
	)
);

CREATE TABLE bookbrainz.entity (
	bbid UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	type bookbrainz.entity_type NOT NULL
);
ALTER TABLE bookbrainz.entity ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.entity_redirect (
	source_bbid UUID,
	target_bbid UUID,
	PRIMARY KEY (
		source_bbid,
		target_bbid
	)
);
ALTER TABLE bookbrainz.entity_redirect ADD FOREIGN KEY (source_bbid) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.entity_redirect ADD FOREIGN KEY (target_bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.creator_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.creator_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.publication_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.publication_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.edition_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.edition_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.publisher_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.publisher_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.work_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.work_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.revision_parent (
	parent_id INT,
	child_id INT,
	PRIMARY KEY(
		parent_id,
		child_id
	)
);

CREATE TABLE bookbrainz.revision (
	id SERIAL PRIMARY KEY,
	author_id INT NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.revision ADD FOREIGN KEY (author_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.revision_parent ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.revision_parent ADD FOREIGN KEY (child_id) REFERENCES bookbrainz.revision (id);

CREATE TABLE bookbrainz.creator_revision (
	id INT,
	bbid UUID,
	data_id INT,
	PRIMARY KEY (
		id, bbid
	)
);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.creator_header (bbid);
ALTER TABLE bookbrainz.creator_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.creator_revision (id, bbid);

CREATE TABLE bookbrainz.publication_revision (
	id INT,
	bbid UUID,
	data_id INT,
	PRIMARY KEY (
		id, bbid
	)
);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.publication_header (bbid);
ALTER TABLE bookbrainz.publication_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.publication_revision (id, bbid);

CREATE TABLE bookbrainz.edition_revision (
	id INT,
	bbid UUID,
	data_id INT,
	PRIMARY KEY (
		id, bbid
	)
);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.edition_header (bbid);
ALTER TABLE bookbrainz.edition_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.edition_revision (id, bbid);

CREATE TABLE bookbrainz.publisher_revision (
	id INT,
	bbid UUID,
	data_id INT,
	PRIMARY KEY (
		id, bbid
	)
);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.publisher_header (bbid);
ALTER TABLE bookbrainz.publisher_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.publisher_revision (id, bbid);

CREATE TABLE bookbrainz.work_revision (
	id INT,
	bbid UUID,
	data_id INT,
	PRIMARY KEY (
		id, bbid
	)
);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.work_header (bbid);
ALTER TABLE bookbrainz.work_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.work_revision (id, bbid);

CREATE TABLE bookbrainz.note (
	id SERIAL PRIMARY KEY,
	author_id INT NOT NULL,
	revision_id INT NOT NULL,
	content TEXT NOT NULL CHECK (content <> ''),
	posted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.note ADD FOREIGN KEY (author_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.note ADD FOREIGN KEY (revision_id) REFERENCES bookbrainz.revision (id);

CREATE TABLE bookbrainz.creator_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.creator_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL,
	identifier_set_id INT,
	relationship_set_id INT,
	annotation_id INT,
	disambiguation_id INT,
	begin_year SMALLINT,
	begin_month SMALLINT,
	begin_day SMALLINT,
	begin_area_id INT,
	end_year SMALLINT,
	end_month SMALLINT,
	end_day SMALLINT,
	end_area_id INT,
	ended BOOLEAN NOT NULL DEFAULT FALSE,
	area_id INT,
	gender_id INT,
	type_id INT,
	CHECK (
		(
			-- If any end date fields are not null, then ended must be true
			(
				end_year IS NOT NULL OR
				end_month IS NOT NULL OR
				end_day IS NOT NULL
			) AND ended = TRUE
		) OR (
			-- Otherwise, all end date fields must be null
			(
				end_year IS NULL AND
				end_month IS NULL AND
				end_day IS NULL
			)
		)
	)
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.creator_type (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (area_id) REFERENCES musicbrainz.area (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (begin_area_id) REFERENCES musicbrainz.area (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (end_area_id) REFERENCES musicbrainz.area (id);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.creator_data (id);

CREATE TABLE bookbrainz.release_event (
	id SERIAL PRIMARY KEY,
	"year" SMALLINT,
	"month" SMALLINT,
	"day" SMALLINT,
	area_id INT
);
ALTER TABLE bookbrainz.release_event ADD FOREIGN KEY (area_id) REFERENCES musicbrainz.country_area (area);

CREATE TABLE bookbrainz.release_event_set (
	id SERIAL PRIMARY KEY
);

CREATE TABLE bookbrainz.release_event_set__release_event (
	set_id INT,
	release_event_id INT,
	PRIMARY KEY (
		set_id,
		release_event_id
	)
);
ALTER TABLE bookbrainz.release_event_set__release_event ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.release_event_set (id);
ALTER TABLE bookbrainz.release_event_set__release_event ADD FOREIGN KEY (release_event_id) REFERENCES bookbrainz.release_event (id);

CREATE TABLE bookbrainz.creator_credit (
	id SERIAL PRIMARY KEY,
	creator_count SMALLINT NOT NULL,
	ref_count INT NOT NULL DEFAULT 0,
	begin_phrase TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.creator_credit_name (
	creator_credit_id INT,
	"position" SMALLINT NOT NULL CHECK ("position" >= 0),
	creator_bbid UUID NOT NULL,
	name VARCHAR NOT NULL CHECK (name <> ''),
	join_phrase TEXT NOT NULL,
	PRIMARY KEY (
		creator_credit_id,
		position
	)
);
ALTER TABLE bookbrainz.creator_credit_name ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);
ALTER TABLE bookbrainz.creator_credit_name ADD FOREIGN KEY (creator_bbid) REFERENCES bookbrainz.creator_header (bbid);

CREATE TABLE bookbrainz.publisher_set (
	id SERIAL PRIMARY KEY
);

CREATE TABLE bookbrainz.publisher_set__publisher (
	set_id INT,
	publisher_bbid UUID,
	PRIMARY KEY (
		set_id,
		publisher_bbid
	)
);
ALTER TABLE bookbrainz.publisher_set__publisher ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.publisher_set (id);
ALTER TABLE bookbrainz.publisher_set__publisher ADD FOREIGN KEY (publisher_bbid) REFERENCES bookbrainz.publisher_header (bbid);

CREATE TABLE bookbrainz.edition_format (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.edition_status (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.edition_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL,
	identifier_set_id INT,
	relationship_set_id INT,
	annotation_id INT,
	disambiguation_id INT,
	publication_bbid UUID,
	creator_credit_id INT,
	publisher_set_id INT,
	language_set_id INT,
	release_event_set_id INT,
	width SMALLINT CHECK (width >= 0),
	height SMALLINT CHECK (height >= 0),
	depth SMALLINT CHECK (depth >= 0),
	weight SMALLINT CHECK (weight >= 0),
	pages SMALLINT CHECK (pages >= 0),
	format_id INT,
	status_id INT
);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (format_id) REFERENCES bookbrainz.edition_format (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (publication_bbid) REFERENCES bookbrainz.publication_header (bbid);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (status_id) REFERENCES bookbrainz.edition_status (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (publisher_set_id) REFERENCES bookbrainz.publisher_set (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (release_event_set_id) REFERENCES bookbrainz.release_event_set (id);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);

CREATE TABLE bookbrainz.publication_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.publication_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL,
	identifier_set_id INT,
	relationship_set_id INT,
	annotation_id INT,
	disambiguation_id INT,
	type_id INT
);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.publication_type (id);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publication_data (id);

CREATE TABLE bookbrainz.publisher_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.publisher_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL,
	identifier_set_id INT,
	relationship_set_id INT,
	annotation_id INT,
	disambiguation_id INT,
	begin_year SMALLINT,
	begin_month SMALLINT,
	begin_day SMALLINT,
	end_year SMALLINT,
	end_month SMALLINT,
	end_day SMALLINT,
	ended BOOLEAN NOT NULL DEFAULT FALSE,
	area_id INT,
	type_id INT,
	CHECK (
		(
			-- If any end date fields are not null, then ended must be true
			(
				end_year IS NOT NULL OR
				end_month IS NOT NULL OR
				end_day IS NOT NULL
			) AND ended = TRUE
		) OR (
			-- Otherwise, all end date fields must be null
			(
				end_year IS NULL AND
				end_month IS NULL AND
				end_day IS NULL
			)
		)
	)
);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.publisher_type (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (area_id) REFERENCES musicbrainz.area (id);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publisher_data (id);

CREATE TABLE bookbrainz.work_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

CREATE TABLE bookbrainz.work_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL,
	identifier_set_id INT,
	relationship_set_id INT,
	annotation_id INT,
	disambiguation_id INT,
	language_set_id INT,
	type_id INT
);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.work_type (id);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.work_data (id);

CREATE TABLE bookbrainz.annotation (
	id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
	last_revision_id INT NOT NULL
);
ALTER TABLE bookbrainz.annotation ADD FOREIGN KEY (last_revision_id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (annotation_id) REFERENCES bookbrainz.annotation (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (annotation_id) REFERENCES bookbrainz.annotation (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (annotation_id) REFERENCES bookbrainz.annotation (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (annotation_id) REFERENCES bookbrainz.annotation (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (annotation_id) REFERENCES bookbrainz.annotation (id);

CREATE TABLE bookbrainz.disambiguation (
	id SERIAL PRIMARY KEY,
	comment TEXT NOT NULL
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (disambiguation_id) REFERENCES bookbrainz.disambiguation (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (disambiguation_id) REFERENCES bookbrainz.disambiguation (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (disambiguation_id) REFERENCES bookbrainz.disambiguation (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (disambiguation_id) REFERENCES bookbrainz.disambiguation (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (disambiguation_id) REFERENCES bookbrainz.disambiguation (id);

CREATE TABLE bookbrainz.alias (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL CHECK (name <> ''),
	sort_name TEXT NOT NULL CHECK (sort_name <> ''),
	language_id INT,
	"primary" BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.alias ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

CREATE TABLE bookbrainz.identifier_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL CHECK (label <> ''),
	description TEXT NOT NULL CHECK (description <> ''),
	detection_regex TEXT,
	validation_regex TEXT NOT NULL,
	display_template TEXT NOT NULL CHECK (display_template <> ''),
	entity_type bookbrainz.entity_type NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.identifier_type ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.identifier_type (id);

CREATE TABLE bookbrainz.identifier (
	id SERIAL PRIMARY KEY,
	type_id INT NOT NULL,
	value TEXT NOT NULL CHECK (value <> '')
);
ALTER TABLE bookbrainz.identifier ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.identifier_type (id);

CREATE TABLE bookbrainz.relationship_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL CHECK (label <> ''),
	description TEXT NOT NULL CHECK (description <> ''),
	display_template TEXT NOT NULL CHECK (display_template <> ''),
	source_entity_type bookbrainz.entity_type NOT NULL,
	target_entity_type bookbrainz.entity_type NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.relationship_type ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.relationship_type (id);

CREATE TABLE bookbrainz.alias_set (
	id SERIAL PRIMARY KEY,
	default_alias_id INT
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (alias_set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (alias_set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (alias_set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (alias_set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (alias_set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.alias_set ADD FOREIGN KEY (default_alias_id) REFERENCES bookbrainz.alias (id);

CREATE TABLE bookbrainz.alias_set__alias (
	set_id INT,
	alias_id INT,
	PRIMARY KEY (
		set_id,
		alias_id
	)
);
ALTER TABLE bookbrainz.alias_set__alias ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.alias_set (id);
ALTER TABLE bookbrainz.alias_set__alias ADD FOREIGN KEY (alias_id) REFERENCES bookbrainz.alias (id);

CREATE TABLE bookbrainz.identifier_set (
	id SERIAL PRIMARY KEY
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (identifier_set_id) REFERENCES bookbrainz.identifier_set (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (identifier_set_id) REFERENCES bookbrainz.identifier_set (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (identifier_set_id) REFERENCES bookbrainz.identifier_set (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (identifier_set_id) REFERENCES bookbrainz.identifier_set (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (identifier_set_id) REFERENCES bookbrainz.identifier_set (id);

CREATE TABLE bookbrainz.identifier_set__identifier (
	set_id INT,
	identifier_id INT,
	PRIMARY KEY (
		set_id,
		identifier_id
	)
);
ALTER TABLE bookbrainz.identifier_set__identifier ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.identifier_set (id);
ALTER TABLE bookbrainz.identifier_set__identifier ADD FOREIGN KEY (identifier_id) REFERENCES bookbrainz.identifier (id);

CREATE TABLE bookbrainz.relationship_set (
	id SERIAL PRIMARY KEY
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (relationship_set_id) REFERENCES bookbrainz.relationship_set (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (relationship_set_id) REFERENCES bookbrainz.relationship_set (id);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (relationship_set_id) REFERENCES bookbrainz.relationship_set (id);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (relationship_set_id) REFERENCES bookbrainz.relationship_set (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (relationship_set_id) REFERENCES bookbrainz.relationship_set (id);

CREATE TABLE bookbrainz.relationship_set__relationship (
	set_id INTEGER,
	relationship_id INTEGER,
	PRIMARY KEY (
		set_id,
		relationship_id
	)
);
ALTER TABLE bookbrainz.relationship_set__relationship ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.relationship_set (id);

CREATE TABLE bookbrainz.relationship (
	id SERIAL PRIMARY KEY,
	type_id INT NOT NULL,
	source_bbid UUID NOT NULL,
	target_bbid UUID NOT NULL
);
ALTER TABLE bookbrainz.relationship_set__relationship ADD FOREIGN KEY (relationship_id) REFERENCES bookbrainz.relationship (id);
ALTER TABLE bookbrainz.relationship ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.relationship_type (id);
ALTER TABLE bookbrainz.relationship ADD FOREIGN KEY (source_bbid) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.relationship ADD FOREIGN KEY (target_bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.language_set (
	id SERIAL PRIMARY KEY
);

CREATE TABLE bookbrainz.language_set__language (
	set_id INT,
	language_id INT,
	PRIMARY KEY (
		set_id,
		language_id
	)
);
ALTER TABLE bookbrainz.language_set__language ADD FOREIGN KEY (set_id) REFERENCES bookbrainz.language_set (id);
ALTER TABLE bookbrainz.language_set__language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (language_set_id) REFERENCES bookbrainz.language_set (id);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (language_set_id) REFERENCES bookbrainz.language_set (id);

-- Views --

CREATE VIEW bookbrainz.creator AS
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

CREATE VIEW bookbrainz.edition AS
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

CREATE VIEW bookbrainz.work AS
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

CREATE VIEW bookbrainz.publisher AS
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

CREATE VIEW bookbrainz.publication AS
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

COMMIT;
