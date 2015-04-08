var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Work = require('../../data/entities/work');
var WorkType = require('../../data/properties/work-type');
var Language = require('../../data/properties/language');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	var workTypePromise = WorkType.find();
	var languagesPromise = Language.find();

	Promise.join(workTypePromise, languagesPromise,
		function(workTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return b.frequency - a.frequency;

				return a.name.localeCompare(b.name);
			});

			res.render('entity/create/work', {
				languages: alphabeticLanguagesList,
				workTypes: workTypes
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	console.log(req.body);

	if (req.body.workTypeId) {
		changes.work_type = {
			work_type_id: req.body.workTypeId
		};
	}

	if (req.body.languages) {
		changes.languages = req.body.languages.map(function(language_id) {
			return {
				language_id: language_id
			};
		});
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

	Work.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(work) {
		var rendered = work.relationships.map(function(relationship) {
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
				work.relationships = rendered;
				res.render('entity/view/work', {
					title: 'BookBrainz',
					entity: work
				});
			});
	};

	Work.findOne(req.params.id, {
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
