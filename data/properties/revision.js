var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entities/entity');

var Revision = new Model({
	endpoint: 'revision'
});

Revision.extend({
	id: { type: 'number', map: 'revision_id' },
	entity: { type: 'ref', model: Entity, map: 'entity_uri' }
});

module.exports = Revision;
