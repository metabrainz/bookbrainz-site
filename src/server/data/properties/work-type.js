var Model = require('../../helpers/model');

var WorkType = new Model('WorkType', {
	endpoint: 'workType'
});

WorkType.extend({
	id: {
		type: 'number',
		map: 'work_type_id'
	},
	label: {
		type: 'string'
	}
});

module.exports = WorkType;
