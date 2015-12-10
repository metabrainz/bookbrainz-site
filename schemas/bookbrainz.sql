BEGIN;

CREATE TYPE entity_type AS ENUM (
	'Creator',
	'Publication',
	'Edition',
	'Publisher',
	'Work'
);

CREATE TABLE bookbrainz.editor_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE bookbrainz.editor (
	id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL,
	reputation INT NOT NULL DEFAULT 0,
	bio TEXT NOT NULL DEFAULT '',
	birth_date DATE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	active_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	type_id INT NOT NULL,
	gender_id INT,
	country_id INT,
	password CHAR(60) NOT NULL,
	revisions_applied INT NOT NULL DEFAULT 0,
	revisions_reverted INT NOT NULL DEFAULT 0,
	total_revisions INT NOT NULL DEFAULT 0
);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);
ALTER TABLE bookbrainz.editor ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.editor_type (id);

CREATE TABLE bookbrainz.entity (
	bbid UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	redirect_bbid UUID NULL,
	last_updated TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);
ALTER TABLE bookbrainz.entity ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.creator_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT NULL
);
ALTER TABLE bookbrainz.creator_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.publication_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT NULL
);
ALTER TABLE bookbrainz.publication_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.edition_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT NULL
);
ALTER TABLE bookbrainz.edition_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.publisher_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT NULL
);
ALTER TABLE bookbrainz.publisher_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.work_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT NULL
);
ALTER TABLE bookbrainz.work_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.revision_parent (
	parent_id INT NOT NULL,
	child_id INT NOT NULL,
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
	id SERIAL PRIMARY KEY,
	bbid UUID NOT NULL,
	data_id INT
);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.creator_header (bbid);
ALTER TABLE bookbrainz.creator_header ADD FOREIGN KEY (master_revision_id) REFERENCES bookbrainz.creator_revision (id);

CREATE TABLE bookbrainz.publication_revision (
	id SERIAL PRIMARY KEY,
	bbid UUID NOT NULL,
	data_id INT
);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.publication_header (bbid);
ALTER TABLE bookbrainz.publication_header ADD FOREIGN KEY (master_revision_id) REFERENCES bookbrainz.publication_revision (id);

CREATE TABLE bookbrainz.edition_revision (
	id SERIAL PRIMARY KEY,
	bbid UUID NOT NULL,
	data_id INT
);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.edition_header (bbid);
ALTER TABLE bookbrainz.edition_header ADD FOREIGN KEY (master_revision_id) REFERENCES bookbrainz.edition_revision (id);

CREATE TABLE bookbrainz.publisher_revision (
	id SERIAL PRIMARY KEY,
	bbid UUID NOT NULL,
	data_id INT
);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.publisher_header (bbid);
ALTER TABLE bookbrainz.publisher_header ADD FOREIGN KEY (master_revision_id) REFERENCES bookbrainz.publisher_revision (id);

CREATE TABLE bookbrainz.work_revision (
	id SERIAL PRIMARY KEY,
	bbid UUID NOT NULL,
	data_id INT
);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (id) REFERENCES bookbrainz.revision (id);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.work_header (bbid);
ALTER TABLE bookbrainz.work_header ADD FOREIGN KEY (master_revision_id) REFERENCES bookbrainz.work_revision (id);

