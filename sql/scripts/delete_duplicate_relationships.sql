-- This script selects exact duplicate relationships that appear in the same relationshipSet
-- then deletes them from the relevant tables

CREATE TEMPORARY TABLE IF NOT EXISTS duplicate_relationship_ids
as select distinct id from (
	select
	dupe.id
	FROM relationship as dupe
	join relationship_set__relationship as set1 on  set1.relationship_id = dupe.id
	join relationship as keep on
		 dupe.id > keep.id and dupe.type_id = keep.type_id and dupe.source_bbid = keep.source_bbid and dupe.target_bbid = keep.target_bbid
	join relationship_set__relationship as set2 on  set2.relationship_id = keep.id
	-- target only duplicate relationships that appear in the same set
	where set1.set_id = set2.set_id
) duplicate_relationships;

BEGIN TRANSACTION;

DELETE FROM relationship_set__relationship
    USING duplicate_relationship_ids
    WHERE relationship_set__relationship.relationship_id = duplicate_relationship_ids.id;

DELETE FROM relationship
    USING duplicate_relationship_ids
    where relationship.id = duplicate_relationship_ids.id;
   
COMMIT TRANSACTION;
