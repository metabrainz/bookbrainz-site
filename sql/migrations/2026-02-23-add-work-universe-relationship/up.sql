BEGIN;

INSERT INTO bookbrainz.relationship_type (
  label,
  description,
  link_phrase,
  reverse_link_phrase,
  source_entity_type,
  target_entity_type,
  deprecated
)
SELECT
  'set in',
  'Indicates that a work takes place in a universe',
  'set in',
  'contains work',
  'Work',
  'Universe',
  FALSE
WHERE NOT EXISTS (
  SELECT 1
  FROM bookbrainz.relationship_type
  WHERE label = 'set in'
    AND source_entity_type = 'Work'
    AND target_entity_type = 'Universe'
);

COMMIT;
