var Model = require('../../helpers/model');
var Entity = require('../../data/entity');

var Revision = new Model({
	endpoint: 'revision'
});

Revision.extend({
	id: {
		type: 'number',
		map: 'revision_id'
	},
	entity: {
		type: 'ref',
		model: Entity,
		map: 'entity_uri'
	}
});

module.exports = Revision;
