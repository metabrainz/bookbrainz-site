var Model = rootRequire('helpers/model');
var Entity = rootRequire('data/entity');
var Language = rootRequire('data/properties/language');
var EditionStatus = rootRequire('data/properties/edition-status');

var Edition = new Model({
	base: Entity,
	name: 'Edition',
	endpoint: 'edition'
});

Edition.extend({
	edition_status: {
		type: 'object',
		model: EditionStatus
	},
	language: {
		type: 'object',
		model: Language
	},
	begin_date: {
		type: 'date'
	},
	end_date: {
		type: 'date'
	},
	ended: {
		type: 'boolean'
	}
});

module.exports = Edition;
