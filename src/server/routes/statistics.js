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

/**
 * Retrieves the total count of all entities in the database and returns it as an array of objects,
 * where each object contains the entity name and its count. The results are sorted by count in
 * descending order.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Array<Object>} An array of objects, where each object contains the entity name and its count
 * @throws {Error} If there is an error fetching entities lifetime total
 */
async function getAllEntities(orm) {
	try {
		const entityModels = commonUtils.getEntityModels(orm);
		const countPromises = Object.entries(entityModels).map(async ([modelName, model]) => {
			const Count = await model
				.query((qb) => {
					qb
						.leftJoin(
							'bookbrainz.revision',
							`bookbrainz.${_.snakeCase(modelName)}.revision_id`,
							'bookbrainz.revision.id'
						)
						.where('master', true);
				})
				.count();
			return {Count, modelName};
		});
		const allEntities = await Promise.all(countPromises);
		allEntities.sort((a, b) => b.Count - a.Count);
		return allEntities;
	}
	catch (error) {
		throw new Error('Error fetching all entities total');
	}
}

/**
 * Retrieves the count of entities created in the last 30 days and returns it as an object, where
 * each key is the entity name and its value is the count.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Object} An object where each key is the entity name and its value is the count
 * @throws {Error} If there is an error fetching entities total cound from last 30 days
 */
async function getLast30DaysEntities(orm) {
	try {
		const entityModels = commonUtils.getEntityModels(orm);
		const countPromises = Object.keys(entityModels).map(async (modelName) => {
			const model = entityModels[modelName];
			const Count = await model
				.query((qb) => {
					qb
						.leftJoin(
							'bookbrainz.revision',
							`bookbrainz.${_.snakeCase(modelName)}.revision_id`,
							'bookbrainz.revision.id'
						)
						.where('master', true)
						.where(
							'bookbrainz.revision.created_at',
							'>=',
							utils.getDateBeforeDays(30)
						);
				})
				.count();
			return {Count, modelName};
		});
		const last30DaysEntitiesHelper = await Promise.all(countPromises);
		const last30DaysEntities = {};
		last30DaysEntitiesHelper.forEach((model) => {
			last30DaysEntities[model.modelName] = model.Count;
		});
		return last30DaysEntities;
	}
	catch (error) {
		throw new Error('Error fetching entities from last 30 days');
	}
}

/**
 * Retrieves the top 10 editors with the most revisions and returns them as an array of objects,
 * where each object contains the editor's information.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Array<Object>} An array of objects, where each object contains the editor's information.
 * @throws {Error} If there is an error fetching the top 10 editors.
 */
async function getTop10Editors(orm) {
	try {
		const {Editor} = orm;
		const topEditorsQuery = await new Editor()
			.query((q) =>
				q.orderBy('total_revisions', 'desc')
					.limit(10))
			.fetchAll();

		const topEditors = topEditorsQuery.models.map((model) => model.attributes);
		return topEditors;
	}
	catch (error) {
		throw new Error('Error fetching top 10 editors');
	}
}

/* Get Statistics Page */
router.get('/', async (req, res, next) => {
	const {orm} = req.app.locals;
	try {
		const [allEntities, last30DaysEntities, topEditors] = await Promise.all([
			getAllEntities(orm),
			getLast30DaysEntities(orm),
			getTop10Editors(orm)
		]);
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
		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/statistics.js',
			title: 'Statistics'
		}));
	}
	catch (err) {
		return next(err);
	}
});

export default router;
