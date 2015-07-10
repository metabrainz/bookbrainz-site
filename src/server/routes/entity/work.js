/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Work = require('../../data/entities/work');
var User = require('../../data/user');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/work.jsx'));
// Creation

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadWorkTypes = require('../../helpers/middleware').loadWorkTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;
var loadIdentifierTypes = require('../../helpers/middleware').loadIdentifierTypes;

var bbws = require('../../helpers/bbws');
var Promise = require('bluebird');

/* If the route specifies a BBID, load the Work for it. */
router.param('bbid', makeEntityLoader(Work, 'Work not found'));

router.get('/:bbid', loadEntityRelationships, function(req, res) {
	var work = res.locals.entity;
	var title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = 'Work “' + work.default_alias.name + '”';
	}

	res.render('entity/view/work', {
		title: title
	});
});

router.get('/:bbid/delete', auth.isAuthenticated, function(req, res) {
	var work = res.locals.entity;
	var title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = 'Work “' + work.default_alias.name + '”';
	}

	res.render('entity/delete', {
		title: title
	});
});

router.post('/:bbid/delete/confirm', function(req, res) {
	var work = res.locals.entity;

	Work.del(work.bbid, {
			revision: {note: req.body.note}
		},
		{
			session: req.session
		})
		.then(function() {
			res.redirect(303, '/work/' + work.bbid);
		});
});

router.get('/:bbid/revisions', function(req, res) {
	var work = res.locals.entity;
	var title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = 'Work “' + work.default_alias.name + '”';
	}

	bbws.get('/work/' + work.bbid + '/revisions')
		.then(function(revisions) {
			var promisedUsers = {};
			revisions.objects.forEach(function(revision) {
				if (!promisedUsers[revision.user.user_id]) {
					promisedUsers[revision.user.user_id] =
						User.findOne(revision.user.user_id);
				}
			});

			Promise.props(promisedUsers).then(function(users) {
				res.render('entity/revisions', {
					title: title,
					revisions: revisions,
					users: users
				});
			});
		});
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes, loadLanguages, loadWorkTypes, function(req, res) {
	var props = {
		languages: res.locals.languages,
		workTypes: res.locals.workTypes,
		identifierTypes: res.locals.identifierTypes,
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

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes, loadWorkTypes, loadLanguages, function(req, res) {
	var work = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		workTypes: res.locals.workTypes,
		work: work,
		identifierTypes: res.locals.identifierTypes,
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

	if (req.body.disambiguation) {
		changes.disambiguation = req.body.disambiguation;
	}

	if (req.body.annotation) {
		changes.annotation = req.body.annotation;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	var newIdentifiers = req.body.identifiers.map(function(identifier) {
		return {
			value: identifier.value,
			identifier_type: {
				identifier_type_id: identifier.typeId
			}
		};
	});

	if (newIdentifiers.length) {
		changes.identifiers = newIdentifiers;
	}

	var newAliases = [];

	req.body.aliases.forEach(function(alias) {
		if (!alias.name && !alias.sortName) {
			return;
		}

		newAliases.push({
			name: alias.name,
			sort_name: alias.sortName,
			language_id: alias.language,
			primary: alias.primary,
			default: alias.default
		});
	});

	if (newAliases.length) {
		changes.aliases = newAliases;
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
		if (language.language_id !== req.body.languages[0]) {
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

	var currentIdentifiers = work.identifiers.map(function(identifier) {
		var nextIdentifier = req.body.identifiers[0];

		if (identifier.id !== nextIdentifier.id) {
			// Remove the alias
			return [identifier.id, null];
		}
		else {
			// Modify the alias
			req.body.identifiers.shift();
			return [nextIdentifier.id, {
				value: nextIdentifier.value,
				identifier_type: {
					identifier_type_id: nextIdentifier.typeId
				}
			}];
		}
	});

	var newIdentifiers = req.body.identifiers.map(function(identifier) {
		// At this point, the only aliases should have null IDs, but check anyway.
		if (identifier.id) {
			return null;
		}
		else {
			return [null, {
				value: identifier.value,
				identifier_type: {
					identifier_type_id: identifier.typeId
				}
			}];
		}
	});

	changes.identifiers = currentIdentifiers.concat(newIdentifiers);

	var currentAliases = [];

	work.aliases.forEach(function(alias) {
		var nextAlias = req.body.aliases[0];

		if (alias.id !== nextAlias.id) {
			// Remove the alias
			currentAliases.push([alias.id, null]);
		}
		else {
			// Modify the alias
			req.body.aliases.shift();
			currentAliases.push([nextAlias.id, {
				name: nextAlias.name,
				sort_name: nextAlias.sortName,
				language_id: nextAlias.language,
				primary: nextAlias.primary,
				default: nextAlias.default
			}]);
		}
	});

	var newAliases = [];

	req.body.aliases.forEach(function(alias) {
		// At this point, the only aliases should have null IDs, but check anyway.
		if (alias.id || (!alias.name && !alias.sortName)) {
			return;
		}

		newAliases.push([null, {
			name: alias.name,
			sort_name: alias.sortName,
			language_id: alias.language,
			primary: alias.primary,
			default: alias.default
		}]);
	});

	changes.aliases = currentAliases.concat(newAliases);

	Work.update(work.bbid, changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
