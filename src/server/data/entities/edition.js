var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var Language = require('../../data/properties/language');
var EditionStatus = require('../../data/properties/edition-status');

var Edition = new Model('Edition', {
	base: Entity,
	endpoint: 'edition'
});

Edition.extend({
	publication: {
		type: 'ref',
		model: 'Publication'
	},
	creator_credit: {
		type: 'object'
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
