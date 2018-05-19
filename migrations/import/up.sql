BEGIN;

-- Base table for imports storing import ids and types
CREATE TABLE IF NOT EXISTS bookbrainz.import (
    id SERIAL PRIMARY KEY,
    type bookbrainz.entity_type NOT NULL
);

-- Tables linking import and relevant data in entitytype_data tables
CREATE TABLE IF NOT EXISTS bookbrainz.creator_import (
	import_id INT PRIMARY KEY,
	data_id INT
);
ALTER TABLE bookbrainz.creator_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.creator_import ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.creator_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.edition_import (
	import_id INT PRIMARY KEY,
	data_id INT
);
ALTER TABLE bookbrainz.edition_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.edition_import ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.edition_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.publication_import (
	import_id INT PRIMARY KEY,
	data_id INT
);
ALTER TABLE bookbrainz.publication_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.publication_import ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publication_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.publisher_import (
	import_id INT PRIMARY KEY,
	data_id INT
);
ALTER TABLE bookbrainz.publisher_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.publisher_import ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.publisher_data (id);

CREATE TABLE IF NOT EXISTS bookbrainz.work_import (
	import_id INT PRIMARY KEY,
	data_id INT
);
ALTER TABLE bookbrainz.work_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.work_import ADD FOREIGN KEY (data_id) REFERENCES bookbrainz.work_data (id);

-- Table to store votes cast to discard an import
CREATE TABLE IF NOT EXISTS bookbrainz.discard_votes (
    id SERIAL PRIMARY KEY,
    import_id INT NOT NULL,
    editor_id INT NOT NULL,
    voted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now())
);
ALTER TABLE bookbrainz.discard_votes ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.discard_votes ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);

-- Table to store all origin sources of imported data
CREATE TABLE IF NOT EXISTS bookbrainz.origin_import (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL CHECK (value <> '')
);

-- Table to store source metadata linked with import and (upon it's subsequent upgrade) with entity
-- The origin_name_id refers to the source of the import, a foreign key reference to origin_import
-- The origin_id is the designated id of the import data item at it's source
CREATE TABLE IF NOT EXISTS bookbrainz.link_import (
    import_id INT,
    origin_name_id INT NOT NULL,
    origin_id TEXT NOT NULL CHECK (origin_id <> ''),
    imported_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT timezone('UTC'::TEXT, now()),
    last_edited VARCHAR(10),
    entity_id UUID DEFAULT NULL,
    metadata jsonb,
    PRIMARY KEY (
        origin_name_id,
        origin_id
    )
);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (entity_id) REFERENCES bookbrainz.entity (bbid);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (import_id) REFERENCES bookbrainz.import (id);
ALTER TABLE bookbrainz.link_import ADD FOREIGN KEY (origin_name_id) REFERENCES bookbrainz.origin_import (id);

COMMIT;
