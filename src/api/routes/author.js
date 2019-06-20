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
import {getAuthorBasicInfo, getEntityAliases, getEntityIdentifiers, getEntityRelationships} from '../helpers/formatEntityData';
import _ from 'lodash';
import express from 'express';
import {makeEntityLoader} from '../helpers/entityLoader';


const router = express.Router();

const authorBasicRelations = [
	'defaultAlias.language',
	'disambiguation',
	'authorType',
	'gender',
	'beginArea',
	'endArea'
];

const authorError = 'Author not found';

router.get('/:bbid',
	makeEntityLoader('Author', authorBasicRelations, authorError),
	async (req, res, next) => {
		const authorBasicInfo = await getAuthorBasicInfo(res.locals.entity);
		return res.status(200).send(authorBasicInfo);
	});


router.get('/:bbid/aliases',
	makeEntityLoader('Author', aliasesRelation, authorError),
	async (req, res, next) => {
		const authorAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(authorAliasesList);
	});


router.get('/:bbid/identifiers',
	makeEntityLoader('Author', identifiersRelation, authorError),
	async (req, res, next) => {
		const authorIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(authorIdentifiersList);
	});

router.get('/:bbid/relationships',
	makeEntityLoader('Author', relationshipsRelation, authorError),
	async (req, res, next) => {
		const authorRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(authorRelationshipList);
	});

export default router;
