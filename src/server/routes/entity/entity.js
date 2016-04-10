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

const bookshelf = require('bookbrainz-data').bookshelf;
const _ = require('lodash');

const utils = require('../../helpers/utils');

const Revision = require('bookbrainz-data').Revision;
const Note = require('bookbrainz-data').Note;
const Disambiguation = require('bookbrainz-data').Disambiguation;
const Annotation = require('bookbrainz-data').Annotation;
const status = require('http-status');
const Promise = require('bluebird');

const AliasSet = require('bookbrainz-data').AliasSet;
const IdentifierSet = require('bookbrainz-data').IdentifierSet;

module.exports.displayEntity = (req, res) => {
	const entity = res.locals.entity;

	// Get unique identifier types for display
	const identifierTypes = entity.identifierSet &&
		_.uniq(
			_.map(entity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	res.render(
		`entity/view/${entity.type.toLowerCase()}`,
		{identifierTypes}
	);
};

module.exports.displayDeleteEntity = (req, res) => {
	res.render('entity/delete');
};

module.exports.displayRevisions = (req, res, RevisionModel) => {
	const bbid = req.params.bbid;

	return new RevisionModel()
		.where({bbid})
		.fetchAll({withRelated: ['revision', 'revision.author']})
		.then((collection) => {
			const revisions = collection.toJSON();
			return res.render('entity/revisions', {revisions});
		});
};

module.exports.handleDelete = (req, res, HeaderModel, RevisionModel) => {
	const entity = res.locals.entity;
	const editorJSON = req.session.passport.user;

	return bookshelf.transaction((transacting) => {
		const editorUpdatePromise =
			utils.incrementEditorEditCountById(editorJSON.id, transacting);

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = req.body.note ? newRevisionPromise
			.then((revision) => new Note({
				authorId: editorJSON.id,
				revisionId: revision.get('id'),
				content: req.body.note
			}).save(null, {transacting})) : null;

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
	})
		.then(() => {
			res.redirect(
				status.SEE_OTHER, `/${entity.type.toLowerCase()}/${entity.bbid}`
			);
		});
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
	console.log(JSON.stringify(oldSet));
	console.log(JSON.stringify(newSet));
	return _.intersectionBy(
		newSet,
		oldSet,
		(item) => _.pick(item, compareFields)
	);
}
module.exports.unchangedSetItems = unchangedSetItems;

function updatedOrNewSetItems(oldSet, newSet, compareFields) {
	console.log(JSON.stringify(oldSet));
	console.log(JSON.stringify(newSet));
	return _.differenceBy(
		newSet, oldSet, (item) => _.pick(item, compareFields)
	);
}
module.exports.updatedOrNewSetItems = updatedOrNewSetItems;

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
module.exports.processFormAliases = processFormAliases;

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
	console.log(`Unchanged: ${JSON.stringify(unchangedIdents)}`);
	const oldIdentsAttachedPromise = newIdentsPromise.then((collection) =>
		collection.attach(_.map(unchangedIdents, 'id'), {transacting})
	);

	// Create new aliases for any new or updated aliases, and attach them to
	// the set
	const newOrUpdatedIdents =
		updatedOrNewSetItems(oldIdents, newIdents, identCompareFields);
	console.log(`New: ${JSON.stringify(newOrUpdatedIdents)}`);
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
module.exports.processFormIdentifiers = processFormIdentifiers;

function processFormAnnotation(
	oldAnnotation, newContent
) {
	const oldContent = oldAnnotation && oldAnnotation.get('content');

	if (newContent === oldContent) {
		return oldAnnotation;
	}

	return newContent ? new Annotation({
		content: newContent
	}) : null;
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
			_.reduce(newProps, (result, value, key) => {
				result[key] = value;

				return result;
			}, {})
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

		const notePromise = req.body.note ? newRevisionPromise
			.then((revision) => new Note({
				authorId: editorJSON.id,
				revisionId: revision.get('id'),
				content: req.body.note
			}).save(null, {transacting})) : null;

		const aliasSetPromise = processFormAliases(
			transacting, null, null, req.body.aliases || []
		);

		const identSetPromise = processFormIdentifiers(
			transacting, null, req.body.identifiers || []
		);

		const annotationPromise = newRevisionPromise.then(() =>
			processFormAnnotation(
				null, req.body.annotation
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

				let annotationSavePromise = null;

				if (annotation) {
					annotationSavePromise =
						annotation
							.set('lastRevisionId', newRevision.get('id'))
							.save(null, {transacting});
				}

				const model = utils.getEntityModelByType(entityType);

				return Promise.join(
					model.forge(propsToSet)
						.save(null, {method: 'insert', transacting}),
					annotationSavePromise
				);
			})
			.spread(
				(entityModel) => entityModel.refresh({transacting})
			)
			.then((entity) => entity.toJSON());
	});

	return entityCreationPromise.then((entity) =>
		res.send(entity)
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

	const entityEditPromise = bookshelf.transaction((transacting) => {
		const currentEntity = res.locals.entity;

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

		const annotationPromise = Promise.resolve(oldAnnotationPromise)
			.then((oldAnnotation) =>
				processFormAnnotation(
					oldAnnotation, req.body.annotation
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
			aliasSetPromise,
			identSetPromise,
			annotationPromise,
			disambiguationPromise,
			derivedPropsPromise,
			(aliasSet, identSet, annotation, disambiguation, allProps) => {
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

				const model = utils.getEntityModelByType(entityType);

				const entityPromise = model.forge({bbid: currentEntity.bbid})
					.fetch();

				return Promise.join(entityPromise, annotation, changedProps);
			}
		)
			.spread((entity, annotation, changedProps) => {
				_.forOwn(changedProps, (value, key) =>
					entity.set(key, value)
				);

				const editorUpdatePromise =
					utils.incrementEditorEditCountById(
						editorJSON.id,
						transacting
					);

				const newRevisionPromise = new Revision({
					authorId: editorJSON.id
				}).save(null, {transacting});

				// Get the parents of the new revision
				const revisionParentsPromise =
					newRevisionPromise.then((revision) =>
						revision.related('parents').fetch({transacting})
					);

				// Add the previous revision as a parent of this revision.
				const parentAddedPromise =
					revisionParentsPromise.then((parents) =>
						parents.attach(currentEntity.revisionId, {transacting})
					);

				const notePromise = req.body.note ? newRevisionPromise
					.then((revision) => new Note({
						authorId: editorJSON.id,
						revisionId: revision.get('id'),
						content: req.body.note
					}).save(null, {transacting})) : null;

				return Promise.join(
					newRevisionPromise,
					entity,
					annotation,
					editorUpdatePromise,
					notePromise,
					parentAddedPromise
				);
			})
			.spread((newRevision, entity, annotation) => {
				const revisionId = newRevision.get('id');

				entity.set('revisionId', revisionId);

				let annotationSavePromise = null;

				if (annotation) {
					annotationSavePromise =
						annotation
							.set('lastRevisionId', revisionId)
							.save(null, {transacting});
				}

				return Promise.join(
					entity.save(null, {method: 'update', transacting}),
					annotationSavePromise
				);
			})
			.spread((entity) => entity.refresh({transacting}))
			.then((entity) => entity.toJSON());
	});

	return entityEditPromise.then((entity) =>
		res.send(entity)
	);
};
