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
const status = require('http-status');
const auth = require('../../helpers/auth');
const Publisher = require('../../data/entities/publisher');
const Edition = require('../../data/entities/edition');
const User = require('../../data/user');

/* Middleware loader functions. */
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm = React.createFactory(
	require('../../../client/components/forms/publisher.jsx')
);

const loadLanguages = require('../../helpers/middleware').loadLanguages;
const loadPublisherTypes =
	require('../../helpers/middleware').loadPublisherTypes;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;

const bbws = require('../../helpers/bbws');
const Promise = require('bluebird');
const _ = require('underscore');

/* If the route specifies a BBID, load the Publisher for it. */
router.param('bbid', makeEntityLoader(Publisher, 'Publisher not found'));

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	const publisher = res.locals.entity;
	let title = 'Publisher';

	publisher.editions = publisher.editions.map((edition) =>
		Edition.findOne(edition.bbid, {
			populate: ['disambiguation', 'aliases']
		})
	);

	if (publisher.default_alias && publisher.default_alias.name) {
		title = `Publisher “${publisher.default_alias.name}”`;
	}

	Promise.all(publisher.editions).then((editions) => {
		publisher.editions = editions;

		// Get unique identifier types for display
		const identifier_types = _.uniq(
			_.pluck(publisher.identifiers, 'identifier_type'),
			(identifier) => identifier.identifier_type_id
		);

		res.render('entity/view/publisher', {title, identifier_types});
	});
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	const publisher = res.locals.entity;
	let title = 'Publisher';

	if (publisher.default_alias && publisher.default_alias.name) {
		title = `Publisher “${publisher.default_alias.name}”`;
	}

	res.render('entity/delete', {title});
});

router.post('/:bbid/delete/confirm', (req, res) => {
	const publisher = res.locals.entity;

	Publisher.del(
		publisher.bbid,
		{revision: {note: req.body.note}},
		{session: req.session}
	)
		.then(() => {
			res.redirect(status.SEE_OTHER, `/publisher/${publisher.bbid}`);
		});
});

router.get('/:bbid/revisions', (req, res) => {
	const publisher = res.locals.entity;
	let title = 'Publisher';

	if (publisher.default_alias && publisher.default_alias.name) {
		title = `Publisher “${publisher.default_alias.name}”`;
	}

	bbws.get(`/publisher/${publisher.bbid}/revisions`)
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

router.get('/create', auth.isAuthenticated, loadIdentifierTypes, loadLanguages,
	loadPublisherTypes, (req, res) => {
		const props = {
			languages: res.locals.languages,
			publisherTypes: res.locals.publisherTypes,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: '/publisher/create/handler'
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/publisher', {
			title: 'Add Publisher',
			heading: 'Create Publisher',
			subheading: 'Add a new Publisher to BookBrainz',
			props,
			markup
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadPublisherTypes, loadLanguages, (req, res) => {
		const publisher = res.locals.entity;

		const props = {
			languages: res.locals.languages,
			publisherTypes: res.locals.publisherTypes,
			publisher,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: `/publisher/${publisher.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/publisher', {
			title: 'Edit Publisher',
			heading: 'Edit Publisher',
			subheading: 'Edit an existing Publisher in BookBrainz',
			props,
			markup
		});
	}
);

router.post('/create/handler', auth.isAuthenticated, (req, res) => {
	const changes = {
		bbid: null
	};

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

	Publisher.create(changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

router.post('/:bbid/edit/handler', auth.isAuthenticated, (req, res) => {
	const publisher = res.locals.entity;

	const changes = {
		bbid: publisher.bbid
	};

	const publisherTypeId = req.body.publisherTypeId;
	if (!publisher.publisher_type ||
			publisher.publisher_type.publisher_type_id !== publisherTypeId) {
		changes.publisher_type = {
			publisher_type_id: publisherTypeId
		};
	}

	const beginDate = req.body.beginDate;
	if (publisher.begin_date !== beginDate) {
		changes.begin_date = beginDate ? beginDate : null;
	}

	const endDate = req.body.endDate;
	const ended = req.body.ended;
	if (publisher.end_date !== endDate) {
		changes.end_date = endDate ? endDate : null;
		 // Must have ended if there's an end date.
		changes.ended = endDate ? true : ended;
	}

	const disambiguation = req.body.disambiguation;
	if (!publisher.disambiguation ||
			publisher.disambiguation.comment !== disambiguation) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	const annotation = req.body.annotation;
	if (!publisher.annotation ||
			publisher.annotation.content !== annotation) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	const currentIdentifiers = publisher.identifiers.map((identifier) => {
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

	publisher.aliases.forEach((alias) => {
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

	Publisher.update(publisher.bbid, changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

module.exports = router;
