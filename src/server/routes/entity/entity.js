/*
 * Copyright (C) 2016  Ben Ockmore
 *               2016  Sean Burke
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

// @flow

import * as achievement from '../../helpers/achievement';
import * as error from '../../../common/helpers/error';
import * as handler from '../../helpers/handler';
import * as propHelpers from '../../../client/helpers/props';
import * as search from '../../helpers/search';
import * as utils from '../../helpers/utils';


import type {$Request, $Response, NextFunction} from 'express';
import type {
	EntityTypeString,
	FormLanguageT as Language,
	FormPublisherT as Publisher,
	FormReleaseEventT as ReleaseEvent,
	Transaction
} from 'bookbrainz-data/lib/func/types';
import {escapeProps, generateProps} from '../../helpers/props';

import AuthorPage from '../../../client/components/pages/entities/author';
import DeletionForm from '../../../client/components/forms/deletion';
import EditionGroupPage from
	'../../../client/components/pages/entities/edition-group';
import EditionPage from '../../../client/components/pages/entities/edition';
import EntityRevisions from '../../../client/components/pages/entity-revisions';
import Layout from '../../../client/containers/layout';
import Log from 'log';
import Promise from 'bluebird';
import PublisherPage from '../../../client/components/pages/entities/publisher';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import WorkPage from '../../../client/components/pages/entities/work';
import _ from 'lodash';
import config from '../../../common/helpers/config';
import target from '../../templates/target';


type PassportRequest = $Request & {user: any, session: any};

const log = new Log(config.site.log);

const entityComponents = {
	author: AuthorPage,
	edition: EditionPage,
	editionGroup: EditionGroupPage,
	publisher: PublisherPage,
	work: WorkPage
};

export function displayEntity(req: PassportRequest, res: $Response) {
	const {orm}: {orm: any} = req.app.locals;
	const {AchievementUnlock, EditorEntityVisits} = orm;
	const {locals: resLocals}: {locals: any} = res;
	const {entity}: {entity: any} = resLocals;
	// Get unique identifier types for display
	// $FlowFixMe
	const identifierTypes = entity.identifierSet &&
		_.uniqBy(
			_.map(entity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	let editorEntityVisitPromise;
	if (resLocals.user) {
		editorEntityVisitPromise = new EditorEntityVisits({
			bbid: resLocals.entity.bbid,
			editorId: resLocals.user.id
		})
			.save(null, {method: 'insert'})
			.then(() => achievement.processPageVisit(orm, resLocals.user.id))
			.catch(
				// error caused by duplicates we do not want in database
				() => Promise.resolve(false)
			);
	}
	else {
		editorEntityVisitPromise = Promise.resolve(false);
	}

	let alertPromise = editorEntityVisitPromise.then((visitAlert) => {
		let alertIds = [];
		if (visitAlert.alert) {
			alertIds = alertIds.concat(visitAlert.alert.split(',').map(
				(id) => parseInt(id, 10)
			));
		}
		if (_.isString(req.query.alert)) {
			// $FlowFixMe
			alertIds = alertIds.concat(req.query.alert.split(',').map(
				(id) =>	parseInt(id, 10)
			));
		}
		if (alertIds.length > 0) {
			const promiseList = alertIds.map(
				(achievementAlert) =>
					new AchievementUnlock(
						{id: achievementAlert}
					)
						.fetch({
							require: 'true',
							withRelated: 'achievement'
						})
						.then((unlock) => unlock.toJSON())
						.then((unlock) => {
							let unlockName;
							if (req.user.id === unlock.editorId) {
								unlockName = {
									name: unlock.achievement.name
								};
							}
							return unlockName;
						})
						.catch((err) => {
							log.debug(err);
						})
			);
			alertPromise = Promise.all(promiseList);
		}
		else {
			alertPromise = Promise.resolve(false);
		}
		return alertPromise;
	});

	return alertPromise.then((alert) => {
		const entityName = _.camelCase(entity.type);
		const EntityComponent = entityComponents[entityName];
		if (EntityComponent) {
			const props = generateProps(req, res, {
				alert,
				identifierTypes
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<EntityComponent
						{...propHelpers.extractEntityProps(props)}
					/>
				</Layout>
			);
			res.send(target({
				markup,
				page: entityName,
				props: escapeProps(props),
				script: '/js/entity/entity.js'
			}));
		}
		else {
			throw new Error(
				`Component was not found for the following entity:${entityName}`
			);
		}
	});
}

export function displayDeleteEntity(req: PassportRequest, res: $Response) {
	const props = generateProps(req, res);

	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<DeletionForm entity={props.entity}/>
		</Layout>
	);

	res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/deletion.js'
	}));
}

export function displayRevisions(
	req: PassportRequest, res: $Response, next: NextFunction, RevisionModel: any
) {
	const {bbid} = req.params;

	return new RevisionModel()
		.where({bbid})
		.fetchAll({
			withRelated: ['revision', 'revision.author', 'revision.notes']
		})
		.then((collection) => {
			const revisions = collection.toJSON();
			const props = generateProps(req, res, {
				revisions
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<EntityRevisions
						entity={props.entity}
						revisions={props.revisions}
					/>
				</Layout>
			);
			return res.send(target({
				markup,
				page: 'revisions',
				props: escapeProps(props),
				script: '/js/entity/entity.js'
			}));
		})
		.catch(next);
}

function _createNote(orm, content, editorID, revision, transacting) {
	const {Note} = orm;
	if (content) {
		const revisionId = revision.get('id');
		return new Note({
			authorId: editorID,
			content,
			revisionId
		})
			.save(null, {transacting});
	}

	return null;
}

export function addNoteToRevision(req: PassportRequest, res: $Response) {
	const {orm}: {orm: any} = req.app.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const revision = Revision.forge({id: req.params.id});
	const {body}: {body: any} = req;
	const revisionNotePromise = bookshelf.transaction(
		(transacting) => _createNote(
			orm, body.note, editorJSON.id, revision, transacting
		)
	);
	return handler.sendPromiseResult(res, revisionNotePromise);
}

type ProcessEditionSetsBody = {
	languages: Array<Language>,
	publishers: Array<Publisher>,
	releaseEvents: Array<ReleaseEvent>
};

async function processEditionSets(
	orm: any,
	currentEntity: ?{},
	body: ProcessEditionSetsBody,
	transacting: Transaction
) {
	const languageSetID = _.get(currentEntity, ['languageSet', 'id']);

	const oldLanguageSet = await (
		languageSetID &&
		orm.LanguageSet.forge({id: languageSetID})
			.fetch({transacting, withRelated: ['languages']})
	);

	const languages = _.get(body, 'languages') || [];
	const newLanguageSetIDPromise = orm.func.language.updateLanguageSet(
		orm, transacting, oldLanguageSet,
		languages.map((languageID) => ({id: languageID}))
	)
		.then((set) => set && set.get('id'));

	const publisherSetID = _.get(currentEntity, ['publisherSet', 'id']);

	const oldPublisherSet = await (
		publisherSetID &&
		orm.PublisherSet.forge({id: publisherSetID})
			.fetch({transacting, withRelated: ['publishers']})
	);

	const publishers = _.get(body, 'publishers') || [];
	const newPublisherSetIDPromise = orm.func.publisher.updatePublisherSet(
		orm, transacting, oldPublisherSet,
		publishers.map((publisherBBID) => ({bbid: publisherBBID}))
	)
		.then((set) => set && set.get('id'));

	const releaseEventSetID = _.get(currentEntity, ['releaseEventSet', 'id']);

	const oldReleaseEventSet = await (
		releaseEventSetID &&
		orm.ReleaseEventSet.forge({id: releaseEventSetID})
			.fetch({transacting, withRelated: ['releaseEvents']})
	);

	const releaseEvents = _.get(body, 'releaseEvents') || [];

	// if areaId is not present, set it to null.
	// otherwise it shows error while comparing old and new releaseEvent;

	if (releaseEvents[0] && _.isNil(releaseEvents[0].areaId)) {
		releaseEvents[0].areaId = null;
	}

	const newReleaseEventSetIDPromise =
		orm.func.releaseEvent.updateReleaseEventSet(
			orm, transacting, oldReleaseEventSet, releaseEvents
		)
			.then((set) => set && set.get('id'));

	return Promise.props({
		languageSetId: newLanguageSetIDPromise,
		publisherSetId: newPublisherSetIDPromise,
		releaseEventSetId: newReleaseEventSetIDPromise
	});
}

async function processWorkSets(
	orm, currentEntity: ?{}, body: {languages: Array<Language>},
	transacting: Transaction
) {
	const id = _.get(currentEntity, ['languageSet', 'id']);

	const oldSet = await (
		id &&
		orm.LanguageSet.forge({id})
			.fetch({transacting, withRelated: ['languages']})
	);

	const languages = _.get(body, 'languages') || [];
	return Promise.props({
		languageSetId: orm.func.language.updateLanguageSet(
			orm, transacting, oldSet,
			languages.map((languageID) => ({id: languageID}))
		).then((set) => set && set.get('id'))
	});
}

function processEntitySets(
	orm: any,
	currentEntity: ?{},
	entityType: EntityTypeString,
	body: any,
	transacting: Transaction
) {
	if (entityType === 'Edition') {
		return processEditionSets(orm, currentEntity, body, transacting);
	}

	if (entityType === 'Work') {
		return processWorkSets(orm, currentEntity, body, transacting);
	}

	return Promise.resolve(null);
}

async function getNextAliasSet(orm, transacting, currentEntity, body) {
	const {AliasSet} = orm;

	const id = _.get(currentEntity, ['aliasSet', 'id']);

	const oldAliasSet = await (
		id &&
		new AliasSet({id}).fetch({transacting, withRelated: ['aliases']})
	);

	return orm.func.alias.updateAliasSet(
		orm, transacting, oldAliasSet,
		oldAliasSet && oldAliasSet.get('defaultAliasId'),
		body.aliases || []
	);
}

async function getNextIdentifierSet(orm, transacting, currentEntity, body) {
	const {IdentifierSet} = orm;

	const id = _.get(currentEntity, ['identifierSet', 'id']);

	const oldIdentifierSet = await (
		id &&
		new IdentifierSet({id}).fetch({
			transacting, withRelated: ['identifiers']
		})
	);

	return orm.func.identifier.updateIdentifierSet(
		orm, transacting, oldIdentifierSet, body.identifiers || []
	);
}

async function getNextRelationshipSets(
	orm, transacting, currentEntity, body
) {
	const {RelationshipSet} = orm;

	const id = _.get(currentEntity, ['relationshipSet', 'id']);

	const oldRelationshipSet = await (
		id &&
		new RelationshipSet({id}).fetch({
			transacting, withRelated: ['relationships']
		})
	);

	const updatedRelationships = orm.func.relationship.updateRelationshipSets(
		orm, transacting, oldRelationshipSet, body.relationships || []
	);

	return updatedRelationships;
}

async function getNextAnnotation(
	orm, transacting, currentEntity, body, revision
) {
	const {Annotation} = orm;

	const id = _.get(currentEntity, ['annotation', 'id']);

	const oldAnnotation = await (
		id && new Annotation({id}).fetch({transacting})
	);

	return body.annotation ? orm.func.annotation.updateAnnotation(
		orm, transacting, oldAnnotation, body.annotation, revision
	) : Promise.resolve(null);
}

async function getNextDisambiguation(orm, transacting, currentEntity, body) {
	const {Disambiguation} = orm;

	const id = _.get(currentEntity, ['disambiguation', 'id']);

	const oldDisambiguation = await (
		id && new Disambiguation({id}).fetch({transacting})
	);

	return orm.func.disambiguation.updateDisambiguation(
		orm, transacting, oldDisambiguation, body.disambiguation
	);
}

async function getChangedProps(
	orm, transacting, isNew, currentEntity, body, entityType,
	newRevisionPromise, derivedProps
) {
	const aliasSetPromise =
		getNextAliasSet(orm, transacting, currentEntity, body);

	const identSetPromise =
		getNextIdentifierSet(orm, transacting, currentEntity, body);

	const annotationPromise = newRevisionPromise.then(
		(revision) => getNextAnnotation(
			orm, transacting, currentEntity, body, revision
		)
	);

	const disambiguationPromise =
		getNextDisambiguation(orm, transacting, currentEntity, body);

	const entitySetIdsPromise =
		processEntitySets(orm, currentEntity, entityType, body, transacting);

	const [
		aliasSet, identSet, annotation, disambiguation, entitySetIds
	] = await Promise.all([
		aliasSetPromise, identSetPromise, annotationPromise,
		disambiguationPromise, entitySetIdsPromise
	]);

	const propsToSet = {
		aliasSetId: aliasSet && aliasSet.get('id'),
		annotationId: annotation && annotation.get('id'),
		disambiguationId:
			disambiguation && disambiguation.get('id'),
		identifierSetId: identSet && identSet.get('id'),
		...derivedProps,
		...entitySetIds
	};

	if (isNew) {
		return propsToSet;
	}

	// Construct a set of differences between the new values and old
	return _.reduce(propsToSet, (result, value, key) => {
		if (!_.isEqual(value, currentEntity[key])) {
			result[key] = value;
		}

		return result;
	}, {});
}

function fetchOrCreateMainEntity(
	orm, transacting, isNew, currentEntity, entityType
) {
	const model = utils.getEntityModelByType(orm, entityType);

	const entity = model.forge({bbid: currentEntity.bbid});

	if (isNew) {
		return Promise.resolve(entity);
	}

	return entity.fetch({transacting});
}

async function getEntityByBBID(orm, transacting, bbid) {
	const entityHeader = await orm.Entity.forge({bbid}).fetch({transacting});

	const model = utils.getEntityModelByType(orm, entityHeader.get('type'));
	return model.forge({bbid}).fetch({transacting});
}

function fetchEntitiesForRelationships(
	orm, transacting, currentEntity, relationshipSets
) {
	const bbidsToFetch = _.without(
		_.keys(relationshipSets), _.get(currentEntity, 'bbid')
	);

	return Promise.all(bbidsToFetch.map(
		(bbid) =>
			getEntityByBBID(orm, transacting, bbid)
	));
}

async function setParentRevisions(transacting, newRevision, parentRevisionIDs) {
	if (_.isEmpty(parentRevisionIDs)) {
		return Promise.resolve(null);
	}

	// Get the parents of the new revision
	const parents =
		await newRevision.related('parents').fetch({transacting});

	// Add the previous revision as a parent of this revision.
	return parents.attach(parentRevisionIDs, {transacting});
}

async function saveEntitiesAndFinishRevision(
	orm, transacting, isNew: boolean, newRevision: any, mainEntity: any,
	updatedEntities: [], editorID: number, note: string
) {
	const parentRevisionIDs = _.compact(_.uniq(updatedEntities.map(
		(entityModel) => entityModel.get('revisionId')
	)));

	const entitiesSavedPromise = Promise.all(
		_.map(updatedEntities, (entityModel) => {
			entityModel.set('revisionId', newRevision.get('id'));

			const shouldInsert =
				entityModel.get('bbid') === mainEntity.get('bbid') && isNew;
			const method = shouldInsert ? 'insert' : 'update';
			return entityModel.save(null, {method, transacting});
		})
	);

	const editorUpdatePromise =
		utils.incrementEditorEditCountById(orm, editorID, transacting);

	const notePromise = _createNote(
		orm, note, editorID, newRevision, transacting
	);

	const parentsAddedPromise =
		setParentRevisions(transacting, newRevision, parentRevisionIDs);

	await Promise.all([
		entitiesSavedPromise,
		editorUpdatePromise,
		parentsAddedPromise,
		notePromise
	]);

	return mainEntity;
}

export function handleCreateOrEditEntity(
	req: PassportRequest,
	res: $Response,
	entityType: EntityTypeString,
	derivedProps: {}
) {
	const {orm}: {orm: any} = req.app.locals;
	const {Entity, Revision, bookshelf} = orm;
	const editorJSON = req.user;

	const {body}: {body: any} = req;
	const {locals: resLocals}: {locals: any} = res;

	let currentEntity: ?{
		aliasSet: ?{id: number},
		annotation: ?{id: number},
		bbid: string,
		disambiguation: ?{id: number},
		identifierSet: ?{id: number},
		type: EntityTypeString
	} = resLocals.entity;

	const entityEditPromise = bookshelf.transaction(async (transacting) => {
		// Determine if a new entity is being created
		const isNew = !currentEntity;

		if (isNew) {
			const newEntity = await new Entity({type: entityType})
				.save(null, {transacting});
			const newEntityBBID = newEntity.get('bbid');
			body.relationships = _.map(
				body.relationships,
				({sourceBbid, targetBbid, ...others}) => ({
					sourceBbid: sourceBbid || newEntityBBID,
					targetBbid: targetBbid || newEntityBBID,
					...others
				})
			);

			currentEntity = newEntity.toJSON();
		}

		// Then, edit the entity
		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const relationshipSetsPromise = getNextRelationshipSets(
			orm, transacting, currentEntity, body
		);

		const changedPropsPromise = getChangedProps(
			orm, transacting, isNew, currentEntity, body, entityType,
			newRevisionPromise, derivedProps
		);

		const [newRevision, changedProps, relationshipSets] =
			await Promise.all([
				newRevisionPromise, changedPropsPromise, relationshipSetsPromise
			]);

		// If there are no differences, bail
		if (_.isEmpty(changedProps) && _.isEmpty(relationshipSets)) {
			throw new error.NoUpdatedFieldError();
		}


		// Fetch or create main entity
		const mainEntity = await fetchOrCreateMainEntity(
			orm, transacting, isNew, currentEntity, entityType
		);

		// Fetch all entities that definitely exist
		const otherEntities = await fetchEntitiesForRelationships(
			orm, transacting, currentEntity, relationshipSets
		);

		_.forOwn(changedProps, (value, key) => mainEntity.set(key, value));

		const allEntities = [...otherEntities, mainEntity];

		_.forEach(allEntities, (entityModel) => {
			const bbid: string = entityModel.get('bbid');
			if (_.has(relationshipSets, bbid)) {
				entityModel.set(
					'relationshipSetId',
					relationshipSets[bbid] && relationshipSets[bbid].get('id')
				);
			}
		});

		const savedMainEntity = await saveEntitiesAndFinishRevision(
			orm, transacting, isNew, newRevision, mainEntity, allEntities,
			editorJSON.id, body.note
		);

		const refreshedEntity = await savedMainEntity.refresh({
			transacting,
			withRelated: ['defaultAlias', 'aliasSet.aliases']
		});

		return refreshedEntity.toJSON();
	});

	const achievementPromise = entityEditPromise.then(
		(entityJSON) => achievement.processEdit(
			orm, editorJSON.id, entityJSON.revisionId
		)
			.then((unlock) => {
				if (unlock.alert) {
					entityJSON.alert = unlock.alert;
				}
				return entityJSON;
			})
	);

	return handler.sendPromiseResult(
		res,
		achievementPromise,
		search.indexEntity
	);
}


async function deleteEntityRelationships(orm, transacting, entity) {
	const entityBBID = entity.get('bbid');
	
	// Adding the entity to be deleted to allEntities
	let allEntities = [entity];

	const relationshipSet = await entity.relationshipSet()
		.fetch({require: false, transacting, withRelated: 'relationships'});
	if (!relationshipSet) {
		return allEntities;
	}
	const relationships = relationshipSet.related('relationships').toJSON();

	const otherEntitiesToFetch = relationships
		.reduce((accumulator, relationship) => {
			if (relationship.sourceBbid === entityBBID) {
				accumulator.push(relationship.targetBbid);
			}
			else if (relationship.targetBbid === entityBBID) {
				accumulator.push(relationship.sourceBbid);
			}
			return accumulator;
		}, []);

	await Promise.all(otherEntitiesToFetch.map(
		async (bbid) => {
			const otherEntity = await getEntityByBBID(orm, transacting, bbid);

			const otherEntityRelationshipSet = await entity.relationshipSet()
				.fetch({require: false, transacting, withRelated: 'relationships'});
			if (!otherEntityRelationshipSet) {
				return;
			}
			const otherEntityRelationships = otherEntityRelationshipSet.related('relationships').toJSON();

			// Remove relationships with entity being deleted
			const cleanedUpRelationships = otherEntityRelationships
				.filter(({sourceBbid, targetBbid}) =>
					entityBBID !== sourceBbid &&
					entityBBID !== targetBbid);

			// If there's a difference, apply the new relationships array.
			if (cleanedUpRelationships.length !== otherEntityRelationships.length) {
				await orm.func.relationship.updateRelationshipSets(
					orm, transacting, otherEntityRelationshipSet, cleanedUpRelationships
				);
				// List of BBID of all the affected entities
				allEntities = _.unionBy(allEntities, [otherEntity], 'id');
			}
		}
	));

	return allEntities;
}


export function handleDelete(
	orm: any, req: PassportRequest, res: $Response, HeaderModel: any,
	RevisionModel: any
) {
	// Destructuring entity from localsas entityJSON
	const {entity: entityJSON}: {entity: any} = res.locals;
	// const {entity}: {entity: any} = res.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const {body}: {body: any} = req;

	const entityDeletePromise = bookshelf.transaction(async (transacting) => {
		const entityPromise = getEntityByBBID(orm, transacting, entityJSON.bbid);

		const editorUpdatePromise =
			utils.incrementEditorEditCountById(orm, editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				orm, body.note, editorJSON.id, revision, transacting
			));


		const searchDeleteEntityPromise = search.deleteEntity(entityJSON)
			.catch(err => { log.error(err); });

		// Update related Entities
		const updatedEntitiesPromise = entityPromise
			.then((entity) => deleteEntityRelationships(
				orm, transacting, entity
			));

		const parentRevisionIDsPromise = updatedEntitiesPromise
			.then((updatedEntities) => _.compact(updatedEntities.map(
				(entityModel) => entityModel.get('revisionId')
			)));

		const [newRevision, parentRevisionIDs] = await Promise.all([newRevisionPromise, parentRevisionIDsPromise]);

		const parentsAddedPromise = setParentRevisions(transacting, newRevision, _.uniq(parentRevisionIDs));

		/*
		 * No trigger for deletions, so manually create the <Entity>Revision
		 * and update the entity header
		 */

		const entitiesRevisionPromise = updatedEntitiesPromise
			.then((updatedEntities) => Promise.all(
				_.map(updatedEntities, (entityModel) => new RevisionModel({
					bbid: entityModel.get('bbid'),
					dataId: null,
					id: newRevision.get('id')
				}).save(null, {
					method: 'insert',
					transacting
				}))
			));

		const entitiesHeaderPromise = updatedEntitiesPromise
			.then((updatedEntities) => Promise.all(
				_.map(updatedEntities, (entityModel) => new HeaderModel({
					bbid: entityModel.get('bbid'),
					masterRevisionId: newRevision.get('id')
				}).save(null, {transacting}))
			));

		const entitiesSavedPromise = updatedEntitiesPromise
			.then((updatedEntities) => Promise.all(
				_.map(updatedEntities, (entityModel) => {
					entityModel.set('revisionId', newRevision.get('id'));
					return entityModel.save(null, {method: 'update', transacting});
				})
			));

		return Promise.join(
			editorUpdatePromise, newRevisionPromise, notePromise,
			entitiesRevisionPromise, entitiesHeaderPromise, parentsAddedPromise,
			updatedEntitiesPromise, parentRevisionIDsPromise,
			entitiesSavedPromise, searchDeleteEntityPromise
		).catch(err => {
			log.debug(err);
		});
	});

	return handler.sendPromiseResult(res, entityDeletePromise);
}

