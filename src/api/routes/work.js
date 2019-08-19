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
import {getEntityAliases, getEntityIdentifiers, getEntityRelationships, getWorkBasicInfo} from '../helpers/formatEntityData';
import {loadEntityRelationshipsForBrowse, validateWorkBrowseRequest} from '../helpers/middleware';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = Router();

const workBasicRelations = [
	'defaultAlias.language',
	'languageSet.languages',
	'disambiguation',
	'workType'
];

const workError = 'Work not found';

/**
 *@swagger
 *definitions:
 *  WorkDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: ba446064-90a5-447b-abe5-139be547da2e
 *      defaultAlias:
 *        $ref: '#/definitions/Alias'
 *      disambiguation:
 *        type: string
 *        example: 'Harry Porter 1'
 *      entityType:
 *        type: string
 *        example: 'Work'
 *      languages:
 *        type: array
 *        items:
 *          type: string
 *          example: English
 *      workType:
 *        type: string
 *        example: 'Epic'
 *  BrowsedWorks:
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
 *             $ref: '#/definitions/WorkDetail'
 *           relationships:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                  relationshipTypeID:
 *                    type: number
 *                    example: 8
 *                  relationshipType:
 *                    type: string
 *                    example: 'Author'
 *
 */

/**
 *@swagger
 *'/work/{bbid}':
 *  get:
 *     tags:
 *       - Lookup Requests
 *     summary: Lookup Work by BBID
 *     description: Returns the basic details of the Work
 *     operationId: getWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Work
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Basic information of the Work entity
 *         schema:
 *             $ref: '#/definitions/WorkDetail'
 *       404:
 *         description: Work not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid',
	makeEntityLoader('Work', workBasicRelations, workError),
	async (req, res) => {
		const workBasicInfo = await getWorkBasicInfo(res.locals.entity);
		return res.status(200).send(workBasicInfo);
	});


/**
 *@swagger
 *  '/work/{bbid}/aliases':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Get list of aliases of a Work by BBID
 *      description: Returns the list of aliases of a Work
 *      operationId: getAliasesOfWorkByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Work
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: List of aliases with BBID of a Work entity
 *          schema:
 *              $ref: '#/definitions/Aliases'
 *        404:
 *          description: Work not found
 *        406:
 *          description: Invalid BBID
 */


router.get('/:bbid/aliases',
	makeEntityLoader('Work', utils.aliasesRelations, workError),
	async (req, res, next) => {
		const workAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(workAliasesList);
	});

/**
 *	@swagger
 * '/work/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of the Work by BBID
 *     description: Returns the list of identifiers of the Work
 *     operationId: getIdentifiersOfWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Work
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of the Work entity
 *         schema:
 *             $ref: '#/definitions/Identifiers'
 *       404:
 *         description: Work not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Work', utils.identifiersRelations, workError),
	async (req, res, next) => {
		const workIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(workIdentifiersList);
	});


/**
 *	@swagger
 * '/work/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of the Work by BBID
 *     description: Returns the list of relationships of the Work
 *     operationId: getRelationshipsOfWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Work
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of the Work entity
 *         schema:
 *             $ref: '#/definitions/Relationships'
 *       404:
 *         description: Work not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Work', utils.relationshipsRelations, workError),
	async (req, res, next) => {
		const workRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(workRelationshipList);
	});

/**
 *	@swagger
 * '/work':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Get list of Works which are related to an Edition or Author
 *     description: Returns the list of Author, When one of the bbid of Edition or Author is passed as query parameter
 *     operationId: getRelatedWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: author
 *         in: query
 *         description: BBID of the Author
 *         required: false
 *         type: bbid
 *       - name: edition
 *         in: query
 *         description: BBID of the Edition
 *         required: false
 *         type: bbid
 *     responses:
 *       200:
 *         description: List of Works which are related to either Author or Edition
 *         schema:
 *             $ref: '#/definitions/BrowsedAuthors'
 *       404:
 *         description: Author not found or Edition not found
 *       406:
 *         description: Invalid BBID paased in query params
 */

router.get('/',
	validateWorkBrowseRequest,
	makeEntityLoader('modelNmae', utils.relationshipsRelations, 'Entity not found', true),
	loadEntityRelationshipsForBrowse(),
	async (req, res, next) => {
		const workRelationshipList = await utils.getBrowsedRelationships(req.app.locals.orm, res.locals, 'Work', getWorkBasicInfo);
		return res.status(200).send({
			bbid: req.query.bbid,
			relatedWorks: workRelationshipList
		});
	});

export default router;
