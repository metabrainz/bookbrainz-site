var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Promise = require('bluebird');
var Publisher = require('../../data/entities/publisher');
var PublisherType = require('../../data/properties/publisher-type');
var Entity = require('../../data/entity');
var renderRelationship = require('../../helpers/render');

var NotFoundError = require('../../helpers/error').NotFoundError;

/* Middleware loader functions. */
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

router.param('bbid', function(req, res, next, bbid) {
	if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
		Publisher.findOne(req.params.bbid, {
				populate: [
					'annotation',
					'disambiguation',
					'relationships',
				]
			})
			.then(function(publisher) {
				res.locals.entity = publisher;

				next();
			})
			.catch(function(err) {
				if (err.status == 404) {
					var newErr = new NotFoundError('Publisher not found');
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
	var publisher = res.locals.entity;
	var title = 'Publisher';

	if (publisher.default_alias && publisher.default_alias.name)
		title = 'Publisher “' + publisher.default_alias.name + '”';

	res.render('entity/view/publisher', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, function(req, res) {
	PublisherType.find()
		.then(function(publisherTypes) {
			res.render('entity/create/publisher', {
				publisherTypes: publisherTypes,
				title: 'Add Publisher'
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

module.exports = router;
