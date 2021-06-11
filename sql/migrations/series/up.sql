BEGIN;

ALTER TYPE bookbrainz.entity_type ADD VALUE IF NOT EXISTS 'Series';

CREATE TABLE  IF NOT EXISTS bookbrainz.series_header (
	bbid UUID PRIMARY KEY,
	master_revision_id INT
);
ALTER TABLE bookbrainz.series_header ADD FOREIGN KEY (bbid) REFERENCES bookbrainz.entity (bbid);

CREATE TABLE IF NOT EXISTS bookbrainz.series_ordering_type (
	id SERIAL PRIMARY KEY,
	label TEXT NOT NULL UNIQUE CHECK (label <> '')
);

INSERT INTO bookbrainz.series_ordering_type (id, label)
    VALUES (1, 'Automatic'), (2, 'Manual');

CREATE TABLE IF NOT EXISTS bookbrainz.series_data (
	id SERIAL PRIMARY KEY,
	alias_set_id INT NOT NULL REFERENCES bookbrainz.alias_set(id),
	identifier_set_id INT REFERENCES bookbrainz.identifier_set(id),
	relationship_set_id INT REFERENCES bookbrainz.relationship_set(id),
	annotation_id INT REFERENCES bookbrainz.annotation(id),
	disambiguation_id INT REFERENCES bookbrainz.disambiguation(id),
	entity_type bookbrainz.entity_type NOT NULL,
	ordering_type_id INT NOT NULL REFERENCES bookbrainz.series_ordering_type(id)
);

CREATE TABLE IF NOT EXISTS bookbrainz.series_revision (
	id INT REFERENCES bookbrainz.revision (id),
	bbid UUID REFERENCES bookbrainz.series_header (bbid),
	data_id INT REFERENCES bookbrainz.series_data(id),
	is_merge BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY ( id, bbid )
);

ALTER TABLE bookbrainz.series_header ADD FOREIGN KEY (master_revision_id, bbid) REFERENCES bookbrainz.series_revision (id, bbid);

COMMIT;

BEGIN;

CREATE VIEW bookbrainz.series AS
	SELECT
		e.bbid, sd.id AS data_id, sr.id AS revision_id, (sr.id = s.master_revision_id) AS master, sd.entity_type, sd.annotation_id, sd.disambiguation_id,
		als.default_alias_id, sd.ordering_type_id, sd.alias_set_id, sd.identifier_set_id,
		sd.relationship_set_id, e.type
	FROM bookbrainz.series_revision sr
	LEFT JOIN bookbrainz.entity e ON e.bbid = sr.bbid
	LEFT JOIN bookbrainz.series_header s ON s.bbid = e.bbid
	LEFT JOIN bookbrainz.series_data sd ON sr.data_id = sd.id
	LEFT JOIN bookbrainz.alias_set als ON sd.alias_set_id = als.id
	WHERE e.type = 'Series';

COMMIT;
