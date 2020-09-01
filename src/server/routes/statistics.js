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

import * as commonUtils from '../../common/helpers/utils';
import * as propHelpers from '../../client/helpers/props';
import * as utils from '../helpers/utils';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import StatisticsPage from '../../client/components/pages/statistics';
import _ from 'lodash';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/* Get Statistics Page */
router.get('/', async (req, res) => {
	const {orm} = req.app.locals;
	const {Editor} = orm;

	const entityModels = commonUtils.getEntityModels(orm);

	// queryPromises1 is used to extract total count of all entities
	const queryPromises1 = [];

	// queryPromises2 is used for total count of entities added in 30 days
	const queryPromises2 = [];

	/*
	 *	Here We are fetching count of master revisions
	 *  for every type of entities added from beginning
	 */

	// eslint-disable-next-line guard-for-in
	for (const modelName in entityModels) {
		const model = entityModels[modelName];
		queryPromises1.push(
			model.query((qb) => {
				qb
					.leftJoin(
						'bookbrainz.revision',
						`bookbrainz.${_.snakeCase(modelName)}.revision_id`,
						'bookbrainz.revision.id'
					)
					.where('master', true);
			})
				.count().then((Count) =>
					 ({Count, modelName}))
		);
	}
	const allEntities = await Promise.all(queryPromises1);
	allEntities.sort((a, b) =>
		b.Count - a.Count);

	/*
	 *	Here We are fetching count of master revision
	 *  for every type of entities added in last 30 days
	 */

	// eslint-disable-next-line guard-for-in
	for (const modelName in entityModels) {
		const model = entityModels[modelName];

		queryPromises2.push(
			model.query((qb) => {
				qb
					.leftJoin(
						'bookbrainz.revision',
						`bookbrainz.${_.snakeCase(modelName)}.revision_id`,
						'bookbrainz.revision.id'
					)
					.where('master', true)
					.where('bookbrainz.revision.created_at', '>=',
						utils.getDateBeforeDays(30));
			})
				.count().then((Count) =>
					 ({Count, modelName}))
		);
	}
	const last30DaysEntitiesHelper = await Promise.all(queryPromises2);
	const last30DaysEntities = {};
	for (const model of last30DaysEntitiesHelper) {
		last30DaysEntities[model.modelName] = model.Count;
	}

	/*
	 *	Fetch the top 10 Editors on the basis of total revisions
	 */
	const getTopEditors = new Editor()
		.query((q) =>
			q.orderBy('total_revisions', 'desc')
			 .limit(10))
		.fetchAll()
		.then((collection) =>
			collection.models.map((model) =>
				model.attributes));

	const topEditors = await getTopEditors;

	const props = generateProps(req, res, {
		allEntities,
		last30DaysEntities,
		topEditors
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<StatisticsPage
				allEntities={allEntities}
				last30DaysEntities={last30DaysEntities}
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

export default router;
