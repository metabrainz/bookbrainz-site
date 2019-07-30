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
import {getEntityAliases, getEntityIdentifiers, getEntityRelationships, getWorkBasicInfo} from '../helpers/formatEntityData';
import _ from 'lodash';
import express from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = express.Router();

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
 *  workDetail:
 *    type: object
 *    properties:
 *      bbid:
 *        type: string
 *        format: uuid
 *        example: ba446064-90a5-447b-abe5-139be547da2e
 *      defaultAlias:
 *        $ref: '#/definitions/defaultAlias'
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
 *
 */

/**
 *@swagger
 *'/work/{bbid}':
 *  get:
 *     tags:
 *       - Lookup Requests
 *     summary: Lookup Work by BBID
 *     description: Returns the basic details of the owrk
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
 *         description: Basic information of the work entity
 *         schema:
 *             $ref: '#/definitions/workDetail'
 *       404:
 *         description: Work not found
 */

router.get('/:bbid',
	makeEntityLoader('Work', workBasicRelations, workError),
	async (req, res, next) => {
		const workBasicInfo = await getWorkBasicInfo(res.locals.entity);
		return res.status(200).send(workBasicInfo);
	});


/**
 *@swagger
 *  '/work/{bbid}/aliases':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Get list of aliases of work by bbid
 *      description: Returns the list of aliases of a work
 *      operationId: getAliasesOfWorkByBbid
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the work
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: List of aliases with bbid of a work entity
 *          schema:
 *              $ref: '#/definitions/aliases'
 *        404:
 *          description: Work not found
 */


router.get('/:bbid/aliases',
	makeEntityLoader('Work', aliasesRelation, workError),
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
 *     summary: Get list of identifiers of the work by BBID
 *     description: Returns the list of identifiers of the work
 *     operationId: getIdentifiersOfWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the work
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of the work entity
 *         schema:
 *             $ref: '#/definitions/identifiers'
 *       404:
 *         description: Work not found
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Work', identifiersRelation, workError),
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
 *     summary: Get list of relationships of the work by BBID
 *     description: Returns the list of relationships of the work
 *     operationId: getRelationshipsOfWorkByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the work
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: List of relationships with BBID of the work entity
 *         schema:
 *             $ref: '#/definitions/relationships'
 *       404:
 *         description: Work not found
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Work', relationshipsRelation, workError),
	async (req, res, next) => {
		const workRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(workRelationshipList);
	});

export default router;
