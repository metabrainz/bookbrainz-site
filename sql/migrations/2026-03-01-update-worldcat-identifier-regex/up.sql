BEGIN;

UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '(?:https?://)?(?:[a-zA-Z0-9-]+\.)?worldcat\.org/(?:title/(?:[^/]+/oclc/)?|oclc/)(\d+)',
    "display_template" = 'https://search.worldcat.org/title/{value}'
WHERE "id" = '26';

COMMIT;