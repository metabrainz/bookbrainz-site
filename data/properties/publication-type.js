var Model = rootRequire('helpers/model');

var PublicationType = new Model({
	endpoint: 'publicationType'
});

PublicationType.extend({
	id: { type: 'number', map: 'publication_type_id' },
	label: { type: 'string' }
});

module.exports = PublicationType;
