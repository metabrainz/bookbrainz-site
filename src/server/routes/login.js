var express = require('express');
var router = express.Router();
var auth = require('../helpers/auth');

router.get('/login', function(req, res) {
	res.render('login', {
		error: req.query.error
	});
});

router.get('/logout', function(req, res) {
	delete req.session.bearerToken;
	req.logout();
	res.redirect(303, '/');
});

router.post('/login/handler', auth.authenticate(), function(req, res) {
	var redirect = req.session.redirectTo ? req.session.redirectTo : '/';
	delete req.session.redirectTo;

	res.redirect(303, redirect);
}, function(err, req, res, next) {
	/* If an error occurs during login, send the user back. */
	res.redirect(301, '/login?error=' + err.message);
});

module.exports = router;
