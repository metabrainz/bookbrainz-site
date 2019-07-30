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
import {getEditionGroupBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
import _ from 'lodash';
import express from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = express.Router();

const editionGroupBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'editionGroupType'
];

const editionGroupError = 'Edition-Group not found';

/**
 *@swagger
 *definitions:
 *  editionGroupDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: 'ba446064-90a5-447b-abe5-139be547da2e'
 *      defaultAlias:
 *        $ref: '#/definitions/defaultAlias'
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
 *      summary: Lookup Edtiotn Group by bbid
 *      description: Returns the basic details an Edition Group
 *      operationId: getEditionGroupByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of Edition Group
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Basic information of an Edition Group entity
 *          schema:
 *              $ref: '#/definitions/editionGroupDetail'
 *        404:
 *          description: Edition Group not found
 *
 */

router.get('/:bbid',
	makeEntityLoader('EditionGroup', editionGroupBasicRelations, editionGroupError),
	async (req, res, next) => {
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
 *             $ref: '#/definitions/aliases'
 *       404:
 *         description: Edition Group not found
 */

router.get('/:bbid/aliases',
	makeEntityLoader('EditionGroup', aliasesRelation, editionGroupError),
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
 *     summary: Get list of identifiers of an edition group by BBID
 *     description: Returns the list of identifiers of an edition group
 *     operationId: getIdentifiersOfEditionGroupByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the edition group
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of an edition group entity
 *         schema:
 *             $ref: '#/definitions/identifiers'
 *       404:
 *         description: Edition Group not found
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('EditionGroup', identifiersRelation, editionGroupError),
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
 *     summary: Get list of relationships of an edition group by BBID
 *     description: Returns the list of relationships of an edition group
 *     operationId: getRelationshipsOfEditionGroupByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the edition group
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of an edition group entity
 *         schema:
 *             $ref: '#/definitions/relationships'
 *       404:
 *         description: Edition Group not found
 */

router.get('/:bbid/relationships',
	makeEntityLoader('EditionGroup', relationshipsRelation, editionGroupError),
	async (req, res, next) => {
		const editionGroupRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(editionGroupRelationshipList);
	});

export default router;
