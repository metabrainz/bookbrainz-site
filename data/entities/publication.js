var Model = rootRequire('helpers/model');
var Entity = rootRequire('data/entity');
var PublicationType = rootRequire('data/properties/publication-type');

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
