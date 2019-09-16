/* eslint-disable quotes */
/* eslint-disable no-console */
/*
 * Copyright (C) 2015-2016  Ben Ockmore
 *               2016       Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// @flow

import * as auth from '../helpers/auth';
import * as entityRoutes from './entity/entity';
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import * as utils from '../helpers/utils';

import {
	entityMergeMarkup,
	generateEntityMergeProps
} from '../helpers/entityRouteUtils';
import {escapeProps, generateProps} from '../helpers/props';

import Promise from 'bluebird';
import _ from 'lodash';
import express from 'express';
import renderRelationship from '../helpers/render';
import target from '../templates/target';


const router = express.Router();

const relations = [
	'aliasSet.aliases.language',
	'annotation.lastRevision',
	'defaultAlias',
	'disambiguation',
	'identifierSet.identifiers.type',
	'relationshipSet',
	'revision.revision'
];

function getEntityFetchPropertiesByType(entityType) {
	switch (entityType) {
		case 'Creator':
			return ['creatorType', 'beginArea', 'endArea', 'gender'];
		default:
			return [];
	}
}

function getEntitySectionByType(entity) {
	// switch(entity.type)
	return {
		beginArea: entityRoutes.areaToOption(entity.beginArea),
		beginDate: entity.beginDate,
		endArea: entityRoutes.areaToOption(entity.endArea),
		endDate: entity.endDate,
		ended: entity.ended,
		gender: entity.gender && entity.gender.id,
		type: entity.creatorType && entity.creatorType.id
	};
}


function entitiesToFormState(entities) {
	const aliases = entities.reduce((returnValue, entity) => {
		if (!_.isNil(entity.aliasSet) && Array.isArray(entity.aliasSet.aliases)) {
			return returnValue.concat(
				entity.aliasSet.aliases.map(({language, ...rest}) => ({
					language: language.id,
					...rest
				}))
			);
		}
		return returnValue;
	}, []);
	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(aliases);
	const defaultAlias = aliases.splice(defaultAliasIndex, 1)[0];

	const aliasEditor = {};
	const aliasPropsComparator = ['name', 'sortName', 'language', 'primary'];
	aliases.forEach((alias) => {
		// Filter out aliases that are the same as defaultAlias
		if (defaultAlias &&
			!_.isEqual(
				_.pick(alias, aliasPropsComparator),
				_.pick(defaultAlias, aliasPropsComparator)
			)
		) {
			aliasEditor[alias.id] = alias;
		}
	});

	const nameSection = _.isNil(defaultAlias) ? {
		disambiguation: null,
		language: null,
		name: '',
		sortName: ''
	} : defaultAlias;
	const hasDisambiguation = _.find(entities, 'disambiguation');
	nameSection.disambiguation = hasDisambiguation &&
		hasDisambiguation.disambiguation &&
		hasDisambiguation.disambiguation.comment;

	const identifiers = entities.reduce((returnValue, entity) => {
		if (entity.identifierSet) {
			const mappedIdentifiers = entity.identifierSet.identifiers.map(
				({type, ...rest}) => ({
					type: type.id,
					...rest
				})
			);
			return returnValue.concat(mappedIdentifiers);
		}
		return returnValue;
	}, []);

	const identifierEditor = {};
	const uniqueIdentifiers = _.uniqWith(identifiers, (identifierA, identifierB) =>
		identifierA.type === identifierB.type && identifierA.value === identifierB.value);
	uniqueIdentifiers.forEach((identifier) => {
		identifierEditor[identifier.id] = identifier;
	});
	const entityTypeSection = getEntitySectionByType(entities[0]);

	const relationshipSection = {
		canEdit: false,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};
	const type = entities[0].type.toLowerCase();

	const relationships = entities.reduce((returnValue, entity) => {
		if (entity.relationships) {
			return returnValue.concat(entity.relationships);
		}
		return returnValue;
	}, []);
	relationships.forEach((relationship) => (
		relationshipSection.relationships[relationship.id] = {
			relationshipType: relationship.type,
			rendered: relationship.rendered,
			rowID: relationship.id,
			sourceEntity: relationship.source,
			targetEntity: relationship.target
		}
	));
	const props = {
		aliasEditor,
		identifierEditor,
		nameSection,
		relationshipSection
	};
	props[`${type}Section`] = entityTypeSection;
	return props;
}

function loadEntityRelationships(entity, orm, transacting): Promise {
	const {RelationshipSet} = orm;

	if (!entity.relationshipSetId) {
		return null;
	}

	return RelationshipSet.forge({id: entity.relationshipSetId})
		.fetch({
			transacting,
			withRelated: [
				'relationships.source',
				'relationships.target',
				'relationships.type'
			]
		})
		.then((relationshipSet) => {
			entity.relationships = relationshipSet ?
				relationshipSet.related('relationships').toJSON() : [];

			function getEntityWithAlias(relEntity) {
				const model = utils.getEntityModelByType(orm, relEntity.type);

				return model.forge({bbid: relEntity.bbid})
					.fetch({withRelated: 'defaultAlias'});
			}

			/**
			 * Source and target are generic Entity objects, so until we have
			 * a good way of polymorphically fetching the right specific entity,
			 * we need to fetch default alias in a somewhat sketchier way.
			 */
			return Promise.map(
				entity.relationships,
				(relationship) => Promise.join(
					getEntityWithAlias(relationship.source),
					getEntityWithAlias(relationship.target),
					(relationshipSource, relationshipTarget) => {
						relationship.source = relationshipSource.toJSON();
						relationship.target = relationshipTarget.toJSON();

						return relationship;
					}
				)
			);
		})
		.then((relationships) => {
			// Set rendered relationships on relationship objects
			relationships.forEach((relationship) => {
				relationship.rendered = renderRelationship(relationship);
			});

			return entity;
		});
}

