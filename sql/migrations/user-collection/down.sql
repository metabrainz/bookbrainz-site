BEGIN;

DROP TABLE IF EXISTS bookbrainz.user_collection CASCADE;
DROP TABLE IF EXISTS bookbrainz.user_collection_collaborator CASCADE;
DROP TABLE IF EXISTS bookbrainz.user_collection_item CASCADE;

COMMIT;
