/* eslint-disable */

import _ from 'lodash';




export async function getWorkFromDB(req, relations) {	
	const {orm} = req.app.locals;
	const {Work} = orm;

	const workPromise =  Work.forge({bbid: req.params.bbid})
		.fetch({withRelated: relations})

	const workData = await Promise.resolve(workPromise)

	return workData;
}
