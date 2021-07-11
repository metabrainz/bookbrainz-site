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

import {formatQueryParameters, loadEntityRelationshipsForBrowse, validateBrowseRequestQueryParameters} from '../helpers/middleware';
import {getEntityAliases, getEntityIdentifiers, getEntityRelationships, getSeriesBasicInfo} from '../helpers/formatEntityData';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';
import {toLower} from 'lodash';


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


/**
 *	@swagger
 * '/series/{bbid}/aliases':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of aliases of an Series by BBID
 *     description: Returns the list of aliases of an Series
 *     operationId: getAliasesOfSeriesByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Series
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of aliases with BBID of an Series entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aliases'
 *       404:
 *         description: Series not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/aliases',
	makeEntityLoader('Series', utils.aliasesRelations, seriesError),
	async (req, res) => {
		const seriesAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(seriesAliasesList);
	});

/**
 *	@swagger
 * '/series/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of an Series by BBID
 *     description: Returns the list of identifiers of an Series
 *     operationId: getIdentifiersOfSeriesByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Series
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an Series entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Identifiers'
 *       404:
 *         description: Series not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Series', utils.identifiersRelations, seriesError),
	async (req, res) => {
		const seriesIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(seriesIdentifiersList);
	});

/**
 *	@swagger
 * '/series/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of an Series by BBID
 *     description: Returns the list of relationships of an Series
 *     operationId: getRelationshipsOfSeriesByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Series
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an Series entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationships'
 *       404:
 *         description: Series not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Series', utils.relationshipsRelations, seriesError),
	async (req, res) => {
		const seriesRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(seriesRelationshipList);
	});

/**
 *	@swagger
 * '/series':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Gets a list of Series related to another Entity
 *     description: BBID of an Author or an Edition or an EditionGroup or a Publisher or a Work is passed as query parameter and it's Series are fetched
 *     operationId: getRelatedSeriesByBbid
 *     parameters:
 *       - name: author
 *         in: query
 *         description: BBID of the corresponding Author
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: work
 *         in: query
 *         description: BBID of the corresponding Work
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: edition
 *         in: query
 *         description: BBID of the corresponding Edition
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: edition-group
 *         in: query
 *         description: BBID of the corresponding Edition Group
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: publisher
 *         in: query
 *         description: BBID of the corresponding Publisher
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: seriesOrderingType
 *         in: query
 *         description: filter by Series Ordering Type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Automatic, Manual]
 *     responses:
 *       200:
 *         description: List of Series related to another Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrowsedSeries'
 *       404:
 *         description: author/work/edition/edition-group/publisher (entity entity) not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['edition', 'author', 'edition-group', 'work', 'publisher']),
	makeEntityLoader(null, utils.relationshipsRelations, 'Entity not found', true),
	loadEntityRelationshipsForBrowse(),
	async (req, res) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.seriesorderingtype) {
				return toLower(relatedEntity.seriesOrderingType) === toLower(req.query.seriesorderingtype);
			}
			return true;
		}

		const seriesRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'Series',
			getSeriesBasicInfo, seriesBasicRelations, relationshipsFilterMethod
		);

		return res.status(200).send({
			bbid: req.query.bbid,
			series: seriesRelationshipList
		});
	});

export default router;
