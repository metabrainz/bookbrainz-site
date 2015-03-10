var express = require('express');
var router = express.Router();
var request = require('superagent');
require('superagent-bluebird-promise');
var Promise = require('bluebird');

router.get('/editor/:id', function(req, res) {
	// Get the list of publication types
	var ws = req.app.get('webservice');

	var userPromise = request.get(ws + '/user/' + req.params.id).promise();
	var userSecretsPromise = request.get(ws + '/user/secrets')
		.set('Authorization', 'Bearer ' + req.session.bearerToken).promise();
	var userStatsPromise = request.get(ws + '/user/' +
		req.params.id + '/stats').promise();

	var renderData = {
		user: req.user,
		session: req.session
	};

	userStatsPromise.then(function(stats) {
		renderData.stats = stats.body;
	}).
	catch (function(err) {});

	userSecretsPromise.then(function(secrets) {
		renderData.secrets = secrets.body;
	}).
	catch (function(err) {});

	userPromise.then(function(user) {
		renderData.editor = user.body;

		/* This will cause the page to be rendered when both optional promises have
    either been fulfilled or rejected, but only when the user promise has been
    fulfilled. */
		Promise.join(userStatsPromise, userSecretsPromise)
			.
		catch (function() {})
			.
		finally(function() {
			res.render('editor/editor', renderData);
		});
	});
});

router.get('/editor/:id/edits', function(req, res) {
	// Get the list of publication types
	var ws = req.app.get('webservice');

	var userPromise = request.get(ws + '/user/' + req.params.id).promise();
	var userEditsPromise = request.get(ws + '/user/' +
		req.params.id + '/edits').promise();

	var userRevisionsPromise = userEditsPromise.then(function(edits) {
		return Promise.all(
			edits.body.objects.map(function(edit) {
				return request.get(edit.revisions_uri).promise();
			})
		);
	});


	Promise.join(userPromise, userEditsPromise, userRevisionsPromise, function(user, edits, revisions) {
		var editObjects = edits.body.objects;
		editObjects.forEach(function(e, i) {
			editObjects[i].revisions = revisions[i].body;
		});
		console.log(editObjects);

		res.render('editor/edits', {
			user: req.user,
			session: req.session,
			editor: user.body,
			edits: edits.body
		});
	});
});

module.exports = router;