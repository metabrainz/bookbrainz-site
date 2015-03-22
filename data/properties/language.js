var Model = rootRequire('helpers/model');

var Language = new Model({
	endpoint: 'language'
});

Language.extend({
	id: { type: 'number', map: 'language_id' },
	name: { type: 'string' }
});

module.exports = Language;
