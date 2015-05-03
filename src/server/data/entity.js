var Model = require('../helpers/model');
require('../data/properties/alias');
require('../data/properties/annotation');
require('../data/properties/disambiguation');
require('../data/relationship');

var Entity = new Model('Entity', {
	abstract: true,
	endpoint: 'entity'
});

Entity.extend({
	bbid: {
		type: 'uuid',
		map: 'entity_gid'
	},
	default_alias: {
		type: 'object',
		model: 'Alias'
	},
	revision: {
		type: 'object'
	},
	aliases: {
		type: 'ref',
		model: 'Alias',
		many: true,
		map: 'aliases_uri'
	},
	disambiguation: {
		type: 'ref',
		model: 'Disambiguation',
		map: 'disambiguation_uri'
	},
	annotation: {
		type: 'ref',
		model: 'Annotation',
		map: 'annotation_uri'
	},
	relationships: {
		type: 'ref',
		model: 'Relationship',
		map: 'relationships_uri',
		many: true
	},
	last_updated: {
		type: 'date'
	},
	_type: {
		type: 'string'
	}
});

module.exports = Entity;
