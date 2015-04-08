var Model = require('../../helpers/model');
var Entity = require('../../data/entity');
var Language = require('../../data/properties/language');
var WorkType = require('../../data/properties/work-type');

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
