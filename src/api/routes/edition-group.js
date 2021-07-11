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

import * as utils from '../helpers/utils';
import {
	formatQueryParameters,
	loadEntityRelationshipsForBrowse,
	validateBrowseRequestQueryParameters
} from '../helpers/middleware';
import {
	getEditionGroupBasicInfo,
	getEntityAliases,
	getEntityIdentifiers,
	getEntityRelationships
} from '../helpers/formatEntityData';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';
import {toLower} from 'lodash';


const router = Router();

const editionGroupBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'editionGroupType'
];

const editionGroupError = 'Edition Group not found';

/**
 *@swagger
 *components:
 *  schemas:
 *    EditionGroupDetail:
 *      type: object
 *      properties:
 *        bbid:
 *          type: string
 *          format: uuid
 *          example: 'ba446064-90a5-447b-abe5-139be547da2e'
 *        defaultAlias:
 *          $ref: '#/components/schemas/Alias'
 *        disambiguation:
 *          type: string
 *          example: 'Harry Porter'
 *        type:
 *          type: string
 *          example: 'Book'
 *    BrowsedEditionGroups:
 *      type: object
 *      properties:
 *        bbid:
 *          type: string
 *          format: uuid
 *          example: '4fb5ed30-e222-4204-83a3-5f2409c47e41'
 *        editionGroups:
 *          type: array
 *          items:
 *            type: object
 *            properties:
 *              entity:
 *                $ref: '#/components/schemas/EditionGroupDetail'
 *              relationships:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                     relationshipTypeID:
 *                       type: number
 *                       example: 3
 *                     relationshipType:
 *                       type: string
 *                       example: 'Edition'
 *
 */

/**
 *@swagger
 *  '/edition-group/{bbid}':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Lookup Edition Group by bbid
 *      description: Returns the basic details of an Edition Group
 *      operationId: getEditionGroupByBbid
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Edition Group
 *          required: true
 *          schema:
 *            type: string
 *            format: uuid
 *      responses:
 *        200:
 *          description: Basic information of an Edition Group entity
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/EditionGroupDetail'
 *        404:
 *          description: Edition Group not found
 *        400:
 *          description: Invalid BBID
 */

router.get('/:bbid',
	makeEntityLoader('EditionGroup', editionGroupBasicRelations, editionGroupError),
	async (req, res) => {
		const editionGroupBasicInfo = await getEditionGroupBasicInfo(res.locals.entity);
		return res.status(200).send(editionGroupBasicInfo);
	});

/**
 *	@swagger
 * '/edition-group/{bbid}/aliases':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of aliases of the Edition Group by BBID
 *     description: Returns the list of aliases of the Edition Group
 *     operationId: getAliasesOfEditionGroupByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of aliases with BBID of the Edition Group entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aliases'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/aliases',
	makeEntityLoader('EditionGroup', utils.aliasesRelations, editionGroupError),
	async (req, res) => {
		const editionGroupAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(editionGroupAliasesList);
	});

/**
 *	@swagger
 * '/edition-group/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of an Edition Group by BBID
 *     description: Returns the list of identifiers of an Edition Group
 *     operationId: getIdentifiersOfEditionGroupByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an Edition Group entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Identifiers'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('EditionGroup', utils.identifiersRelations, editionGroupError),
	async (req, res) => {
		const editionGroupIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(editionGroupIdentifiersList);
	});


/**
 *	@swagger
 * '/edition-group/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of an Edition Group by BBID
 *     description: Returns the list of relationships of an Edition Group
 *     operationId: getRelationshipsOfEditionGroupByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an Edition Group entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationships'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('EditionGroup', utils.relationshipsRelations, editionGroupError),
	async (req, res) => {
		const editionGroupRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(editionGroupRelationshipList);
	});

/**
 *	@swagger
 * '/edition-group':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Gets a list of Edition Groups which are related to another Entity
 *     description: BBID of an Edition or a Series is passed as a query parameter, and its related EditionGroups are fetched
 *     operationId: getRelatedEditionGroupByBbid
 *     parameters:
 *       - name: edition
 *         in: query
 *         description: BBID of the Edition
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: series
 *         in: query
 *         description: BBID of the corresponding Series
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: type
 *         in: query
 *         description: filter by Edition Group type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [book, leaflet, newspaper, magazine, journal]
 *     responses:
 *       200:
 *         description: List of EditionGroups related to another Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrowsedEditionGroups'
 *       404:
 *         description: edition/series (entity entity) not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['edition', 'series']),
	(req, res, next) => {
		// As we're loading the browsed entity, also load the related EditionGroups from the ORM models to avoid fetching it twice
		let extraRelationships = [];
		if (req.query.modelType === 'Edition') {
			extraRelationships = editionGroupBasicRelations.map(rel => `editionGroup.${rel}`);
		}
		makeEntityLoader(null, utils.relationshipsRelations.concat(extraRelationships), 'Entity not found', true)(req, res, next);
	},
	loadEntityRelationshipsForBrowse(),
	async (req, res) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.type) {
				const editionGroupTypeMatched = toLower(relatedEntity.editionGroupType) === toLower(req.query.type);
				return editionGroupTypeMatched;
			}
			return true;
		}
		// editionGroupRelationsList will always be empty. Because edition is the only validLinkedEnitity
		const editionGroupRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'EditionGroup',
			getEditionGroupBasicInfo, editionGroupBasicRelations, relationshipsFilterMethod
		);

		if (req.query.modelType === 'Edition') {
			const {entity: edition} = res.locals;
			const {editionGroup} = edition;
			// an edition will belong to only one edition-group
			const editionGroupArray = [getEditionGroupBasicInfo(editionGroup)];
			editionGroupArray
				.filter(relationshipsFilterMethod)
				.forEach((filteredEditionGroup) => {
					editionGroupRelationshipList.push({entity: filteredEditionGroup, relationship: {}});
				});
		}
		return res.status(200).send({
			bbid: req.query.bbid,
			editionGroups: editionGroupRelationshipList
		});
	});

export default router;
