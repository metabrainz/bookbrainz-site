BEGIN;

ALTER TABLE bookbrainz.edition_group_data ADD COLUMN author_credit_id INT;
ALTER TABLE bookbrainz.edition_group_data ADD FOREIGN KEY (author_credit_id) REFERENCES bookbrainz.author_credit (id);

CREATE OR REPLACE VIEW bookbrainz.edition_group AS
	SELECT
		e.bbid, pcd.id AS data_id, pcr.id AS revision_id, (pcr.id = pc.master_revision_id) AS master, pcd.annotation_id, pcd.disambiguation_id,
		als.default_alias_id, pcd.type_id, pcd.alias_set_id, pcd.identifier_set_id,
		pcd.relationship_set_id, e.type, pcd.author_credit_id
	FROM bookbrainz.edition_group_revision pcr
	LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
	LEFT JOIN bookbrainz.edition_group_header pc ON pc.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_group_data pcd ON pcr.data_id = pcd.id
	LEFT JOIN bookbrainz.alias_set als ON pcd.alias_set_id = als.id
	WHERE e.type = 'EditionGroup';

COMMIT;