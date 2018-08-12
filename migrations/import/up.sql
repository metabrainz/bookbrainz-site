BEGIN;

-- Base table for imports storing import ids and types
CREATE TABLE IF NOT EXISTS bookbrainz.import (
    id SERIAL PRIMARY KEY,
    type bookbrainz.entity_type NOT NULL
);

-- Tables linking import and relevant data in entitytype_data tables
CREATE TABLE IF NOT EXISTS bookbrainz.creator_import_header (
	import_id INT PRIMARY KEY,
	data_id INT NOT NULL
);
ALTER TABLE bookbrainz.creator_import_header ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.creator_import_header ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.creator_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.edition_import_header (
	import_id INT PRIMARY KEY,
	data_id INT NOT NULL
);
ALTER TABLE bookbrainz.edition_import_header ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.edition_import_header ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.publication_import_header (
	import_id INT PRIMARY KEY,
	data_id INT NOT NULL
);
ALTER TABLE bookbrainz.publication_import_header ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.publication_import_header ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publication_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.publisher_import_header (
	import_id INT PRIMARY KEY,
	data_id INT NOT NULL
);
ALTER TABLE bookbrainz.publisher_import_header ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.publisher_import_header ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publisher_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.work_import_header (
	import_id INT PRIMARY KEY,
	data_id INT NOT NULL
);
ALTER TABLE bookbrainz.work_import_header ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.work_import_header ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.work_data (id);

-- Table to store votes cast to discard an import
CREATE TABLE IF NOT EXISTS bookbrainz.discard_votes (
    import_id INT NOT NULL,
    editor_id INT NOT NULL,
    voted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    PRIMARY KEY (
        import_id,
        editor_id
    )
);
ALTER TABLE bookbrainz.discard_votes ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.discard_votes ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);

-- Table to store all origin sources of imported data
CREATE TABLE IF NOT EXISTS bookbrainz.origin_source (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (name <> '')
);

-- Table to store source metadata linked with import and (upon it's subsequent upgrade) with entity
-- The origin_source_id refers to the source of the import, a foreign key reference to origin_import
-- The origin_id is the designated id of the import data item at it's source
CREATE TABLE IF NOT EXISTS bookbrainz.link_import (
    import_id INT,
    origin_source_id INT NOT NULL,
    origin_id TEXT NOT NULL CHECK (origin_id <> ''),
    imported_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    last_edited TIMESTAMP WITHOUT TIME ZONE,
    entity_id UUID DEFAULT NULL,
    import_metadata jsonb,
    PRIMARY KEY (
        origin_source_id,
        origin_id
    )
);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (entity_id) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (origin_source_id) REFERENCES bookbrainz.origin_source (id);

-- view --
CREATE VIEW bookbrainz.creator_import AS
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


CREATE VIEW bookbrainz.edition_import AS
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

CREATE VIEW bookbrainz.publisher_import AS
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

CREATE VIEW bookbrainz.publication_import AS
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

CREATE VIEW bookbrainz.work_import AS
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

COMMIT;
