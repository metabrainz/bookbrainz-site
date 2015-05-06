var Model = require('../../helpers/model');
var IdentifierType = require('./identifier-type');

var Identifier = new Model('Identifier');

Identifier.extend({
	id: {
		type: 'number',
		map: 'identifier_id'
	},
	value: {
		type: 'string'
	},
	identifier_type: {
		type: 'object',
		model: 'IdentifierType'
	}
});

module.exports = Identifier;
