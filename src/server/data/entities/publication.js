var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var PublicationType = require('../../data/properties/publication-type');

var Publication = new Model({
	base: Entity,
	name: 'Publication',
	endpoint: 'publication'
});

Publication.extend({
	publication_type: {
		type: 'object',
		model: PublicationType
	}
});

module.exports = Publication;
