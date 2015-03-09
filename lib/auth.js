var passport = require('passport'),
    BBWSStrategy = require('./passport-bookbrainz-ws');

var auth = {};

auth.init = function(app) {
	var ws = app.get('webservice');

	passport.use(new BBWSStrategy({
		wsURL: ws,
		clientID: 'f8accd51-33d2-4d9b-a2c1-c01a76a4f096'
	}, function(req, accessToken, refreshToken, profile, done) {
		req.session.bearerToken = accessToken;

		done(null, profile);
	}));

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

	app.use(passport.initialize());
	app.use(passport.session());
};

auth.authenticate = function() {
	return function(req, res, next) {
		var options = {
			username: req.body.username,
			password: 'abc'
		};

		passport.authenticate('bbws', options)(req, res, next);
	}
};

auth.isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated())
		return next();

	req.session.redirectTo = req.originalUrl;
	res.redirect(303, '/login');
};

module.exports = auth;
