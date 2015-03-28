var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entity'),
	Language = rootRequire('data/properties/language');

var Edition = new Model({
	base: Entity,
	name: 'Edition',
	endpoint: 'edition'
});

Edition.extend({
	edition_status: { type: 'enum', values: [ 'Official', 'Draft' ] },
	language: { type: 'object', model: Language },
	begin_date: { type: 'date' },
	end_date: { type: 'date' },
	ended: { type: 'boolean' }
});

module.exports = Edition;
