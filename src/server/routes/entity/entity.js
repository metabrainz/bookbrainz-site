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

'use strict';

const Promise = require('bluebird');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const _ = require('lodash');

// XXX: Don't pull in bookshelf directly
const bookshelf = require('bookbrainz-data').bookshelf;

const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const AliasSet = require('bookbrainz-data').AliasSet;
const Annotation = require('bookbrainz-data').Annotation;
const Disambiguation = require('bookbrainz-data').Disambiguation;
const EditorEntityVisits = require('bookbrainz-data').EditorEntityVisits;
const IdentifierSet = require('bookbrainz-data').IdentifierSet;
const Note = require('bookbrainz-data').Note;
const Revision = require('bookbrainz-data').Revision;
const handler = require('../../helpers/handler');
const search = require('../../helpers/search');
const utils = require('../../helpers/utils');
const achievement = require('../../helpers/achievement');
const propHelpers = require('../../helpers/props');

const Layout = require('../../../client/containers/layout');
const EntityRevisions =
	require('../../../client/components/pages/entity-revisions');
const EntityContainer = require('../../../client/containers/entity');
const EditionPage = require('../../../client/components/pages/entity/edition');
const CreatorPage = require('../../../client/components/pages/entity/creator');
const PublicationPage =
	require('../../../client/components/pages/entity/publication');
const PublisherPage =
	require('../../../client/components/pages/entity/publisher');
const WorkPage = require('../../../client/components/pages/entity/work');
const DeletionForm = React.createFactory(
	require('../../../client/components/forms/deletion')
);

const entityComponents = {
	edition: EditionPage,
	creator: CreatorPage,
	publication: PublicationPage,
	publisher: PublisherPage,
	work: WorkPage
};

