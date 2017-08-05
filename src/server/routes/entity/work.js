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

import * as auth from '../../helpers/auth';
import * as entityRoutes from './entity';
import * as middleware from '../../helpers/middleware';
import * as propHelpers from '../../helpers/props';
import * as utils from '../../helpers/utils';
import EditForm from '../../../client/components/forms/work';
import Layout from '../../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';


const router = express.Router();

/* If the route specifies a BBID, load the Work for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
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

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
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

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadWorkTypes,
	(req, res) => {
		const props = {
			heading: 'Create Work',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			requiresJS: true,
			subheading: 'Add a new Work to BookBrainz',
			submissionUrl: '/work/create/handler',
			workTypes: res.locals.workTypes
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		return res.render('target', {
			markup,
			props,
			script: '/js/entity/work.js',
			title: 'Add Work'
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadWorkTypes, middleware.loadLanguages,
	(req, res) => {
		const work = res.locals.entity;

		const props = {
			heading: 'Edit Work',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			requiresJS: true,
			subheading: 'Edit an existing Work in BookBrainz',
			submissionUrl: `/work/${work.bbid}/edit/handler`,
			work,
			workTypes: res.locals.workTypes
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		return res.render('target', {
			markup,
			props,
			script: '/js/entity/work.js',
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

export default router;
