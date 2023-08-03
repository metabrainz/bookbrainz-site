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
import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import {getIntFromQueryParams, parseQuery} from '../helpers/utils';
import AdminLogsPage from '../../client/components/pages/adminLogs';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import {getNextEnabledAndResultsArray} from '../../common/helpers/utils';
import {getOrderedAdminLogs} from '../helpers/adminLogs';
import target from '../templates/target';


const router = express.Router();

router.get('/', auth.isAuthenticated, async (req, res, next) => {
	const {orm} = req.app.locals;
	const query = parseQuery(req.url);
	const size = getIntFromQueryParams(query, 'size', 20);
	const from = getIntFromQueryParams(query, 'from');

	function render(results, nextEnabled) {
		const props = generateProps(req, res, {
			from,
			nextEnabled,
			results,
			size
		});

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<AdminLogsPage {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/adminLogs.js',
			title: 'Admin Logs'
		}));
	}

	try {
		// fetch 1 more log item than required to check nextEnabled
		const orderedLogs = await getOrderedAdminLogs(from, size + 1, orm);
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(orderedLogs, size);
		return render(newResultsArray, nextEnabled);
	}
	catch (err) {
		return next(err);
	}
});


// eslint-disable-next-line consistent-return
router.get('/admin-logs', auth.isAuthenticated, async (req, res, next) => {
	const {orm} = req.app.locals;
	const query = parseQuery(req.url);
	const size = getIntFromQueryParams(query, 'size', 20);
	const from = getIntFromQueryParams(query, 'from');

	try {
		const orderedLogs = await getOrderedAdminLogs(from, size, orm);
		res.json(orderedLogs);
	}
	catch (err) {
		return next(err);
	}
});

export default router;
