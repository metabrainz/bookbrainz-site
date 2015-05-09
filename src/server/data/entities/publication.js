var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
require('../../data/entities/edition');
require('../../data/properties/publication-type');

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
		many: true,
		map: 'editions_uri'
	}
});

module.exports = Publication;
