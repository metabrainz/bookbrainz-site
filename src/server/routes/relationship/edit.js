var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');

router.get('/:id/relationships', auth.isAuthenticated, function relationshipEditor(req, res) {
	res.render('relationship/edit', {
		entityGid: req.params.id
	});
});

router.post('/:id/relationships/handler', auth.isAuthenticated, function(req, res) {
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
