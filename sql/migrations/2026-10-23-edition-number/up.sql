-- Don't forget to run sql/scripts/create_triggers.sql after recreating the view.
BEGIN;

ALTER TABLE bookbrainz.edition_data ADD COLUMN edition_number TEXT;

DROP VIEW bookbrainz.edition;

CREATE VIEW bookbrainz.edition AS
SELECT e.bbid,
    edd.id AS data_id,
    edr.id AS revision_id,
    edr.id = edh.master_revision_id AS master,
    edd.annotation_id,
    edd.disambiguation_id,
    dis.comment AS disambiguation,
    als.default_alias_id,
    al.name,
    al.sort_name,
    edd.edition_group_bbid,
    edd.edition_number,
    edd.author_credit_id,
    edd.width,
    edd.height,
    edd.depth,
    edd.weight,
    edd.pages,
    edd.format_id,
    edd.status_id,
    edd.alias_set_id,
    edd.identifier_set_id,
    edd.relationship_set_id,
    edd.language_set_id,
    edd.release_event_set_id,
    edd.publisher_set_id,
    edd.credit_section,
    e.type
   FROM bookbrainz.edition_revision edr
     LEFT JOIN bookbrainz.entity e ON e.bbid = edr.bbid
     LEFT JOIN bookbrainz.edition_header edh ON edh.bbid = e.bbid
     LEFT JOIN bookbrainz.edition_data edd ON edr.data_id = edd.id
     LEFT JOIN bookbrainz.alias_set als ON edd.alias_set_id = als.id
     LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
     LEFT JOIN bookbrainz.disambiguation dis ON dis.id = edd.disambiguation_id
  WHERE e.type = 'Edition';

COMMIT;
