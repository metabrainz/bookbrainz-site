var util = require('util'),
    PasswordGrantStrategy = require('passport-oauth2-password-grant');

function BBWSStrategy(options, verify) {
	options = options || {};

	if (!options.wsURL) { throw new TypeError('BBWSStrategy requires a wsURL option'); }

	this._wsURL = options.wsURL;
	delete options.wsURL;

	options.tokenURL = this._wsURL + '/oauth/token';
	options.passReqToCallback = true;

	PasswordGrantStrategy.call(this, options, verify);
	this.name = 'bbws';
}

util.inherits(BBWSStrategy, PasswordGrantStrategy);

BBWSStrategy.prototype.userProfile = function(accessToken, done) {
	this._oauth2.get(this._wsURL + '/user/secrets', accessToken, function(err, body, res) {
		if (err)
			return done(new Error('Failed to fetch user profile'));

		try {
			var json = JSON.parse(body);

			var profile = {
				id: json.user_id,
				name: json.name
			};

			done(null, profile);
		} catch(e) {
			done(e);
		}
	});
};

module.exports = BBWSStrategy;
