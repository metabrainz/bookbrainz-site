var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');

var relationshipHelper = {};

relationshipHelper.addEditRoutes = function(router) {
	router.get('/:bbid/relationships', auth.isAuthenticated, function relationshipEditor(req, res) {
		res.render('relationship/edit', {
			entityGid: req.params.bbid
		});
	});

	router.post('/:bbid/relationships/handler', auth.isAuthenticated, function(req, res) {
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
}

module.exports = relationshipHelper;
