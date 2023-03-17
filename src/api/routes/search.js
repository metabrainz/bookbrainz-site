/*
 * Copyright (C) 2019  Akhilesh Kumar
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

import 	* as search from '../../common/helpers/search';
import {snakeCase as _snakeCase} from 'lodash';
import express from 'express';
import {formatSearchResponse} from '../helpers/formatEntityData';


const router = express.Router();

/**
 *	@swagger
 * '/search':
 *   get:
 *     tags:
 *       - Search Requests
 *     summary: Get a list of entities according to search query and params
 *     description: query parameter is used to match in the default alias and other parameters are optional
 *     operationId: getSearchResult
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search query
 *         required: true
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         description: Entity type to search for. Defaults to all entities except Editors.
 *         required: false
 *         schema:
 *           type: string
 *           default: 'All entities'
 *           enum: [author, edition, edition-group, editor, publisher, series, work]
 *       - name: size
 *         in: query
 *         description: maximum number of entities in response
 *         required: false
 *         schema:
 *           type: number
 *           default: 20
 *       - name: from
 *         in: query
 *         description: offset for search result
 *         required: false
 *         schema:
 *           type: number
 *           default: 0
 *     responses:
 *       200:
 *         description: List of entities matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResultModel'
 *       400:
 *         description: Invalid BBID
 */

router.get('/', async (req, res) => {
	const {orm} = req.app.locals;
	if (req.query.q) {
		const query = req.query.q;
		const type = req.query.type || null;
		const size = req.query.size ? parseInt(req.query.size, 10) : 20;
		const from = req.query.from ? parseInt(req.query.from, 10) : 0;
		const searchResult = await search.searchByName(orm, query, _snakeCase(type), size, from);
		const formattedSearchResult = await formatSearchResponse(searchResult);
		res.status(200).send(formattedSearchResult);
	}
	else {
		const errMsg = 'Invalid Query';
		res.status(400).send({message: errMsg});
	}
});


export default router;
