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

import {aliasesRelation, identifiersRelation, relationshipsRelation} from '../helpers/utils';
import {getAuthorBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
import _ from 'lodash';
import express from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = express.Router();

const authorBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'authorType',
	'gender',
	'beginArea',
	'endArea'
];

const authorError = 'Author not found';

/**
 *@swagger
 *definitions:
 *  defaultAlias:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *        example: 'Robert A. Heinlein'
 *      sortName:
 *        type: string
 *        example: 'Heinlein, Robert A.'
 *      aliasLanguage:
 *        type: string
 *        example: 'English'
 *  AuthorDetail:
 *   type: object
 *   properties:
 *     bbid:
 *       type: string
 *       format: uuid
 *       example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *     beginArea:
 *       type: string
 *       example: 'United States'
 *     beginDate:
 *       type: string
 *       example: '1907-07-07'
 *     defaultAlias:
 *         $ref: '#/definitions/defaultAlias'
 *     disambiguation:
 *       type: string
 *       example: 'Robert A. Heinlein'
 *     endArea:
 *       type: string
 *       example: 'United States'
 *     endDate:
 *       type: string
 *       example: '1988-05-08'
 *     ended:
 *       type: boolean
 *       example: true
 *     gender:
 *       type: string
 *       example: 'Male'
 *     type:
 *       type: string
 *       example: 'Person'
 *  AuthorAliases:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *      aliases:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *              example: 'Robert A. Heinlein'
 *            sortName:
 *              type: string
 *              example: 'Heinlein, Robert A.'
 *            aliasLanguage:
 *              type: string
 *              example: 'English'
 *            primary:
 *              type: boolean
 *              example: true
 *  AuthorIdentifiers:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *      identifiers:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            type:
 *              type: string
 *              example: 'Wikidata ID'
 *            value:
 *              type: string
 *              example: 'Q123078'
 *  AuthorRelationships:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *      relationships:
 *        type: array
 *        items:
 *          type: object
 *          properties:
 *            direction:
 *              type: string
 *              example: 'forward'
 *            id:
 *              type: number
 *              example: 804
 *            linkPhrase:
 *              type: string
 *              example: 'wrote'
 *            relationshipTypeId:
 *              type: number
 *              example: 8
 *            relationshipTypeName:
 *              type: string
 *              example: 'Author'
 *            targetBbid:
 *              type: string
 *							format: uuid
 *							example: '4682cf09-66fb-4542-b457-b889117e0279'
 *						targetEntityType:
 *              type: string
 *              example: 'work'
 */

/**
 *@swagger
 *'/author/{bbid}':
 *  get:
 *     tags:
 *       - Lookup Requests
 *     summary: Lookup Author by BBID
 *     description: Returns the basic details of an Author
 *     operationId: getAuthorByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Author to get the data
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Basic information of an Author entity
 *         schema:
 *             $ref: '#/definitions/AuthorDetail'
 *       404:
 *         description: Author not found
 */

router.get('/:bbid',
	makeEntityLoader('Author', authorBasicRelations, authorError),
	async (req, res, next) => {
		const authorBasicInfo = await getAuthorBasicInfo(res.locals.entity);
		return res.status(200).send(authorBasicInfo);
	});


/**
 *	@swagger
 * '/author/{bbid}/aliases':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of aliases of an author by BBID
 *     description: Returns the list of aliases of an author
 *     operationId: getAliasesOfAuthorByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the author to return that data
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of aliases with BBID of an author entity
 *         schema:
 *             $ref: '#/definitions/AuthorAliases'
 *       404:
 *         description: Author not found
 */

router.get('/:bbid/aliases',
	makeEntityLoader('Author', aliasesRelation, authorError),
	async (req, res, next) => {
		const authorAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(authorAliasesList);
	});

/**
 *	@swagger
 * '/author/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of an author by BBID
 *     description: Returns the list of identifiers of an author
 *     operationId: getIdentifiersOfAuthorByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of author to return that data
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an author entity
 *         schema:
 *             $ref: '#/definitions/AuthorIdentifiers'
 *       404:
 *         description: Author not found
 */
router.get('/:bbid/identifiers',
	makeEntityLoader('Author', identifiersRelation, authorError),
	async (req, res, next) => {
		const authorIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(authorIdentifiersList);
	});

/**
 *	@swagger
 * '/author/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of an author by BBID
 *     description: Returns the list of relationships of an author
 *     operationId: getRelationshipsOfAuthorByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the author to return that data
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an author entity
 *         schema:
 *             $ref: '#/definitions/AuthorRelationships'
 *       404:
 *         description: Author not found
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Author', relationshipsRelation, authorError),
	async (req, res, next) => {
		const authorRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(authorRelationshipList);
	});

export default router;
