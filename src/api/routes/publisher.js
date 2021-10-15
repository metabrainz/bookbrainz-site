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

import {
	formatQueryParameters,
	loadEntityRelationshipsForBrowse,
	validateBrowseRequestQueryParameters
} from '../helpers/middleware';
import {
	getEntityAliases,
	getEntityIdentifiers,
	getEntityRelationships,
	getPublisherBasicInfo
} from '../helpers/formatEntityData';

import {Router} from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';
import {toLower} from 'lodash';


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
 *components:
 *  schemas:
 *    PublisherDetail:
 *      type: object
 *      properties:
 *        bbid:
 *          type: string
 *          format: uuid
 *          example: 'e418874e-5684-4fe9-9d2d-1b7e5d43fd59'
 *        area:
 *          type: string
 *          example: 'India'
 *        beginDate:
 *          type: string
 *          example: '1943'
 *        defaultAlias:
 *          $ref: '#/components/schemas/Alias'
 *        disambiguation:
 *          type: string
 *          example: 'Bharati Bhawan'
 *        endDate:
 *          type: string
 *          example:
 *        ended:
 *          type: boolean
 *          example: false
 *        type:
 *          type: string
 *          example: 'Publisher'
 *    BrowsedPublishers:
 *     type: object
 *     properties:
 *       bbid:
 *         type: string
 *         format: uuid
 *         example: 'f94d74ce-c748-4130-8d59-38b290af8af3'
 *       publishers:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             entity:
 *               $ref: '#/components/schemas/PublisherDetail'
 *             relationships:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                    relationshipTypeID:
 *                      type: number
 *                      example: 4
 *                    relationshipType:
 *                      type: string
 *                      example: 'Publisher'
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
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Publisher
 *          required: true
 *          schema:
 *            type: string
 *            format: uuid
 *      responses:
 *        200:
 *          description: Basic information of the Publisher entity
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PublisherDetail'
 *        404:
 *          description: Publisher not found
 *        400:
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
 *      parameters:
 *        - name: bbid
 *          in: path
 *          description: BBID of the Publisher
 *          required: true
 *          schema:
 *            type: string
 *            format: uuid
 *      responses:
 *        200:
 *          description: List of aliases with BBID of the Publisher
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Aliases'
 *        404:
 *          description: Publisher not found
 *        400:
 *          description: Invalid BBID
 */
router.get('/:bbid/aliases',
	makeEntityLoader('Publisher', utils.aliasesRelations, publisherError),
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
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Publisher
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of identifiers with BBID of the Publisher entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Identifiers'
 *       404:
 *         description: Publisher not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/identifiers',
	makeEntityLoader('Publisher', utils.identifiersRelations, publisherError),
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
 *     parameters:
 *       - name: bbid
 *         in: path
 *         description: BBID of the Publisher
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of relationships with BBID of the Publisher entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Relationships'
 *       404:
 *         description: Publisher not found
 *       400:
 *         description: Invalid BBID
 */

router.get('/:bbid/relationships',
	makeEntityLoader('Publisher', utils.relationshipsRelations, publisherError),
	async (req, res) => {
		const publisherRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(publisherRelationshipList);
	});

/**
 *	@swagger
 * '/publisher':
 *   get:
 *     tags:
 *       - Browse Requests
 *     summary: Gets a list of Publishers which are related to another Entity
 *     description: BBID of an Author or an Edition or an EditionGroup or a Publisher or a Series is passed as a query parameter, and its related Publishers are fetched
 *     operationId: getRelatedPublisherByBbid
 *     parameters:
 *       - name: author
 *         in: query
 *         description: BBID of the corresponding Author
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
 *       - name: publisher
 *         in: query
 *         description: BBID of the corresponding Publisher
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
 *       - name: work
 *         in: query
 *         description: BBID of the corresponding Work
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: type
 *         in: query
 *         description: filter by Publisher type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [publisher, distributor, imprint]
 *       - name: area
 *         in: query
 *         description: filter by Publisher area
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of Publisher related to another Entity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BrowsedPublishers'
 *       404:
 *         description: Author/Edition/Series/Work/Publisher (other entity) not found
 *       400:
 *         description: Invalid BBID passed in the query params OR Multiple browsed entities passed in parameters
 */

router.get('/',
	formatQueryParameters(),
	validateBrowseRequestQueryParameters(['author', 'edition', 'series', 'work', 'publisher']),
	(req, res, next) => {
		// As we're loading the browsed entity, also load the related Publishers from the ORM models to avoid fetching it twice
		let extraRelationships = [];
		if (req.query.modelType === 'Edition') {
			extraRelationships = publisherBasicRelations.map(rel => `publisherSet.publishers.${rel}`);
		}
		makeEntityLoader(null, utils.relationshipsRelations.concat(extraRelationships), 'Entity not found', true)(req, res, next);
	},
	loadEntityRelationshipsForBrowse(),
	async (req, res) => {
		function relationshipsFilterMethod(relatedEntity) {
			if (req.query.type) {
				const publisherTypeMatched = toLower(relatedEntity.publisherType) === toLower(req.query.type);
				if (req.query.area) {
					const publisherAreaMatched = toLower(relatedEntity.area) === toLower(req.query.area);
					return publisherTypeMatched && publisherAreaMatched;
				}
				return publisherTypeMatched;
			}
			else if (req.query.area) {
				return toLower(relatedEntity.area) === toLower(req.query.area);
			}

			return true;
		}

		const publisherRelationshipList = await utils.getBrowsedRelationships(
			req.app.locals.orm, res.locals, 'Publisher',
			getPublisherBasicInfo, publisherBasicRelations, relationshipsFilterMethod
		);

		if (req.query.modelType === 'Edition') {
			const {entity: edition} = res.locals;
			const publishers = edition.publisherSet ? edition.publisherSet.publishers : [];
			publishers.map(publisher => getPublisherBasicInfo(publisher))
				.filter(relationshipsFilterMethod)
				.forEach((filteredEdition) => {
					// added relationship to make the output consistent
					publisherRelationshipList.push({entity: filteredEdition, relationship: {}});
				});
		}
		return res.status(200).send({
			bbid: req.query.bbid,
			publishers: publisherRelationshipList
		});
	});

export default router;
