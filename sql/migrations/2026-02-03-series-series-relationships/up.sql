BEGIN;

INSERT INTO bookbrainz.relationship_type (
    id,
    label,
    description,
    link_phrase,
    reverse_link_phrase,
    source_entity_type,
    target_entity_type,
    parent_id,
    child_order,
    deprecated
) VALUES
(
    124,
    'Series Subseries',
    'Indicates that one series is a subseries or story arc of another series',
    'is a subseries of',
    'has subseries',
    'Series',
    'Series',
    NULL,
    0,
    false
),
(
    125,
    'Series Translation',
    'Indicates that one series is a translation of another series',
    'is a translation of',
    'was translated to',
    'Series',
    'Series',
    NULL,
    0,
    false
),
(
    126,
    'Series Followed By',
    'Indicates that one series is followed by another series temporally or sequentially',
    'is followed by',
    'is preceded by',
    'Series',
    'Series',
    NULL,
    0,
    false
);

COMMIT;