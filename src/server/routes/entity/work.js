var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Work = require('../../data/entities/work');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/work.jsx'));
// Creation

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadWorkTypes = require('../../helpers/middleware').loadWorkTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Work for it. */
router.param('bbid', makeEntityLoader(Work, 'Work not found'));

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

router.get('/create', auth.isAuthenticated, loadLanguages, loadWorkTypes, function(req, res) {
	var props = {
		languages: res.locals.languages,
		workTypes: res.locals.workTypes
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/work', {
		title: 'Add Work',
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
