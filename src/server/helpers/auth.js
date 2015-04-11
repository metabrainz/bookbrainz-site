var passport = require('passport');
var config = require('../helpers/config');
var BBWSStrategy = require('./passport-bookbrainz-ws');

var auth = {};

auth.init = function(app) {
	passport.use(new BBWSStrategy({
		wsURL: config.site.webservice,
		clientID: config.site.clientID
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
			password: req.body.password
		};

		var callback = function(err) {
			if (err) {
				console.log(err.stack);

				var newErr;

				switch (err.name) {
					case 'InternalOAuthError':
					case 'TokenError':
						newErr = new Error('An internal error occurred during authentication');
						break;
					case 'AuthorizationError':
						newErr = new Error('Invalid username or password');
						break;
				}

				return next(newErr);
			}
		};

		passport.authenticate('bbws', options)(req, res, callback);
	}
};

auth.isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated())
		return next();

	if (req.route.path == '/handler')
		req.session.redirectTo = req.baseUrl;
	else
		req.session.redirectTo = req.originalUrl;

	res.redirect(303, '/login');
};

module.exports = auth;
