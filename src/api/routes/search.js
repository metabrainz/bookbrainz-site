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

import * as search from '../../common/helpers/search';
import {keys as _keys, snakeCase as _snakeCase, isNil} from 'lodash';
import express from 'express';
import {formatSearchRespose} from '../helpers/formatEntityData';


const router = express.Router();

/**
 *	@swagger
 * '/search?q=Harry&colloction=work&limit=5&offset=0':
 *   get:
 *     tags:
 *       - Search Requests
 *     summary: Get the list of entity accourding to query and query params
 *     description: query parameter is used to match in the default alias and other parameters are optional
 *     operationId: getSearchResult
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search string for entity search
 *         required: true
 *         type: string
 *       - name: collection
 *         in: query
 *         description: Entity type for search
 *         required: false
 *         type: string
 *         default: null
 *       - name: limit
 *         in: query
 *         description: maximum number of output in one request
 *         required: false
 *         type: number
 *         default: 10
 *       - name: offset
 *         in: query
 *         description: Result start from the number
 *         required: false
 *         type: number
 *         default: 0
 *     responses:
 *       200:
 *         description: List of relationships with BBID of the Publisher entity
 *         schema:
 *             $ref: '#/definitions/SearchResultModel'
 */

router.get('/', async (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const collection = req.query.collection || null;
	const {limit, offset} = req.query;
	const searchResult = await search.searchByName(orm, query, _snakeCase(collection), limit, offset);
	const formattedSearchResult = await formatSearchRespose(searchResult);
	res.status(200).send(formattedSearchResult);
});


export default router;
