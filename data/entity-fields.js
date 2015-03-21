var Alias = rootRequire('data/properties/alias'),
    Annotation = rootRequire('data/properties/annotation'),
    Disambiguation = rootRequire('data/properties/disambiguation');

var entityFields = {
	bbid: { type: 'uuid', map: 'entity_gid' },
	aliases: { type: 'ref', model: Alias, many: true, map: 'aliases_uri' },
	disambiguation: { type: 'ref', model: Disambiguation, map: 'disambiguation_uri' },
	annotation: { type: 'ref', model: Annotation, map: 'annotation_uri' },
	default_alias_id: { type: 'number' },
	last_updated: { type: 'date' },
	master_revision_id: { type: 'number' }
};

module.exports = entityFields;
