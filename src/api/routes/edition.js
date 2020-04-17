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

import {aliasesRelations, identifiersRelations, relationshipsRelations} from '../helpers/utils';
import {getEditionBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
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
	makeEntityLoader('Edition', aliasesRelations, editionError),
	async (req, res) => {
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
	makeEntityLoader('Edition', identifiersRelations, editionError),
	async (req, res) => {
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
	makeEntityLoader('Edition', relationshipsRelations, editionError),
	async (req, res) => {
		const editionRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(editionRelationshipList);
	});

export default router;
