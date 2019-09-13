BEGIN;
-- (BB-304) Update librarything author regex to allow for their disambiguation system (librarything.com/author/nyebill-1 and librarything.com/author/nyebill-2 for example)
UPDATE "bookbrainz"."identifier_type" SET "detection_regex" = '^(?:https?:\/\/)?(?:w{3}\.)?librarything\.com\/author\/(\S+)', "validation_regex" = '(\S+)$' WHERE "id" = '15';

-- (BB-220) Update ISNI detection regexp to allow for optional "www." in the address.
UPDATE "bookbrainz"."identifier_type" SET "detection_regex" = '^(?:https?:\/\/)?(?:w{3}\.)?isni\.org\/isni\/((?:\d ?){15}[X\d])' WHERE "id" = '13';


INSERT INTO "bookbrainz"."identifier_type" ("id", "label", "description", "detection_regex", "validation_regex", "display_template", "entity_type", "parent_id", "child_order", "deprecated")
VALUES
  -- (BB-306)
  ('22', 'Archive.org ID', 'The ID for an archive.org text corresponding to a BookBrainz Edition', 'archive\.org\/details\/(\S+)', '\S+$', 'Placeholder Template', 'Edition', NULL, '0', 'f'),
  -- (BB-305)
  ('23', 'OpenLibrary Author ID', 'The ID for an OpenLibrary Author corresponding to a BookBrainz Author.', 'openlibrary\.org\/authors\/(OL\d+?A)', 'OL\d+?A$', 'Placeholder Template', 'Author', NULL, '0', 'f'),
  -- (BB-280)
  ('24', 'LCCN', 'The Library of Congress Control Number corresponding to a BookBrainz Edition', '(lccn\.loc\.gov\/([a-zA-Z]{0,3}\d{6,10})|([a-zA-Z]{1,3}\d{6,10}))', '^[a-zA-Z]{0,3}\d{6,10}$', 'Placeholder Template', 'Edition', NULL, '0', 'f'),
  -- (BB-262)
  ('25', 'ORCID', 'Open Researcher and Contributor ID corresponding to a BookBrainz Author', '(?:ORCID:\s?|(?:https?:\/\/)?orcid\.org\/)?((?:\d{4}-){3}\d{3}[\dX])', '^(?:\d{4}-){3}\d{3}[\dX]$', 'Placeholder Template', 'Author', NULL, '0', 'f'),
  -- (BB-193)
  ('26', 'OCN/Worldcat ID', 'OCLC Control Number corresponding to a BookBrainz Edition', '(?:https?://)?(?:w{3}\.)?worldcat\.org/title/.+/oclc/(\d+)', '^[1-9]\d*$', 'Placeholder Template', 'Edition', NULL, '0', 'f'),
  -- (BB-194)
  ('27', 'Goodreads Author ID', 'Goodreads author ID that corresponds to a BookBrainz Author', '(?:https?:\/\/)?(?:w{3}\.)?goodreads\.com\/author\/show\/(\d+)(?:[-.]\w+)?', '^[1-9]\d*$', 'Placeholder Template', 'Author', NULL, '0', 'f'),
  ('28', 'Goodreads Book ID', 'Goodreads book ID that corresponds to a BookBrainz Edition', '(?:https?:\/\/)?(?:w{3}\.)?goodreads\.com\/book\/show\/(\d+)(?:[-.]\S+)?', '^[1-9]\d*$', 'Placeholder Template', 'Edition', NULL, '0', 'f')
;

COMMIT;
