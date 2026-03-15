ALTER TYPE bookbrainz.entity_type
ADD VALUE IF NOT EXISTS 'Universe';

CREATE TABLE bookbrainz.universe_header (
    bbid UUID PRIMARY KEY,
    master_revision_id INT
);

ALTER TABLE bookbrainz.universe_header
ADD FOREIGN KEY (bbid)
REFERENCES bookbrainz.entity (bbid);

CREATE TABLE bookbrainz.universe_data (
    id SERIAL PRIMARY KEY,
    alias_set_id INT NOT NULL REFERENCES bookbrainz.alias_set(id),
    identifier_set_id INT REFERENCES bookbrainz.identifier_set(id),
    relationship_set_id INT REFERENCES bookbrainz.relationship_set(id),
    annotation_id INT REFERENCES bookbrainz.annotation(id),
    disambiguation_id INT REFERENCES bookbrainz.disambiguation(id)
);

CREATE TABLE bookbrainz.universe_revision (
    id INT REFERENCES bookbrainz.revision (id),
    bbid UUID REFERENCES bookbrainz.universe_header (bbid),
    data_id INT REFERENCES bookbrainz.universe_data(id),
    is_merge BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id, bbid)
);

ALTER TABLE bookbrainz.universe_header
ADD FOREIGN KEY (master_revision_id, bbid)
REFERENCES bookbrainz.universe_revision (id, bbid);

CREATE VIEW bookbrainz.universe AS
SELECT
    e.bbid,
    ud.id AS data_id,
    ur.id AS revision_id,
    (ur.id = uh.master_revision_id) AS master,
    ud.annotation_id,
    ud.disambiguation_id,
    dis.comment AS disambiguation,
    als.default_alias_id,
    al.name,
    al.sort_name,
    ud.alias_set_id,
    ud.identifier_set_id,
    ud.relationship_set_id,
    e.type
FROM bookbrainz.universe_revision ur
LEFT JOIN bookbrainz.entity e ON e.bbid = ur.bbid
LEFT JOIN bookbrainz.universe_header uh ON uh.bbid = e.bbid
LEFT JOIN bookbrainz.universe_data ud ON ur.data_id = ud.id
LEFT JOIN bookbrainz.alias_set als ON ud.alias_set_id = als.id
LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
LEFT JOIN bookbrainz.disambiguation dis ON dis.id = ud.disambiguation_id
WHERE e.type = 'Universe';
