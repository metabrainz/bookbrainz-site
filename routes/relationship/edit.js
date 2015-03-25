var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

router.get('/', function relationshipEditor(req, res) {
	res.render('relationship/edit', {
		entityGid: req.params.id
	});
});

router.post('/handler', auth.isAuthenticated, function(req, res) {
	var ws = req.app.get('webservice');

	req.body.forEach(function(relationship) {
		// Send a relationship revision for each of the relationships
		var changes = relationship;

		request.post(ws + '/revisions')
			.set('Authorization', 'Bearer ' + req.session.bearerToken)
			.send(changes).promise()
			.then(function(revision) {
				res.send(revision.body);
			});
	});
});

module.exports = router;
