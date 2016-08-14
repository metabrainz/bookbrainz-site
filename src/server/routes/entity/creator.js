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

const Creator = require('bookbrainz-data').Creator;
const CreatorRevision = require('bookbrainz-data').CreatorRevision;
const CreatorHeader = require('bookbrainz-data').CreatorHeader;

/* Middleware loader functions. */
const loadCreatorTypes = require('../../helpers/middleware').loadCreatorTypes;
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadGenders = require('../../helpers/middleware').loadGenders;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;
const loadLanguages = require('../../helpers/middleware').loadLanguages;
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const auth = require('../../helpers/auth');
const utils = require('../../helpers/utils');

const entityRoutes = require('./entity');

const EditForm = React.createFactory(
	require('../../../client/entity-editor/creator').default
);

const router = express.Router();

/* If the route specifies a BBID, load the Creator for it. */
router.param(
	'bbid',
	makeEntityLoader(
		Creator,
		['creatorType', 'gender'],
		'Creator not found'
	)
);

function _setCreatorTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Creator',
		utils.template`Creator “${'name'}”`
	);
}

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	_setCreatorTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setCreatorTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) =>
		entityRoutes.handleDelete(req, res, CreatorHeader, CreatorRevision)
);

router.get('/:bbid/revisions', (req, res, next) => {
	_setCreatorTitle(res);
	entityRoutes.displayRevisions(req, res, next, CreatorRevision);
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

const additionalCreatorProps = [
	'typeId', 'genderId', 'areaId', 'beginDate', 'endDate', 'ended'
];

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.createEntity(
		req, res, 'Creator', _.pick(req.body, additionalCreatorProps)
	)
);

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.editEntity(
		req, res, 'Creator', _.pick(req.body, additionalCreatorProps)
	)
);

module.exports = router;
