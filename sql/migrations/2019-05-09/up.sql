-- Replace deprecated relationships of type 3 ("Edition is an edition of EditionGroup")
-- with edition_data.edition_group_bbid column
-- and remove relationships from entity's current relationship set

CREATE TEMPORARY TABLE IF NOT EXISTS rels_to_fix
AS
SELECT
    relationship.id AS relationship_id,
    relationship_set_id,
    source_bbid,
    target_bbid,
    edition_group_bbid,
    data_id
FROM
    bookbrainz.relationship
    LEFT JOIN bookbrainz.edition ON bbid = source_bbid AND master = TRUE
WHERE
    type_id = 3
    AND edition.bbid IS NOT NULL
    AND edition.data_id IS NOT NULL
;

BEGIN TRANSACTION;

    -- make sure edition_data has edition_group_bbid set
    UPDATE bookbrainz.edition_data
    SET edition_group_bbid = target_bbid
    FROM rels_to_fix
    WHERE edition_data.id = data_id
        AND edition_data.edition_group_bbid IS NULL;

    -- delete row that sets the obsolete relationship in that entity's current relationship set
    DELETE FROM bookbrainz.relationship_set__relationship
    USING rels_to_fix
    WHERE relationship_set__relationship.relationship_id = rels_to_fix.relationship_id;

    DROP TABLE IF EXISTS rels_to_fix;

COMMIT TRANSACTION;
