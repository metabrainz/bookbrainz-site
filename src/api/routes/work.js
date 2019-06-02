/* eslint-disable */


import express from 'express';
import {getWorkFromDB} from '../../common/queries/work';
import {getWorkBasicInfo, getWorkAliases, getWorkIdentifiers} from '../helpers/formatWorkData';
import _ from 'lodash';

const router = express.Router();


router.get('/:bbid', async (req, res, next) => {
	const params = ['defaultAlias', 'languageSet.languages', 'disambiguation'];
	const work = await getWorkFromDB(req, params); // example params
	if(_.isNil(work)) {
		return res.status(404).send({message: 'This Work is not founded'});
	} else {
		const workBasicInfo = getWorkBasicInfo(work.toJSON());
		return res.status(200).send(workBasicInfo);
	}
});

router.get('/:bbid/aliases', async (req, res, next) => {
	const params = ['aliasSet.aliases'];
	const workWithAliases = await getWorkFromDB(req, params)
	if(_.isNil(workWithAliases.aliasSet)) {
		return res.status(404).send({message: 'This Work is not founded'});
	} else {
		const workAliasesList = getWorkAliases(workWithAliases.toJSON());
		return res.status(200).send(workAliasesList);
	}
})

router.get('/:bbid/identifiers', async (req, res, next) => {
	const params = ['identifierSet.identifiers'];
	const workWithIdentifiers = await getWorkFromDB(req, params)
	if(_.isNil(workWithIdentifiers.identifierSet)) {
		return res.status(404).send({message: 'No identifiers are founded for this work'});
	} else {
		const workIdentifiersList = getWorkIdentifiers(workWithIdentifiers.toJSON());
		return res.status(200).send(workIdentifiersList);
	}
})

export default router;
