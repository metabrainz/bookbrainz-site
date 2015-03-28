var Model = rootRequire('helpers/model'),
    Alias = rootRequire('data/properties/alias'),
    Annotation = rootRequire('data/properties/annotation'),
    Disambiguation = rootRequire('data/properties/disambiguation');

var Entity = new Model();

Entity.extend({
	bbid: { type: 'uuid', map: 'entity_gid' },
	default_alias: { type: 'object', model: Alias },
	revision: { type: 'object' },
	aliases: { type: 'ref', model: Alias, many: true, map: 'aliases_uri' },
	disambiguation: { type: 'ref', model: Disambiguation, map: 'disambiguation_uri' },
	annotation: { type: 'ref', model: Annotation, map: 'annotation_uri' },
	last_updated: { type: 'date' }
});

module.exports = Entity;
