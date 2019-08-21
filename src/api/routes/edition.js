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
import {getEditionBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
import {loadEntityRelationshipsForBrowse, validateBrowseRequestQueryParameters} from '../helpers/middleware';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = Router();

const editionBasicRelations = [
	'defaultAlias.language',
	'languageSet.languages',
	'disambiguation',
	'editionFormat',
	'editionStatus',
	'releaseEventSet.releaseEvents'
];

const editionError = 'Edition not found';

/**
 *@swagger
 *definitions:
 *  EditionDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: '96a23368-85a1-4559-b3df-16833893d861'
 *      defaultAlias:
 *        $ref: '#/definitions/Alias'
 *      depth:
 *        type: integer
 *        description: 'depth in mm'
 *        example: 40
 *      disambiguation:
 *        type: string
 *        example: 'Limited edition boxed set'
 *      editionFormat:
 *        type: string
 *        example: 'eBook'
 *      height:
 *        type: integer
 *        description: 'height in mm'
 *        example: 250
 *      languages:
 *        type: array
 *        items:
 *          type: string
 *          example: 'English'
 *      pages:
 *        type: integer
 *        example: 200
 *      releaseEventDates:
 *        type: string
 *        example: '2011-01-01'
 *      status:
 *        type: string
 *        example: 'Official'
 *      weight:
 *        type: integer
 *        description: 'Weight in grams'
 *        example: 300
 *      width:
 *        type: integer
 *        description: 'width in mm'
 *        example: 80
 *  BrowsedEditions:
 *   type: object
 *   properties:
 *     bbid:
 *       type: string
 *       format: uuid
 *       example: 'f94d74ce-c748-4130-8d59-38b290af8af3'
 *     relatedWorks:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           entity:
 *             $ref: '#/definitions/EditionDetail'
 *           relationships:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                  relationshipTypeID:
 *                    type: number
 *                    example: 4
 *                  relationshipType:
 *                    type: string
 *                    example: 'Publisher'
 *
 */


/**
 *
 * @swagger
 * '/edition/{bbid}':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Lookup Edition by BBID
 *      description: Returns the basic details of an Edition
 *      operationId: getEditionByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Edition
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Basic information of an Edition entity
 *          schema:
 *              $ref: '#/definitions/EditionDetail'
 *        404:
 *          description: Edition not found
 *        406:
 *          description: Invalid BBID
 */


router.get('/:bbid',
	makeEntityLoader('Edition', editionBasicRelations, editionError),
	async (req, res) => {
		const editionBasicInfo = await getEditionBasicInfo(res.locals.entity);
		return res.status(200).send(editionBasicInfo);
	});

/**
 *	@swagger
 * '/edition/{bbid}/aliases':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of aliases of the Edition by BBID
 *     description: Returns the list of aliases of the Edition
 *     operationId: getAliasesOfEditionByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of aliases with BBID of the Edition entity
 *         schema:
 *             $ref: '#/definitions/Aliases'
 *       404:
 *         description: Edition not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/aliases',
	makeEntityLoader('Edition', utils.aliasesRelations, editionError),
	async (req, res, next) => {
		const editionAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(editionAliasesList);
	});

/**
 *	@swagger
 * '/edition/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of an Edition by BBID
 *     description: Returns the list of identifiers of an Edition
 *     operationId: getIdentifiersOfEditionByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an Edition entity
 *         schema:
 *             $ref: '#/definitions/Identifiers'
 *       404:
 *         description: Edition not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Edition', utils.identifiersRelations, editionError),
	async (req, res, next) => {
		const editionIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(editionIdentifiersList);
	});

/**
 *	@swagger
 * '/edition/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of an Edition by BBID
 *     description: Returns the list of relationships of an Edition
 *     operationId: getRelationshipsOfEditionByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Edition
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an Edition entity
 *         schema:
 *             $ref: '#/definitions/Relationships'
 *       404:
 *         description: Edition not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Edition', utils.relationshipsRelations, editionError),
	async (req, res, next) => {
		const editionRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(editionRelationshipList);
	});

/**
 *	@swagger
 * '/edition':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Get list of Edition which are related to the other entity
 *     description: Returns the list of Edition, When one of the bbid of Work or Author or Publisher or EditionGroup is passed as query parameter
 *     operationId: getRelatedEditionByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: author
 *         in: query
 *         description: BBID of the Author
 *         required: false
 *         type: bbid
 *       - name: work
 *         in: query
 *         description: BBID of the Work
 *         required: false
 *         type: bbid
 *       - name: publisher
 *         in: query
 *         description: BBID of the Publisher
 *         required: false
 *         type: bbid
 *       - name: edition-group
 *         in: query
 *         description: BBID of the EditionGroup
 *         required: false
 *         type: bbid
 *     responses:
 *       200:
 *         description: List of Editions which are related any of one other entity
 *         schema:
 *             $ref: '#/definitions/BrowsedEditions'
 *       404:
 *         description: Related entity not found
 *       406:
 *         description: Invalid BBID paased in query params
 */

router.get('/',
	validateBrowseRequestQueryParameters(['author', 'edition', 'edition-group', 'work', 'publisher']),
	makeEntityLoader(null, utils.relationshipsRelations, 'Entity not found', true),
	loadEntityRelationshipsForBrowse(),
	async (req, res, next) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.type) {
				return _.toLower(_.get(relatedEntity, 'editionType.label')) === req.query.type;
			}
			return true;
		}
		const editionRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'Edition',
			getEditionBasicInfo, editionBasicRelations, relationshipsFilterMethod
		);
		return res.status(200).send({
			bbid: req.query.bbid,
			relatedEditions: editionRelationshipList
		});
	});

export default router;
