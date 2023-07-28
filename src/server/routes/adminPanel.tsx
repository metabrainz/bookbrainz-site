/*
 * Copyright (C) 2023 Shivam Awasthi
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
import * as handler from '../helpers/handler';
import * as propHelpers from '../../client/helpers/props';
import * as search from '../../common/helpers/search';

import {snakeCase as _snakeCase, isNil} from 'lodash';
import {escapeProps, generateProps} from '../helpers/props';
import {getIntFromQueryParams, parseQuery} from '../helpers/utils';
import AdminPanelSearchPage from '../../client/components/pages/admin-panel-search';
import Layout from '../../client/containers/layout';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import target from '../templates/target';


const {ADMIN} = PrivilegeType;

type SearchResultsT = {
	initialResults: any,
	query: string,
	total?: number
};

const router = express.Router();

/**
 * Generates React markup for the search page that is rendered by the user's
 * browser.
 */
router.get('/', auth.isAuthenticated, auth.isAuthorized(ADMIN), async (req, res, next) => {
	const {orm} = req.app.locals;
	const type = 'editor';
	const urlQuery = parseQuery(req.url);
	const query = urlQuery.get('q') ?? '';
	const size = getIntFromQueryParams(urlQuery, 'size', 20);
	const from = getIntFromQueryParams(urlQuery, 'from');
	try {
		let searchResults: SearchResultsT = {
			initialResults: [],
			query,
			total: 0
		};
		if (query) {
			// get 1 more results to check nextEnabled
			const searchResponse = await search.searchByName(orm, query, _snakeCase(type), size + 1, from);
			const {results: entities} = searchResponse;
			searchResults = {
				initialResults: entities.filter(entity => !isNil(entity)),
				query
			};
		}

		const {newResultsArray, nextEnabled} = commonUtils.getNextEnabledAndResultsArray(searchResults.initialResults, size);
		searchResults.initialResults = newResultsArray;

		const props = generateProps(req, res, {
			from,
			hideSearch: true,
			nextEnabled,
			resultsPerPage: size,
			...searchResults
		});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<AdminPanelSearchPage
					user={props.user}
					{...propHelpers.extractChildProps(props)}
				/>
			</Layout>
		);

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/adminPanel.js',
			title: 'Search Results'
		}));
	}
	catch (err) {
		return next(err);
	}
});

router.get('/search', auth.isAuthenticated, auth.isAuthorized(ADMIN), (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = 'editor';

	const {size, from} = req.query;

	const searchPromise = search.searchByName(orm, query, _snakeCase(type), size, from);

	handler.sendPromiseResult(res, searchPromise);
});


export default router;
