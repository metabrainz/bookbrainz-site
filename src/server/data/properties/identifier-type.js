var Model = require('../../helpers/model');

var IdentifierType = new Model('IdentifierType', {
	endpoint: 'identifierType'
});

IdentifierType.extend({
	id: {
		type: 'number',
		map: 'identifier_type_id'
	},
	detection_regex: {
		type: 'string'
	},
	validation_regex: {
		type: 'string'
	},
	label: {
		type: 'string'
	}
});

module.exports = IdentifierType;
