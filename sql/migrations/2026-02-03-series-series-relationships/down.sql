BEGIN;

DELETE FROM bookbrainz.relationship_type
WHERE label IN ('Series Subseries', 'Series Translation', 'Series Followed By')
AND source_entity_type = 'Series'
AND target_entity_type = 'Series';

COMMIT;