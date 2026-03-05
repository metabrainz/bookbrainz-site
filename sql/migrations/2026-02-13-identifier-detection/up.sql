BEGIN;

-- Update ISBN-10 detection regex (id=10)
-- Enforces structure: Start + (Digit+Separators)x9 + CheckDigit + End
-- This ensures exactly 10 significant characters are present
UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '^(?:ISBN(?:-?10)?:?\s*)?(?:\d[\s-]*){9}[\dXx]$'
WHERE "id" = '10';

-- Update ISBN-13 detection regex (id=9)
-- Enforces structure: Start + 978/979 + (Separators+Digit)x10 + End
-- This ensures exactly 13 significant characters are present
UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '^(?:ISBN(?:-?13)?:?\s*)?(?:97[89])(?:[\s-]*\d){10}$'
WHERE "id" = '9';

-- Update Barcode detection regex (id=11)
-- Simple length check for barcode
UPDATE "bookbrainz"."identifier_type"
SET "detection_regex" = '^([\d\s-]{8,25})$'
WHERE "id" = '11';

COMMIT;