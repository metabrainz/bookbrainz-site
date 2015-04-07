var Model = rootRequire('helpers/model');

var EditionStatus = new Model({
	endpoint: 'editionStatus'
});

EditionStatus.extend({
	id: {
		type: 'number',
		map: 'edition_status_id'
	},
	label: {
		type: 'string'
	}
});

module.exports = EditionStatus;
