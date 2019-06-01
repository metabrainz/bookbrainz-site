/* eslint-disable */

import _ from 'lodash';

export function getWorkBasicInfo(entity) {
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