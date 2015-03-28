var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entity');

var Publisher = new Model({
	base: Entity,
	name: 'Publisher',
	endpoint: 'publisher'
});

Publisher.extend({
	publisher_type: { type: 'enum' },
	begin_date: { type: 'date' },
	end_date: { type: 'date' },
	ended: { type: 'boolean' }
});

module.exports = Publisher;
