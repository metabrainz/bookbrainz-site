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

import {getWorkAliases, getWorkBasicInfo, getWorkIdentifiers} from '../helpers/formatWorkData';
import _ from 'lodash';
import express from 'express';
import {getWorkFromDB} from '../../common/queries/work';


const router = express.Router();

router.get('/:bbid', async (req, res, next) => {
	const params = ['defaultAlias', 'languageSet.languages', 'disambiguation'];
	const work = await getWorkFromDB(req, params);
	if (_.isNil(work)) {
		return res.status(404).send({message: 'This Work is not founded'});
	}
	const workBasicInfo = getWorkBasicInfo(work.toJSON());
	return res.status(200).send(workBasicInfo);
});

router.get('/:bbid/aliases', async (req, res, next) => {
	const params = ['aliasSet.aliases'];
	const workWithAliases = await getWorkFromDB(req, params);
	if (_.isNil(workWithAliases.aliasSet)) {
		return res.status(404).send({message: 'This Work is not founded'});
	}
	const workAliasesList = getWorkAliases(workWithAliases.toJSON());
	return res.status(200).send(workAliasesList);
});

router.get('/:bbid/identifiers', async (req, res, next) => {
	const params = ['identifierSet.identifiers'];
	const workWithIdentifiers = await getWorkFromDB(req, params);
	if (_.isNil(workWithIdentifiers.identifierSet)) {
		return res.status(404).send({message: 'No identifiers are founded for this work'});
	}
	const workIdentifiersList = getWorkIdentifiers(workWithIdentifiers.toJSON());
	return res.status(200).send(workIdentifiersList);
});

export default router;
