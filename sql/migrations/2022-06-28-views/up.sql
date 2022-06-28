-- Views --
BEGIN;

DROP VIEW bookbrainz.author;
DROP VIEW bookbrainz.edition;
DROP VIEW bookbrainz.edition_group;
DROP VIEW bookbrainz.publisher;
DROP VIEW bookbrainz.work;
DROP VIEW bookbrainz.series;

CREATE OR REPLACE VIEW bookbrainz.author AS
	SELECT
		e.bbid, cd.id AS data_id, cr.id AS revision_id, (cr.id = c.master_revision_id) AS master, cd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, cd.begin_year, cd.begin_month, cd.begin_day, cd.begin_area_id,
		cd.end_year, cd.end_month, cd.end_day, cd.end_area_id, cd.ended, cd.area_id,
		cd.gender_id, cd.type_id, atype.label as author_type, cd.alias_set_id, cd.identifier_set_id, cd.relationship_set_id, e.type
	FROM bookbrainz.author_revision cr
	LEFT JOIN bookbrainz.entity e ON e.bbid = cr.bbid
	LEFT JOIN bookbrainz.author_header c ON c.bbid = e.bbid
	LEFT JOIN bookbrainz.author_data cd ON cr.data_id = cd.id
	LEFT JOIN bookbrainz.alias_set als ON cd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = cd.disambiguation_id
	LEFT JOIN bookbrainz.author_type atype ON atype.id = cd.type_id
	WHERE e.type = 'Author';

CREATE OR REPLACE VIEW bookbrainz.edition AS
	SELECT
		e.bbid, edd.id AS data_id, edr.id AS revision_id, (edr.id = ed.master_revision_id) AS master, edd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, edd.edition_group_bbid, edd.author_credit_id, edd.width, edd.height,
		edd.depth, edd.weight, edd.pages, edd.format_id, edd.status_id,
		edd.alias_set_id, edd.identifier_set_id, edd.relationship_set_id, e.type,
		edd.language_set_id, edd.release_event_set_id, edd.publisher_set_id
	FROM bookbrainz.edition_revision edr
	LEFT JOIN bookbrainz.entity e ON e.bbid = edr.bbid
	LEFT JOIN bookbrainz.edition_header ed ON ed.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_data edd ON edr.data_id = edd.id
	LEFT JOIN bookbrainz.alias_set als ON edd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = edd.disambiguation_id
	WHERE e.type = 'Edition';

CREATE OR REPLACE VIEW bookbrainz.work AS
	SELECT
		e.bbid, wd.id AS data_id, wr.id AS revision_id, (wr.id = w.master_revision_id) AS master, wd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, wd.type_id, worktype.label as work_type, wd.alias_set_id, wd.identifier_set_id,
		wd.relationship_set_id, e.type, wd.language_set_id
	FROM bookbrainz.work_revision wr
	LEFT JOIN bookbrainz.entity e ON e.bbid = wr.bbid
	LEFT JOIN bookbrainz.work_header w ON w.bbid = e.bbid
	LEFT JOIN bookbrainz.work_data wd ON wr.data_id = wd.id
	LEFT JOIN bookbrainz.alias_set als ON wd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = wd.disambiguation_id
	LEFT JOIN bookbrainz.publisher_type worktype ON worktype.id = wd.type_id
	WHERE e.type = 'Work';

CREATE OR REPLACE VIEW bookbrainz.publisher AS
	SELECT
		e.bbid, psd.id AS data_id, psr.id AS revision_id, (psr.id = ps.master_revision_id) AS master, psd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, psd.begin_year, psd.begin_month, psd.begin_day,
		psd.end_year, psd.end_month, psd.end_day, psd.ended, psd.area_id,
		psd.type_id, pubtype.label as publisher_type, psd.alias_set_id, psd.identifier_set_id, psd.relationship_set_id, e.type
	FROM bookbrainz.publisher_revision psr
	LEFT JOIN bookbrainz.entity e ON e.bbid = psr.bbid
	LEFT JOIN bookbrainz.publisher_header ps ON ps.bbid = e.bbid
	LEFT JOIN bookbrainz.publisher_data psd ON psr.data_id = psd.id
	LEFT JOIN bookbrainz.alias_set als ON psd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = psd.disambiguation_id
	LEFT JOIN bookbrainz.publisher_type pubtype ON pubtype.id = psd.type_id
	WHERE e.type = 'Publisher';

CREATE OR REPLACE VIEW bookbrainz.edition_group AS
	SELECT
		e.bbid, pcd.id AS data_id, pcr.id AS revision_id, (pcr.id = pc.master_revision_id) AS master, pcd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, pcd.type_id, egtype.label as edition_group_type, pcd.author_credit_id, pcd.alias_set_id, pcd.identifier_set_id,
		pcd.relationship_set_id, e.type
	FROM bookbrainz.edition_group_revision pcr
	LEFT JOIN bookbrainz.entity e ON e.bbid = pcr.bbid
	LEFT JOIN bookbrainz.edition_group_header pc ON pc.bbid = e.bbid
	LEFT JOIN bookbrainz.edition_group_data pcd ON pcr.data_id = pcd.id
	LEFT JOIN bookbrainz.alias_set als ON pcd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = pcd.disambiguation_id
	LEFT JOIN bookbrainz.edition_group_type egtype ON egtype.id = pcd.type_id
	WHERE e.type = 'EditionGroup';

CREATE OR REPLACE VIEW bookbrainz.series AS
	SELECT
		e.bbid, sd.id AS data_id, sr.id AS revision_id, (sr.id = s.master_revision_id) AS master, sd.entity_type, sd.annotation_id, dis.comment,
		als.default_alias_id, al."name", al.sort_name, sd.ordering_type_id, sd.alias_set_id, sd.identifier_set_id,
		sd.relationship_set_id, e.type
	FROM bookbrainz.series_revision sr
	LEFT JOIN bookbrainz.entity e ON e.bbid = sr.bbid
	LEFT JOIN bookbrainz.series_header s ON s.bbid = e.bbid
	LEFT JOIN bookbrainz.series_data sd ON sr.data_id = sd.id
	LEFT JOIN bookbrainz.alias_set als ON sd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = sd.disambiguation_id
	WHERE e.type = 'Series';

COMMIT;

