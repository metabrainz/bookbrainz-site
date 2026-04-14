BEGIN;

UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '(?:isbn)?\s*(?:\d[\s-]*){9}[\dXx]'
WHERE "id" = '10';

UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '(?:isbn)?\s*(?:97[89])[\s-]*(?:\d[\s-]*){9}\d'
WHERE "id" = '9';

UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '\d{8,13}'
WHERE "id" = '11';

COMMIT;