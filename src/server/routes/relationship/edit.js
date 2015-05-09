var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');
var RelationshipType = require('../../data/properties/relationship-type');
var Entity = require('../../data/entity');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));
var Promise = require('bluebird');
var config = require('../../helpers/config');

var relationshipHelper = {};

relationshipHelper.addEditRoutes = function(router) {
	router.get('/:bbid/relationships', auth.isAuthenticated, function relationshipEditor(req, res) {
		var relationshipTypesPromise = RelationshipType.find();
		var entityPromise = Entity.findOne(req.params.bbid, {
				populate: [
					'aliases'
				]
			});

		Promise.join(entityPromise, relationshipTypesPromise,
			function(entity, relationshipTypes) {
				var props = {
					relationshipTypes: relationshipTypes,
					targetEntity: entity,
					wsUrl: config.site.clientWebservice
				};

				var markup = React.renderToString(EditForm(props));

				res.render('relationship/edit', {
					props: props,
					markup: markup
				});
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
};

module.exports = relationshipHelper;
