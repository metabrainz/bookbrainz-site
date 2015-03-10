var express = require('express');
var router = express.Router();
var auth = require('../lib/auth');

router.get('/login', function(req, res) {
	res.render('login', {
		user: req.user,
		session: req.session,
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

	res.redirect(303, redirect);
});

module.exports = router;