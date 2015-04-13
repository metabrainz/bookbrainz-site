var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Work = require('../../data/entities/work');
var WorkType = require('../../data/properties/work-type');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

var NotFoundError = require('../../helpers/error').NotFoundError;

/* Middleware loader functions. */
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

router.param('bbid', function(req, res, next, bbid) {
	if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
		Work.findOne(req.params.bbid, {
				populate: [
					'annotation',
					'disambiguation',
					'relationships',
				]
			})
			.then(function(work) {
				res.locals.entity = work;

				next();
			})
			.catch(function(err) {
				if (err.status == 404) {
					var newErr = new NotFoundError('Work not found');
					return next(newErr);
				}

				next(err);
			});
	}
	else {
		next('route');
	}
});

router.get('/:bbid', loadEntityRelationships, function(req, res, next) {
	var work = res.locals.entity;
	var title = 'Work';

	if (work.default_alias && work.default_alias.name)
		title = 'Work “' + work.default_alias.name + '”';

	res.render('entity/view/work', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, function(req, res) {
	WorkType.find()
		.then(function(workTypes) {
			res.render('entity/create/work', {
				workTypes: workTypes,
				title: 'Add Work'
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

module.exports = router;
