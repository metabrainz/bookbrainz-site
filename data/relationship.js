var Model = rootRequire('helpers/model');

var Relationship = new Model({
	endpoint: 'relationship'
});

Relationship.extend({
	id: { type: 'number', map: 'relationship_id' },
	relationship_type: { type: 'enum' },
	begin_date: { type: 'date' },
	end_date: { type: 'date' },
	ended: { type: 'boolean' }
});

module.exports = Relationship;
