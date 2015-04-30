var Model = require('../../helpers/model');

var EditionFormat = new Model('EditionFormat', {
	endpoint: 'editionFormat'
});

EditionFormat.extend({
	id: {
		type: 'number',
		map: 'edition_format_id'
	},
	label: {
		type: 'string'
	}
});

module.exports = EditionFormat;
