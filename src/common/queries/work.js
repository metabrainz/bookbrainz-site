/* eslint-disable */

import _ from 'lodash';


function filterData(entity) {
	return _.isNil(entity) ? null :
		{
			bbid: entity.bbid,
			defaultAlias: entity.defaultAlias,
			disambiguation: entity.disambiguation ?
				entity.disambiguation.comment : null,
			languages: entity.languageSet ? entity.languageSet : null,
			entityType: entity.type ? entity.type : null
		};
}

export async function getEntityBasicInfo(req) {
	const {orm} = req.app.locals;
	const {Work} = orm;
	const workPromise =  Work.forge({bbid: req.params.bbid})
		.fetch({withRelated: ['defaultAlias', 'languageSet']})
		.then((data) => filterData(data.toJSON()));

	const workData = await Promise.resolve(workPromise)
	return workData;
}
