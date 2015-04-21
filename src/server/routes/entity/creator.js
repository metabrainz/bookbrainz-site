var express = require('express');
var auth = require('../../helpers/auth');
var Creator = require('../../data/entities/creator');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var loadCreatorTypes = require('../../helpers/middleware').loadCreatorTypes;
var loadGenders = require('../../helpers/middleware').loadGenders;
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;
var React = require('react');

var router = express.Router();
var EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));

/* If the route specifies a BBID, load the Creator for it. */
router.param('bbid', makeEntityLoader(Creator, 'Creator not found'));

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
	var props = {
		languages: res.locals.languages,
		genders: res.locals.genders,
		creatorTypes: res.locals.creatorTypes
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/creator', {
		title: 'Add Creator',
		props: props,
		markup: markup
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
