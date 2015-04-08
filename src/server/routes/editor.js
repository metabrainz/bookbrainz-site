var express = require('express');
var router = express.Router();
var User = require('../data/user');
var bbws = require('../helpers/bbws');
var auth = require('../helpers/auth');

router.get('/edit', auth.isAuthenticated, function(req, res) {
	res.render('editor/edit', {
		userId: req.user.id
	});
});

router.post('/edit/handler', auth.isAuthenticated, function(req, res) {
	bbws.put('/user/' + req.body.id + '/', {
			name: req.body.name,
			bio: req.body.bio,
		}, {
			accessToken: req.session.bearerToken
		})
		.then(function(user) {
			res.send(user);
		})
		.catch(function(err) {
			req.session.error = 'Error! Please try a different username';
			res.redirect(303, '/editor/edit');
		});
});

router.get('/:id', function(req, res) {
	var userPromise;

	if (req.params.id == req.user.id)
		userPromise = User.getCurrent(req.session.bearerToken);
	else
		userPromise = User.findOne(req.params.id);

	userPromise.then(function(editor) {
		res.render('editor/editor', {
			editor: editor
		});
	});
});


module.exports = router;
