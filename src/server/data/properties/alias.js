var Model = require('../../helpers/model');
var Language = require('./language');

var Alias = new Model('Alias');

Alias.extend({
	id: {
		type: 'number',
		map: 'alias_id'
	},
	name: {
		type: 'string'
	},
	sort_name: {
		type: 'string'
	},
	primary: {
		type: 'boolean'
	},
	language: {
		type: 'object',
		model: 'Language'
	}
});

module.exports = Alias;
