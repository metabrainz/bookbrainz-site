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

import {keys as _keys, snakeCase as _snakeCase, camelCase, isNil, isString, upperFirst} from 'lodash';
import {escapeProps, generateProps} from '../helpers/props';

import {EntityTypeString} from 'bookbrainz-data/lib/types/entity';
import Layout from '../../client/containers/layout';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SearchPage from '../../client/components/pages/search';
import express from 'express';
import target from '../templates/target';


const router = express.Router();
const {REINDEX_SEARCH_SERVER} = PrivilegeType;

/**
 * Generates React markup for the search page that is rendered by the user's
 * browser.
 */
router.get('/', async (req, res, next) => {
	const {orm} = req.app.locals;
	const query = req.query.q ?? '';
	const type = req.query.type?.toString() || 'allEntities';
	const size = req.query.size ? parseInt(String(req.query.size), 10) : 20;
	const from = req.query.from ? parseInt(String(req.query.from), 10) : 0;
	try {
		let searchResults = {
			initialResults: [],
			query,
			total: 0
		};
		if (query) {
			// get 1 more results to check nextEnabled
			const searchResponse = await search.searchByName(orm, query, _snakeCase(type), size + 1, from);
			const {results: entities} = searchResponse;
			const initialResults = entities.filter(entity => !isNil(entity));
			searchResults = {
				initialResults,
				query,
				total: initialResults.length
			};
		}

		const entityTypes = _keys(commonUtils.getEntityModels(orm));
		const {newResultsArray, nextEnabled} = commonUtils.getNextEnabledAndResultsArray(searchResults.initialResults, size);
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

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/search.js',
			title: 'Search Results'
		}));
	}
	catch (err) {
		return next(err);
	}
});

router.get('/search', (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = req.query.type as search.IndexableEntitiesOrAll ?? 'allEntities';

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
	const query = req.query.q.toString();
	const type = req.query.type as search.IndexableEntitiesOrAll ?? 'allEntities';
	const size = Number(req.query.size) || 42;

	const searchPromise = search.autocomplete(orm, query, type, size);

	handler.sendPromiseResult(res, searchPromise);
});

/**
 * Responds with stringified boolean value which signifies if the given user
 * query already exists
 */
router.get('/exists', (req, res) => {
	const {orm} = req.app.locals;
	const {q, type} = req.query;

	const searchPromise = search.checkIfExists(orm, q, _snakeCase(String(type)));

	handler.sendPromiseResult(res, searchPromise);
});

/**
 * Regenerates search index. Restricted to administrators.
 *
 * @throws {error.PermissionDeniedError} - Thrown if user is not admin.
 */
router.get('/reindex', auth.isAuthenticated, auth.isAuthorized(REINDEX_SEARCH_SERVER), async (req, res) => {
	req.socket.setTimeout(600000);
	const {orm} = req.app.locals;
	const type = isString(req.query.type) ? upperFirst(camelCase(req.query.type)) : 'allEntities';
	try {
		await search.generateIndex(orm, type as search.IndexableEntities);
		return handler.sendPromiseResult(res, {success: true});
	}
	catch (err) {
		return error.sendErrorAsJSON(res, new error.SiteError(`Cannot index entites for search, something went wrong: ${err.toString()}`, req));
	}
});

router.get('/entity/:bbid', async (req, res) => {
	const {orm} = res.app.locals;
	const {bbid} = req.params;
	const entity = await commonUtils.getEntityByBBID(orm, bbid);
	if (!entity) {
		return error.sendErrorAsJSON(res, new error.NotFoundError("Entity with this bbid doesn't exist", req));
	}
	return res.send(entity);
});

export default router;
