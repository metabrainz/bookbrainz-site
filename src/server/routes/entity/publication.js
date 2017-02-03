/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const express = require('express');
const _ = require('lodash');

const Publication = require('bookbrainz-data').Publication;
const PublicationHeader = require('bookbrainz-data').PublicationHeader;
const PublicationRevision = require('bookbrainz-data').PublicationRevision;

const auth = require('../../helpers/auth');
const utils = require('../../helpers/utils');

const entityRoutes = require('./entity');

/* Middleware loader functions. */
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;
const loadLanguages = require('../../helpers/middleware').loadLanguages;
const loadPublicationTypes =
	require('../../helpers/middleware').loadPublicationTypes;
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const EditForm = React.createFactory(
	require('../../../client/components/forms/publication')
);

const router = express.Router();

/* If the route specifies a BBID, load the Publication for it. */
router.param(
	'bbid',
	makeEntityLoader(
		Publication,
		[
			'publicationType',
			'editions.defaultAlias',
			'editions.disambiguation',
			'editions.releaseEventSet.releaseEvents'
		],
		'Publication not found'
	)
);

function _setPublicationTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Publication',
		utils.template`Publication “${'name'}”`
	);
}

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) =>
		entityRoutes.handleDelete(
			req,
			res,
			PublicationHeader,
			PublicationRevision
		)
);

router.get('/:bbid/revisions', (req, res, next) => {
	_setPublicationTitle(res);
	entityRoutes.displayRevisions(req, res, next, PublicationRevision);
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes,
	loadLanguages, loadPublicationTypes, (req, res) => {
		const props = {
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publicationTypes: res.locals.publicationTypes,
			submissionUrl: '/publication/create/handler'
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/create-common', {
			heading: 'Create Publication',
			markup,
			props,
			script: 'publication',
			subheading: 'Add a new Publication to BookBrainz',
			title: 'Add Publication'
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadPublicationTypes, loadLanguages, (req, res) => {
		const publication = res.locals.entity;

		const props = {
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publication,
			publicationTypes: res.locals.publicationTypes,
			submissionUrl: `/publication/${publication.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		res.render('entity/create/create-common', {
			heading: 'Edit Publication',
			markup,
			props,
			script: 'publication',
			subheading: 'Edit an existing Publication in BookBrainz',
			title: 'Edit Publication'
		});
	}
);

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.createEntity(
		req, res, 'Publication', _.pick(req.body, 'typeId')
	)
);

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.editEntity(
		req, res, 'Publication', _.pick(req.body, 'typeId')
	)
);

module.exports = router;
