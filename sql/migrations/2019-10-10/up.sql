ALTER TABLE bookbrainz.revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookbrainz.author_revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookbrainz.edition_revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookbrainz.edition_group_revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE bookbrainz.publisher_revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;
	
ALTER TABLE bookbrainz.work_revision
	ADD is_merge BOOLEAN NOT NULL DEFAULT FALSE;

DROP TRIGGER IF EXISTS process_author ON bookbrainz.author;
DROP TRIGGER IF EXISTS process_edition ON bookbrainz.edition;
DROP TRIGGER IF EXISTS process_edition_group ON bookbrainz.edition_group;
DROP TRIGGER IF EXISTS process_publisher ON bookbrainz.publisher;
DROP TRIGGER IF EXISTS process_work ON bookbrainz.work;