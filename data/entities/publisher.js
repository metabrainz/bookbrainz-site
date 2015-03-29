var Model = rootRequire('helpers/model');
var Entity = rootRequire('data/entity');
var PublisherType = rootRequire('data/properties/publisher-type');

var Publisher = new Model({
	base: Entity,
	name: 'Publisher',
	endpoint: 'publisher'
});

Publisher.extend({
	publisher_type: {
		type: 'object',
		map: PublisherType
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

module.exports = Publisher;
