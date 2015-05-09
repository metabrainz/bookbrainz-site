var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
require('../../data/properties/language');
require('../../data/properties/edition-format');
require('../../data/properties/edition-status');
require('../../data/entities/publication');
require('../../data/entities/publisher');

var Edition = new Model('Edition', {
	base: Entity,
	endpoint: 'edition'
});

Edition.extend({
	publication: {
		type: 'ref',
		model: 'Publication',
		map: 'publication_uri'
	},
	creator_credit: {
		type: 'object'
	},
	edition_format: {
		type: 'object',
		model: 'EditionFormat'
	},
	edition_status: {
		type: 'object',
		model: 'EditionStatus'
	},
	publisher: {
		type: 'ref',
		model: 'Publisher'
	},
	language: {
		type: 'object',
		model: 'Language'
	},
	release_date: {
		type: 'date'
	}
});

module.exports = Edition;
