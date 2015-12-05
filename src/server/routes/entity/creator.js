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
const status = require('http-status');
const auth = require('../../helpers/auth');
const Creator = require('../../data/entities/creator');
const User = require('../../data/user');

/* Middleware loader functions. */
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const loadCreatorTypes = require('../../helpers/middleware').loadCreatorTypes;
const loadGenders = require('../../helpers/middleware').loadGenders;
const loadLanguages = require('../../helpers/middleware').loadLanguages;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const router = express.Router();
const EditForm = React.createFactory(
	require('../../../client/components/forms/creator.jsx')
);

const bbws = require('../../helpers/bbws');
const Promise = require('bluebird');
const _ = require('underscore');

/* If the route specifies a BBID, load the Creator for it. */
router.param('bbid', makeEntityLoader(Creator, 'Creator not found'));

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	const creator = res.locals.entity;
	let title = 'Creator';

	if (creator.default_alias && creator.default_alias.name) {
		title = `Creator “${creator.default_alias.name}”`;
	}

	// Get unique identifier types for display
	const identifier_types = _.uniq(
		_.pluck(creator.identifiers, 'identifier_type'),
		(identifier) => identifier.identifier_type_id
	);

	res.render('entity/view/creator', {title, identifier_types});
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	const creator = res.locals.entity;
	let title = 'Creator';

	if (creator.default_alias && creator.default_alias.name) {
		title = `Creator “${creator.default_alias.name}”`;
	}

	res.render('entity/delete', {title});
});

router.post('/:bbid/delete/confirm', (req, res) => {
	const creator = res.locals.entity;

	Creator.del(
		creator.bbid,
		{revision: {note: req.body.note}},
		{session: req.session}
	)
		.then(() => {
			res.redirect(status.SEE_OTHER, `/creator/${creator.bbid}`);
		});
});

router.get('/:bbid/revisions', (req, res) => {
	const creator = res.locals.entity;
	let title = 'Creator';

	if (creator.default_alias && creator.default_alias.name) {
		title = `Creator “${creator.default_alias.name}”`;
	}

	bbws.get(`/creator/${creator.bbid}/revisions`)
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
router.get('/create', auth.isAuthenticated, loadIdentifierTypes, loadGenders,
	loadLanguages, loadCreatorTypes, (req, res) => {
		const props = {
			languages: res.locals.languages,
			genders: res.locals.genders,
			creatorTypes: res.locals.creatorTypes,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: '/creator/create/handler'
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/creator', {
			title: 'Add Creator',
			heading: 'Create Creator',
			subheading: 'Add a new Creator to BookBrainz',
			props,
			markup
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadGenders, loadLanguages, loadCreatorTypes, (req, res) => {
		const creator = res.locals.entity;

		const props = {
			languages: res.locals.languages,
			genders: res.locals.genders,
			creatorTypes: res.locals.creatorTypes,
			creator,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: `/creator/${creator.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/creator', {
			title: 'Edit Creator',
			heading: 'Edit Creator',
			subheading: 'Edit an existing Creator in BookBrainz',
			props,
			markup
		});
	}
);

router.post('/create/handler', auth.isAuthenticated, (req, res) => {
	const changes = {
		bbid: null
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
		 // Must have ended if there's an end date.
		changes.ended = true;
	}
	else if (req.body.ended) {
		changes.ended = req.body.ended;
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

	const newIdentifiers = req.body.identifiers.map((identifier) => ({
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

	Creator.create(changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

router.post('/:bbid/edit/handler', auth.isAuthenticated, (req, res) => {
	const creator = res.locals.entity;

	const changes = {
		bbid: creator.bbid
	};

	const creatorTypeId = req.body.creatorTypeId;
	if (!creator.creator_type ||
			creator.creator_type.creator_type_id !== creatorTypeId) {
		changes.creator_type = {
			creator_type_id: creatorTypeId
		};
	}

	const genderId = req.body.genderId;
	if (!creator.gender || creator.gender.gender_id !== genderId) {
		changes.gender = {
			gender_id: genderId
		};
	}

	const beginDate = req.body.beginDate;
	if (creator.begin_date !== beginDate) {
		changes.begin_date = beginDate ? beginDate : null;
	}

	const endDate = req.body.endDate;
	const ended = req.body.ended;
	if (creator.end_date !== endDate) {
		changes.end_date = endDate ? endDate : null;
		// Must have ended if there's an end date.
		changes.ended = endDate ? true : ended;
	}

	const disambiguation = req.body.disambiguation;
	if (!creator.disambiguation ||
			creator.disambiguation.comment !== disambiguation) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	const annotation = req.body.annotation;
	if (!creator.annotation ||
			creator.annotation.content !== annotation) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	const currentIdentifiers = creator.identifiers.map((identifier) => {
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

	creator.aliases.forEach((alias) => {
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

	Creator.update(creator.bbid, changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

module.exports = router;
