var express = require('express');
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Creator = require('../../data/entities/creator');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

var NotFoundError = require('../../helpers/error').NotFoundError;

/* Middleware loader functions. */
var loadCreatorTypes = require('../../helpers/middleware').loadCreatorTypes;
var loadGenders = require('../../helpers/middleware').loadGenders;
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

var router = express.Router();

/* If the route specifies a BBID, load the Creator for it. */
router.param('bbid', function(req, res, next, bbid) {
	if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
		Creator.findOne(req.params.bbid, {
				populate: [
					'annotation',
					'disambiguation',
					'relationships',
				]
			})
			.then(function(creator) {
				res.locals.entity = creator;

				next();
			})
			.catch(function(err) {
				if (err.status == 404) {
					var newErr = new NotFoundError('Creator not found');
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
	var creator = res.locals.entity;
	var title = 'Creator';

	if (creator.default_alias && creator.default_alias.name)
		title = 'Creator “' + creator.default_alias.name + '”';

	res.render('entity/view/creator', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadGenders, loadLanguages, loadCreatorTypes, function(req, res) {
	res.render('entity/create/creator', {
		title: 'Add Creator'
	});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	if (req.body.creatorTypeId) {
		changes.creator_type = {
			creator_type_id: req.body.creatorTypeId
		};
	}

	if (req.body.genderId) {
		changes.gender = {
			gender_id: req.body.genderId
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

	Creator.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
