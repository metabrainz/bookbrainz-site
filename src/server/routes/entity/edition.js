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
var Edition = require('../../data/entities/edition');
var User = require('../../data/user');

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/edition.jsx'));

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var loadEditionStatuses = require('../../helpers/middleware').loadEditionStatuses;
var loadEditionFormats = require('../../helpers/middleware').loadEditionFormats;
var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;
var loadIdentifierTypes = require('../../helpers/middleware').loadIdentifierTypes;

var bbws = require('../../helpers/bbws');
var Publication = require('../../data/entities/publication');
var Publisher = require('../../data/entities/publisher');
var Promise = require('bluebird');

/* If the route specifies a BBID, load the Edition for it. */
router.param('bbid', makeEntityLoader(Edition, 'Edition not found'));

router.get('/:bbid', loadEntityRelationships, function(req, res) {
	var edition = res.locals.entity;
	var title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = 'Edition “' + edition.default_alias.name + '”';
	}

	res.render('entity/view/edition', {
		title: title
	});
});

router.get('/:bbid/revisions', function(req, res) {
	var edition = res.locals.entity;
	var title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = 'Edition “' + edition.default_alias.name + '”';
	}

	bbws.get('/edition/' + edition.bbid + '/revisions')
		.then(function(revisions) {
			var promisedUsers = {};
			revisions.objects.forEach(function(revision) {
				if (!promisedUsers[revision.user.user_id]) {
					promisedUsers[revision.user.user_id] = User.findOne(revision.user.user_id);
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

router.get('/:bbid/delete', auth.isAuthenticated, function(req, res) {
	var edition = res.locals.entity;
	var title = 'Edition';

	if (edition.default_alias && edition.default_alias.name) {
		title = 'Edition “' + edition.default_alias.name + '”';
	}

	res.render('entity/delete', {
		title: title
	});
});

router.post('/:bbid/delete/confirm', function(req, res) {
	var edition = res.locals.entity;

	Edition.del(edition.bbid, {
			revision: {note: req.body.note}
		},
		{
			session: req.session
		})
		.then(function() {
			res.redirect(303, '/edition/' + edition.bbid);
		});
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes, loadEditionStatuses, loadEditionFormats, loadLanguages, function(req, res) {

	var propsPromise = {
		languages: res.locals.languages,
		editionStatuses: res.locals.editionStatuses,
		editionFormats: res.locals.editionFormats,
		identifierTypes: res.locals.identifierTypes,
		submissionUrl: '/edition/create/handler'
	};

	if (req.query.publication) {
		propsPromise.publication = Publication.findOne(req.query.publication);
	}

	if (req.query.publisher) {
		propsPromise.publisher = Publisher.findOne(req.query.publisher);
	}

	function render(props) {
		var markup = React.renderToString(EditForm(props));

		res.render('entity/create/edition', {
			title: 'Add Edition',
			heading: 'Create Edition',
			subheading: 'Add a new Edition to BookBrainz',
			props: props,
			markup: markup
		});
	}

	Promise.props(propsPromise).then((resolvedProps) => render(resolvedProps));
});

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes, loadEditionStatuses, loadEditionFormats, loadLanguages, function(req, res) {
	var edition = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		editionStatuses: res.locals.editionStatuses,
		editionFormats: res.locals.editionFormats,
		identifierTypes: res.locals.identifierTypes,
		edition: edition,
		submissionUrl: '/edition/' + edition.bbid + '/edit/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/edition', {
		title: 'Edit Edition',
		heading: 'Edit Edition',
		subheading: 'Edit an existing Edition in BookBrainz',
		props: props,
		markup: markup
	});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
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

	Edition.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

router.post('/:bbid/edit/handler', auth.isAuthenticated, function(req, res) {
	var edition = res.locals.entity;

	var changes = {
		bbid: edition.bbid
	};

	var editionStatusId = req.body.editionStatusId;
	if ((!edition.edition_status) ||
		(edition.edition_status.edition_status_id !== editionStatusId)) {
		changes.edition_status = {
			edition_status_id: editionStatusId
		};
	}

	var editionFormatId = req.body.editionFormatId;
	if ((!edition.edition_format) ||
		(edition.edition_format.edition_format_id !== editionFormatId)) {
		changes.edition_format = {
			edition_format_id: editionFormatId
		};
	}

	var publication = req.body.publication;
	if (!edition.publication || edition.publication.bbid !== publication) {
		changes.publication = publication;
	}

	var publisher = req.body.publisher;
	if (!edition.publisher || edition.publisher.bbid !== publisher) {
		changes.publisher = publisher;
	}

	var languageId = req.body.languageId;
	if ((!edition.language) || (edition.language.language_id !== languageId)) {
		changes.language = {
			language_id: languageId
		};
	}

	var releaseDate = req.body.releaseDate;
	if (edition.release_date !== releaseDate) {
		changes.release_date = releaseDate ? releaseDate : null;
	}

	var disambiguation = req.body.disambiguation;
	if ((!edition.disambiguation) ||
		(edition.disambiguation.comment !== disambiguation)) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	var annotation = req.body.annotation;
	if ((!edition.annotation) ||
		(edition.annotation.content !== annotation)) {
		changes.annotation = annotation ? annotation : null;
	}

	var pages = req.body.pages;
	if (edition.pages !== pages) {
		changes.pages = pages ? pages : null;
	}

	var weight = req.body.weight;
	if (edition.weight !== weight) {
		changes.weight = weight ? weight : null;
	}

	var width = req.body.width;
	if (edition.width !== width) {
		changes.width = width ? width : null;
	}

	var height = req.body.height;
	if (edition.height !== height) {
		changes.height = height ? height : null;
	}

	var depth = req.body.depth;
	if (edition.depth !== depth) {
		changes.depth = depth ? depth : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	var currentIdentifiers = edition.identifiers.map(function(identifier) {
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

	edition.aliases.forEach(function(alias) {
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

	Edition.update(edition.bbid, changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
