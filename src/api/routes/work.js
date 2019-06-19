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

router.get('/:bbid',
	makeEntityLoader('Work', workBasicRelations, workError),
	async (req, res, next) => {
		const workBasicInfo = await getWorkBasicInfo(res.locals.entity);
		return res.status(200).send(workBasicInfo);
	});


router.get('/:bbid/aliases',
	makeEntityLoader('Work', aliasesRelation, workError),
	async (req, res, next) => {
		const workAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(workAliasesList);
	});


router.get('/:bbid/identifiers',
	makeEntityLoader('Work', identifiersRelation, workError),
	async (req, res, next) => {
		const workIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(workIdentifiersList);
	});

router.get('/:bbid/relationships',
	makeEntityLoader('Work', relationshipsRelation, workError),
	async (req, res, next) => {
		const workRelationshipList = await getEntityRelationships(res.locals.entity);
		return res.status(200).send(workRelationshipList);
	});

export default router;
