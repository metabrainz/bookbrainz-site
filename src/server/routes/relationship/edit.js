var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');
var RelationshipType = require('../../data/properties/relationship-type');
var Entity = require('../../data/entity');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));
var Promise = require('bluebird');
var config = require('../../helpers/config');

router.get('/:id/relationships', auth.isAuthenticated, function relationshipEditor(req, res) {
	var relationshipTypesPromise = RelationshipType.find();
	var entityPromise = Entity.findOne(req.params.id, {
			populate: [
				'aliases',
			]
		});

	Promise.join(entityPromise, relationshipTypesPromise,
		function(entity, relationshipTypes) {
			props = {
				relationshipTypes: relationshipTypes,
				targetEntity: entity,
				wsUrl: config.site.webservice
			};

			var markup = React.renderToString(EditForm(props));

			res.render('relationship/edit', {
				props: props,
				markup: markup
			});
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
