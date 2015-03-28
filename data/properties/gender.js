var Model = rootRequire('helpers/model');

var Gender = new Model({
	endpoint: 'gender'
});

Gender.extend({
	id: {
		type: 'number',
		map: 'gender_id'
	},
	name: {
		type: 'string'
	}
});

module.exports = Gender;