async function getEntityByBBID(orm, transacting, bbid) {
	if (utils.isValidBBID(bbid)) {
		const entityHeader = await orm.Entity.forge({bbid}).fetch({transacting});
		const entityType = entityHeader.get('type');
		const model = utils.getEntityModelByType(orm, entityType);
		// .concat(additionalRels);

		return model.forge({bbid})
			.fetch({
				require: true,
				transacting,
				withRelated: relations.concat(getEntityFetchPropertiesByType(entityType))
			})
			.then(async (entity) => {
				const entityJSON = entity.toJSON();
				try {
					await loadEntityRelationships(entityJSON, orm, transacting);
				}
				catch (error) {
					// eslint-disable-next-line no-console
					console.error(error);
				}
				return entityJSON;
			})
			.catch(error => {
				throw error;
			});
	}
	return null;
}

// function mergeOptions(targetObject, sourceEntity, level = 0) {
// 	Object.keys(sourceEntity).forEach(key => {
// 		if (_.isNil(sourceEntity[key])) {
// 			return null;
// 		}
// 		// if (key === 'nameSection' && !_.isEqual(targetObject[key], sourceEntity[key])) {
// 		if (key === 'nameSection') {
// 			targetObject[key] = (targetObject[key] || []).concat(sourceEntity[key]);
// 			// targetObject[key][sourceEntity[key].id] = sourceEntity[key];
// 			return null;
// 		}
// 		if (_.isPlainObject(sourceEntity[key]) && level === 0) {
// 			targetObject[key] = mergeOptions(targetObject[key] || {}, sourceEntity[key], level + 1);
// 			return null;
// 		}
// 		if (_.isNil(targetObject[key])) {
// 			targetObject[key] = sourceEntity[key];
// 			return null;
// 		}
// 		if (_.isArray(targetObject[key])) {
// 			if (_.findIndex(targetObject[key], sourceEntity[key]) === -1 && targetObject[key].indexOf(sourceEntity[key]) === -1) {
// 				targetObject[key] = targetObject[key].concat(sourceEntity[key]);
// 			}
// 		}
// 		else if (!_.isEqual(targetObject[key], sourceEntity[key])) {
// 			targetObject[key] = [targetObject[key], sourceEntity[key]];
// 		}
// 		return null;
// 	});
// 	return targetObject;
// }

router.get('/*', auth.isAuthenticated,
	middleware.loadIdentifierTypes, middleware.loadGenders,
	middleware.loadLanguages, middleware.loadCreatorTypes,
	middleware.loadRelationshipTypes, async (req, res, next) => {
		const {orm}: {orm: any} = req.app.locals;
		const {
			Creator, Edition, Publication,
			Publisher, Revision, Work,
			bookshelf, Entity
		} = orm;

		const bbids = req.params[0].split('/');

		if (bbids.length < 2) {
			return next('Merging requires to have more than one bbid passed, separated by a "/"');
		}
		const invalidBBIDs = bbids.filter(bbid => !utils.isValidBBID(bbid));
		if (invalidBBIDs.length) {
			return next(`Invalid bbids: ${invalidBBIDs}`);
		}

		let entities;

		await bookshelf.transaction(async (transacting) => {
			entities = await Promise.all(bbids.map(
				(bbid) =>
					getEntityByBBID(orm, transacting, bbid)
			));
		});

		if (!_.uniqBy(entities, 'type').length === 1) {
			return next('You can only merge entities of the same type');
		}

		const entityType = entities[0].type.toLowerCase();
		res.locals.entity = entities[0];
		req.app.locals.mergingEntities = entities;

		const {markup, props} = entityMergeMarkup(generateEntityMergeProps(
			entityType, req, res, {
				bbids,
				creatorTypes: res.locals.creatorTypes,
				entities,
				genderOptions: res.locals.genders,
				identifierTypes: res.locals.identifierTypes,
				title: 'Merge Page'
			}
			, entitiesToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-merge.js',
			title: `Merge ${entityType}s`
		}));
	});

export default router;
