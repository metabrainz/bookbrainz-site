ALTER TABLE bookbrainz.editor
    ADD COLUMN metabrainz_oauth_access_token TEXT,
    ADD COLUMN metabrainz_oauth_refresh_token TEXT;