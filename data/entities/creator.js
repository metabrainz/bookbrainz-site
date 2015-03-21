var Model = rootRequire('helpers/model'),
    entityFields = rootRequire('data/entity-fields');

var Creator = new Model({
	endpoint: 'creator'
});

Creator.extend(entityFields);

Creator.extend({
	creator_type: { type: 'enum', values: [ 'Person', 'Group' ] },
	gender: { type: 'enum', values: [ 'Male', 'Female', 'Other' ] },
	begin_date: { type: 'date' },
	end_date: { type: 'date' },
	ended: { type: 'boolean' }
});

module.exports = Creator;
