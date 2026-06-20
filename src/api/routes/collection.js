import express from 'express';
import {getFormattedCollection} from '../helpers/formatCollectionData';
import {makeCollectionLoader} from '../helpers/collectionLoader';


const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CollectionDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The unique identifier of the collection
 *         name:
 *           type: string
 *           description: The name of the collection
 *         description:
 *           type: string
 *           description: A description of the collection
 *         entityType:
 *           type: string
 *           description: The type of entities in the collection (e.g., Edition, Work, Author)
 *         public:
 *           type: boolean
 *           description: Whether the collection is publicly visible
 *         owner:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: The unique identifier of the collection owner
 *             name:
 *               type: string
 *               description: The username of the collection owner
 *             metabrainzUserId:
 *               type: integer
 *               description: The MetaBrainz user ID of the collection owner
 *         items:
 *           type: array
 *           description: The items in the collection
 *           items:
 *             type: object
 */

/**
 * @swagger
 * '/collection/{collectionId}':
 *    get:
 *      tags:
 *        - Lookup Requests
 *      summary: Lookup Collection by collectionId
 *      description: Returns the basic details of a Collection
 *      operationId: getCollectionById
 *      parameters:
 *        - name: collectionId
 *          in: path
 *          description: Id of the Collection
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Basic information of a Collection
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/CollectionDetail'
 *        404:
 *          description: Collection not found
 *        400:
 *          description: Invalid collectionId
 */

router.get('/:collectionId', makeCollectionLoader(), async (req, res) => {
	const collectionInfo = await getFormattedCollection(res.locals.collection);
	return res.status(200).send(collectionInfo);
});

export default router;
