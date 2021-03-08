BEGIN;

DROP VIEW bookbrainz.edition_group;

CREATE VIEW bookbrainz.edition_group AS
	SELECT
		e.bbid, pcd.id AS data_id, pcr.id AS revision_id, (pcr.id = pc.master_revision_id) AS master, pcd.annotation_id, pcd.disambiguation_id,
		als.default_alias_id, pcd.type_id, pcd.alias_set_id, pcd.identifier_set_id,
		pcd.relationship_set_id, e.type
	FROM bookbrainz.edition_group_revision pcr
	LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
	LEFT JOIN bookbrainz.edition_group_header pc ON pc.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_group_data pcd ON pcr.data_id = pcd.id
	LEFT JOIN bookbrainz.alias_set als ON pcd.alias_set_id = als.id
	WHERE e.type = 'EditionGroup';


ALTER TABLE bookbrainz.edition_group_data DROP CONSTRAINT author_credit_author_credit_id_fkey;
ALTER TABLE bookbrainz.edition_group_data DROP COLUMN author_credit_id;

COMMIT;