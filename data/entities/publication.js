var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entity');

var Publication = new Model({
	base: Entity,
	endpoint: 'publication'
});

Publication.extend({
	publication_type: { type: 'enum', values: [ 'Book' ] }
});

module.exports = Publication;