module.exports.displayEntity = (req, res) => {
	const entity = res.locals.entity;
	// Get unique identifier types for display
	const identifierTypes = entity.identifierSet &&
		_.uniqBy(
			_.map(entity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	let editorEntityVisitPromise;
	if (res.locals.user) {
		editorEntityVisitPromise = new EditorEntityVisits({
			editorId: res.locals.user.id,
			bbid: res.locals.entity.bbid
		})
		.save(null, {method: 'insert'})
		.then(() =>
			achievement.processPageVisit(res.locals.user.id)
		)
		.catch(() =>
			// error caused by duplicates we do not want in database
			Promise.resolve(false)
		);
	}
	else {
		editorEntityVisitPromise = Promise.resolve(false);
	}

	let alertPromise = editorEntityVisitPromise.then((visitAlert) => {
		let alertIds = [];
		if (visitAlert.alert) {
			alertIds = alertIds.concat(visitAlert.alert.split(',').map((id) =>
				parseInt(id, 10)
			));
		}
		if (req.query.alert) {
			alertIds = alertIds.concat(req.query.alert.split(',').map((id) =>
				parseInt(id, 10)
			));
		}
		if (alertIds.length > 0) {
			const promiseList = alertIds.map((achievementAlert) =>
				new AchievementUnlock({id: achievementAlert})
					.fetch({
						require: 'true',
						withRelated: 'achievement'
					})
					.then((unlock) =>
						unlock.toJSON()
					)
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
						console.log(error);
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
			const props = propHelpers.generateProps(req, res, {
				identifierTypes,
				alert
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<EntityContainer
						{...propHelpers.extractEntityProps(props)}
						iconName={EntityComponent.iconName}
						attributes={EntityComponent.attributes(props.entity)}
					>
						<EntityComponent
							entity={props.entity}
						/>
					</EntityContainer>
				</Layout>
			);
			res.render('target', {markup, props});
		}
		else {
			throw new Error(
				`Component was not found for the following entity:${entityName}`
			);
		}
	});
};

module.exports.displayDeleteEntity = (req, res) => {
	const props = {
		entity: res.locals.entity
	};

	res.render('common', {
		markup: ReactDOMServer.renderToString(DeletionForm(props)),
		task: 'delete',
		script: 'deletion',
		props
	});
};

module.exports.displayRevisions = (req, res, next, RevisionModel) => {
	const bbid = req.params.bbid;

	return new RevisionModel()
		.where({bbid})
		.fetchAll({
			withRelated: ['revision', 'revision.author', 'revision.notes']
		})
		.then((collection) => {
			const revisions = collection.toJSON();
			const props = propHelpers.generateProps(req, res, {
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
			return res.render('target', {markup});
		})
		.catch(next);
};

function _createNote(content, editor, revision, transacting) {
	if (content) {
		const revisionId = revision.get('id');
		return new Note({
			authorId: editor.id,
			revisionId,
			content
		})
			.save(null, {transacting});
	}

	return null;
}

module.exports.addNoteToRevision = (req, res) => {
	const editorJSON = req.session.passport.user;
	const revision = Revision.forge({id: req.params.id});
	const revisionNotePromise = bookshelf.transaction((transacting) =>
		_createNote(
			req.body.note, editorJSON, revision, transacting
		)
	);
	return handler.sendPromiseResult(res, revisionNotePromise);
};

module.exports.handleDelete = (req, res, HeaderModel, RevisionModel) => {
	const entity = res.locals.entity;
	const editorJSON = req.session.passport.user;

	const entityDeletePromise = bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				req.body.note, editorJSON, revision, transacting
			));

		// No trigger for deletions, so manually create the <Entity>Revision
		// and update the entity header
		const newEntityRevisionPromise = newRevisionPromise
			.then((revision) => new RevisionModel({
				id: revision.get('id'),
				bbid: entity.bbid,
				dataId: null
			}).save(null, {method: 'insert', transacting}));

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
};

function setHasChanged(oldSet, newSet, idField, compareFields) {
	const oldSetIds = _.map(oldSet, idField);
	const newSetIds = _.map(newSet, idField);

	const oldSetHash = {};
	oldSet.forEach((item) => { oldSetHash[item[idField]] = item; });

	// First, determine whether any items have been deleted or added, by
	// excluding all new IDs from the old IDs and checking whether any IDs
	// remain, and vice versa
	const itemsHaveBeenDeletedOrAdded =
		_.difference(oldSetIds, newSetIds).length > 0 ||
		_.difference(newSetIds, oldSetIds).length > 0;

	if (itemsHaveBeenDeletedOrAdded) {
		return true;
	}

	// If no list of fields for comparison is provided and no items have been
	// deleted or added, consider the set unchanged
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
	if (!setHasChanged(
			oldItems,
			formItems,
			setMetadata.idField,
			setMetadata.mutableFields
		)) {
		return oldSet;
	}

	// If we have no items for the set, the set should be null
	if (_.isEmpty(formItems)) {
		return null;
	}

	const newSetPromise = setMetadata.model.forge()
		.save(null, {transacting});

	const fetchCollectionPromise = newSetPromise
		.then((newSet) =>
			newSet.related(setMetadata.propName)
				.fetch({transacting})
		);

	let createPropertiesPromise = null;
	let idsToAttach;

	if (!setMetadata.mutableFields) {
		// If the set's elements aren't mutable, it should just be a list of IDs
		idsToAttach = formItems;
	}
	else {
		// If there are items in the set which haven't changed, get their IDs
		const unchangedItems = unchangedSetItems(
			oldItems,
			formItems,
			setMetadata.mutableFields
		);
		idsToAttach = _.map(unchangedItems, setMetadata.idField);

		// If there are new items in the set or items in the set have otherwise
		// changed, add rows to the database and connect them to the set
		const updatedOrNewItems = updatedOrNewSetItems(
			oldItems,
			formItems,
			setMetadata.mutableFields
		);

		createPropertiesPromise = fetchCollectionPromise
			.then((collection) =>
				Promise.map(updatedOrNewItems, (item) =>
					collection.create(
						_.omit(item, setMetadata.idField),
						{transacting}
					)
				)
			);
	}

	// Link any IDs for unchanged items (including immutable) to the set
	const attachPropertiesPromise = fetchCollectionPromise
		.then((collection) =>
			collection.attach(idsToAttach, {transacting})
		);

	// Ensure that any linking that needs to happen to the set is completed
	// and return the new set's object
	return Promise.join(
		newSetPromise,
		Promise.resolve(createPropertiesPromise),
		attachPropertiesPromise,
		(newSet) => newSet
	);
}

function processFormAliases(
	transacting, oldAliasSet, oldDefaultAliasId, newAliases
) {
	const oldAliases =
		oldAliasSet ? oldAliasSet.related('aliases').toJSON() : [];
	const aliasCompareFields =
		['name', 'sortName', 'languageId', 'primary'];
	const aliasesHaveChanged = setHasChanged(
		oldAliases, newAliases, 'id', aliasCompareFields
	);

	// If there is no change to the set of aliases, and the default alias is
	// the same, skip alias processing
	const newDefaultAlias = _.find(newAliases, 'default');
	if (!aliasesHaveChanged && newDefaultAlias.id === oldDefaultAliasId) {
		return oldAliasSet;
	}

	// Make a new alias set
	const newAliasSetPromise = new AliasSet().save(null, {transacting});
	const newAliasesPromise = newAliasSetPromise.then((newAliasSet) =>
		newAliasSet.related('aliases').fetch({transacting})
	);

	// Copy across any old aliases that are exactly the same in the new set
	const unchangedAliases =
		unchangedSetItems(oldAliases, newAliases, aliasCompareFields);
	const oldAliasesAttachedPromise = newAliasesPromise.then((collection) =>
		collection.attach(_.map(unchangedAliases, 'id'), {transacting})
	);

	// Create new aliases for any new or updated aliases, and attach them to
	// the set
	const newOrUpdatedAliases =
		updatedOrNewSetItems(oldAliases, newAliases, aliasCompareFields);
	const allAliasesAttachedPromise = oldAliasesAttachedPromise
		.then((collection) =>
			Promise.all(
				_.map(newOrUpdatedAliases, (alias) =>
					collection.create(
						_.omit(alias, 'id', 'default'),
						{transacting}
					)
				)
			).then(() => collection)
		);

	// Set the default alias
	return Promise.join(newAliasSetPromise, allAliasesAttachedPromise,
		(newAliasSet, collection) => {
			const defaultAlias = collection.find((alias) =>
				alias.get('name') === newDefaultAlias.name &&
				alias.get('sortName') === newDefaultAlias.sortName &&
				alias.get('languageId') === newDefaultAlias.languageId
			);
			newAliasSet.set('defaultAliasId', defaultAlias.get('id'));
			return newAliasSet.save(null, {transacting});
		}
	);
}

function processFormIdentifiers(transacting, oldIdentSet, newIdents) {
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
	const newIdentSetPromise = new IdentifierSet().save(null, {transacting});
	const newIdentsPromise = newIdentSetPromise.then((newIdentSet) =>
		newIdentSet.related('identifiers').fetch({transacting})
	);

	// Copy across any old aliases that are exactly the same in the new set
	const unchangedIdents =
		unchangedSetItems(oldIdents, newIdents, identCompareFields);
	const oldIdentsAttachedPromise = newIdentsPromise.then((collection) =>
		collection.attach(_.map(unchangedIdents, 'id'), {transacting})
	);

	// Create new aliases for any new or updated aliases, and attach them to
	// the set
	const newOrUpdatedIdents =
		updatedOrNewSetItems(oldIdents, newIdents, identCompareFields);
	const allIdentsAttachedPromise = oldIdentsAttachedPromise
		.then((collection) =>
			Promise.all(
				_.map(newOrUpdatedIdents, (ident) =>
					collection.create(_.omit(ident, 'id'), {transacting})
				)
			).then(() => collection)
		);

	return Promise.join(newIdentSetPromise, allIdentsAttachedPromise,
		(newIdentSet) => newIdentSet
	);
}

function processFormAnnotation(
	transacting, oldAnnotation, newContent, revision
) {
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
	transacting, oldDisambiguation, newComment
) {
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
					withRelated: [derivedSet.propName],
					transacting
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
		.then((newProps) =>
			_.reduce(newProps, (result, value) => _.assign(result, value), {})
		);
}

module.exports.createEntity = (
	req,
	res,
	entityType,
	derivedProps,
	derivedSets
) => {
	const editorJSON = req.session.passport.user;
	const entityCreationPromise = bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = newRevisionPromise
			.then((revision) => _createNote(
				req.body.note, editorJSON, revision, transacting
			));

		const aliasSetPromise = processFormAliases(
			transacting, null, null, req.body.aliases || []
		);

		const identSetPromise = processFormIdentifiers(
			transacting, null, req.body.identifiers || []
		);

		const annotationPromise = newRevisionPromise.then((revision) =>
			processFormAnnotation(
				transacting, null, req.body.annotation, revision
			)
		);

		const disambiguationPromise = processFormDisambiguation(
			transacting, null, req.body.disambiguation
		);

		const derivedPropsPromise = Promise.resolve(
			processEntitySets(
				derivedSets,
				null,
				req.body,
				transacting
			)
		)
			.then((derivedSetProps) =>
				_.merge({}, derivedProps, derivedSetProps)
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
					identifierSetId: identSet && identSet.get('id'),
					annotationId: annotation && annotation.get('id'),
					disambiguationId:
						disambiguation && disambiguation.get('id'),
					revisionId: newRevision.get('id')
				}, allProps);

				const model = utils.getEntityModelByType(entityType);

				return model.forge(propsToSet)
					.save(null, {method: 'insert', transacting});
			})
			.then(
				(entityModel) =>
					entityModel.refresh({
						withRelated: ['defaultAlias'],
						transacting
					})
			)
			.then((entity) => entity.toJSON());
	});

	const achievementPromise = entityCreationPromise.then((entityJSON) =>
		achievement.processEdit(
			editorJSON.id,
			entityJSON.revisionId
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
};

module.exports.editEntity = (
	req,
	res,
	entityType,
	derivedProps,
	derivedSets
) => {
	const editorJSON = req.session.passport.user;
	const model = utils.getEntityModelByType(entityType);

	const entityEditPromise = bookshelf.transaction((transacting) => {
		const currentEntity = res.locals.entity;

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const oldAliasSetPromise = currentEntity.aliasSet &&
			new AliasSet({id: currentEntity.aliasSet.id})
				.fetch({withRelated: ['aliases'], transacting});

		const aliasSetPromise = Promise.resolve(oldAliasSetPromise)
			.then((oldAliasSet) =>
				processFormAliases(
					transacting, oldAliasSet,
					oldAliasSet.get('defaultAliasId'),
					req.body.aliases || []
				)
			);

		const oldIdentSetPromise = currentEntity.identifierSet &&
			new IdentifierSet({id: currentEntity.identifierSet.id})
				.fetch({withRelated: ['identifiers'], transacting});

		const identSetPromise = Promise.resolve(oldIdentSetPromise)
			.then((oldIdentifierSet) =>
				processFormIdentifiers(
					transacting, oldIdentifierSet,
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
					transacting, oldAnnotation, req.body.annotation, revision
				)
			);

		const oldDisambiguationPromise = currentEntity.disambiguation &&
			new Disambiguation({id: currentEntity.disambiguation.id})
				.fetch({transacting});

		const disambiguationPromise = Promise.resolve(oldDisambiguationPromise)
			.then((oldDisambiguation) =>
				processFormDisambiguation(
					transacting, oldDisambiguation, req.body.disambiguation
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
			.then((derivedSetProps) =>
				_.merge({}, derivedProps, derivedSetProps)
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
					identifierSetId: identSet && identSet.get('id'),
					annotationId: annotation && annotation.get('id'),
					disambiguationId: disambiguation && disambiguation.get('id')
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
				_.forOwn(changedProps, (value, key) =>
					entity.set(key, value)
				);

				entity.set('revisionId', newRevision.get('id'));

				const editorUpdatePromise =
					utils.incrementEditorEditCountById(
						editorJSON.id,
						transacting
					);

				// Get the parents of the new revision
				const revisionParentsPromise =
					newRevision.related('parents').fetch({transacting});

				// Add the previous revision as a parent of this revision.
				const parentAddedPromise =
					revisionParentsPromise.then((parents) =>
						parents.attach(currentEntity.revisionId, {transacting})
					);

				const notePromise = _createNote(
					req.body.note, editorJSON, newRevision, transacting
				);

				return Promise.join(
					entity.save(null, {method: 'update', transacting}),
					editorUpdatePromise,
					parentAddedPromise,
					notePromise
				);
			})
			.spread(
				() => model.forge({bbid: currentEntity.bbid})
					.fetch({withRelated: ['defaultAlias'], transacting})
			)
			.then((entity) =>
				entity.toJSON()
			)
			.then((entityJSON) =>
				achievement.processEdit(req.user.id, entityJSON.revisionId)
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
};
