var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Publication = require('../../data/entities/publication');
var PublicationType = require('../../data/properties/publication-type');
var Language = require('../../data/properties/language');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publication.jsx'));
// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	// Get the list of publication types
	var publicationTypesPromise = PublicationType.find();
	var languagesPromise = Language.find();

	Promise.join(publicationTypesPromise, languagesPromise,
		function(publicationTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return b.frequency - a.frequency;

				return a.name.localeCompare(b.name);
			});

			var props = {
				languages: alphabeticLanguagesList,
				publicationTypes: publicationTypes
			};

			var markup = React.renderToString(EditForm(props));

			res.render('entity/create/publication', {
				props: props,
				markup: markup
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		publication_type: {
			publication_type_id: req.body.publicationTypeId
		}
	};

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

	if (req.body.aliases.length) {
		var default_alias = req.body.aliases[0];

		changes.aliases = [{
			name: default_alias.name,
			sort_name: default_alias.sortName,
			language_id: default_alias.languageId,
			primary: default_alias.primary,
			default: true
		}];
	}

	Publication.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(publication) {
		var rendered = publication.relationships.map(function(relationship) {
			relationship.entities.sort(function sortRelationshipEntity(a, b) {
				return a.position - b.position;
			});

			relationship.entities = relationship.entities.map(function(entity) {
				return Entity.findOne(entity.entity.entity_gid);
			});

			relationship.template = relationship.relationship_type.template;
			relationship.rendered = Promise.all(relationship.entities)
				.then(function(entities) {
					entities.forEach(function(entity) {
						entity.entity_gid = entity.bbid;
					});
					return renderRelationship(entities, relationship, null);
				});

			return Promise.props(relationship);
		});

		Promise.all(rendered)
			.then(function(rendered) {
				publication.relationships = rendered;
				res.render('entity/view/publication', {
					title: 'BookBrainz',
					entity: publication
				});
			});
	};

	Publication.findOne(req.params.id, {
			populate: [
				'annotation',
				'disambiguation',
				'relationships',
			]
		})
		.then(render)
		.catch(function(err) {
			console.log(err.stack);
			next(err);
		});
});

module.exports = router;
