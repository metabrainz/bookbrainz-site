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
import log from 'log';


/* eslint-disable*/

export function validateAuthorBrowseRequest (req, res, next) {
	const workBbid = req.query['work'];
	const editionBbid = req.query['edition'];
	console.log(req.query);
	
	if (workBbid) {
		req.query.bbid = workBbid;
		req.query.modelType = 'Work';
	} 
	else if (editionBbid) {
		req.query.bbid = editionBbid;
		req.query.modelType = 'Edition';
	}
	next();
}

export function validateWorkBrowseRequest (req, res, next) {
	const authorBbid = req.query['author'];
	const editionBbid = req.query['edition'];	
	if (authorBbid) {
		req.query.bbid = authorBbid;
		req.query.modelType = 'Author';
	} 
	else if (editionBbid) {
		req.query.bbid = editionBbid;
		req.query.modelType = 'Edition';
	}
	next();
}

async function loadEntitty (orm, relEntity) {	
	const model = commonUtils.getEntityModelByType(orm, relEntity.type);
	const entity = await  model.forge({bbid: relEntity.bbid})
					.fetch({withRelated: ['defaultAlias']});
	return entity.toJSON();
}

export function loadEntityRelationshipsForBrowse() {
	
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		const {RelationshipSet} = orm;
		const bbid = req.query.bbid;
		const entityData = res.locals.entity;		
		try {
			const relationshipSet = await RelationshipSet.forge({id: entityData.relationshipSetId})
				.fetch({
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
	}
}


