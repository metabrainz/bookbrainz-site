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
	ISODateStringToObject,
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
		case 'Edition':
			return [
				'editionGroup.defaultAlias',
				'languageSet.languages',
				'editionFormat',
				'editionStatus',
				'releaseEventSet.releaseEvents',
				'publisherSet.publishers.defaultAlias'
			];
		case 'EditionGroup':
			return [
				'editionGroupType',
				'editions.defaultAlias',
				'editions.disambiguation',
				'editions.releaseEventSet.releaseEvents',
				'editions.identifierSet.identifiers.type',
				'editions.editionFormat'
			];
		case 'Publisher':
			return [
				'publisherType',
				'area'
			];
		case 'Work':
			return [
				'languageSet.languages',
				'workType'
			];
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
 * The returned section has some properties transformed to a state acceptable by the reducer.
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
 * @name getEditionEntityMergeSection
 * @description Returns the initial form state for the Edition merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Edition merge section for the initialState
 */
function getEditionEntityMergeSection(entities) {
	const editionSection = {};
	entities.forEach(entity => {
		assignIfNotSet(editionSection, 'depth', entity);
		assignIfNotSet(editionSection, 'editionGroup', entity);
		assignIfNotSet(editionSection, 'format', entity, 'editionFormat.id');
		assignIfNotSet(editionSection, 'height', entity);
		assignIfNotSet(editionSection, 'pages', entity);
		assignIfNotSet(editionSection, 'publisher', entity, 'publisherSet.publishers[0]');
		assignIfNotSet(editionSection, 'releaseDate', entity, 'releaseEventSet.releaseEvents[0].date');
		assignIfNotSet(editionSection, 'status', entity, 'editionStatus.id');
		assignIfNotSet(editionSection, 'weight', entity);
		assignIfNotSet(editionSection, 'width', entity);
	});
	const releaseDate = editionSection.releaseDate ?
		ISODateStringToObject(editionSection.releaseDate) :
		{day: '', month: '', year: ''};
	const languages = _.flatMap(entities, entity => _.get(entity, 'languageSet.languages', []).map(
		({id, name}) => ({label: name, value: id})
	));
	return Object.assign(editionSection,
		{
			editionGroup: utils.entityToOption(editionSection.editionGroup),
			languages: _.uniqBy(languages, 'value'),
			publisher: utils.entityToOption(editionSection.publisher),
			releaseDate
		});
}

/**
 * @name getEditionGroupEntityMergeSection
 * @description Returns the initial form state for the Edition Group merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Edition Group merge section for the initialState
 */
function getEditionGroupEntityMergeSection(entities) {
	const editionGroupSection = {editions: []};
	entities.forEach(entity => {
		assignIfNotSet(editionGroupSection, 'type', entity, 'typeId');
		editionGroupSection.editions.push(...entity.editions);
	});

	return editionGroupSection;
}

/**
 * @name getPublisherEntityMergeSection
 * @description Returns the initial form state for the Publisher merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Publisher merge section for the initialState
 */
function getPublisherEntityMergeSection(entities) {
	const publisherSection = {};
	entities.forEach(entity => {
		assignIfNotSet(publisherSection, 'area', entity);
		assignIfNotSet(publisherSection, 'beginDate', entity);
		assignIfNotSet(publisherSection, 'endDate', entity);
		assignIfNotSet(publisherSection, 'ended', entity);
		assignIfNotSet(publisherSection, 'type', entity, 'typeId');
	});
	return Object.assign(publisherSection,
		{
			area: entityRoutes.areaToOption(publisherSection.area),

			/** If one of the entities has an end date and another doesn't,
			 * that endDate property will be automatically selected as the only option on the merge display page
			 * We want to emulate this for the initialState to match, so if there's any endDate, set ended to true
			 */
			ended: !_.isNil(publisherSection.endDate) || publisherSection.ended
		});
}

/**
 * @name getWorkEntityMergeSection
 * @description Returns the initial form state for the Work merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Work merge section for the initialState
 */
function getWorkEntityMergeSection(entities) {
	const workSection = {};
	entities.forEach(entity => {
		assignIfNotSet(workSection, 'type', entity, 'typeId');
	});
	const languages = _.flatMap(entities, entity => _.get(entity, 'languageSet.languages', []).map(
		({id, name}) => ({label: name, value: id})
	));
	return Object.assign(workSection,
		{
			languages: _.uniqBy(languages, 'value')
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
			return getAuthorEntityMergeSection(entities);
		case 'edition':
			return getEditionEntityMergeSection(entities);
		case 'editionGroup':
			return getEditionGroupEntityMergeSection(entities);
		case 'publisher':
			return getPublisherEntityMergeSection(entities);
		case 'work':
			return getWorkEntityMergeSection(entities);
		default:
			throw new Error(`Invalid entity type: '${entityType}'`);
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
	const type = _.camelCase(targetEntity.type);

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
	middleware.loadIdentifierTypes, middleware.loadLanguages,
	middleware.loadRelationshipTypes,
	async (req, res, next) => {
		const {orm}: {orm: any} = req.app.locals;
		const {bookshelf} = orm;

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

		const entityType = _.camelCase(mergingEntities[0].type);
		res.locals.entity = mergingEntities[0];

		const {markup, props} = entityMergeMarkup(generateEntityMergeProps(
			entityType, req, res, {
				authorTypes: res.locals.authorTypes,
				bbids,
				editionGroupTypes: res.locals.editionGroupTypes,
				genderOptions: res.locals.genders,
				identifierTypes: res.locals.identifierTypes,
				mergingEntities,
				publisherTypes: res.locals.publisherTypes,
				title: 'Merge Page'
			}
			, entitiesToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: `Merge ${mergingEntities.length} ${_.startCase(entityType)}s`
		}));
	});

export default router;
