/* eslint-disable */

import _ from 'lodash';

export function getWorkBasicInfo(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: work.bbid,
			defaultAlias: work.defaultAlias,
			disambiguation: work.disambiguation ?
				work.disambiguation.comment : null,
			languages: work.languageSet ?
                work.languageSet.languages.map((language) => language.name) : null,
            workType: work.typeId,
			entityType: work.type ? work.type : null
		};
}

export function getWorkAliases(work: object) {
    
    return _.isNil(work) ? null :
        {
            bbid: work.bbid,
            aliases: work.aliasSet.aliases.map( (alias) => {
                return {
                    name: alias.name,
                    sortName: alias.sortName,
                    aliasLanguage: alias.languageId,
                    primary: alias.primary
                }
            })
        }
}

export function getWorkIdentifiers(work: object) {
    return _.isNil(work) ? null :
        {
            bbid: work.bbid,
            identifiers: work.identifierSet.identifiers.map( (identifier) => {
                return {
                    type: identifier.typeId,
                    value: identifier.value
                }
            })
        }
    
}