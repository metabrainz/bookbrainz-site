var Model = rootRequire('helpers/model');
var Entity = rootRequire('data/entity');
var Language = rootRequire('data/properties/language');
var WorkType = rootRequire('data/properties/work-type');

var Work = new Model({
	base: Entity,
	name: 'Work',
	endpoint: 'work'
});

Work.extend({
	work_type: {
		type: 'object',
		model: WorkType
	},
	languages: {
		type: 'object',
		model: Language,
		many: true
	}
});

module.exports = Work;
