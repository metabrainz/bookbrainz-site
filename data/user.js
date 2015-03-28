var Model = rootRequire('helpers/model'),
    UserType = rootRequire('data/properties/user-type');

var User = new Model({
	endpoint: 'user'
});

User.extend({
	id: { type: 'number', map: 'user_id' },
	name: { type: 'string' },
	password: { type: 'string' },
	user_type: { type: 'object', model: UserType },
	email: { type: 'string' },
	reputation: { type: 'number' },
	bio: { type: 'string' },
	created_at: { type: 'date' },
	active_at: { type: 'date' }
});

User.getCurrent = function(accessToken) {
	return this.findOne({
		path: '/account/',
		accessToken: accessToken
	});
}

module.exports = User;
