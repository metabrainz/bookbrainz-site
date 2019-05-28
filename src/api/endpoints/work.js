/* eslint-disable */


import express from 'express';
import {getEntityBasicInfo} from '../../common/queries/work';


const router = express.Router();


function middleware(req, res, next) {
	//console.log('middleware called');
	next();
}

router.get('/:bbid', middleware, async (req, res) => {
	//console.log(req.params.bbid);
	const work = await getEntityBasicInfo('entityTpye', 'bbid'); // example params
	return res.send(work);
});

export default router;
