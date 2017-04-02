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

const auth = require('../../helpers/auth');
const utils = require('../../helpers/utils');

const entityRoutes = require('./entity');

/* Middleware loader functions. */
const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;
const loadIdentifierTypes =
	require('../../helpers/middleware').loadIdentifierTypes;
const loadLanguages = require('../../helpers/middleware').loadLanguages;
const loadWorkTypes = require('../../helpers/middleware').loadWorkTypes;
const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

const EditForm =
	React.createFactory(require('../../../client/components/forms/work'));

const router = express.Router();

/* If the route specifies a BBID, load the Work for it. */
router.param(
	'bbid',
	makeEntityLoader(
		'Work',
		['workType', 'languageSet.languages'],
		'Work not found'
	)
);

function _setWorkTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Work',
		utils.template`Work “${'name'}”`
	);
}

router.get('/:bbid', loadEntityRelationships, (req, res) => {
	_setWorkTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setWorkTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {WorkHeader, WorkRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, WorkHeader, WorkRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {WorkRevision} = req.app.locals.orm;
	_setWorkTitle(res);
	entityRoutes.displayRevisions(req, res, next, WorkRevision);
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes,
	loadLanguages, loadWorkTypes,
	(req, res) => {
		const props = {
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: '/work/create/handler',
			workTypes: res.locals.workTypes
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		return res.render('entity/create/create-common', {
			heading: 'Create Work',
			markup,
			props,
			script: 'work',
			subheading: 'Add a new Work to BookBrainz',
			title: 'Add Work'
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes,
	loadWorkTypes, loadLanguages,
	(req, res) => {
		const work = res.locals.entity;

		const props = {
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: `/work/${work.bbid}/edit/handler`,
			work,
			workTypes: res.locals.workTypes
		};

		const markup = ReactDOMServer.renderToString(EditForm(props));

		return res.render('entity/create/create-common', {
			heading: 'Edit Work',
			markup,
			props,
			script: 'work',
			subheading: 'Edit an existing Work in BookBrainz',
			title: 'Edit Work'
		});
	}
);

function getAdditionalWorkSets(orm) {
	const {LanguageSet} = orm;
	return [
		{
			entityIdField: 'languageSetId',
			idField: 'id',
			model: LanguageSet,
			name: 'languageSet',
			propName: 'languages'
		}
	];
}

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const {orm} = req.app.locals;

	return entityRoutes.createEntity(
		req, res, 'Work', _.pick(req.body, 'typeId'), getAdditionalWorkSets(orm)
	);
});

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;

		return entityRoutes.editEntity(
			req, res, 'Work', _.pick(req.body, 'typeId'),
			getAdditionalWorkSets(orm)
		);
	}
);

module.exports = router;
