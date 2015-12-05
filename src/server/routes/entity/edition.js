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
const Edition = require('../../data/entities/edition');
const User = require('../../data/user');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm = React.createFactory(
	require('../../../client/components/forms/edition.jsx')
);

/* Middleware loader functions. */
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const loadEditionStatuses =
	require('../../helpers/middleware').loadEditionStatuses;
const loadEditionFormats =
	require('../../helpers/middleware').loadEditionFormats;
const loadLanguages =
	require('../../helpers/middleware').loadLanguages;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;

const bbws = require('../../helpers/bbws');
const Publication = require('../../data/entities/publication');
const Publisher = require('../../data/entities/publisher');
const Promise = require('bluebird');
const _ = require('underscore');

/* If the route specifies a BBID, load the Edition for it. */
router.param('bbid', makeEntityLoader(Edition, 'Edition not found'));

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	const edition = res.locals.entity;
	let title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = `Edition “${edition.default_alias.name}”`;
	}

	// Get unique identifier types for display
	const identifier_types = _.uniq(
		_.pluck(edition.identifiers, 'identifier_type'),
		(identifier) => identifier.identifier_type_id
	);

	res.render('entity/view/edition', {title, identifier_types});
});

router.get('/:bbid/revisions', (req, res) => {
	const edition = res.locals.entity;
	let title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = `Edition “${edition.default_alias.name}”`;
	}

	bbws.get(`/edition/${edition.bbid}/revisions`)
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

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	const edition = res.locals.entity;
	let title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = `Edition “${edition.default_alias.name}”`;
	}

	res.render('entity/delete', {title});
});

router.post('/:bbid/delete/confirm', (req, res) => {
	const edition = res.locals.entity;

	Edition.del(
		edition.bbid,
		{revision: {note: req.body.note}},
		{session: req.session}
	)
		.then(() => {
			res.redirect(status.SEE_OTHER, `/edition/${edition.bbid}`);
		});
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes,
	loadEditionStatuses, loadEditionFormats, loadLanguages, (req, res) => {
		const propsPromise = {
			languages: res.locals.languages,
			editionStatuses: res.locals.editionStatuses,
			editionFormats: res.locals.editionFormats,
			identifierTypes: res.locals.identifierTypes,
			submissionUrl: '/edition/create/handler'
		};

		if (req.query.publication) {
			propsPromise.publication =
				Publication.findOne(req.query.publication);
		}

		if (req.query.publisher) {
			propsPromise.publisher = Publisher.findOne(req.query.publisher);
		}

		function render(props) {
			const markup = ReactDOMServer.renderToString(EditForm(props));

			res.render('entity/create/edition', {
				title: 'Add Edition',
				heading: 'Create Edition',
				subheading: 'Add a new Edition to BookBrainz',
				props,
				markup
			});
		}

		Promise.props(propsPromise).then(render);
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadEditionStatuses, loadEditionFormats, loadLanguages, (req, res) => {
		const edition = res.locals.entity;

		const props = {
			languages: res.locals.languages,
			editionStatuses: res.locals.editionStatuses,
			editionFormats: res.locals.editionFormats,
			identifierTypes: res.locals.identifierTypes,
			edition,
			submissionUrl: `/edition/${edition.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/edition', {
			title: 'Edit Edition',
			heading: 'Edit Edition',
			subheading: 'Edit an existing Edition in BookBrainz',
			props,
			markup
		});
	}
);

router.post('/create/handler', auth.isAuthenticated, (req, res) => {
	const changes = {
		bbid: null
	};

	if (req.body.editionFormatId) {
		changes.edition_format = {
			edition_format_id: req.body.editionFormatId
		};
	}

	if (req.body.editionStatusId) {
		changes.edition_status = {
			edition_status_id: req.body.editionStatusId
		};
	}

	if (req.body.publication) {
		changes.publication = req.body.publication;
	}

	if (req.body.publisher) {
		changes.publisher = req.body.publisher;
	}

	if (req.body.languageId) {
		changes.language = {
			language_id: req.body.languageId
		};
	}

	if (req.body.releaseDate) {
		changes.release_date = req.body.releaseDate;
	}

	if (req.body.disambiguation) {
		changes.disambiguation = req.body.disambiguation;
	}

	if (req.body.annotation) {
		changes.annotation = req.body.annotation;
	}

	if (req.body.pages) {
		changes.pages = req.body.pages;
	}

	if (req.body.weight) {
		changes.weight = req.body.weight;
	}

	if (req.body.width) {
		changes.width = req.body.width;
	}

	if (req.body.height) {
		changes.height = req.body.height;
	}

	if (req.body.depth) {
		changes.depth = req.body.depth;
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

	Edition.create(changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

router.post('/:bbid/edit/handler', auth.isAuthenticated, (req, res) => {
	const edition = res.locals.entity;

	const changes = {
		bbid: edition.bbid
	};

	const editionStatusId = req.body.editionStatusId;
	if (!edition.edition_status ||
			edition.edition_status.edition_status_id !== editionStatusId) {
		changes.edition_status = {
			edition_status_id: editionStatusId
		};
	}

	const editionFormatId = req.body.editionFormatId;
	if (!edition.edition_format ||
			edition.edition_format.edition_format_id !== editionFormatId) {
		changes.edition_format = {
			edition_format_id: editionFormatId
		};
	}

	const publication = req.body.publication;
	if (!edition.publication || edition.publication.bbid !== publication) {
		changes.publication = publication;
	}

	const publisher = req.body.publisher;
	if (!edition.publisher || edition.publisher.bbid !== publisher) {
		changes.publisher = publisher;
	}

	const languageId = req.body.languageId;
	if (!edition.language || edition.language.language_id !== languageId) {
		changes.language = {
			language_id: languageId
		};
	}

	const releaseDate = req.body.releaseDate;
	if (edition.release_date !== releaseDate) {
		changes.release_date = releaseDate ? releaseDate : null;
	}

	const disambiguation = req.body.disambiguation;
	if (!edition.disambiguation ||
			edition.disambiguation.comment !== disambiguation) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	const annotation = req.body.annotation;
	if (!edition.annotation ||
			edition.annotation.content !== annotation) {
		changes.annotation = annotation ? annotation : null;
	}

	const pages = req.body.pages;
	if (edition.pages !== pages) {
		changes.pages = pages ? pages : null;
	}

	const weight = req.body.weight;
	if (edition.weight !== weight) {
		changes.weight = weight ? weight : null;
	}

	const width = req.body.width;
	if (edition.width !== width) {
		changes.width = width ? width : null;
	}

	const height = req.body.height;
	if (edition.height !== height) {
		changes.height = height ? height : null;
	}

	const depth = req.body.depth;
	if (edition.depth !== depth) {
		changes.depth = depth ? depth : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	const currentIdentifiers = edition.identifiers.map((identifier) => {
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

	edition.aliases.forEach((alias) => {
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

	Edition.update(edition.bbid, changes, {
		session: req.session
	})
		.then((revision) => {
			res.send(revision);
		});
});

module.exports = router;
