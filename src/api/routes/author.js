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

import {formatQueryParameters, loadEntityRelationshipsForBrowse, validateBrowseRequestQueryParameters} from '../helpers/middleware';
import {getAuthorBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';
import {toLower} from 'lodash';


const router = Router();

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
 * components:
 *   schemas:
 *     AuthorDetail:
 *      type: object
 *      properties:
 *        bbid:
 *          type: string
 *          format: uuid
 *          example: '2e5f49a8-6a38-4cc7-97c7-8e624e1fc2c1'
 *        beginArea:
 *          type: string
 *          example: 'United States'
 *        beginDate:
 *          type: string
 *          example: '1907-07-07'
 *        defaultAlias:
 *            $ref: '#/components/schemas/Alias'
 *        disambiguation:
 *          type: string
 *          example: 'Robert A. Heinlein'
 *        endArea:
 *          type: string
 *          example: 'United States'
 *        endDate:
 *          type: string
 *          example: '1988-05-08'
 *        ended:
 *          type: boolean
 *          example: true
 *        gender:
 *          type: string
 *          example: 'Male'
 *        type:
 *          type: string
 *          example: 'Person'
 *     BrowsedAuthors:
 *       type: object
 *       properties:
 *         bbid:
 *           type: string
 *           format: uuid
 *           example: 'f94d74ce-c748-4130-8d59-38b290af8af3'
 *         authors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               entity:
 *                 $ref: '#/components/schemas/AuthorDetail'
 *               relationships:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                      relationshipTypeID:
 *                        type: number
 *                        example: 8
 *                      relationshipType:
 *                        type: string
 *                        example: 'Author'
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
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Basic information of an Author entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthorDetail'
 *       404:
 *         description: Author not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid',
	makeEntityLoader('Author', authorBasicRelations, authorError),
	async (req, res) => {
		const authorBasicInfo = await getAuthorBasicInfo(res.locals.entity);
		return res.status(200).send(authorBasicInfo);
	});


/**
 *	@swagger
 * '/author/{bbid}/aliases':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of aliases of an Author by BBID
 *     description: Returns the list of aliases of an Author
 *     operationId: getAliasesOfAuthorByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of aliases with BBID of an Author entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aliases'
 *       404:
 *         description: Author not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/aliases',
	makeEntityLoader('Author', utils.aliasesRelations, authorError),
	async (req, res) => {
		const authorAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(authorAliasesList);
	});

/**
 *	@swagger
 * '/author/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of an Author by BBID
 *     description: Returns the list of identifiers of an Author
 *     operationId: getIdentifiersOfAuthorByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an Author entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Identifiers'
 *       404:
 *         description: Author not found
 *       400:
 *         description: Invalid BBID
 */
router.get('/:bbid/identifiers',
	makeEntityLoader('Author', utils.identifiersRelations, authorError),
	async (req, res) => {
		const authorIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(authorIdentifiersList);
	});

/**
 *	@swagger
 * '/author/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of an Author by BBID
 *     description: Returns the list of relationships of an Author
 *     operationId: getRelationshipsOfAuthorByBbid
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Author
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an Author entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationships'
 *       404:
 *         description: Author not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Author', utils.relationshipsRelations, authorError),
	async (req, res) => {
		const authorRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(authorRelationshipList);
	});

/**
 *	@swagger
 * '/author':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Gets a list of Authors related to another Entity
 *     description: BBID of an Author or an Edition or an EditionGroup or a Publisher or a Series or a Work is passed as query parameter and it's Authors are fetched
 *     operationId: getRelatedAuthorByBbid
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
 *       - name: series
 *         in: query
 *         description: BBID of the corresponding Series
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
 *       - name: type
 *         in: query
 *         description: filter by Author type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [person, group]
 *     responses:
 *       200:
 *         description: List of Authors related to another Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrowsedAuthors'
 *       404:
 *         description: author/series/work/edition/edition-group/publisher (entity entity) not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['edition', 'author', 'series', 'edition-group', 'work', 'publisher']),
	makeEntityLoader(null, utils.relationshipsRelations, 'Entity not found', true),
	loadEntityRelationshipsForBrowse(),
	async (req, res) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.type) {
				return toLower(relatedEntity.authorType) === toLower(req.query.type);
			}

			return true;
		}

		const authorRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'Author',
			getAuthorBasicInfo, authorBasicRelations, relationshipsFilterMethod
		);

		return res.status(200).send({
			authors: authorRelationshipList,
			bbid: req.query.bbid
		});
	});

export default router;
