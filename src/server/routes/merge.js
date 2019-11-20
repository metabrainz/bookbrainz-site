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
import * as commonUtils from '../../common/helpers/utils';
import * as entityRoutes from './entity/entity';
import * as middleware from '../helpers/middleware';
import * as utils from '../helpers/utils';
import {
	entityMergeMarkup,
	generateEntityMergeProps
} from '../helpers/entityRouteUtils';

import {ConflictError} from '../../common/helpers/error';
import Promise from 'bluebird';
import _ from 'lodash';
import {escapeProps} from '../helpers/props';
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
		case 'Author':
			return ['authorType', 'beginArea', 'endArea', 'gender'];
		default:
			return [];
	}
}

/**
 * @param {object} targetObject - Object to modify
 * @param {string} propName - Property name to set on the targetObject
 * @param {object} sourceObject - Source object to copy from
 * @param {string|string[]} [sourcePath=propName] - Path of the property to check on the sourceObject.
 * @description Mutates the targetObject, setting the value at propName if it isn't already set.
 * Accepts an optional path string or array of strings to allow get the source value at another path
 */
function assignIfNotSet(targetObject, propName, sourceObject, sourcePath = propName) {
	const sourceValue = _.get(sourceObject, sourcePath);
	if (_.isNil(targetObject[propName]) && !_.isNil(sourceValue)) {
	  targetObject[propName] = sourceValue;
	}
}

/**
 * @name getAuthorEntityMergeSection
 * @description Returns the initial form state for the Author merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Author merge section for the initialState
 */
function getAuthorEntityMergeSection(entities) {
	const authorSection = {};
	entities.forEach(entity => {
		assignIfNotSet(authorSection, 'type', entity, 'authorType.id');
		assignIfNotSet(authorSection, 'gender', entity, 'gender.id');
		assignIfNotSet(authorSection, 'beginDate', entity);
		assignIfNotSet(authorSection, 'endDate', entity);
		assignIfNotSet(authorSection, 'beginArea', entity);
		assignIfNotSet(authorSection, 'endArea', entity);
		assignIfNotSet(authorSection, 'ended', entity);
	});
	return Object.assign(authorSection,
		{
			beginArea: entityRoutes.areaToOption(authorSection.beginArea),
			endArea: entityRoutes.areaToOption(authorSection.endArea),

			/** If one of the entities has an end date or area and another doesn't,
			 * those endDate/Area properties will be automatically selected as the only option on the merge display page
			 * We want to emulate this for the initialState to match, so if there's any endDate/Are, set ended to true
			 */
			ended: (!_.isNil(authorSection.endArea) || !_.isNil(authorSection.endDate)) || authorSection.ended
		});
}

/**
 * @description Returns the initial form state for the $entity$ section depending on the entity type
 * @param {string} entityType - Entity type string (lowercased)
 * @param {object[]} entities - Array of entities to merge
 * @returns {object} - The entity section initial form state
 * @throws Will throw an error if the entityType is not one of the know entity types, lowercased.
 */
function getEntitySectionByType(entityType, entities) {
	switch (entityType) {
		case 'author':
		default:
			return getAuthorEntityMergeSection(entities);
	}
}