type AliasEditorT = {
	language: ?number,
	name: string,
	primary: boolean,
	sortName: string
};

type NameSectionT = {
	disambiguation: string,
	language: ?number,
	name: string,
	sortName: string
};

export function constructAliases(
	aliasEditor: {[string]: AliasEditorT}, nameSection: NameSectionT
) {
	const aliases = _.map(
		aliasEditor,
		(
			{language: languageId, name, primary, sortName}: AliasEditorT,
			id
		) => ({
			default: false,
			id,
			languageId,
			name,
			primary,
			sortName
		})
	);

	return [{
		default: true,
		id: nameSection.id,
		languageId: nameSection.language,
		name: nameSection.name,
		primary: true,
		sortName: nameSection.sortName
	}, ...aliases];
}

type IdentifierEditorT = {
	type: number,
	value: string
};

export function constructIdentifiers(
	identifierEditor: {[string]: IdentifierEditorT}
) {
	return _.map(
		identifierEditor,
		({type: typeId, value}: IdentifierEditorT, id: string) =>
			({id, typeId, value})
	);
}

export function constructRelationships(relationshipSection) {
	return _.map(
		relationshipSection.relationships,
		({rowID, relationshipType, sourceEntity, targetEntity}) => ({
			id: rowID,
			sourceBbid: _.get(sourceEntity, 'bbid'),
			targetBbid: _.get(targetEntity, 'bbid'),
			typeId: relationshipType.id
		})
	);
}

export function getDefaultAliasIndex(aliases) {
	const index = aliases.findIndex((alias) => alias.default);
	return index > 0 ? index : 0;
}

export function areaToOption(
	area: {comment: string, id: number, name: string}
) {
	if (!area) {
		return null;
	}
	const {id} = area;
	return {
		disambiguation: area.comment,
		id,
		text: area.name,
		type: 'area'
	};
}

export function compareEntitiesByDate(a, b) {
	const aDate = _.get(a, 'releaseEventSet.releaseEvents[0].date', null);
	const bDate = _.get(b, 'releaseEventSet.releaseEvents[0].date', null);
	if (_.isNull(aDate)) {
		/*
		 * return a positive value,
		 * so that non-null dates always come before null dates.
		 */
		return 1;
	}

	if (_.isNull(bDate)) {
		/*
		 * return a negative value,
		 * so that non-null dates always come before null dates.
		 */
		return -1;
	}

	return new Date(aDate).getTime() - new Date(bDate).getTime();
}
