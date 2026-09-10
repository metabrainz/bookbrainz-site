CREATE INDEX CONCURRENTLY author_data_identifier_set_id_idx ON bookbrainz.author_data (identifier_set_id);
CREATE INDEX CONCURRENTLY author_revision_data_id_idx ON bookbrainz.author_revision (data_id);

CREATE INDEX CONCURRENTLY work_data_identifier_set_id_idx ON bookbrainz.work_data (identifier_set_id);
CREATE INDEX CONCURRENTLY work_revision_data_id_idx ON bookbrainz.work_revision (data_id);

CREATE INDEX CONCURRENTLY identifier_type_id_value_idx ON bookbrainz.identifier (type_id, value);
CREATE INDEX CONCURRENTLY identifier_set__identifier_identifier_id_idx ON bookbrainz.identifier_set__identifier (identifier_id);
