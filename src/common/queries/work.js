/* eslint-disable */

import _ from 'lodash';




export async function getWorkFromDB(req, params) {	
	const {orm} = req.app.locals;
	const {Work} = orm;

	const workPromise =  Work.forge({bbid: req.params.bbid})
		.fetch({withRelated: params})

	const workData = await Promise.resolve(workPromise)

	return workData;
}
