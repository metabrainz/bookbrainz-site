var Model = require('../helpers/model');
var Entity = require('../data/entity');

var Relationship = new Model('Relationship', {
	endpoint: 'relationship'
});

Relationship.extend({
	id: {
		type: 'number',
		map: 'relationship_id'
	},
	relationship_type: {
		type: 'enum'
	},
	entities: {
		type: 'object',
		model: 'Entity',
		many: true
	},
	begin_date: {
		type: 'date'
	},
	end_date: {
		type: 'date'
	},
	ended: {
		type: 'boolean'
	}
});

module.exports = Relationship;
