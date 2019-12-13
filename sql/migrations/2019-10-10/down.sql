ALTER TABLE bookbrainz.revision
	DROP is_merge;

ALTER TABLE bookbrainz.author_revision
	DROP is_merge;

ALTER TABLE bookbrainz.edition_revision
	DROP is_merge;

ALTER TABLE bookbrainz.edition_group_revision
	DROP is_merge;

ALTER TABLE bookbrainz.publisher_revision
	DROP is_merge;
	
ALTER TABLE bookbrainz.work_revision
	DROP is_merge;
