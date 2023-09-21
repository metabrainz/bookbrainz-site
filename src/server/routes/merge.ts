/*
 * Copyright (C) 2019  Nicolas Pelletier
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


import * as auth from '../helpers/auth';
import * as commonUtils from '../../common/helpers/utils';
import * as entityRoutes from './entity/entity';
import * as middleware from '../helpers/middleware';
import {BadRequestError, ConflictError, NotFoundError} from '../../common/helpers/error';
import {attachAttributes, getAdditionalRelations} from '../helpers/utils';
import {basicRelations,
	getEntityFetchPropertiesByType,
	getEntitySectionByType} from '../helpers/merge';
import {
	entityMergeMarkup,
	generateEntityMergeProps
} from '../helpers/entityRouteUtils';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import _ from 'lodash';
import {escapeProps} from '../helpers/props';
import express from 'express';
import renderRelationship from '../helpers/render';
import targetTemplate from '../templates/target';


const {ENTITY_EDITOR} = PrivilegeType;

const router = express.Router();

function entitiesToFormState(entities: any[]) {
	const [targetEntity, ...otherEntities] = entities;
	const aliases: any[] = entities.reduce((returnValue, entity) => {
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

	const identifiers: any[] = entities.reduce((returnValue, entity) => {
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
		const isAffectedByMerge = otherEntitiesBBIDs.includes(relationship.sourceBbid) || otherEntitiesBBIDs.includes(relationship.targetBbid);
		const formattedRelationship = {
			attributeSetId: relationship.attributeSetId,
			attributes: relationship.attributeSet ? relationship.attributeSet.relationshipAttributes : [],
			isAdded: isAffectedByMerge,
			relationshipType: relationship.type,
			rendered: relationship.rendered,
			rowID: `n${relationship.id}`,
			// Change the source and/or target BBIDs of the relationship accordingly
			// to the bbid of the entity we're merging into
			sourceEntity: otherEntitiesBBIDs.includes(relationship.sourceBbid) ? targetEntity : relationship.source,
			targetEntity: otherEntitiesBBIDs.includes(relationship.targetBbid) ? targetEntity : relationship.target
		};
		// separate series items from relationships
		if (type === 'series' && (relationship.typeId > 69 && relationship.typeId < 75)) {
			entityTypeSection.seriesItems[`n${relationship.id}`] = formattedRelationship;
		}
		else {
			relationshipSection.relationships[`n${relationship.id}`] = formattedRelationship;
		}
	});

	const annotations = entities.reduce((returnValue, entity) => {
		if (entity.annotation && entity.annotation.content) {
			return `${returnValue}${returnValue ? '\n——————\n' : ''}${entity.annotation.content}`;
		}
		return returnValue;
	}, '');
	const annotationSection = {content: annotations};


	const authorCredits = entities.reduce((returnValue, entity) => {
		if (entity.authorCredit) {
			return returnValue.concat(entity.authorCredit);
		}
		return returnValue;
	}, []);
	const authorCredit = authorCredits.length ? authorCredits[0] : null;

	const props = {
		aliasEditor,
		annotationSection,
		authorCredit,
		identifierEditor,
		nameSection,
		relationshipSection
	};
	props[`${type}Section`] = entityTypeSection;
	return props;
}

async function loadEntityRelationships(entity, orm, transacting): Promise<any> {
	async function getEntityWithAlias(relEntity) {
		const redirectBbid = await orm.func.entity.recursivelyGetRedirectBBID(orm, relEntity.bbid, null);
		const model = commonUtils.getEntityModelByType(orm, relEntity.type);
		return model.forge({bbid: redirectBbid})
		  .fetch({require: true, withRelated: ['defaultAlias'].concat(getAdditionalRelations(relEntity.type))});
	}
	const {RelationshipSet} = orm;

	// Default to empty array, its presence is expected down the line
	entity.relationships = [];

	if (!entity.relationshipSetId) {
		return null;
	}
	try {
	  const relationshipSet = await RelationshipSet.forge({id: entity.relationshipSetId})
			.fetch({
				transacting,
				withRelated: [
					'relationships.source',
					'relationships.target',
					'relationships.type.attributeTypes',
					'relationships.attributeSet.relationshipAttributes.value',
					'relationships.attributeSet.relationshipAttributes.type'
				]
			});
		if (relationshipSet) {
			entity.relationships = relationshipSet.related('relationships').toJSON();
		}

	  attachAttributes(entity.relationships);

	  /**
	   * Source and target are generic Entity objects, so until we have
	   * a good way of polymorphically fetching the right specific entity,
	   * we need to fetch default alias in a somewhat sketchier way.
	   */
	  const relationships = await Promise.all(entity.relationships.map(async (relationship) => {
			const [relationshipSource, relationshipTarget] = await Promise.all([
				getEntityWithAlias(relationship.source),
				getEntityWithAlias(relationship.target)
			]);

			relationship.source = relationshipSource.toJSON();
			relationship.target = relationshipTarget.toJSON();
			return relationship;
	  }));

	  // Set rendered relationships on relationship objects
		relationships.forEach((relationship) => {
			relationship.rendered = renderRelationship(relationship);
		});
	  return entity;
	}
	catch (error) {
		/* eslint-disable no-console */
		console.error(error);
		/* eslint-enable no-console */
	}
	return null;
}
async function getEntityByBBID(orm, transacting, bbid) {
	const redirectBbid = await orm.func.entity.recursivelyGetRedirectBBID(orm, bbid, transacting);
	const entityHeader = await orm.Entity.forge({bbid: redirectBbid}).fetch({transacting});
	const entityType = entityHeader.get('type');
	const model = commonUtils.getEntityModelByType(orm, entityType);

	const entity = await model.forge({bbid: redirectBbid})
		.fetch({
			require: true,
			transacting,
			withRelated: basicRelations.concat(getEntityFetchPropertiesByType(entityType))
		});

	const entityJSON = entity.toJSON();
	await loadEntityRelationships(entityJSON, orm, transacting);

	// Return the loaded entity as JSON
	return entityJSON;
}


