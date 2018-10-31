/*
 * Copyright (C) 2018 Akhilesh Kumar <akhilesh5991@gmail.com>
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

import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StatisticsPage from '../../client/components/pages/statistics';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/* Get Statistics Page */
router.get('/', (req, res) => {
	const {orm} = req.app.locals;
	const {Editor} = orm;

	/*
	 *	Here We are fetching top 10 Edirors
	 *  from database on Basis of  totalRevisions
	 */
	const getTopEditors = new Editor()
		.query((q) =>
			q.orderBy('total_revisions', 'desc')
			 .limit(10))
		.fetchAll()
		.then((collection) =>
			collection.models.map((model) =>
				model.attributes));

	getTopEditors.then((topEditors) => {
		const props = generateProps(req, res, {
			topEditors
		});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<StatisticsPage
					topEditors={topEditors}
				/>
			</Layout>
		);
		res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/statistics.js',
			title: 'Statistics'
		}));
	});
});

export default router;
