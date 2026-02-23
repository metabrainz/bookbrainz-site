BEGIN;

DELETE FROM bookbrainz.relationship_type
WHERE label = 'set in'
  AND source_entity_type = 'Work'
  AND target_entity_type = 'Universe';

COMMIT;
