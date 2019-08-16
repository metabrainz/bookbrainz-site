
import * as commonUtils from '../../common/helpers/utils';
import _ from 'lodash';


/* eslint-disable*/

export function loadEntityRelationshipsForBrowse() {
	console.log('loadEntityRelationshipsForBrowse');
	
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		const {RelationshipSet} = orm;
		const bbid = req.query.work;
		console.log('called loadEntityRelationshipsForBrowse' + bbid);

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
			res.locals.relationships = relationshipSet.related('relationships').toJSON();
			console.log(res.locals.relationships);

			return next();
		}
		catch (error) {
			// What do we do with the error here?
			return next(error);
		}
	}
}


export async function getBrowsedRelationships(locals, browsedEntityType, getEntityInfoMethod) {
	const entity = locals.entity;
	const relationships = locals.relationships;
	console.log('getBrowsedRelationships called');

	const filteredRelationships = await relationships
		.map(relationship => {
			console.log(relationship);
			// Current entity is the source of the relationship
			if (entity.bbid === relationship.sourceBbid) {
				console.log('condition 1');
				
				// The other entity is of the browsed type we are looking for
				// We need a good way to compare entity type strings here and same thing below
				// Allow for capitalization mistakes? (.toLowercase() on both?)
				if (relationship.targetEntityType === browsedEntityType) {
					return {
						entity: relationship.target,
						relationships: [{
							relationshipTypeID: _.get(relationship, 'type.id', null),
							relationshipType: _.get(relationship, 'type.label', null)
						}]
					};
				}
			}
			// Current entity is the target of the relationship
			// and the other entity is of the browsed type we are looking for
			else if (relationship.source.type === browsedEntityType) {
				return {
					entity: relationship.source,
					relationships: [{
						relationshipTypeID: _.get(relationship, 'type.id', null),
						relationshipType: _.get(relationship, 'type.label', null)
					}]
				};
			}
			return null;
		})
		// Remove falsy values (nulls returned above)
		.filter(Boolean);

	const flattenedRelationships = await filteredRelationships
		.reduce((accumulator, relationship, index, array) => {
			const entityAlreadyExists = accumulator.find(rel => rel.entity.bbid === relationship.entity.bbid);
			if (entityAlreadyExists) {
				entityAlreadyExists.relationships.push(...relationship.relationships);
			}
			else {
				accumulator.push(relationship);
			}
			return accumulator;
		}, []);

	return flattenedRelationships;
}

