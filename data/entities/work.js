var Model = rootRequire('helpers/model'),
    Entity = rootRequire('data/entity'),
	Language = rootRequire('data/properties/language');

var Work = new Model({
	base: Entity,
	name: 'Work',
	endpoint: 'work'
});

Work.extend({
	work_type: { type: 'enum' },
	languages: { type: 'object', model: Language, many: true }
});

module.exports = Work;
