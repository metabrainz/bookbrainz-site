var Model = rootRequire('helpers/model');

var Annotation = new Model();

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