router.get('/add/:bbid', auth.isAuthenticated, auth.isAuthorized(ENTITY_EDITOR),
	async (req, res, next) => {
		const {orm}: {orm?: any} = req.app.locals;
		let {mergeQueue} = req.session;
		if (_.isNil(req.params.bbid) ||
		!commonUtils.isValidBBID(req.params.bbid)) {
			return next(new BadRequestError(`Invalid bbid: ${req.params.bbid}`, req));
		}
		if (!mergeQueue) {
			mergeQueue = {
				entityType: '',
				mergingEntities: {},
				seriesEntityType: ''
			};
			req.session.mergeQueue = mergeQueue;
		}
		if (_.has(mergeQueue.mergingEntities, req.params.bbid)) {
			// Do nothing, redirect to referer.
			return res.redirect(req.headers.referer);
		}
		let fetchedEntity;
		try {
			await orm.bookshelf.transaction(async (transacting) => {
				fetchedEntity = await getEntityByBBID(orm, transacting, req.params.bbid);
			});
		}
		catch (error) {
			return next(new NotFoundError('Entity not found', req));
		}

		/* If there is no fetchedEntity or no dataId, the entity has been deleted */
		if (!_.get(fetchedEntity, 'dataId')) {
			const conflictError = new ConflictError('You cannot merge an entity that has been deleted');
			return next(conflictError);
		}
		const {bbid, type} = fetchedEntity;
		if (type !== mergeQueue.entityType) {
			mergeQueue.mergingEntities = {};
			// mergeQueue.entityType is the type of the entity
			mergeQueue.entityType = _.upperFirst(type);
			// fetchedEnitity.entityType is the series entity type
			mergeQueue.seriesEntityType = type === 'Series' ? fetchedEntity.entityType : null;
		}

		/* Disallow merging series entity of different types. */
		if (type === 'Series' && (mergeQueue.seriesEntityType !== fetchedEntity.entityType)) {
			mergeQueue.mergingEntities = {};
			mergeQueue.entityType = _.upperFirst(type);
			mergeQueue.seriesEntityType = fetchedEntity.entityType;
		}

		mergeQueue.mergingEntities[bbid] = fetchedEntity;

		return res.redirect(req.headers.referer);
	});

