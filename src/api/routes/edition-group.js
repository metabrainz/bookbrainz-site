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

import * as _ from 'lodash';
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


const router = Router();

const editionGroupBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'editionGroupType'
];

const editionGroupError = 'Edition Group not found';

/**
 *@swagger
 *definitions:
 *  EditionGroupDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: 'ba446064-90a5-447b-abe5-139be547da2e'
 *      defaultAlias:
 *        $ref: '#/definitions/Alias'
 *      disambiguation:
 *        type: string
 *        example: 'Harry Porter'
 *      type:
 *        type: string
 *        example: 'Book'
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
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Edition Group
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Basic information of an Edition Group entity
 *          schema:
 *              $ref: '#/definitions/EditionGroupDetail'
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
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of aliases with BBID of the Edition Group entity
 *         schema:
 *             $ref: '#/definitions/Aliases'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/aliases',
	makeEntityLoader('EditionGroup', utils.aliasesRelations, editionGroupError),
	async (req, res, next) => {
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
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an Edition Group entity
 *         schema:
 *             $ref: '#/definitions/Identifiers'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('EditionGroup', utils.identifiersRelations, editionGroupError),
	async (req, res, next) => {
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
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition Group
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an Edition Group entity
 *         schema:
 *             $ref: '#/definitions/Relationships'
 *       404:
 *         description: Edition Group not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('EditionGroup', utils.relationshipsRelations, editionGroupError),
	async (req, res, next) => {
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
 *     description: BBID of an Edition is passed as a query parameter, and its related EditionGroups are fetched
 *     operationId: getRelatedEditionGroupByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: edition
 *         in: query
 *         description: BBID of the Edition
 *         required: true
 *         type: bbid
 *       - name: type
 *         in: query
 *         description: filter by Edition Group type
 *         required: false
 *         type: string
 *         enum: [book, leaflet, newspaper, magazine, journal]
 *     responses:
 *       200:
 *         description: List of EditionGroups related to another Entity
 *         schema:
 *             $ref: '#/definitions/BrowsedEditionGroups'
 *       404:
 *         description: Edition not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['edition']),
	makeEntityLoader(null, utils.relationshipsRelations, 'Entity not found', true),
	loadEntityRelationshipsForBrowse(),
	async (req, res, next) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.type) {
				const editionGroupTypeMatched = _.toLower(relatedEntity.editionGroupType) === _.toLower(req.query.type);
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
			// If we're loading an Edition, also load the related Edition Group from the ORM model
			const {Edition} = req.app.locals.orm;
			const {bbid} = req.query;
			const relationships = editionGroupBasicRelations.map(rel => `editionGroup.${rel}`);
			const edition = await new Edition({bbid}).fetch({
				require: false,
				withRelated: relationships
			});
			const editionJSON = edition ? edition.toJSON() : {};
			const {editionGroup} = editionJSON;
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
