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

const express = require('express');
const router = express.Router();
const auth = require('../../helpers/auth');
const status = require('http-status');
const Work = require('../../data/entities/work');
const User = require('../../data/user');

/* Middleware loader functions. */
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm =
	React.createFactory(require('../../../client/components/forms/work.jsx'));

const loadLanguages = require('../../helpers/middleware').loadLanguages;
const loadWorkTypes = require('../../helpers/middleware').loadWorkTypes;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;

const bbws = require('../../helpers/bbws');
const Promise = require('bluebird');
const _ = require('underscore');

/* If the route specifies a BBID, load the Work for it. */
router.param('bbid', makeEntityLoader(Work, 'Work not found'));

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	const work = res.locals.entity;
	let title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = `Work “${work.default_alias.name}”`;
	}

	// Get unique identifier types for display
	const identifier_types = _.uniq(
		_.pluck(work.identifiers, 'identifier_type'),
		(identifier) => identifier.identifier_type_id
	);

	res.render('entity/view/work', {title, identifier_types});
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	const work = res.locals.entity;
	let title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = `Work “${work.default_alias.name}”`;
	}

	res.render('entity/delete', {title});
});

router.post('/:bbid/delete/confirm', (req, res) => {
	const work = res.locals.entity;

	Work.del(
		work.bbid,
		{revision: {note: req.body.note}},
		{session: req.session}
	)
		.then(() => {
			res.redirect(status.SEE_OTHER, `/work/${work.bbid}`);
		});
});

router.get('/:bbid/revisions', (req, res) => {
	const work = res.locals.entity;
	let title = 'Work';

	if (work.default_alias && work.default_alias.name) {
		title = `Work “${work.default_alias.name}”`;
	}

	bbws.get(`/work/${work.bbid}/revisions`)
		.then((revisions) => {
			const promisedUsers = {};
			revisions.objects.forEach((revision) => {
				if (!promisedUsers[revision.user.user_id]) {
					promisedUsers[revision.user.user_id] =
						User.findOne(revision.user.user_id);
				}
			});

			Promise.props(promisedUsers).then((users) => {
				res.render('entity/revisions', {title, revisions, users});
			});
		});
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes,
	loadLanguages, loadWorkTypes,
	(req, res) => {
		const props = {
			languages: res.locals.languages,
			workTypes: res.locals.workTypes,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: '/work/create/handler'
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/work', {
			title: 'Add Work',
			heading: 'Create Work',
			subheading: 'Add a new Work to BookBrainz',
			props,
			markup
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadWorkTypes, loadLanguages,
	(req, res) => {
		const work = res.locals.entity;

		const props = {
			languages: res.locals.languages,
			workTypes: res.locals.workTypes,
			work,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: `/work/${work.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/work', {
			title: 'Edit Work',
			heading: 'Edit Work',
			subheading: 'Edit an existing Work in BookBrainz',
			props,
			markup
		});
	}
);

router.post('/create/handler', auth.isAuthenticated, (req, res) => {
	const changes = {
		bbid: null,
		ended: req.body.ended
	};

	if (req.body.workTypeId) {
		changes.work_type = {
			work_type_id: req.body.workTypeId
		};
	}

	if (req.body.languages) {
		changes.languages =
			req.body.languages.map((language_id) => ({language_id}));
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

	const newIdentifiers =
		req.body.identifiers.map((identifier) => ({
			value: identifier.value,
			identifier_type: {
				identifier_type_id: identifier.typeId
			}
		}));

	if (newIdentifiers.length) {
		changes.identifiers = newIdentifiers;
	}

	const newAliases = [];

	req.body.aliases.forEach((alias) => {
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
		.then((revision) => {
			res.send(revision);
		});
});

router.post('/:bbid/edit/handler', auth.isAuthenticated, (req, res) => {
	const work = res.locals.entity;

	const changes = {
		bbid: work.bbid
	};

	const workTypeId = req.body.workTypeId;
	if (!work.work_type ||
		work.work_type.work_type_id !== workTypeId) {
		changes.work_type = {
			work_type_id: workTypeId
		};
	}

	const disambiguation = req.body.disambiguation;
	if (!work.disambiguation ||
			work.disambiguation.comment !== disambiguation) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	const annotation = req.body.annotation;
	if (!work.annotation ||
			work.annotation.content !== annotation) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	const currentLanguages = work.languages.map((language) => {
		if (language.language_id !== req.body.languages[0]) {
			// Remove the alias
			return [language.language_id, null];
		}

		req.body.languages.shift();
		return [language.language_id, language.language_id];
	});

	const newLanguages =
		req.body.languages.map((language) => [null, language]);

	changes.languages = currentLanguages.concat(newLanguages);

	const currentIdentifiers = work.identifiers.map((identifier) => {
		const nextIdentifier = req.body.identifiers[0];

		if (identifier.id !== nextIdentifier.id) {
			// Remove the alias
			return [identifier.id, null];
		}

		// Modify the alias
		req.body.identifiers.shift();
		return [nextIdentifier.id, {
			value: nextIdentifier.value,
			identifier_type: {
				identifier_type_id: nextIdentifier.typeId
			}
		}];
	});

	const newIdentifiers = req.body.identifiers.map((identifier) => {
		// At this point, the only aliases should have null IDs, but check
		// anyway.
		if (identifier.id) {
			return null;
		}

		return [null, {
			value: identifier.value,
			identifier_type: {
				identifier_type_id: identifier.typeId
			}
		}];
	});

	changes.identifiers = currentIdentifiers.concat(newIdentifiers);

	const currentAliases = [];

	work.aliases.forEach((alias) => {
		const nextAlias = req.body.aliases[0];

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

	const newAliases = [];

	req.body.aliases.forEach((alias) => {
		// At this point, the only aliases should have null IDs, but check
		// anyway.
		if (alias.id || !alias.name && !alias.sortName) {
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
		.then((revision) => {
			res.send(revision);
		});
});

module.exports = router;
