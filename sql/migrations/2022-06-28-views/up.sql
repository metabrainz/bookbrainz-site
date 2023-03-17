-- IMPORTANT ! --
-- Do not forget to run the sql/scripts/create_triggers.sql script
-- since we are dropping the and recreating the views --

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
		e.bbid, ad.id AS data_id, ar.id AS revision_id, (ar.id = ah.master_revision_id) AS master, ad.annotation_id, ad.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, ad.begin_year, ad.begin_month, ad.begin_day, ad.begin_area_id,
		ad.end_year, ad.end_month, ad.end_day, ad.end_area_id, ad.ended, ad.area_id,
		ad.gender_id, ad.type_id, atype.label as author_type, ad.alias_set_id, ad.identifier_set_id, ad.relationship_set_id, e.type
	FROM bookbrainz.author_revision ar
	LEFT JOIN bookbrainz.entity e ON e.bbid = ar.bbid
	LEFT JOIN bookbrainz.author_header ah ON ah.bbid = e.bbid
	LEFT JOIN bookbrainz.author_data ad ON ar.data_id = ad.id
	LEFT JOIN bookbrainz.alias_set als ON ad.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = ad.disambiguation_id
	LEFT JOIN bookbrainz.author_type atype ON atype.id = ad.type_id
	WHERE e.type = 'Author';

CREATE OR REPLACE VIEW bookbrainz.edition AS
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

CREATE OR REPLACE VIEW bookbrainz.work AS
	SELECT
		e.bbid, wd.id AS data_id, wr.id AS revision_id, ( wr.id = wh.master_revision_id) AS master, wd.annotation_id, wd.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, wd.type_id, worktype.label as work_type, wd.alias_set_id, wd.identifier_set_id,
		wd.relationship_set_id, wd.language_set_id, e.type
	FROM bookbrainz.work_revision wr
	LEFT JOIN bookbrainz.entity e ON e.bbid = wr.bbid
	LEFT JOIN bookbrainz.work_header wh ON wh.bbid = e.bbid
	LEFT JOIN bookbrainz.work_data wd ON wr.data_id = wd.id
	LEFT JOIN bookbrainz.alias_set als ON wd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = wd.disambiguation_id
	LEFT JOIN bookbrainz.work_type worktype ON worktype.id = wd.type_id
	WHERE e.type = 'Work';

CREATE OR REPLACE VIEW bookbrainz.publisher AS
	SELECT
		e.bbid, pubd.id AS data_id, psr.id AS revision_id, (psr.id = pubh.master_revision_id) AS master, pubd.annotation_id, pubd.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, pubd.begin_year, pubd.begin_month, pubd.begin_day,
		pubd.end_year, pubd.end_month, pubd.end_day, pubd.ended, pubd.area_id,
		pubd.type_id, pubtype.label as publisher_type, pubd.alias_set_id, pubd.identifier_set_id, pubd.relationship_set_id, e.type
	FROM bookbrainz.publisher_revision psr
	LEFT JOIN bookbrainz.entity e ON e.bbid = psr.bbid
	LEFT JOIN bookbrainz.publisher_header pubh ON pubh.bbid = e.bbid
	LEFT JOIN bookbrainz.publisher_data pubd ON psr.data_id = pubd.id
	LEFT JOIN bookbrainz.alias_set als ON pubd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = pubd.disambiguation_id
	LEFT JOIN bookbrainz.publisher_type pubtype ON pubtype.id = pubd.type_id
	WHERE e.type = 'Publisher';

CREATE OR REPLACE VIEW bookbrainz.edition_group AS
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

CREATE OR REPLACE VIEW bookbrainz.series AS
	SELECT
		e.bbid, sd.id AS data_id, sr.id AS revision_id, (sr.id = sh.master_revision_id) AS master, sd.entity_type, sd.annotation_id, sd.disambiguation_id, dis.comment disambiguation,
		als.default_alias_id, al."name", al.sort_name, sd.ordering_type_id, sd.alias_set_id, sd.identifier_set_id,
		sd.relationship_set_id, e.type
	FROM bookbrainz.series_revision sr
	LEFT JOIN bookbrainz.entity e ON e.bbid = sr.bbid
	LEFT JOIN bookbrainz.series_header sh ON sh.bbid = e.bbid
	LEFT JOIN bookbrainz.series_data sd ON sr.data_id = sd.id
	LEFT JOIN bookbrainz.alias_set als ON sd.alias_set_id = als.id
	LEFT JOIN bookbrainz.alias al ON al.id = als.default_alias_id
	LEFT JOIN bookbrainz.disambiguation dis ON dis.id = sd.disambiguation_id
	WHERE e.type = 'Series';

COMMIT;

