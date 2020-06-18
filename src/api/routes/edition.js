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
	getEditionBasicInfo,
	getEntityAliases,
	getEntityIdentifiers,
	getEntityRelationships
} from '../helpers/formatEntityData';
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
 *        400:
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
 *       400:
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
 *       400:
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
 *       400:
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
 *     summary: Gets a list of Editions related to another Entity
 *     description: BBID of an Author or an Edition or an EditionGroup or a Publisher or a Work is passed as query parameter and its related Editions are fetched
 *     operationId: getRelatedEditionByBbid
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: author
 *         in: query
 *         description: BBID of the corresponding Author
 *         required: false
 *         type: bbid
 *       - name: edition
 *         in: query
 *         description: BBID of the corresponding Edition
 *         required: false
 *         type: bbid
 *       - name: edition-group
 *         in: query
 *         description: BBID of the corresponding Edition Group
 *         required: false
 *         type: bbid
 *       - name: publisher
 *         in: query
 *         description: BBID of the corresponding Publisher
 *         required: false
 *         type: bbid
 *       - name: work
 *         in: query
 *         description: BBID of the corresponding Work
 *         required: false
 *         type: bbid
 *       - name: format
 *         in: query
 *         description: filter by Edition format
 *         required: false
 *         type: string
 *         enum: [paperback, hardcover, ebook, library binding, audiobook]
 *       - name: language
 *         in: query
 *         description: filter by Edition language
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: List of Editions related to another Entity
 *         schema:
 *             $ref: '#/definitions/BrowsedEditions'
 *       404:
 *         description: author/edition/edition-group/publisher/work (other entity) not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['author', 'edition', 'edition-group', 'work', 'publisher']),
	(req, res, next) => {
		// As we're loading the browsed entity, also load the related Editions from the ORM models to avoid fetching it twice
		let extraRelationships = [];
		if (req.query.modelType === 'EditionGroup') {
			extraRelationships = editionBasicRelations.map(rel => `editions.${rel}`);
		}
		// Publisher().editions() is not a regular model relationship so we can't load it withRelated 'editions.xyz'
		// Consider rewriting the model method to use .through() (https://bookshelfjs.org/api.html#Model-instance-through)
		// Until then, we can't optimise this part and the Publisher will be loaded twice from DB
		// if (req.query.modelType === 'Publisher') {}

		makeEntityLoader(null, utils.relationshipsRelations.concat(extraRelationships), 'Entity not found', true)(req, res, next);
	},
	loadEntityRelationshipsForBrowse(),
	async (req, res, next) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.format) {
				const editionFormatMatched = _.toLower(relatedEntity.editionFormat) === _.toLower(req.query.format);
				if (req.query.language) {
					const editionLanguageMatched = relatedEntity.languages.includes(_.upperFirst(_.toLower(req.query.language)));
					return editionFormatMatched && editionLanguageMatched;
				}
				return editionFormatMatched;
			}
			else if (req.query.language) {
				const editionLanguageMatched = relatedEntity.languages.includes(_.upperFirst(_.toLower(req.query.language)));
				return editionLanguageMatched;
			}
			return true;
		}

		const editionRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'Edition',
			getEditionBasicInfo, editionBasicRelations, relationshipsFilterMethod
		);

		if (req.query.modelType === 'EditionGroup') {
			const {editions} = res.locals.entity;
			editions.map(edition => getEditionBasicInfo(edition))
				.filter(relationshipsFilterMethod)
				.forEach((filteredEdition) => {
					// added relationship to make the output consistent
					editionRelationshipList.push({entity: filteredEdition, relationship: {}});
				});
		}

		if (req.query.modelType === 'Publisher') {
			// Relationship between Edition and Publisher is defined differently than your normal relationship
			// See note above in middleware about refactoring Publisher().editions()
			const {Publisher} = req.app.locals.orm;
			const {bbid} = req.query;
			const editions = await new Publisher({bbid}).editions({withRelated: editionBasicRelations});
			const editionsJSON = editions.toJSON();
			editionsJSON.map(edition => getEditionBasicInfo(edition))
				.filter(relationshipsFilterMethod)
				.forEach((filteredEdition) => {
					// added relationship to make the output consistent
					editionRelationshipList.push({entity: filteredEdition, relationship: {}});
				});
		}

		return res.status(200).send({
			bbid: req.query.bbid,
			editions: editionRelationshipList
		});
	});

export default router;
