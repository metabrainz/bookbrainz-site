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
import * as utils from '../../helpers/utils';
import EditForm from '../../../client/components/forms/edition';
import Promise from 'bluebird';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';

const router = express.Router();

/* If the route specifies a BBID, load the Edition for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Edition',
		[
			'publication.defaultAlias',
			'languageSet.languages',
			'editionFormat',
			'editionStatus',
			'releaseEventSet.releaseEvents',
			'publisherSet.publishers.defaultAlias'
		],
		'Edition not found'
	)
);

function _setEditionTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Edition',
		utils.template`Edition “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/revisions', (req, res, next) => {
	const {EditionRevision} = req.app.locals.orm;
	_setEditionTitle(res);
	entityRoutes.displayRevisions(req, res, next, EditionRevision);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {EditionHeader, EditionRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, EditionHeader, EditionRevision
		);
	}
);

// Creation

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages,
	(req, res, next) => {
		const {Publication, Publisher} = req.app.locals.orm;
		const propsPromise = {
			editionFormats: res.locals.editionFormats,
			editionStatuses: res.locals.editionStatuses,
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: '/edition/create/handler'
		};

		if (req.query.publication) {
			propsPromise.publication =
				Publication.forge({bbid: req.query.publication})
					.fetch({withRelated: 'defaultAlias'});
		}

		if (req.query.publisher) {
			propsPromise.publisher =
				Publisher.forge({bbid: req.query.publisher})
					.fetch({withRelated: 'defaultAlias'});
		}

		function render(props) {
			const markup = ReactDOMServer.renderToString(
				<EditForm {...props}/>
			);

			res.render('entity/create/create-common', {
				heading: 'Create Edition',
				markup,
				props,
				script: 'edition',
				subheading: 'Add a new Edition to BookBrainz',
				title: 'Add Edition'
			});
		}

		Promise.props(propsPromise)
			.then(render)
			.catch(next);
	}
);

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages,
	(req, res) => {
		const edition = res.locals.entity;

		const props = {
			edition,
			editionFormats: res.locals.editionFormats,
			editionStatuses: res.locals.editionStatuses,
			identifierTypes: res.locals.identifierTypes,
			languages: res.locals.languages,
			submissionUrl: `/edition/${edition.bbid}/edit/handler`
		};

		const markup = ReactDOMServer.renderToString(<EditForm {...props}/>);

		res.render('entity/create/create-common', {
			heading: 'Edit Edition',
			markup,
			props,
			script: 'edition',
			subheading: 'Edit an existing Edition in BookBrainz',
			title: 'Edit Edition'
		});
	}
);

const additionalEditionProps = [
	'publicationBbid', 'width', 'height', 'depth', 'weight', 'pages',
	'formatId', 'statusId'
];

function getAdditionalEditionSets(orm) {
	const {LanguageSet, PublisherSet, ReleaseEventSet} = orm;
	return [
		{
			entityIdField: 'languageSetId',
			idField: 'id',
			model: LanguageSet,
			name: 'languageSet',
			propName: 'languages'
		},
		{
			entityIdField: 'publisherSetId',
			idField: 'bbid',
			model: PublisherSet,
			name: 'publisherSet',
			propName: 'publishers'
		},
		{
			entityIdField: 'releaseEventSetId',
			idField: 'id',
			model: ReleaseEventSet,
			mutableFields: [
				'date',
				'areaId'
			],
			name: 'releaseEventSet',
			propName: 'releaseEvents'
		}
	];
}

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const {orm} = req.app.locals;
	return entityRoutes.createEntity(
		req,
		res,
		'Edition',
		_.pick(req.body, additionalEditionProps),
		getAdditionalEditionSets(orm)
	);
});

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		return entityRoutes.editEntity(
			req,
			res,
			'Edition',
			_.pick(req.body, additionalEditionProps),
			getAdditionalEditionSets(orm)
		);
	}
);

export default router;
