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
import EditForm from '../../../client/components/forms/publisher';
import Layout from '../../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';


const router = express.Router();

/* If the route specifies a BBID, load the Publisher for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Publisher',
		['publisherType', 'area'],
		'Publisher not found'
	)
);

function _setPublisherTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Publisher',
		utils.template`Publisher “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res, next) => {
	// Fetch editions
	const {Publisher} = req.app.locals.orm;
	const editionRelationsToFetch = [
		'defaultAlias', 'disambiguation', 'releaseEventSet.releaseEvents'
	];
	const editionsPromise =
		Publisher.forge({bbid: res.locals.entity.bbid})
			.editions({withRelated: editionRelationsToFetch});

	return editionsPromise
		.then((editions) => {
			res.locals.entity.editions = editions.toJSON();
			_setPublisherTitle(res);
			entityRoutes.displayEntity(req, res);
		})
		.catch(next);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublisherTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {PublisherHeader, PublisherRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, PublisherHeader, PublisherRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {PublisherRevision} = req.app.locals.orm;
	_setPublisherTitle(res);
	entityRoutes.displayRevisions(req, res, next, PublisherRevision);
});

// Creation

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublisherTypes,
	(req, res) => {
		const props = {
			heading: 'Create Publisher',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publisherTypes: res.locals.publisherTypes,
			requiresJS: true,
			subheading: 'Add a new Publisher to BookBrainz',
			submissionUrl: '/publisher/create/handler'
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.render('target', {
			markup,
			props,
			script: '/js/entity/publisher.js',
			title: 'Add Publisher'
		});
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublisherTypes, middleware.loadLanguages,
	(req, res) => {
		const publisher = res.locals.entity;

		const props = {
			heading: 'Edit Publisher',
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			publisher,
			publisherTypes: res.locals.publisherTypes,
			requiresJS: true,
			subheading: 'Edit an existing Publisher in BookBrainz',
			submissionUrl: `/publisher/${publisher.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditForm {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.render('target', {
			markup,
			props,
			script: '/js/entity/publisher.js',
			title: 'Edit Publisher'
		});
	}
);

const additionalPublisherProps = [
	'typeId', 'areaId', 'beginDate', 'endDate', 'ended'
];

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.createEntity(
		req, res, 'Publisher', _.pick(req.body, additionalPublisherProps)
	)
);

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler, (req, res) =>
	entityRoutes.editEntity(
		req, res, 'Publisher', _.pick(req.body, additionalPublisherProps)
	)
);

export default router;