CREATE TABLE bookbrainz.note (
	id SERIAL PRIMARY KEY,
	author_id INT NOT NULL,
	revision_id INT NOT NULL,
	content TEXT NOT NULL,
	posted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.note ADD FOREIGN KEY (author_id) REFERENCES bookbrainz.editor (id);
ALTER TABLE bookbrainz.note ADD FOREIGN KEY (revision_id) REFERENCES bookbrainz.revision (id);

CREATE TABLE bookbrainz.creator_data (
	id INT PRIMARY KEY,
	begin_year SMALLINT,
	begin_month SMALLINT,
	begin_day SMALLINT,
	end_year SMALLINT,
	end_month SMALLINT,
	end_day SMALLINT,
	ended BOOLEAN NOT NULL DEFAULT FALSE,
	country_id INT,
	gender_id INT,
	type_id INT
);
ALTER TABLE bookbrainz.creator_data ADD FOREIGN KEY (gender_id) REFERENCES musicbrainz.gender (id);
ALTER TABLE bookbrainz.creator_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.creator_data (id);

CREATE TABLE bookbrainz.release_event (
	id INT PRIMARY KEY,
	"year" SMALLINT,
	"month" SMALLINT,
	"day" SMALLINT,
	country_id INT
);

CREATE TABLE bookbrainz.release_event__edition_data (
	release_event_id INT,
	edition_data_id INT,
	PRIMARY KEY(
		release_event_id,
		edition_data_id
	)
);
ALTER TABLE bookbrainz.release_event__edition_data ADD FOREIGN KEY (release_event_id) REFERENCES bookbrainz.release_event (id);

CREATE TABLE bookbrainz.creator_credit (
	id SERIAL PRIMARY KEY,
	begin_phrase TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.creator_credit_name (
	creator_credit_id INT,
	"position" SMALLINT NOT NULL,
	creator_bbid UUID NOT NULL,
	"name" VARCHAR NOT NULL,
	join_phrase TEXT NOT NULL,
	PRIMARY KEY (
		creator_credit_id,
		position
	)
);
ALTER TABLE bookbrainz.creator_credit_name ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);
ALTER TABLE bookbrainz.creator_credit_name ADD FOREIGN KEY (creator_bbid) REFERENCES bookbrainz.creator_header (bbid);

CREATE TABLE bookbrainz.edition_data__language (
	data_id INT,
	language_id INT,
	PRIMARY KEY(
		data_id,
		language_id
	)
);
ALTER TABLE bookbrainz.edition_data__language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

CREATE TABLE bookbrainz.edition_data__publisher (
	data_id INT,
	publisher_bbid UUID,
	PRIMARY KEY(
		data_id,
		publisher_bbid
	)
);
ALTER TABLE bookbrainz.edition_data__publisher ADD FOREIGN KEY (publisher_bbid) REFERENCES bookbrainz.publisher_header (bbid);

CREATE TABLE bookbrainz.edition_format (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.edition_status (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.edition_data (
	id INT PRIMARY KEY,
	publication_bbid UUID,
	country_id INT,
	creator_credit_id INT,
	width SMALLINT,
	height SMALLINT,
	depth SMALLINT,
	weight SMALLINT,
	pages SMALLINT,
	format_id INT,
	status_id INT
);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (format_id) REFERENCES bookbrainz.edition_format (id);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (publication_bbid) REFERENCES bookbrainz.publication_header (bbid);
ALTER TABLE bookbrainz.edition_data ADD FOREIGN KEY (status_id) REFERENCES bookbrainz.edition_status (id);
ALTER TABLE bookbrainz.edition_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);
ALTER TABLE bookbrainz.edition_data__language ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);
ALTER TABLE bookbrainz.edition_data__publisher ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);
ALTER TABLE bookbrainz.release_event__edition_data ADD FOREIGN KEY (edition_data_id) REFERENCES bookbrainz.edition_data (id);

CREATE TABLE bookbrainz.publication_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.publication_data (
	id INT PRIMARY KEY,
	type_id INT
);
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.publication_type (id);
ALTER TABLE bookbrainz.publication_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publication_data (id);

CREATE TABLE bookbrainz.publisher_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.publisher_data (
	id INT PRIMARY KEY,
	begin_year SMALLINT,
	begin_month SMALLINT,
	begin_day SMALLINT,
	end_year SMALLINT,
	end_month SMALLINT,
	end_day SMALLINT,
	ended BOOLEAN NOT NULL DEFAULT FALSE,
	country_id INT,
	type_id INT
);
ALTER TABLE bookbrainz.publisher_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.publisher_type (id);
ALTER TABLE bookbrainz.publisher_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publisher_data (id);

CREATE TABLE bookbrainz.work_data__language (
	data_id INT,
	language_id INT,
	PRIMARY KEY (
		data_id,
		language_id
	)
);
ALTER TABLE bookbrainz.work_data__language ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

CREATE TABLE bookbrainz.work_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.work_data (
	id SERIAL PRIMARY KEY,
	type_id INT
);
ALTER TABLE bookbrainz.work_data ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.work_type (id);
ALTER TABLE bookbrainz.work_revision ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.work_data (id);
ALTER TABLE bookbrainz.work_data__language ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.work_data (id);

CREATE TABLE bookbrainz.alias (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	sort_name TEXT NOT NULL,
	language_id INT,
	is_primary BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.alias ADD FOREIGN KEY (language_id) REFERENCES musicbrainz.language (id);

CREATE TABLE bookbrainz.identifier_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	detection_regex TEXT,
	validation_regex TEXT NOT NULL,
	display_template TEXT NOT NULL,
	entity_type entity_type NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.identifier_type ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.identifier_type (id);

CREATE TABLE bookbrainz.identifier (
	id SERIAL PRIMARY KEY,
	type_id INT NOT NULL
);
ALTER TABLE bookbrainz.identifier ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.identifier_type (id);

CREATE TABLE bookbrainz.relationship_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	display_template TEXT NOT NULL,
	source_entity_type entity_type NOT NULL,
	target_entity_type entity_type NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);
ALTER TABLE bookbrainz.relationship_type ADD FOREIGN KEY (parent_id) REFERENCES bookbrainz.relationship_type (id);

CREATE TABLE bookbrainz.relationship (
	id SERIAL PRIMARY KEY,
	type_id INT NOT NULL
);
ALTER TABLE bookbrainz.relationship ADD FOREIGN KEY (type_id) REFERENCES bookbrainz.relationship_type (id);

COMMIT;
