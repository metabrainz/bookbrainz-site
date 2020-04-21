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
import {getEntityAliases, getEntityIdentifiers, getEntityRelationships, getPublisherBasicInfo} from '../helpers/formatEntityData';
import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = Router();

const publisherBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'publisherType',
	'area'
];

const publisherError = 'Publisher not found';

/**
 *@swagger
 *definitions:
 *  PublisherDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: 'e418874e-5684-4fe9-9d2d-1b7e5d43fd59'
 *      area:
 *        type: string
 *        example: 'India'
 *      beginDate:
 *        type: string
 *        example: '1943'
 *      defaultAlias:
 *        $ref: '#/definitions/Alias'
 *      disambiguation:
 *        type: string
 *        example: 'Bharati Bhawan'
 *      endDate:
 *        type: string
 *        example:
 *      ended:
 *        type: boolean
 *        example: false
 *      gender:
 *        type: string
 *        example: 'Male'
 *      type:
 *        type: string
 *        example: 'Publisher'
 */


/**
 *
 *@swagger
 * '/publisher/{bbid}':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Lookup Publisher by BBID
 *      description: Returns the basic details of the Publisher
 *      operationId: getPublisherByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Publisher
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Basic information of the Publisher entity
 *          schema:
 *              $ref: '#/definitions/PublisherDetail'
 *        404:
 *          description: Publisher not found
 *        406:
 *          description: Invalid BBID
 */

router.get('/:bbid',
	makeEntityLoader('Publisher', publisherBasicRelations, publisherError),
	async (req, res) => {
		const publisherBasicInfo = await getPublisherBasicInfo(res.locals.entity);
		return res.status(200).send(publisherBasicInfo);
	});

/**
 *@swagger
 *  '/publisher/{bbid}/aliases':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Get list of aliases of the Publisher by BBID
 *      description: Returns the list of aliases of the Publisher
 *      operationId: getAliasesOfPublisherByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Publisher
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: List of aliases with BBID of the Publisher
 *          schema:
 *              $ref: '#/definitions/Aliases'
 *        404:
 *          description: Publisher not found
 *        406:
 *          description: Invalid BBID
 */
router.get('/:bbid/aliases',
	makeEntityLoader('Publisher', aliasesRelations, publisherError),
	async (req, res) => {
		const publisherAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(publisherAliasesList);
	});

/**
 *	@swagger
 * '/publisher/{bbid}/identifiers':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of identifiers of the Publisher by BBID
 *     description: Returns the list of identifiers of the Publisher
 *     operationId: getIdentifiersOfPublisherByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Publisher
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of the Publisher entity
 *         schema:
 *             $ref: '#/definitions/Identifiers'
 *       404:
 *         description: Publisher not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Publisher', identifiersRelations, publisherError),
	async (req, res) => {
		const publisherIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(publisherIdentifiersList);
	});

/**
 *	@swagger
 * '/publisher/{bbid}/relationships':
 *   get:
 *     tags:
 *       - Lookup Requests
 *     summary: Get list of relationships of the Publisher by BBID
 *     description: Returns the list of relationships of the Publisher
 *     operationId: getRelationshipsOfPublisherByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Publisher
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of the Publisher entity
 *         schema:
 *             $ref: '#/definitions/Relationships'
 *       404:
 *         description: Publisher not found
 *       406:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Publisher', relationshipsRelations, publisherError),
	async (req, res) => {
		const publisherRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(publisherRelationshipList);
	});

export default router;
