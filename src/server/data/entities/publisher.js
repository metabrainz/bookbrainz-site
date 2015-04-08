var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var PublisherType = require('../../data/properties/publisher-type');

var Publisher = new Model({
	base: Entity,
	name: 'Publisher',
	endpoint: 'publisher'
});

Publisher.extend({
	publisher_type: {
		type: 'object',
		model: PublisherType
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
