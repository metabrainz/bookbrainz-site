BEGIN;
DROP VIEW IF EXISTS bookbrainz.creator_import;
DROP VIEW IF EXISTS bookbrainz.edition_import;
DROP VIEW IF EXISTS bookbrainz.publication_import;
DROP VIEW IF EXISTS bookbrainz.publisher_import;
DROP VIEW IF EXISTS bookbrainz.work_import;

DROP TABLE IF EXISTS bookbrainz.creator_import_header;
DROP TABLE IF EXISTS bookbrainz.edition_import_header;
DROP TABLE IF EXISTS bookbrainz.publication_import_header;
DROP TABLE IF EXISTS bookbrainz.publisher_import_header;
DROP TABLE IF EXISTS bookbrainz.work_import_header;
DROP TABLE IF EXISTS bookbrainz.discard_votes;
DROP TABLE IF EXISTS bookbrainz.link_import;
DROP TABLE IF EXISTS bookbrainz.origin_source;
DROP TABLE IF EXISTS bookbrainz.import;

COMMIT;
