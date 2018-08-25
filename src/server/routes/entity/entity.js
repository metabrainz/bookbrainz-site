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
import * as handler from '../../helpers/handler';
import * as propHelpers from '../../../client/helpers/props';
import * as search from '../../helpers/search';
import * as utils from '../../helpers/utils';
import type {$Request, $Response, NextFunction} from 'express';
import {escapeProps, generateProps} from '../../helpers/props';
import CreatorPage from '../../../client/components/pages/entities/creator';
import DeletionForm from '../../../client/components/forms/deletion';
import EditionPage from '../../../client/components/pages/entities/edition';
import EntityRevisions from '../../../client/components/pages/entity-revisions';
import Layout from '../../../client/containers/layout';
import Log from 'log';
import Promise from 'bluebird';
import PublicationPage from
	'../../../client/components/pages/entities/publication';
import PublisherPage from '../../../client/components/pages/entities/publisher';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import WorkPage from '../../../client/components/pages/entities/work';
import _ from 'lodash';
import config from '../../helpers/config';


type PassportRequest = $Request & {user: any, session: any};

const log = new Log(config.site.log);

const entityComponents = {
	creator: CreatorPage,
	edition: EditionPage,
	publication: PublicationPage,
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
						.catch((error) => {
							log.debug(error);
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
		const entityName = entity.type.toLowerCase();
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
			res.render('target', {
				markup,
				page: entityName,
				props: escapeProps(props),
				script: '/js/entity/entity.js'
			});
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

	res.render('target', {
		markup,
		props: escapeProps(props),
		script: '/js/deletion.js'
	});
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
			return res.render('target', {
				markup,
				page: 'revisions',
				props: escapeProps(props),
				script: '/js/entity/entity.js'
			});
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

export function handleDelete(
	orm: any, req: PassportRequest, res: $Response, HeaderModel: any,
	RevisionModel: any
) {
	const {entity}: {entity: any} = res.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const {body}: {body: any} = req;

	const entityDeletePromise = bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(orm, editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				orm, body.note, editorJSON.id, revision, transacting
			));

		/*
		 * No trigger for deletions, so manually create the <Entity>Revision
		 * and update the entity header
		 */
		const newEntityRevisionPromise = newRevisionPromise
			.then((revision) => new RevisionModel({
				bbid: entity.bbid,
				dataId: null,
				id: revision.get('id')
			}).save(null, {
				method: 'insert',
				transacting
			}));

		const entityHeaderPromise = newEntityRevisionPromise
			.then((entityRevision) => new HeaderModel({
				bbid: entity.bbid,
				masterRevisionId: entityRevision.get('id')
			}).save(null, {transacting}));

		return Promise.join(
			editorUpdatePromise, newRevisionPromise, notePromise,
			newEntityRevisionPromise, entityHeaderPromise
		);
	});

	return handler.sendPromiseResult(res, entityDeletePromise);
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

	return Promise.props({
		languageSetId: orm.func.language.updateLanguageSet(
			orm, transacting, oldSet, body.languages
		)
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

async function getNextAnnotation(
	orm, transacting, currentEntity, body, revision
) {
	const {Annotation} = orm;

	const id = _.get(currentEntity, ['annotation', 'id']);

	const oldAnnotation = await (
		id && new Annotation({id}).fetch({transacting})
	);

	return orm.func.annotation.updateAnnotation(
		orm, transacting, oldAnnotation, body.annotation, revision
	);
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

export function createEntity(
	req,
	res,
	entityType,
	derivedProps
) {
	const {orm} = req.app.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const entityCreationPromise = bookshelf.transaction(async (transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(orm, editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				orm, req.body.note, editorJSON.id, revision, transacting
			));

		const changedPropsPromise = getChangedProps(
			orm, transacting, true, null, req.body, entityType,
			newRevisionPromise, derivedProps
		);

		const [
			newRevision, propsToSet
		] = await Promise.all([
			newRevisionPromise, changedPropsPromise, editorUpdatePromise,
			notePromise
		]);

		const model = utils.getEntityModelByType(orm, entityType);

		const entityModel = model.forge(propsToSet);
		entityModel.set('revisionId', newRevision.get('id'));
		const savedEntity = await entityModel.save(null, {
			method: 'insert',
			transacting
		});

		const entity = await savedEntity.refresh({
			transacting,
			withRelated: ['defaultAlias']
		});

		return entity.toJSON();
	});

	const achievementPromise = entityCreationPromise.then(
		(entityJSON) => achievement.processEdit(
			orm, editorJSON.id, entityJSON.revisionId
		)
			.then((unlock) => {
				if (unlock.alert) {
					entityJSON.alert = unlock.alert;
				}
			})
			.then(() => entityJSON)
	);

	return handler.sendPromiseResult(
		res,
		achievementPromise,
		search.indexEntity
	);
}

export function editEntity(
	req,
	res,
	entityType,
	derivedProps
) {
	const {orm} = req.app.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const model = utils.getEntityModelByType(orm, entityType);

	const entityEditPromise = bookshelf.transaction(async (transacting) => {
		const currentEntity = res.locals.entity;

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const changedPropsPromise = getChangedProps(
			orm, transacting, false, currentEntity, req.body, entityType,
			newRevisionPromise, derivedProps
		);

		const [newRevision, changedProps] =
			await Promise.all([
				newRevisionPromise, changedPropsPromise
			]);

		// If there are no differences, bail
		if (_.isEmpty(changedProps)) {
			throw new Error('Entity did not change');
		}

		const entity = await fetchOrCreateMainEntity(
			orm, transacting, false, currentEntity, entityType
		);

		_.forOwn(changedProps, (value, key) => entity.set(key, value));

		entity.set('revisionId', newRevision.get('id'));

		const editorUpdatePromise =
			utils.incrementEditorEditCountById(
				orm,
				editorJSON.id,
				transacting
			);

		// Get the parents of the new revision
		const revisionParentsPromise =
			newRevision.related('parents').fetch({transacting});

		// Add the previous revision as a parent of this revision.
		const parentAddedPromise =
			revisionParentsPromise.then(
				(parents) => parents.attach(
					currentEntity.revisionId, {transacting}
				)
			);

		const notePromise = _createNote(
			orm, req.body.note, editorJSON.id, newRevision, transacting
		);

		await Promise.join(
			entity.save(null, {
				method: 'update',
				transacting
			}),
			editorUpdatePromise,
			parentAddedPromise,
			notePromise
		);

		const updatedEntity = await model.forge({bbid: currentEntity.bbid})
			.fetch({
				transacting,
				withRelated: ['defaultAlias']
			});

		const entityJSON = updatedEntity.toJSON();

		return achievement.processEdit(
			orm, req.user.id, entityJSON.revisionId
		)
			.then((unlock) => {
				if (unlock.alert) {
					entityJSON.alert = unlock.alert;
				}
				return entityJSON;
			});
	});

	return handler.sendPromiseResult(
		res,
		entityEditPromise,
		search.indexEntity
	);
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
