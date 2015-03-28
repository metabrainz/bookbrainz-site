var Model = rootRequire('helpers/model');
var Entity = rootRequire('data/entity');

var Publication = new Model({
	base: Entity,
	name: 'Publication',
	endpoint: 'publication'
});

Publication.extend({
	publication_type: {
		type: 'enum',
		values: ['Book']
	}
});

module.exports = Publication;
