BEGIN;

DROP TABLE IF EXISTS bookbrainz.creator_import;
DROP TABLE IF EXISTS bookbrainz.edition_import;
DROP TABLE IF EXISTS bookbrainz.publication_import;
DROP TABLE IF EXISTS bookbrainz.publisher_import;
DROP TABLE IF EXISTS bookbrainz.work_import;
DROP TABLE IF EXISTS bookbrainz.discard_votes;
DROP TABLE IF EXISTS bookbrainz.link_import;
DROP TABLE IF EXISTS bookbrainz.origin_import;
DROP TABLE IF EXISTS bookbrainz.import;

COMMIT;
