var Model = require('../../helpers/model');

var Alias = new Model();

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
	}
});

module.exports = Alias;
