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


import * as commonUtils from '../../common/helpers/utils';
import _ from 'lodash';


export function validateBrowseRequestQueryParameters(validLinkedEntities) {
	// eslint-disable-next-line consistent-return
	return (req, res, next) => {
		const queriedEntities = validLinkedEntities.filter(keyName => _.has(req.query, keyName));

		if (queriedEntities.length < 1 || queriedEntities.length > 1) {
			const errorMessage =
				`Browse requests require exactly 1 linked entity in query parameters; you passed ${queriedEntities.length}: ${queriedEntities}`;
			return res.status(400).send({message: errorMessage});
		}
		const queriedEntityType = queriedEntities[0];
		req.query.bbid = req.query[queriedEntityType];
		req.query.modelType = _.upperFirst(_.camelCase(queriedEntityType));
		next();
	};
}

export async function loadEntity(orm, relEntity, fetchRelated) {
	const model = commonUtils.getEntityModelByType(orm, relEntity.type);
	try {
		const entity = await model.forge({bbid: relEntity.bbid})
			.fetch({require: true, withRelated: ['defaultAlias', 'disambiguation'].concat(fetchRelated || [])});
		return entity.toJSON();
	}
	catch (error) {
		return null;
	}
}

export function loadEntityRelationshipsForBrowse() {
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		const {RelationshipSet} = orm;
		const entityData = res.locals.entity;
		try {
			const relationshipSet = await RelationshipSet.forge({id: entityData.relationshipSetId})
				.fetch({
					require: false,
					withRelated: [
						'relationships.source',
						'relationships.target',
						'relationships.type'
					]
				});
			res.locals.relationships = relationshipSet ? relationshipSet.related('relationships').toJSON() : [];

			return next();
		}
		catch (error) {
			// What do we do with the error here?
			return next(error);
		}
	};
}

export function formatQueryParameters() {
	return (req, res, next) => {
		req.query = _.mapKeys(req.query, (value, key) => _.toLower(key));
		return next();
	};
}
