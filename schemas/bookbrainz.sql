BEGIN;

----------
-- Types
----------

CREATE TYPE lang_proficiency AS ENUM (
	'BASIC',
	'INTERMEDIATE',
	'ADVANCED',
	'NATIVE'
);

CREATE TYPE entity_types AS ENUM (
	'Creator',
	'Publication',
	'Edition',
	'Publisher',
	'Work'
);

CREATE TYPE date_precision AS ENUM (
	'YEAR',
	'MONTH',
	'DAY'
);

COMMIT;

BEGIN;

-----------
-- Tables
-----------

CREATE TABLE bookbrainz.alias (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	sort_name TEXT NOT NULL,
	language_id INT,
	"primary" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookbrainz.annotation (
	id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

CREATE TABLE bookbrainz.creator_credit (
	id SERIAL PRIMARY KEY,
	begin_phrase TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.creator_credit_name (
	creator_credit_id INT,
	position SMALLINT,
	creator_bbid UUID,
	name VARCHAR NOT NULL,
	join_phrase TEXT NOT NULL,
	PRIMARY KEY (
		creator_credit_id,
		position
	)
);

CREATE TABLE bookbrainz.creator_data (
	entity_data_id INT PRIMARY KEY,
	begin_date DATE,
	begin_date_precision date_precision,
	end_date DATE,
	end_date_precision date_precision,
	ended BOOLEAN,
	country_id INT,
	gender_id INT,
	creator_type_id INT
);

CREATE TABLE bookbrainz.creator_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.disambiguation (
	id SERIAL PRIMARY KEY,
	comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.edition_data (
	entity_data_id INT PRIMARY KEY,
	publication_bbid UUID,
	creator_credit_id INT,
	release_date DATE,
	release_date_precision date_precision,
	pages INT,
	width INT,
	height INT,
	depth INT,
	weight INT,
	country_id INT,
	language_id INT,
	edition_format_id INT,
	edition_status_id INT,
	publisher_bbid UUID
);

CREATE TABLE bookbrainz.edition_format (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.edition_status (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.entity (
	bbid UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	last_updated TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	master_revision_id INT,
	_type entity_types NOT NULL
);

CREATE TABLE bookbrainz.entity_data (
	id SERIAL PRIMARY KEY,
	annotation_id INT,
	disambiguation_id INT,
	default_alias_id INT,
	_type INT NOT NULL
);

CREATE TABLE bookbrainz.entity_data__alias (
	entity_data_id INT,
	alias_id INT,
	PRIMARY KEY (
		entity_data_id,
		alias_id
	)
);

CREATE TABLE bookbrainz.entity_data__identifier (
	entity_data_id INT,
	identifier_id INT,
	PRIMARY KEY (
		entity_data_id,
		identifier_id
	)
);

CREATE TABLE bookbrainz.entity_redirect (
	source_bbid UUID PRIMARY KEY,
	target_bbid UUID NOT NULL
);

CREATE TABLE bookbrainz.entity_revision (
	revision_id INT NOT NULL,
	entity_bbid UUID NOT NULL,
	entity_data_id INT NOT NULL
);

CREATE TABLE bookbrainz.identifier (
	id SERIAL PRIMARY KEY,
	identifier_type_id INT NOT NULL,
	value TEXT NOT NULL
);

CREATE TABLE bookbrainz.identifier_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL UNIQUE,
	entity_type entity_types,
	detection_regex TEXT,
	validation_regex TEXT NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	description TEXT NOT NULL
);

CREATE TABLE bookbrainz.inactive_editor (
	editor_id INT PRIMARY KEY
);

CREATE TABLE bookbrainz.message (
	id SERIAL PRIMARY KEY,
	sender_id INT,
	subject VARCHAR(255) NOT NULL,
	content TEXT NOT NULL
);

CREATE TABLE bookbrainz.message_receipt (
	message_id INT,
	recipient_id INT,
	archived BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (
		message_id,
		recipient_id
	)
);

CREATE TABLE bookbrainz.oauth_client (
	id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	secret UUID NOT NULL UNIQUE DEFAULT public.uuid_generate_v4(),
	is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
	_redirect_uris TEXT NOT NULL DEFAULT '',
	_default_scopes TEXT NOT NULL DEFAULT '',
	owner_id INT NOT NULL
);

CREATE TABLE bookbrainz.publication_data (
	entity_data_id INT PRIMARY KEY,
	publication_type_id INT
);

CREATE TABLE bookbrainz.publication_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.publisher_data (
	entity_data_id INT PRIMARY KEY,
	begin_date DATE,
	begin_date_precision date_precision,
	end_date DATE,
	end_date_precision date_precision,
	ended BOOLEAN DEFAULT FALSE,
	country_id INT,
	publisher_type_id INT
);

CREATE TABLE bookbrainz.publisher_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.relationship (
	id SERIAL PRIMARY KEY,
	last_updated TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	master_revision_id INT
);

CREATE TABLE bookbrainz.relationship_data (
	id SERIAL PRIMARY KEY,
	relationship_type_id INT NOT NULL
);

CREATE TABLE bookbrainz.relationship_entity (
	relationship_data_id INT,
	position SMALLINT,
	entity_bbid UUID NOT NULL,
	PRIMARY KEY (
		relationship_data_id,
		position
	)
);

CREATE TABLE bookbrainz.relationship_revision (
	revision_id INT NOT NULL,
	relationship_id INT NOT NULL,
	relationship_data_id INT NOT NULL
);

CREATE TABLE bookbrainz.relationship_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL UNIQUE,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	description TEXT NOT NULL,
	template TEXT NOT NULL,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookbrainz.revision (
	id SERIAL PRIMARY KEY,
	author_id INT NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	parent_id INT,
	_type SMALLINT NOT NULL
);

CREATE TABLE bookbrainz.note (
	id SERIAL PRIMARY KEY,
	author_id INT NOT NULL,
	revision_id INT NOT NULL,
	content TEXT NOT NULL,
	posted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);

CREATE TABLE bookbrainz.suspended_editor (
	editor_id INT PRIMARY KEY,
	reason TEXT NOT NULL
);

CREATE TABLE bookbrainz.editor (
	id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	email VARCHAR(255) NOT NULL,
	reputation INT NOT NULL DEFAULT 0,
	bio TEXT,
	birth_date DATE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	active_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	editor_type_id INT NOT NULL,
	gender_id INT NOT NULL,
	country_id INT NOT NULL,
	password TEXT NOT NULL,
	revisions_applied INT NOT NULL DEFAULT 0,
	revisions_reverted INT NOT NULL DEFAULT 0,
	total_revisions INT NOT NULL DEFAULT 0
);

CREATE TABLE bookbrainz.editor_language (
	editor_id INT NOT NULL,
	language_id INT NOT NULL,
	proficiency lang_proficiency NOT NULL,
	PRIMARY KEY (
		editor_id,
		language_id
	)
);

CREATE TABLE bookbrainz.editor_type (
	id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL
);

CREATE TABLE bookbrainz.work_data (
	entity_data_id INT PRIMARY KEY,
	work_type_id INT
);

CREATE TABLE bookbrainz.work_data__language (
	work_data_id INT,
	language_id INT,
	PRIMARY KEY (
		work_data_id,
		language_id
	)
);

CREATE TABLE bookbrainz.work_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

COMMIT;
