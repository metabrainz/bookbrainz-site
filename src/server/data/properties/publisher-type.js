var Model = require('../../helpers/model');

var PublisherType = new Model('PublisherType', {
	endpoint: 'publisherType'
});

PublisherType.extend({
	id: {
		type: 'number',
		map: 'publisher_type_id'
	},
	label: {
		type: 'string'
	}
});

module.exports = PublisherType;
