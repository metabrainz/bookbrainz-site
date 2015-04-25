var Model = require('../helpers/model');
var UserType = require('../data/properties/user-type');
var Gender = require('../data/properties/gender');

var User = new Model('User', {
	endpoint: 'user'
});

User.extend({
	id: {
		type: 'number',
		map: 'user_id'
	},
	name: {
		type: 'string'
	},
	password: {
		type: 'string'
	},
	user_type: {
		type: 'object',
		model: 'UserType'
	},
	email: {
		type: 'string'
	},
	reputation: {
		type: 'number'
	},
	bio: {
		type: 'string'
	},
	created_at: {
		type: 'date'
	},
	active_at: {
		type: 'date'
	},
	total_revisions: {
		type: 'number'
	},
	revisions_applied: {
		type: 'number'
	},
	revisions_reverted: {
		type: 'number'
	},
	gender: {
		type: 'object',
		model: 'Gender'
	}
});

User.getCurrent = function(accessToken) {
	return this.findOne({
		path: '/account/',
		accessToken: accessToken
	});
}

module.exports = User;
