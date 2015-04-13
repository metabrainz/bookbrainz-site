var Model = require('../../helpers/model');

var Annotation = new Model('Annotation');

Annotation.extend({
	id: {
		type: 'number',
		map: 'annotation_id'
	},
	comment: {
		type: 'string'
	}
});

module.exports = Annotation;
