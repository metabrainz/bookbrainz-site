var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Edition = require('../../data/entities/edition');

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/edition.jsx'));

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var loadEditionStatuses = require('../../helpers/middleware').loadEditionStatuses;
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Edition for it. */
router.param('bbid', makeEntityLoader(Edition, 'Edition not found'));

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

router.get('/create', auth.isAuthenticated, loadEditionStatuses, loadLanguages, function(req, res) {
	var props = {
		languages: res.locals.languages,
		editionStatuses: res.locals.editionStatuses
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/edition', {
		title: 'Add Edition',
		props: props,
		markup: markup
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
