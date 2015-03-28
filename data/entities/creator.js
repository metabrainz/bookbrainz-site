var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entity');

var Creator = new Model({
	base: Entity,
	endpoint: 'creator'
});

Creator.extend({
	creator_type: { type: 'enum', values: [ 'Person', 'Group' ] },
	gender: { type: 'enum', values: [ 'Male', 'Female', 'Other' ] },
	begin_date: { type: 'date' },
	end_date: { type: 'date' },
	ended: { type: 'boolean' }
});

module.exports = Creator;
