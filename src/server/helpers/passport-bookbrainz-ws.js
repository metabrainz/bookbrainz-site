var util = require('util');
var PasswordGrantStrategy = require('passport-oauth2-password-grant');
var User = require('../data/user');

function BBWSStrategy(options, verify) {
	options = options || {};

	if (!options.wsURL) {
		throw new TypeError('BBWSStrategy requires a wsURL option');
	}

	this._wsURL = options.wsURL;
	delete options.wsURL;

	options.tokenURL = this._wsURL + '/oauth/token';
	options.passReqToCallback = true;

	PasswordGrantStrategy.call(this, options, verify);
	this.name = 'bbws';
}

util.inherits(BBWSStrategy, PasswordGrantStrategy);

BBWSStrategy.prototype.userProfile = function(accessToken, done) {
	User.getCurrent(accessToken)
		.then(function(user) {
			var profile = {
				id: user.id,
				name: user.name
			};

			done(null, profile);
		})
		.catch(function(err) {
			console.log(err.stack);
			return done(new Error('Failed to fetch user profile'));
		});
};

module.exports = BBWSStrategy;
