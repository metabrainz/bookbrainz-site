BEGIN TRANSACTION;

ALTER TABLE bookbrainz.edition_data DROP COLUMN credit_section;
ALTER TABLE bookbrainz.edition_group_data DROP COLUMN credit_section;

-- Drop the existing view if it exists
DROP VIEW IF EXISTS 
    bookbrainz.edition,
    bookbrainz.edition_group;

CREATE VIEW bookbrainz.edition AS
	SELECT
		e.bbid, edd.id AS data_id, edr.id AS revision_id, (edr.id = edh.master_revision_id) AS master, edd.annotation_id, edd.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, edd.edition_group_bbid, edd.author_credit_id, edd.width, edd.height,
		edd.depth, edd.weight, edd.pages, edd.format_id, edd.status_id,
		edd.alias_set_id, edd.identifier_set_id, edd.relationship_set_id,
		edd.language_set_id, edd.release_event_set_id, edd.publisher_set_id, e.type
	FROM bookbrainz.edition_revision edr
	LEFT JOIN bookbrainz.entity e ON e.bbid = edr.bbid
	LEFT JOIN bookbrainz.edition_header edh ON edh.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_data edd ON edr.data_id = edd.id
	LEFT JOIN bookbrainz.alias_set als ON edd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = edd.disambiguation_id
	WHERE e.type = 'Edition';

CREATE VIEW bookbrainz.edition_group AS
	SELECT
		e.bbid, egd.id AS data_id, pcr.id AS revision_id, (pcr.id = egh.master_revision_id) AS master, egd.annotation_id, egd.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, egd.type_id, egtype.label as edition_group_type, egd.author_credit_id, egd.alias_set_id, egd.identifier_set_id,
		egd.relationship_set_id, e.type
	FROM bookbrainz.edition_group_revision pcr
	LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
	LEFT JOIN bookbrainz.edition_group_header egh ON egh.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_group_data egd ON pcr.data_id = egd.id
	LEFT JOIN bookbrainz.alias_set als ON egd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = egd.disambiguation_id
	LEFT JOIN bookbrainz.edition_group_type egtype ON egtype.id = egd.type_id
	WHERE e.type = 'EditionGroup';

COMMIT;