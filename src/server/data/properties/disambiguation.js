var Model = require('../../helpers/model');

var Disambiguation = new Model();

Disambiguation.extend({
	id: {
		type: 'number',
		map: 'disambiguation_id'
	},
	comment: {
		type: 'string'
	}
});

module.exports = Disambiguation;
