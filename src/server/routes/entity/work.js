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
		workTypes: res.locals.workTypes,
		submissionUrl: '/work/create/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/work', {
		title: 'Add Work',
		heading: 'Create Work',
		subheading: 'Add a new Work to BookBrainz',
		props: props,
		markup: markup
	});
});

router.get('/:bbid/edit', auth.isAuthenticated, loadWorkTypes, loadLanguages, function(req, res) {
	var work = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		workTypes: res.locals.workTypes,
		work: work,
		submissionUrl: '/work/' + work.bbid + '/edit/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/work', {
		title: 'Edit Work',
		heading: 'Edit Work',
		subheading: 'Edit an existing Work in BookBrainz',
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

router.post('/:bbid/edit/handler', auth.isAuthenticated, function(req, res) {
	var work = res.locals.entity;

	var changes = {
		bbid: work.bbid
	};

	var workTypeId = req.body.workTypeId;
	if ((!work.work_type) ||
	    (work.work_type.work_type_id !== workTypeId)) {
		changes.work_type = {
			work_type_id: workTypeId
		};
	}

	var disambiguation = req.body.disambiguation;
	if ((!work.disambiguation) ||
	    (work.disambiguation.comment !== disambiguation)) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	var annotation = req.body.annotation;
	if ((!work.annotation) ||
			(work.annotation.content !== annotation)) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	var currentLanguages = work.languages.map(function(language) {
		if (language.language_id != req.body.languages[0]) {
			// Remove the alias
			return [language.language_id, null];
		}
		else {
			req.body.languages.shift();
			return [language.language_id, language.language_id];
		}
	});

	var newLanguages = req.body.languages.map(function(language) {
		return [null, language];
	});

	changes.languages = currentLanguages.concat(newLanguages);

	var currentAliases = work.aliases.map(function(alias) {
		var nextAlias = req.body.aliases[0];

		if (alias.id != nextAlias.id) {
			// Remove the alias
			return [alias.id, null];
		}
		else {
			// Modify the alias
			req.body.aliases.shift();
			return [nextAlias.id, {
				name: nextAlias.name,
				sort_name: nextAlias.sort_name,
				language_id: nextAlias.languageId,
				primary: alias.primary,
				default: alias.default
			}];
		}
	});

	var newAliases = req.body.aliases.map(function(alias) {
		// At this point, the only aliases should have null IDs, but check anyway.
		if (alias.id) {
			return null;
		}
		else {
			return [null, {
				name: alias.name,
				sort_name: alias.sort_name,
				language_id: alias.languageId,
				primary: false,
				default: false
			}];
		}
	});

	changes.aliases = currentAliases.concat(newAliases);
	if (changes.aliases.length !== 0 && changes.aliases[0][1]) {
		changes.aliases[0][1].default = true;
	}

	Work.update(work.bbid, changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
