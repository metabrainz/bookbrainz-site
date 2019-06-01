/* eslint-disable */


import express from 'express';
import {getWorkFromDB} from '../../common/queries/work';
import {getWorkBasicInfo} from '../helpers/formatWorkData';
import _ from 'lodash';

const router = express.Router();


router.get('/:bbid', async (req, res, next) => {
	const work = await getWorkFromDB(req); // example params
	if(_.isNil(work)) {
		return res.status(404).send({message: 'This Work is not founded'});
	} else {
		const workBasicInfo = getWorkBasicInfo(work.toJSON());
		return res.status(200).send(workBasicInfo);
	}
});

export default router;
