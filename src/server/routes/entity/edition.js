var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Edition = require('../../data/entities/edition');
var EditionStatus = require('../../data/properties/edition-status');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

var NotFoundError = require('../../helpers/error').NotFoundError;

/* Middleware loader functions. */
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Edition for it. */
router.param('bbid', function(req, res, next, bbid) {
	if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
		Edition.findOne(req.params.bbid, {
				populate: [
					'annotation',
					'disambiguation',
					'relationships',
				]
			})
			.then(function(edition) {
				res.locals.entity = edition;

				next();
			})
			.catch(function(err) {
				if (err.status == 404) {
					var newErr = new NotFoundError('Edition not found');
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
	var edition = res.locals.entity;
	var title = 'Edition';

	if (edition.default_alias && edition.default_alias.name)
		title = 'Edition “' + edition.default_alias.name + '”';

	res.render('entity/view/edition', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, function(req, res) {
	EditionStatus.find()
		.then(function(editionStatuses) {
			res.render('entity/create/edition', {
				editionStatuses: editionStatuses,
				title: 'Add Edition'
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	console.log(req.body);

	if (req.body.editionStatusId) {
		changes.edition_status = {
			edition_status_id: req.body.editionStatusId
		};
	}

	if (req.body.languageId) {
		changes.language = {
			language_id: req.body.languageId
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

	Edition.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
