var express = require('express'),
    router = express.Router(),
    auth = rootRequire('helpers/auth'),
    Relationship = rootRequire('data/relationship');

router.get('/', function relationshipEditor(req, res) {
	res.render('relationship/edit', {
		entityGid: req.params.id
	});
});

router.post('/handler', auth.isAuthenticated, function(req, res) {
	req.body.forEach(function(relationship) {
		// Send a relationship revision for each of the relationships
		var changes = relationship;

		Relationship.create(changes, {
			session: req.session
		})
			.then(function(revision) {
				res.send(revision);
			});
	});
});

module.exports = router;
