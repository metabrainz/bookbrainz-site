BEGIN;

INSERT INTO bookbrainz.relationship_type ( id, label, description, link_phrase, source_entity_type, target_entity_type, parent_id, child_order, deprecated, reverse_link_phrase ) 
VALUES
( 75, 'Inspiration', 'Indicates a Series is inspired by a Work.', 'inspired', 'Work', 'Series', NULL, 0, false, 'was inspired by');

COMMIT;
