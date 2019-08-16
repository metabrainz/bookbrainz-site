
import * as commonUtils from '../../common/helpers/utils';
import _ from 'lodash';


// export function loadBrowseData() {
// 	return async (req, res, next) => {
// 		const {orm} = req.app.locals;
// 		const {RelationshipSet} = orm;
// 		const bbid = req.query.work;
// 		if (commonUtils.isValidBBID(bbid)) {
// 			try {
// 				const entityData = await orm.func.entity.getEntity(orm, 'Work', bbid, ['defaultAlias']);
// 				res.locals.entity = entityData;
// 				//console.log(entityData);
// 				const relationshipSet = await RelationshipSet.forge({id: entityData.relationshipSetId})
// 					.fetch({
// 						withRelated: [
// 							'relationships.source',
// 							'relationships.target',
// 							'relationships.type'
// 						]
// 					});
// 				const relationshipData = relationshipSet.related('relationships').toJSON();
// 				const relations = relationshipData.map((relation) => {
// 					const isSource = bbid === relation.source.bbid;
// 					// TODO: Get entity detail of
// 					return {
// 						//return entity details
// 					};
// 				});
// 				console.log(relationshipData);

// 				return next();
// 			}
// 			catch (err) {
// 				console.log(err);
// 				return res.status(404).send({message: 'Entity not found'});
// 			}
// 		}
// 		return res.status(406).send({message: 'BBID is not valid uuid'});
// 	};
// }

// Middleware to load relationships

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
				console.log('coundition 2');
				
				console.log(relationship);
				
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
			console.log('.reduce called');			
			const entityAlreadyExists = accumulator.find(rel => rel.entity.bbid === relationship.entity.bbid);
			console.log(entityAlreadyExists);
			
			if (entityAlreadyExists) {
				entityAlreadyExists.relationships.push(...relationship.relationships);
			}
			else {
				accumulator.push(relationship);
			}
			console.log(accumulator);

		}, []);

	console.log(flattenedRelationships);

	return flattenedRelationships;
}


// // My route here is probably wrong, I don't remember off the top of my mind
// router.get('/author?work=<bbid>',
// 	makeEntityLoader('Work', relationshipsRelations, workError),
// 	loadEntityRelationshipsForBrowse,
// 	async (req, res, next) => {
// 		const authorRelationshipList = await getBrowsedRelationships(res.locals, 'Author', getAuthorBasicInfo);
// 		return res.status(200).send(authorRelationshipList);
// 	}
// );
