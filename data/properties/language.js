var Model = rootRequire('helpers/model');

var Language = new Model({
	endpoint: 'language'
});

Language.extend({
	id: {
		type: 'number',
		map: 'language_id'
	},
	name: {
		type: 'string'
	},
	frequency: {
		type: 'number'
	}
});

module.exports = Language;
