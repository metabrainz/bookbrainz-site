var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var PublicationType = require('../../data/properties/publication-type');

var Publication = new Model('Publication', {
	base: Entity,
	endpoint: 'publication'
});

Publication.extend({
	publication_type: {
		type: 'object',
		model: 'PublicationType'
	},
	editions: {
		type: 'ref',
		model: 'Edition',
		many: true
	}
});

module.exports = Publication;