function entitiesToFormState(entities) {
	const [targetEntity, ...otherEntities] = entities;
	const aliases = entities.reduce((returnValue, entity) => {
		if (Array.isArray(_.get(entity, 'aliasSet.aliases'))) {
			return returnValue.concat(
				entity.aliasSet.aliases.map(({language, ...rest}) => ({
					language: language.id,
					...rest
				}))
			);
		}
		return returnValue;
	}, []);
	let defaultAliasIndex;
	if (_.get(targetEntity, 'aliasSet.defaultAliasId')) {
		defaultAliasIndex = _.findIndex(aliases, alias => alias.id === targetEntity.aliasSet.defaultAliasId);
	}
	else {
		defaultAliasIndex = entityRoutes.getDefaultAliasIndex(aliases);
	}

	const aliasEditor = {};
	aliases.forEach((alias) => {
		aliasEditor[alias.id] = alias;
	});

	const nameSection = aliases[defaultAliasIndex] ||
	{
		disambiguation: null,
		language: null,
		name: '',
		sortName: ''
	};
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
	const type = targetEntity.type.toLowerCase();

	const entityTypeSection = getEntitySectionByType(type, entities);

	const relationshipSection = {
		canEdit: false,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};

	const relationships = entities.reduce((returnValue, entity) => {
		if (entity.relationships) {
			return returnValue.concat(entity.relationships);
		}
		return returnValue;
	}, []);
	const otherEntitiesBBIDs = otherEntities.map(entity => entity.bbid);
	relationships.forEach((relationship) => {
		relationshipSection.relationships[relationship.id] = {
			relationshipType: relationship.type,
			rendered: relationship.rendered,
			rowID: relationship.id,
			// Change the source and/or target BBIDs of the relationship accordingly
			// to the bbid of the entity we're merging into
			sourceEntity: otherEntitiesBBIDs.includes(relationship.sourceBbid) ? targetEntity : relationship.source,
			targetEntity: otherEntitiesBBIDs.includes(relationship.targetBbid) ? targetEntity : relationship.target
		};
	});

	const props = {
		aliasEditor,
		identifierEditor,
		mergingEntities: entities,
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
	const redirectBbid = await orm.func.entity.recursivelyGetRedirectBBID(orm, bbid, transacting);
	const entityHeader = await orm.Entity.forge({bbid: redirectBbid}).fetch({transacting});
	const entityType = entityHeader.get('type');
	const model = utils.getEntityModelByType(orm, entityType);

	return model.forge({bbid: redirectBbid})
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

router.get('/*', auth.isAuthenticated,
	middleware.loadIdentifierTypes, middleware.loadGenders,
	middleware.loadLanguages, middleware.loadAuthorTypes,
	middleware.loadRelationshipTypes, async (req, res, next) => {
		const {orm}: {orm: any} = req.app.locals;
		const {
			Author, Edition, EditionGroup,
			Publisher, Revision, Work,
			bookshelf, Entity
		} = orm;

		const bbids = req.params[0].split('/');

		if (bbids.length < 2) {
			return next('Merging requires to have more than one bbid passed, separated by a "/"');
		}
		const invalidBBIDs = bbids.filter(bbid => !commonUtils.isValidBBID(bbid));
		if (invalidBBIDs.length) {
			return next(`Invalid bbids: ${invalidBBIDs}`);
		}

		let mergingEntities;

		try {
			await bookshelf.transaction(async (transacting) => {
				mergingEntities = await Promise.all(bbids.map(
					(bbid) =>
						getEntityByBBID(orm, transacting, bbid)
				));
			});
		}
		catch (error) {
			return next(error);
		}

		if (!_.uniqBy(mergingEntities, 'type').length === 1) {
			const conflictError = new ConflictError('You can only merge entities of the same type');
			return next(conflictError);
		}
		if (_.uniqBy(mergingEntities, 'bbid').length !== bbids.length) {
			const conflictError = new ConflictError('You cannot merge an entity that has already been merged');
			return next(conflictError);
		}
		if (_.some(mergingEntities, entity => entity.dateId === null)) {
			const conflictError = new ConflictError('You cannot merge an entity that has been deleted');
			return next(conflictError);
		}

		const entityType = mergingEntities[0].type.toLowerCase();
		res.locals.entity = mergingEntities[0];

		const {markup, props} = entityMergeMarkup(generateEntityMergeProps(
			entityType, req, res, {
				authorTypes: res.locals.authorTypes,
				bbids,
				genderOptions: res.locals.genders,
				identifierTypes: res.locals.identifierTypes,
				mergingEntities,
				title: 'Merge Page'
			}
			, entitiesToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: `Merge ${entityType}s`
		}));
	});

export default router;
