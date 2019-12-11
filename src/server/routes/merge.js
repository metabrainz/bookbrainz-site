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
import {basicRelations,
	getEntityFetchPropertiesByType,
	getEntitySectionByType} from '../helpers/merge';
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
			withRelated: basicRelations.concat(getEntityFetchPropertiesByType(entityType))
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
