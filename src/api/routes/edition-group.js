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

import {aliasesRelation, identifiersRelation} from '../helpers/utils';
import {getEditionGroupBasicInfo, getEntityAliases, getEntityIdentifiers} from '../helpers/formatEntityData';
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

router.get('/:bbid',
	makeEntityLoader('EditionGroup', editionGroupBasicRelations, editionGroupError),
	async (req, res, next) => {
		const editionGroupBasicInfo = await getEditionGroupBasicInfo(res.locals.entity);
		return res.status(200).send(editionGroupBasicInfo);
	});


router.get('/:bbid/aliases',
	makeEntityLoader('EditionGroup', aliasesRelation, editionGroupError),
	async (req, res, next) => {
		const editionAliasesList = await getEntityAliases(res.locals.entity);
		return res.status(200).send(editionAliasesList);
	});


router.get('/:bbid/identifiers',
	makeEntityLoader('EditionGroup', identifiersRelation, editionGroupError),
	async (req, res, next) => {
		const editionGroupIdentifiersList = await getEntityIdentifiers(res.locals.entity);
		return res.status(200).send(editionGroupIdentifiersList);
	});

export default router;
