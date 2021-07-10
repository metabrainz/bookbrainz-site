/*
 * Copyright (C) 2021  Akash Gupta
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

import * as utils from '../helpers/utils';

import {getEntityAliases, getEntityIdentifiers, getEntityRelationships, getSeriesBasicInfo} from '../helpers/formatEntityData';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = Router();

const seriesBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'seriesOrderingType'
];

const seriesError = 'Series not found';

/**
 *@swagger
 * components:
 *   schemas:
 *     SeriesDetail:
 *      type: object
 *      properties:
 *        bbid:
 *          type: string
 *          format: uuid
 *          example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *        seriesOrderingType:
 *          type: string
 *          example: 'Automatic'
 *        seriesType:
 *          type: string
 *          example: 'Work'
 *        defaultAlias:
 *            $ref: '#/components/schemas/Alias'
 *        disambiguation:
 *          type: string
 *          example: 'series of three epic fantasy'
 *     BrowsedSeries:
 *       type: object
 *       properties:
 *         bbid:
 *           type: string
 *           format: uuid
 *           example: 'f94d74ce-c748-4130-8d59-38b290af8af3'
 *         series:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               entity:
 *                 $ref: '#/components/schemas/SeriesDetail'
 *               relationships:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      relationshipTypeID:
 *                        type: number
 *                        example: 71
 *                      relationshipType:
 *                        type: string
 *                        example: 'Work Series'
 */


/**
 *@swagger
 *'/series/{bbid}':
 *  get:
 *     tags:
 *       - Lookup Requests
 *     summary: Lookup Series by BBID
 *     description: Returns the basic details of an Series
 *     operationId: getSeriesByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Series
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Basic information of an Series entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SeriesDetail'
 *       404:
 *         description: Series not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid',
	makeEntityLoader('Series', seriesBasicRelations, seriesError),
	async (req, res) => {
		const seriesBasicInfo = await getSeriesBasicInfo(res.locals.entity);
		return res.status(200).send(seriesBasicInfo);
	});

export default router;
