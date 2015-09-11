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

-----------
-- Tables
-----------

CREATE TABLE bookbrainz.alias (
	alias_id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	sort_name TEXT NOT NULL,
	language_id INT,
	"primary" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookbrainz.annotation (
	annotation_id SERIAL PRIMARY KEY,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')
);

CREATE TABLE bookbrainz.creator_credit (
	creator_credit_id SERIAL PRIMARY KEY,
	begin_phrase TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.creator_credit_name (
	creator_credit_id INT,
	position SMALLINT,
	creator_gid UUID,
	name VARCHAR NOT NULL,
	join_phrase TEXT NOT NULL,
	PRIMARY KEY (creator_credit_id, position)
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
	creator_type_id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.disambiguation (
	disambiguation_id SERIAL PRIMARY KEY,
	comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE bookbrainz.edition_data (
	entity_data_id INT PRIMARY KEY,
	publication_gid UUID,
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
	publisher_gid UUID
);

CREATE TABLE bookbrainz.edition_format (
	edition_format_id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.edition_status (
	edition_status_id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.entity (
	entity_gid UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	last_updated TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	master_revision_id INT,
	_type entity_types NOT NULL
);

CREATE TABLE bookbrainz.entity_data (
	entity_data_id SERIAL PRIMARY KEY,
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
	source_gid UUID PRIMARY KEY,
	target_gid UUID NOT NULL
);

CREATE TABLE bookbrainz.entity_revision (
	revision_id INT NOT NULL,
	entity_gid UUID NOT NULL,
	entity_data_id INT NOT NULL
);

CREATE TABLE bookbrainz.identifier (
	identifier_id SERIAL PRIMARY KEY,
	identifier_type_id INT NOT NULL,
	value TEXT NOT NULL
);

CREATE TABLE bookbrainz.identifier_type (
	identifier_type_id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL UNIQUE,
	entity_type entity_types,
	detection_regex TEXT,
	validation_regex TEXT NOT NULL,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	description TEXT NOT NULL
);

CREATE TABLE bookbrainz.inactive_users (
	user_id INT PRIMARY KEY
);

CREATE TABLE bookbrainz.message (
	message_id SERIAL PRIMARY KEY,
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
	client_id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
	client_secret UUID NOT NULL UNIQUE DEFAULT public.uuid_generate_v4(),
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
	publication_type_id SERIAL PRIMARY KEY,
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
	publisher_type_id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);

CREATE TABLE bookbrainz.rel (
	relationship_id SERIAL PRIMARY KEY,
	last_updated TIMESTAMP NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
	master_revision_id INT
);

CREATE TABLE bookbrainz.rel_data (
	relationship_data_id SERIAL PRIMARY KEY,
	relationship_type_id INT NOT NULL
);

CREATE TABLE bookbrainz.rel_entity (
	relationship_data_id INT,
	position SMALLINT,
	entity_gid UUID NOT NULL,
	PRIMARY KEY (
		relationship_data_id,
		position
	)
);

CREATE TABLE bookbrainz.rel_revision (
	revision_id INT NOT NULL,
	relationship_id INT NOT NULL,
	relationship_data_id INT NOT NULL
);

CREATE TABLE bookbrainz.rel_text (
	relationship_data_id INT,
	position SMALLINT,
	text TEXT NOT NULL,
	PRIMARY KEY (
		relationship_data_id,
		position
	)
);

CREATE TABLE bookbrainz.rel_type (
	relationship_type_id SERIAL PRIMARY KEY,
	label VARCHAR(255) NOT NULL UNIQUE,
	parent_id INT,
	child_order INT NOT NULL DEFAULT 0,
	description TEXT NOT NULL,
	template TEXT NOT NULL,
	deprecated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bookbrainz.revision (
	revision_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	parent_id INT,
	_type SMALLINT NOT NULL
);

CREATE TABLE bookbrainz.revision_note (
	revision_note_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL,
	revision_id INT NOT NULL,
	content TEXT NOT NULL,
	posted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);

CREATE TABLE bookbrainz.suspended_users (
	user_id INT PRIMARY KEY,
	reason TEXT NOT NULL
);

CREATE TABLE bookbrainz.user (
	user_id SERIAL PRIMARY KEY,
	name VARCHAR(64) NOT NULL,
	email VARCHAR(255) NOT NULL,
	reputation INT NOT NULL DEFAULT 0,
	bio TEXT,
	birth_date DATE,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	active_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
	user_type_id INT NOT NULL,
	gender_id INT NOT NULL,
	country_id INT NOT NULL,
	password TEXT NOT NULL,
	revisions_applied INT NOT NULL DEFAULT 0,
	revisions_reverted INT NOT NULL DEFAULT 0,
	total_revisions INT NOT NULL DEFAULT 0
);

CREATE TABLE bookbrainz.user_language (
	user_id INT NOT NULL,
	language_id INT NOT NULL,
	proficiency lang_proficiency NOT NULL,
	PRIMARY KEY (
		user_id,
		language_id
	)
);

CREATE TABLE bookbrainz.user_type (
	user_type_id SERIAL PRIMARY KEY,
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
	work_type_id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE
);
