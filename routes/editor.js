var express = require('express');
var router = express.Router();
var User = rootRequire('data/user');
var bbws = rootRequire('helpers/bbws');
var auth = rootRequire('helpers/auth');

var NotFoundError = require('../helpers/error').NotFoundError;

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

router.get('/:id', function(req, res, next) {
	var userPromise;

	if (req.user && req.params.id == req.user.id)
		userPromise = User.getCurrent(req.session.bearerToken);
	else
		userPromise = User.findOne(req.params.id);

	userPromise
		.then(function(editor) {
			res.render('editor/editor', {
				editor: editor
			});
		})
		.catch(function(err) {
			console.log(err.stack);
			next(new NotFoundError('Editor not found'));
		});
});


module.exports = router;
