/* eslint-disable */


import express from 'express';
import {getEntityBasicInfo} from '../../common/queries/work';


const router = express.Router();


function middleware(req, res, next) {
	next();
}

router.get('/:bbid', middleware, async (req, res) => {
	const work = await getEntityBasicInfo(req); // example params
	return res.send(work);
});

export default router;
