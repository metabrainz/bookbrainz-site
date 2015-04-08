var Model = require('../../helpers/model');

var RelationshipType = new Model({
	endpoint: 'relationshipType'
});

RelationshipType.extend({
	id: {
		type: 'number',
		map: 'relationship_type_id'
	},
	label: {
		type: 'string'
	},
	template: {
		type: 'string'
	},
	description: {
		type: 'string'
	},
	deprecated: {
		type: 'boolean'
	},
	child_order: {
		type: 'number'
	}
});

module.exports = RelationshipType;
