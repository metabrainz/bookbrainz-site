BEGIN TRANSACTION;

CREATE TYPE bookbrainz.external_service_oauth_type AS ENUM (
    'critiquebrainz'
);

CREATE TABLE bookbrainz.external_service_oauth (
    id SERIAL,
    editor_id INTEGER NOT NULL,
    service bookbrainz.external_service_oauth_type NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires TIMESTAMP,
    scopes TEXT[]
);

ALTER TABLE bookbrainz.external_service_oauth ADD CONSTRAINT external_service_oauth_editor_id_service UNIQUE (editor_id, service);

ALTER TABLE bookbrainz.external_service_oauth ADD FOREIGN KEY (editor_id) REFERENCES bookbrainz.editor (id);

COMMIT;