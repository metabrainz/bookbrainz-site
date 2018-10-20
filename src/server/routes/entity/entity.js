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

import * as achievement from '../../helpers/achievement';
import * as handler from '../../helpers/handler';
import * as propHelpers from '../../../client/helpers/props';
import * as search from '../../helpers/search';
import * as utils from '../../helpers/utils';
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
import target from '../../templates/target';


const log = new Log(config.site.log);

const entityComponents = {
	creator: CreatorPage,
	edition: EditionPage,
	publication: PublicationPage,
	publisher: PublisherPage,
	work: WorkPage
};

export function displayEntity(req, res) {
	const {orm} = req.app.locals;
	const {AchievementUnlock, EditorEntityVisits} = orm;
	const {entity} = res.locals;
	// Get unique identifier types for display
	const identifierTypes = entity.identifierSet &&
		_.uniqBy(
			_.map(entity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	let editorEntityVisitPromise;
	if (res.locals.user) {
		editorEntityVisitPromise = new EditorEntityVisits({
			bbid: res.locals.entity.bbid,
			editorId: res.locals.user.id
		})
			.save(null, {method: 'insert'})
			.then(() => achievement.processPageVisit(orm, res.locals.user.id))
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
		if (req.query.alert) {
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

export function displayDeleteEntity(req, res) {
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

export function displayRevisions(req, res, next, RevisionModel) {
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

function _createNote(orm, content, editor, revision, transacting) {
	const {Note} = orm;
	if (content) {
		const revisionId = revision.get('id');
		return new Note({
			authorId: editor.id,
			content,
			revisionId
		})
			.save(null, {transacting});
	}

	return null;
}

export function addNoteToRevision(req, res) {
	const {orm} = req.app.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const revision = Revision.forge({id: req.params.id});
	const revisionNotePromise = bookshelf.transaction(
		(transacting) => _createNote(
			orm, req.body.note, editorJSON, revision, transacting
		)
	);
	return handler.sendPromiseResult(res, revisionNotePromise);
}

export function handleDelete(orm, req, res, HeaderModel, RevisionModel) {
	const {entity} = res.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;

	const entityDeletePromise = bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(orm, editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				orm, req.body.note, editorJSON, revision, transacting
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

function setHasChanged(oldSet, newSet, idField, compareFields) {
	const oldSetIds = _.map(oldSet, idField);
	const newSetIds = _.map(newSet, idField);

	const oldSetHash = {};
	oldSet.forEach((item) => {
		oldSetHash[item[idField]] = item;
	});

	/*
	 * First, determine whether any items have been deleted or added, by
	 * excluding all new IDs from the old IDs and checking whether any IDs
	 * remain, and vice versa
	 */
	const itemsHaveBeenDeletedOrAdded =
		_.difference(oldSetIds, newSetIds).length > 0 ||
		_.difference(newSetIds, oldSetIds).length > 0;

	if (itemsHaveBeenDeletedOrAdded) {
		return true;
	}

	/*
	 * If no list of fields for comparison is provided and no items have been
	 * deleted or added, consider the set unchanged
	 */
	if (_.isEmpty(compareFields)) {
		return false;
	}

	// If not, return true if any items have changed (are not equal)
	return _.some(newSet, (newItem) => {
		const oldRepresentation =
			_.pick(oldSetHash[newItem[idField]], compareFields);
		const newRepresentation = _.pick(newItem, compareFields);
		return !_.isEqual(oldRepresentation, newRepresentation);
	});
}

function unchangedSetItems(oldSet, newSet, compareFields) {
	return _.intersectionBy(
		newSet,
		oldSet,
		(item) => _.pick(item, compareFields)
	);
}

function updatedOrNewSetItems(oldSet, newSet, compareFields) {
	return _.differenceBy(
		newSet, oldSet, (item) => _.pick(item, compareFields)
	);
}

function processFormSet(transacting, oldSet, formItems, setMetadata) {
	const oldItems =
		oldSet ? oldSet.related(setMetadata.propName).toJSON() : [];

	// If there's no change, return the old set
	const noChangeToSet = !setHasChanged(
		oldItems, formItems, setMetadata.idField, setMetadata.mutableFields
	);

	if (noChangeToSet) {
		return oldSet;
	}

	// If we have no items for the set, the set should be null
	if (_.isEmpty(formItems)) {
		return null;
	}

	const newSetPromise = setMetadata.model.forge()
		.save(null, {transacting});

	const fetchCollectionPromise = newSetPromise
		.then(
			(newSet) => newSet.related(setMetadata.propName)
				.fetch({transacting})
		);

	let createPropertiesPromise = null;
	let idsToAttach;

	if (setMetadata.mutableFields) {
		// If there are items in the set which haven't changed, get their IDs
		const unchangedItems = unchangedSetItems(
			oldItems,
			formItems,
			setMetadata.mutableFields
		);
		idsToAttach = _.map(unchangedItems, setMetadata.idField);

		/*
		 * If there are new items in the set or items in the set have otherwise
		 * changed, add rows to the database and connect them to the set
		 */
		const updatedOrNewItems = updatedOrNewSetItems(
			oldItems,
			formItems,
			setMetadata.mutableFields
		);

		createPropertiesPromise = fetchCollectionPromise
			.then((collection) => Promise.map(
				updatedOrNewItems, (item) =>
					collection.create(
						_.omit(item, setMetadata.idField),
						{transacting}
					)
			));
	}
	else {
		// If the set's elements aren't mutable, it should just be a list of IDs
		idsToAttach = formItems;
	}

	// Link any IDs for unchanged items (including immutable) to the set
	const attachPropertiesPromise = fetchCollectionPromise
		.then((collection) => collection.attach(idsToAttach, {transacting}));

	/*
	 * Ensure that any linking that needs to happen to the set is completed
	 * and return the new set's object
	 */
	return Promise.join(
		newSetPromise,
		Promise.resolve(createPropertiesPromise),
		attachPropertiesPromise,
		(newSet) => newSet
	);
}

function processFormAliases(
	orm, transacting, oldAliasSet, oldDefaultAliasId, newAliases
) {
	const {AliasSet} = orm;
	const oldAliases =
		oldAliasSet ? oldAliasSet.related('aliases').toJSON() : [];
	const aliasCompareFields =
		['name', 'sortName', 'languageId', 'primary'];
	const aliasesHaveChanged = setHasChanged(
		oldAliases, newAliases, 'id', aliasCompareFields
	);

	/*
	 * If there is no change to the set of aliases, and the default alias is
	 * the same, skip alias processing
	 */
	const newDefaultAlias = _.find(newAliases, 'default');
	if (!aliasesHaveChanged && newDefaultAlias.id === oldDefaultAliasId) {
		return oldAliasSet;
	}

	// Make a new alias set
	const newAliasSetPromise = new AliasSet().save(null, {transacting});
	const newAliasesPromise = newAliasSetPromise.then(
		(newAliasSet) => newAliasSet.related('aliases').fetch({transacting})
	);

	// Copy across any old aliases that are exactly the same in the new set
	const unchangedAliases =
		unchangedSetItems(oldAliases, newAliases, aliasCompareFields);
	const oldAliasesAttachedPromise = newAliasesPromise.then(
		(collection) => collection.attach(
			_.map(unchangedAliases, 'id'), {transacting}
		)
	);

	/*
	 * Create new aliases for any new or updated aliases, and attach them to
	 * the set
	 */
	const newOrUpdatedAliases =
		updatedOrNewSetItems(oldAliases, newAliases, aliasCompareFields);
	const allAliasesAttachedPromise = oldAliasesAttachedPromise
		.then(
			(collection) =>
				Promise.all(
					_.map(newOrUpdatedAliases, (alias) => collection.create(
						_.omit(alias, 'id', 'default'),
						{transacting}
					))
				)
					.then(() => collection)
		);

	// Set the default alias
	return Promise.join(
		newAliasSetPromise, allAliasesAttachedPromise,
		(newAliasSet, collection) => {
			const defaultAlias = collection.find(
				(alias) =>
					alias.get('name') === newDefaultAlias.name &&
					alias.get('sortName') === newDefaultAlias.sortName &&
					alias.get('languageId') === newDefaultAlias.languageId
			);
			newAliasSet.set('defaultAliasId', defaultAlias.get('id'));
			return newAliasSet.save(null, {transacting});
		}
	);
}

function processFormIdentifiers(orm, transacting, oldIdentSet, newIdents) {
	const {IdentifierSet} = orm;
	const oldIdents =
		oldIdentSet ? oldIdentSet.related('identifiers').toJSON() : [];
	const identCompareFields =
		['value', 'typeId'];
	const identsHaveChanged = setHasChanged(
		oldIdents, newIdents, 'id', identCompareFields
	);

	// If there is no change to the set of identifiers
	if (!identsHaveChanged) {
		return oldIdentSet;
	}

	// Make a new identifier set
	const newIdentSetPromise =
		new IdentifierSet().save(null, {transacting});
	const newIdentsPromise = newIdentSetPromise.then(
		(newIdentSet) => newIdentSet.related('identifiers').fetch({transacting})
	);

	// Copy across any old aliases that are exactly the same in the new set
	const unchangedIdents =
		unchangedSetItems(oldIdents, newIdents, identCompareFields);
	const oldIdentsAttachedPromise = newIdentsPromise.then(
		(collection) => collection.attach(
			_.map(unchangedIdents, 'id'), {transacting}
		)
	);

	/*
	 * Create new aliases for any new or updated aliases, and attach them to
	 * the set
	 */
	const newOrUpdatedIdents =
		updatedOrNewSetItems(oldIdents, newIdents, identCompareFields);
	const allIdentsAttachedPromise = oldIdentsAttachedPromise
		.then(
			(collection) =>
				Promise.all(
					_.map(newOrUpdatedIdents, (ident) => collection.create(
						_.omit(ident, 'id'), {transacting}
					))
				)
					.then(() => collection)
		);

	return Promise.join(
		newIdentSetPromise, allIdentsAttachedPromise,
		(newIdentSet) => newIdentSet
	);
}

function processFormAnnotation(
	orm, transacting, oldAnnotation, newContent, revision
) {
	const {Annotation} = orm;
	const oldContent = oldAnnotation && oldAnnotation.get('content');

	if (newContent === oldContent) {
		return oldAnnotation;
	}

	return newContent ? new Annotation({
		content: newContent,
		lastRevisionId: revision.get('id')
	}).save(null, {transacting}) : null;
}

function processFormDisambiguation(
	orm, transacting, oldDisambiguation, newComment
) {
	const {Disambiguation} = orm;
	const oldComment = oldDisambiguation && oldDisambiguation.get('comment');

	if (newComment === oldComment) {
		return oldDisambiguation;
	}

	return newComment ? new Disambiguation({
		comment: newComment
	}).save(null, {transacting}) : null;
}

function processEntitySets(derivedSets, currentEntity, body, transacting) {
	if (!derivedSets) {
		return null;
	}

	return Promise.map(derivedSets, (derivedSet) => {
		const newItems = body[derivedSet.propName];

		let oldSetPromise = null;

		if (currentEntity && currentEntity[derivedSet.name]) {
			oldSetPromise = derivedSet.model.forge({
				id: currentEntity[derivedSet.name].id
			})
				.fetch({
					transacting,
					withRelated: [derivedSet.propName]
				});
		}

		return Promise.resolve(oldSetPromise)
			.then(
				(oldSet) =>
					processFormSet(
						transacting,
						oldSet,
						newItems,
						derivedSet
					)
			)
			.then((newSet) => {
				const newProp = {};
				newProp[derivedSet.entityIdField] =
					newSet ? newSet.get('id') : null;

				return newProp;
			});
	})
		.then(
			(newProps) => _.reduce(
				newProps, (result, value) => _.assign(result, value), {}
			)
		);
}

export function createEntity(
	req,
	res,
	entityType,
	derivedProps,
	derivedSets
) {
	const {orm} = req.app.locals;
	const {Revision, bookshelf} = orm;
	const editorJSON = req.session.passport.user;
	const entityCreationPromise = bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(orm, editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				orm, req.body.note, editorJSON, revision, transacting
			));

		const aliasSetPromise = processFormAliases(
			orm, transacting, null, null, req.body.aliases || []
		);

		const identSetPromise = processFormIdentifiers(
			orm, transacting, null, req.body.identifiers || []
		);

		const annotationPromise = newRevisionPromise.then(
			(revision) => processFormAnnotation(
				orm, transacting, null, req.body.annotation, revision
			)
		);

		const disambiguationPromise = processFormDisambiguation(
			orm, transacting, null, req.body.disambiguation
		);

		const derivedPropsPromise = Promise.resolve(
			processEntitySets(
				derivedSets,
				null,
				req.body,
				transacting
			)
		)
			.then(
				(derivedSetProps) => _.merge({}, derivedProps, derivedSetProps)
			);

		return Promise.join(
			newRevisionPromise, aliasSetPromise, identSetPromise,
			annotationPromise, disambiguationPromise, derivedPropsPromise,
			editorUpdatePromise, notePromise,
			(
				newRevision,
				aliasSet,
				identSet,
				annotation,
				disambiguation,
				allProps
			) => {
				const propsToSet = _.extend({
					aliasSetId: aliasSet && aliasSet.get('id'),
					annotationId: annotation && annotation.get('id'),
					disambiguationId:
						disambiguation && disambiguation.get('id'),
					identifierSetId: identSet && identSet.get('id'),
					revisionId: newRevision.get('id')
				}, allProps);

				const model = utils.getEntityModelByType(orm, entityType);

				return model.forge(propsToSet)
					.save(null, {
						method: 'insert',
						transacting
					});
			}
		)
			.then(
				(entityModel) =>
					entityModel.refresh({
						transacting,
						withRelated: ['defaultAlias']
					})
			)
			.then((entity) => entity.toJSON());
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
	derivedProps,
	derivedSets
) {
	const {orm} = req.app.locals;
	const {
		AliasSet, Annotation, Disambiguation, IdentifierSet, Revision,
		bookshelf
	} = orm;
	const editorJSON = req.session.passport.user;
	const model = utils.getEntityModelByType(orm, entityType);

	const entityEditPromise = bookshelf.transaction((transacting) => {
		const currentEntity = res.locals.entity;

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const oldAliasSetPromise = currentEntity.aliasSet &&
			new AliasSet({id: currentEntity.aliasSet.id})
				.fetch({
					transacting,
					withRelated: ['aliases']
				});

		const aliasSetPromise = Promise.resolve(oldAliasSetPromise)
			.then(
				(oldAliasSet) => processFormAliases(
					orm, transacting, oldAliasSet,
					oldAliasSet.get('defaultAliasId'),
					req.body.aliases || []
				)
			);

		const oldIdentSetPromise = currentEntity.identifierSet &&
			new IdentifierSet({id: currentEntity.identifierSet.id})
				.fetch({
					transacting,
					withRelated: ['identifiers']
				});

		const identSetPromise = Promise.resolve(oldIdentSetPromise)
			.then(
				(oldIdentifierSet) => processFormIdentifiers(
					orm, transacting, oldIdentifierSet,
					req.body.identifiers || []
				)
			);

		const oldAnnotationPromise = currentEntity.annotation &&
			new Annotation({id: currentEntity.annotation.id})
				.fetch({transacting});

		const annotationPromise = Promise.join(
			newRevisionPromise, Promise.resolve(oldAnnotationPromise),
			(revision, oldAnnotation) =>
				processFormAnnotation(
					orm, transacting, oldAnnotation, req.body.annotation,
					revision
				)
		);

		const oldDisambiguationPromise = currentEntity.disambiguation &&
			new Disambiguation({id: currentEntity.disambiguation.id})
				.fetch({transacting});

		const disambiguationPromise = Promise.resolve(oldDisambiguationPromise)
			.then(
				(oldDisambiguation) => processFormDisambiguation(
					orm, transacting, oldDisambiguation, req.body.disambiguation
				)
			);

		const derivedPropsPromise = Promise.resolve(
			processEntitySets(
				derivedSets,
				currentEntity,
				req.body,
				transacting
			)
		)
			.then(
				(derivedSetProps) => _.merge({}, derivedProps, derivedSetProps)
			);

		return Promise.join(
			newRevisionPromise,
			aliasSetPromise,
			identSetPromise,
			annotationPromise,
			disambiguationPromise,
			derivedPropsPromise,
			(
				newRevision, aliasSet, identSet,
				annotation, disambiguation, allProps
			) => {
				const propsToSet = _.extend({
					aliasSetId: aliasSet && aliasSet.get('id'),
					annotationId: annotation && annotation.get('id'),
					disambiguationId:
						disambiguation && disambiguation.get('id'),
					identifierSetId: identSet && identSet.get('id')
				}, allProps);

				// Construct a set of differences between the new values and old
				const changedProps =
					_.reduce(propsToSet, (result, value, key) => {
						if (!_.isEqual(value, currentEntity[key])) {
							result[key] = value;
						}

						return result;
					}, {});

				// If there are no differences, bail
				if (_.isEmpty(changedProps)) {
					throw new Error('Entity did not change');
				}

				const entityPromise = model.forge({bbid: currentEntity.bbid})
					.fetch();

				return Promise.join(
					newRevisionPromise, entityPromise, annotation, changedProps
				);
			}
		)
			.spread((newRevision, entity, annotation, changedProps) => {
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
					orm, req.body.note, editorJSON, newRevision, transacting
				);

				return Promise.join(
					entity.save(null, {
						method: 'update',
						transacting
					}),
					editorUpdatePromise,
					parentAddedPromise,
					notePromise
				);
			})
			.spread(
				() => model.forge({bbid: currentEntity.bbid})
					.fetch({
						transacting,
						withRelated: ['defaultAlias']
					})
			)
			.then((entity) => entity.toJSON())
			.then(
				(entityJSON) => achievement.processEdit(
					orm, req.user.id, entityJSON.revisionId
				)
					.then((unlock) => {
						if (unlock.alert) {
							entityJSON.alert = unlock.alert;
						}
						return entityJSON;
					})
			);
	});

	return handler.sendPromiseResult(
		res,
		entityEditPromise,
		search.indexEntity
	);
}

export function constructAliases(aliasEditor, nameSection) {
	const aliases = _.map(
		aliasEditor,
		({id, language, name, primary, sortName}) => ({
			default: false,
			id,
			languageId: language,
			name,
			primary,
			sortName
		})
	);

	return [{
		default: true,
		languageId: nameSection.language,
		name: nameSection.name,
		primary: true,
		sortName: nameSection.sortName
	}, ...aliases];
}

export function constructIdentifiers(identifierEditor) {
	return _.map(identifierEditor, ({id, type, value}) => ({
		id,
		typeId: type,
		value
	}));
}

export function getDefaultAliasIndex(aliases) {
	const index = aliases.findIndex((alias) => alias.default);
	return index > 0 ? index : 0;
}

export function areaToOption(area) {
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
