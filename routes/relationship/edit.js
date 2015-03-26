var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');
var bbws = rootRequire('helpers/bbws');

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

		bbws.post('/relationship', changes, {
				accessToken: req.session.bearerToken
			})
			.then(function returnNewRevision(revision) {
				res.send(revision);
			});
	});
});

module.exports = router;
