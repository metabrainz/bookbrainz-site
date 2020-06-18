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
