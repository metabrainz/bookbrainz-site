var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var Language = require('../../data/properties/language');
var EditionStatus = require('../../data/properties/edition-status');

var Edition = new Model('Edition', {
	base: Entity,
	endpoint: 'edition'
});

Edition.extend({
	edition_status: {
		type: 'object',
		model: 'EditionStatus'
	},
	language: {
		type: 'object',
		model: 'Language'
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
