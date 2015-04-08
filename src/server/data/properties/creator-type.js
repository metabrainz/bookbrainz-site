var Model = require('../../helpers/model');

var CreatorType = new Model({
	endpoint: 'creatorType'
});

CreatorType.extend({
	id: {
		type: 'number',
		map: 'creator_type_id'
	},
	label: {
		type: 'string'
	}
});

module.exports = CreatorType;
