var express = require('express');
var router = express.Router();
var React = require('react');
var User = require('../data/user');
var bbws = require('../helpers/bbws');
var auth = require('../helpers/auth');

var ProfileForm = React.createFactory(require('../../client/components/forms/profile.jsx'));

router.get('/edit', auth.isAuthenticated, function(req, res) {
	User.getCurrent(req.session.bearerToken)
		.then(function(user) {
			var props = {
				id: user.id,
				email: user.email,
				bio: user.bio
			};

			var markup = React.renderToString(ProfileForm(props));

			res.render('editor/edit', {
				props: props,
				markup: markup
			});
		})
		.catch(function(err) {
			next(new Error('An internal error occurred while loading user'));
		});
});

router.post('/edit/handler', auth.isAuthenticated, function(req, res) {
	bbws.put('/user/' + req.body.id + '/', {
			bio: req.body.bio,
			email: req.body.email
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
