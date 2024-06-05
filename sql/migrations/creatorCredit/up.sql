BEGIN;

ALTER TABLE bookbrainz.entity DROP CONSTRAINT entity_bbid_fkey;
ALTER TABLE bookbrainz.creator_credit DROP COLUMN begin_phrase;

ALTER TABLE bookbrainz.publication_data ADD COLUMN creator_credit_id INT;
ALTER TABLE bookbrainz.publication_data ADD FOREIGN KEY (creator_credit_id) REFERENCES bookbrainz.creator_credit (id);

DROP VIEW bookbrainz.publication;

CREATE VIEW bookbrainz.publication AS
	SELECT
		e.bbid, pcd.id AS data_id, pcr.id AS revision_id, (pcr.id = pc.master_revision_id) AS master, pcd.annotation_id, pcd.disambiguation_id,
		als.default_alias_id, pcd.type_id, pcd.creator_credit_id, pcd.alias_set_id, pcd.identifier_set_id,
		pcd.relationship_set_id, e.type
	FROM bookbrainz.publication_revision pcr
	LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
	LEFT JOIN bookbrainz.publication_header pc ON pc.bbid = e.bbid
	LEFT JOIN bookbrainz.publication_data pcd ON pcr.data_id = pcd.id
	LEFT JOIN bookbrainz.alias_set als ON pcd.alias_set_id = als.id
	WHERE e.type = 'Publication';

COMMIT;