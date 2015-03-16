var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');

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

	res.redirect(303, redirect);
});

module.exports = router;
