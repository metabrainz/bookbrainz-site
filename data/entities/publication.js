var Model = rootRequire('helpers/model'),
    entityFields = rootRequire('data/entity-fields');

var Publication = new Model({
	endpoint: 'publication'
});

Publication.extend(entityFields);

Publication.extend({
	publication_type: { type: 'enum', values: [ 'Book' ] }
});

module.exports = Publication;
