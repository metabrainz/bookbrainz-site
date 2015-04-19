var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Publisher = require('../../data/entities/publisher');
var PublisherType = require('../../data/properties/publisher-type');
var Language = require('../../data/properties/language');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publisher.jsx'));
// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	var publisherTypePromise = PublisherType.find();
	var languagesPromise = Language.find();

	Promise.join(publisherTypePromise, languagesPromise,
		function(publisherTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return b.frequency - a.frequency;

				return a.name.localeCompare(b.name);
			});

			var props = {
				languages: alphabeticLanguagesList,
				publisherTypes: publisherTypes
			};

			var markup = React.renderToString(EditForm(props));

			res.render('entity/create/publisher', {
				props: props,
				markup: markup
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	console.log(req.body);

	if (req.body.publisherTypeId) {
		changes.publisher_type = {
			publisher_type_id: req.body.publisherTypeId
		};
	}

	if (req.body.beginDate) {
		changes.begin_date = req.body.beginDate;
	}

	if (req.body.endDate) {
		changes.end_date = req.body.endDate;
	}

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

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

	Publisher.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(publisher) {
		var rendered = publisher.relationships.map(function(relationship) {
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
				publisher.relationships = rendered;
				res.render('entity/view/publisher', {
					title: 'BookBrainz',
					entity: publisher
				});
			});
	};

	Publisher.findOne(req.params.id, {
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
