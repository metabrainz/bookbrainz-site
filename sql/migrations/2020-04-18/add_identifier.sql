BEGIN;

INSERT INTO "bookbrainz"."identifier_type" ("id", "label", "description", "detection_regex", "validation_regex", "display_template", "entity_type", "parent_id", "child_order", "deprecated")
VALUES
  -- (BB-438)
  ('29', 'VIAF', 'The VIAF ID corresponding to a BookBrainz publisher', '^(?:https?://)?viaf\.org/viaf/(\d+)', '^(\d+)$', 'Placeholder Template', 'Publisher', NULL, '0', 'f');
COMMIT;
