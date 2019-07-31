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

import authorRouter from './routes/author';
import editionGroupRouter from './routes/edition-group';
import editionRouter from './routes/edition';
import publisherRouter from './routes/publisher';
import workRouter from './routes/work';


/**
 *@swagger
 *definitions:
 *  DefaultAlias:
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
 *  Aliases:
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
 *  Identifiers:
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
 *  Relationships:
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
 *              format: uuid
 *              example: '4682cf09-66fb-4542-b457-b889117e0279'
 *            targetEntityType:
 *              type: string
 *              example: 'work'
 */

function initWorkRoute(app) {
	app.use('/work', workRouter);
}

function initEditionRoute(app) {
	app.use('/edition', editionRouter);
}

function initEditionGroupRoute(app) {
	app.use('/edition-group', editionGroupRouter);
}

function initAuthorRoute(app) {
	app.use('/author', authorRouter);
}

function initPublishetRouter(app) {
	app.use('/publisher', publisherRouter);
}


function initRoutes(app) {
	initWorkRoute(app);
	initEditionRoute(app);
	initEditionGroupRoute(app);
	initAuthorRoute(app);
	initPublishetRouter(app);
}

export default initRoutes;
