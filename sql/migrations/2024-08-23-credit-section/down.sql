BEGIN TRANSACTION;

-- Drop the existing view if it exists
DROP VIEW IF EXISTS 
    bookbrainz.edition,
    bookbrainz.edition_group;

COMMIT;