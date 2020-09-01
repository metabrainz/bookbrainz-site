/*
 * Copyright (C) 2016  Ben Ockmore
 *               2016  Sean Burke
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

import * as auth from '../helpers/auth';
import * as commonUtils from '../../common/helpers/utils';
import * as error from '../../common/helpers/error';
import * as handler from '../helpers/handler';
import * as propHelpers from '../../client/helpers/props';
import * as search from '../../common/helpers/search';
import * as utils from '../helpers/utils';

import {keys as _keys, snakeCase as _snakeCase, isNil} from 'lodash';
import {escapeProps, generateProps} from '../helpers/props';

import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SearchPage from '../../client/components/pages/search';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/**
 * Generates React markup for the search page that is rendered by the user's
 * browser.
 */
router.get('/', (req, res, next) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = req.query.type || 'allEntities';
	const size = req.query.size ? parseInt(req.query.size, 10) : 20;
	const from = req.query.from ? parseInt(req.query.from, 10) : 0;
	// get 1 more results to check nextEnabled
	search.searchByName(orm, query, _snakeCase(type), size + 1, from)
		.then((entities) => ({
			initialResults: entities.filter(entity => !isNil(entity)),
			query
		}))
		.then((searchResults) => {
			const entityTypes = _keys(commonUtils.getEntityModels(orm));
			const {newResultsArray, nextEnabled} = utils.getNextEnabledAndResultsArray(searchResults.initialResults, size);
			searchResults.initialResults = newResultsArray;

			const props = generateProps(req, res, {
				entityTypes,
				from,
				hideSearch: true,
				nextEnabled,
				resultsPerPage: size,
				...searchResults,
				type: req.query.type
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<SearchPage
						user={props.user}
						{...propHelpers.extractChildProps(props)}
					/>
				</Layout>
			);

			res.send(target({
				markup,
				props: escapeProps(props),
				script: '/js/search.js',
				title: 'Search Results'
			}));
		})
		.catch(next);
});

router.get('/search', (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = req.query.type || 'allEntities';

	const {size, from} = req.query;

	const searchPromise = search.searchByName(orm, query, _snakeCase(type), size, from);

	handler.sendPromiseResult(res, searchPromise);
});

/**
 * Responds with autocomplete results for a given user query. Can be further
 * filtered by collection type.
 */
router.get('/autocomplete', (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = req.query.type || 'allEntities';

	const searchPromise = search.autocomplete(orm, query, type);

	handler.sendPromiseResult(res, searchPromise);
});

/**
 * Responds with stringified boolean value which signifies if the given user
 * query already exists
 */
router.get('/exists', (req, res) => {
	const {orm} = req.app.locals;
	const {q, type} = req.query;

	const searchPromise = search.checkIfExists(orm, q, _snakeCase(type));

	handler.sendPromiseResult(res, searchPromise);
});

/**
 * Regenerates search index. Restricted to administrators.
 *
 * @throws {error.PermissionDeniedError} - Thrown if user is not admin.
 */
router.get('/reindex', auth.isAuthenticated, (req, res) => {
	const {orm} = req.app.locals;
	const indexPromise = new Promise((resolve) => {
		// TODO: This is hacky, and we should replace it once we switch to SOLR.
		const trustedUsers = ['Leftmost Cat', 'LordSputnik', 'Monkey', 'iliekcomputers'];

		const NO_MATCH = -1;
		if (trustedUsers.indexOf(req.user.name) === NO_MATCH) {
			throw new error.PermissionDeniedError(null, req);
		}

		resolve();
	})
		.then(() => search.generateIndex(orm))
		.then(() => ({success: true}));

	handler.sendPromiseResult(res, indexPromise);
});

export default router;
