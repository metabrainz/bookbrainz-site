var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Publisher = require('../../data/entities/publisher');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publisher.jsx'));
// Creation

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadPublisherTypes = require('../../helpers/middleware').loadPublisherTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Publisher for it. */
router.param('bbid', makeEntityLoader(Publisher, 'Publisher not found'));

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

router.get('/create', auth.isAuthenticated, loadLanguages, loadPublisherTypes, function(req, res) {
	var props = {
		languages: res.locals.languages,
		publisherTypes: res.locals.publisherTypes
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/publisher', {
		title: 'Add Publisher',
		props: props,
		markup: markup
	});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
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
		changes.ended = true; // Must have ended if there's an end date.
	} else if (req.body.ended) {
		changes.ended = req.body.ended;
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