router.get('/remove/:bbid', auth.isAuthenticated, auth.isAuthorized(ENTITY_EDITOR),
	(req, res) => {
		const {mergeQueue} = req.session;
		if (!mergeQueue || _.isNil(req.params.bbid)) {
			res.redirect(req.headers.referer);
			return;
		}
		const {mergingEntities} = mergeQueue;

		delete mergingEntities[req.params.bbid];

		/* If there's only one item in the queue, delete the queue entirely */
		const mergingBBIDs = Object.keys(mergingEntities);
		if (mergingBBIDs.length === 0) {
			req.session.mergeQueue = null;
		}
		res.redirect(req.headers.referer);
	});

router.get('/cancel', auth.isAuthenticated, auth.isAuthorized(ENTITY_EDITOR),
	(req, res) => {
		req.session.mergeQueue = null;
		res.redirect(req.headers.referer);
	});

router.get('/submit/:targetBBID?', auth.isAuthenticated, auth.isAuthorized(ENTITY_EDITOR),
	middleware.loadIdentifierTypes, middleware.loadLanguages,
	middleware.loadRelationshipTypes,
	async (req, res, next) => {
		const {orm}: {orm?: any} = req.app.locals;
		const {bookshelf} = orm;
		const {mergeQueue} = req.session;
		if (!mergeQueue) {
			return next(new ConflictError('No entities selected for merge'));
		}
		const {mergingEntities, entityType} = mergeQueue;

		const bbids = Object.keys(mergingEntities);
		if (bbids.length < 2) {
			return next(new ConflictError('You must have at least 2 entities selected to merge'));
		}
		const invalidBBIDs = bbids.filter(bbid => !commonUtils.isValidBBID(bbid));
		if (invalidBBIDs.length) {
			return next(new ConflictError(`Invalid bbids: ${invalidBBIDs.join(', ')}`));
		}

		let mergingFetchedEntities = _.values(mergingEntities);
		let {targetBBID} = req.params;
		if (_.isNil(targetBBID)) {
			targetBBID = bbids[0];
		}

		if (_.uniqBy(mergingFetchedEntities, 'type').length !== 1) {
			const conflictError = new ConflictError('You can only merge entities of the same type');
			return next(conflictError);
		}

		try {
			await bookshelf.transaction(async (transacting) => {
				const refreshedMergingEntities = await Promise.all(bbids.map(
					(bbid) =>
						getEntityByBBID(orm, transacting, bbid)
				));
				refreshedMergingEntities.forEach(entity => {
					mergeQueue.mergingEntities[entity.bbid] = entity;
				});
				mergingFetchedEntities = refreshedMergingEntities;
			});
		}
		catch (error) {
			return next(error);
		}
		if (_.uniqBy(mergingFetchedEntities, 'bbid').length !== mergingFetchedEntities.length) {
			const conflictError = new ConflictError('You cannot merge an entity that has already been merged');
			return next(conflictError);
		}

		mergingFetchedEntities.sort((first, second) => {
			if (first.bbid === targetBBID) { return -1; }
			else if (second.bbid === targetBBID) { return 1; }
			return 0;
		});
		res.locals.entity = mergingFetchedEntities[0];

		const {markup, props} = entityMergeMarkup(generateEntityMergeProps(
			req, res, {
				entityType: _.camelCase(entityType),
				mergingEntities: mergingFetchedEntities,
				title: 'Merge Page'
			}
			, entitiesToFormState
		));

		return res.send(targetTemplate({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: `Merge ${mergingFetchedEntities.length} ${_.startCase(entityType)}s`
		}));
	});

export default router;
