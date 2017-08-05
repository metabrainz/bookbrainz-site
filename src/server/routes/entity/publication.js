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
import EditForm from '../../../client/components/forms/publication';
import Layout from '../../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';


const router = express.Router();

/* If the route specifies a BBID, load the Publication for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Publication',
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

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {PublicationHeader, PublicationRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, PublicationHeader, PublicationRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {PublicationRevision} = req.app.locals.orm;
	_setPublicationTitle(res);
	entityRoutes.displayRevisions(req, res, next, PublicationRevision);
});

// Creation

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublicationTypes, (req, res) => {
		const props = {
			heading: 'Create Publication',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publicationTypes: res.locals.publicationTypes,
			requiresJS: true,
			subheading: 'Add a new Publication to BookBrainz',
			submissionUrl: '/publication/create/handler'
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.render('target', {
			markup,
			props,
			script: '/js/entity/publication.js',
			title: 'Add Publication'
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublicationTypes, middleware.loadLanguages, (req, res) => {
		const publication = res.locals.entity;

		const props = {
			heading: 'Edit Publication',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publication,
			publicationTypes: res.locals.publicationTypes,
			requiresJS: true,
			subheading: 'Edit an existing Publication in BookBrainz',
			submissionUrl: `/publication/${publication.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.render('target', {
			markup,
			props,
			script: '/js/entity/publication.js',
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

export default router;
