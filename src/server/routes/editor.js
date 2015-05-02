var express = require('express');
var router = express.Router();
var React = require('react');
var User = require('../data/user');
var bbws = require('../helpers/bbws');
var auth = require('../helpers/auth');
var Promise = require('bluebird');

var NotFoundError = require('../helpers/error').NotFoundError;
var ProfileForm = React.createFactory(require('../../client/components/forms/profile.jsx'));

router.get('/edit', auth.isAuthenticated, function(req, res, next) {
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
			next(new Error('An internal error occurred while loading profile'));
		});
});

router.post('/edit/handler', auth.isAuthenticated, function(req, res) {
	/* Should handle errors in some fashion other than redirecting. */
	if (req.body.id != req.user.id) {
		req.session.error = 'You do not have permission to edit that user';
		res.redirect(303, '/editor/edit');
	}

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
			req.session.error = 'An internal error occurred while modifying profile';
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

router.get('/:id/revisions', function(req, res, next) {
	var userPromise = User.findOne(req.params.id);
	var revisionsPromise = bbws.get('/user/' + req.params.id + '/revisions');

	Promise.join(userPromise, revisionsPromise,
		function(editor, revisions) {
			res.render('editor/revisions', {
				editor: editor,
				revisions: revisions
			});
		})
		.catch(function(err) {
			console.log(err.stack);
			next(new NotFoundError('Editor not found'));
		});
});


module.exports = router;
