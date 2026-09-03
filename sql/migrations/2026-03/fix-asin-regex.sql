BEGIN;
UPDATE "bookbrainz"."identifier_type"
SET
    "validation_regex" = '^(?:B0[A-Z0-9]{8}|\d{9}[X\d])$',
    "detection_regex" = '(?:https?://)?(?:www\.)?amazon\.(?:com|co\.uk|ca|de|fr|es|it|co\.jp|com\.au|com\.br|nl|in)/.+?/(?:dp|gp/product)/(B0[A-Z0-9]{8}|\d{9}[X\d])'
WHERE "id" = '5';

COMMIT;