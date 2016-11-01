/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

// XXX: Don't directly pull in bookshelf
const bookshelf = require('bookbrainz-data').bookshelf;

const auth = require('../../helpers/auth');
const error = require('../../helpers/error');
const utils = require('../../helpers/utils');

const Editor = require('bookbrainz-data').Editor;
const Relationship = require('bookbrainz-data').Relationship;
const RelationshipSet = require('bookbrainz-data').RelationshipSet;
const RelationshipType = require('bookbrainz-data').RelationshipType;
const Revision = require('bookbrainz-data').Revision;

const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;

const EditForm = React.createFactory(
	require('../../../client/components/forms/relationship')
);

const relationshipHelper = {};

function getEntityByType(entity, withRelated, transacting) {
	const model = utils.getEntityModelByType(entity.type);

	return model.forge({bbid: entity.bbid}).fetch({
		withRelated,
		transacting
	});
}

function copyRelationshipsAndAdd(
	transacting, oldRelationshipSet, newRelationshipSet, newRelationship
) {
	const oldRelationshipSetPromise = oldRelationshipSet.fetch({transacting});
	return oldRelationshipSetPromise.then((relationshipSet) => {
		const newRelationshipsPromise =
			newRelationshipSet.related('relationships').fetch({transacting});

		if (!relationshipSet) {
			return newRelationshipsPromise.then((newRelationships) =>
				newRelationships.attach(
					newRelationship.get('id'), {transacting}
				)
			);
		}

		const oldRelationshipsPromise =
			relationshipSet.related('relationships').fetch({transacting});

		return Promise.join(oldRelationshipsPromise, newRelationshipsPromise,
			(oldRelationships, newRelationships) => {
				const relationshipsToBeAdded = _.concat(
					oldRelationships.map('id'), newRelationship.get('id')
				);
				return newRelationships
					.attach(relationshipsToBeAdded, {transacting});
			}
		);
	});
}

function addRelationshipToEntity(transacting, entityJSON, rel, revision) {
	const newRelationshipSetPromise =
		new RelationshipSet().save(null, {transacting});
	const entityPromise =
		getEntityByType(entityJSON, 'relationshipSet', transacting);

	// Add all the old relationships to the new set, plus the new relationship
	const relationshipsBuiltPromise =
		Promise.join(newRelationshipSetPromise, entityPromise,
			(newRelSet, entity) =>
				copyRelationshipsAndAdd(
					transacting, entity.related('relationshipSet'), newRelSet,
					rel
				)
			);

	// Get the parents of the new revision
	const revisionParentsPromise =
		revision.related('parents').fetch({transacting});

	// Add the previous revision as a parent of this revision.
	const parentAddedPromise = Promise.join(
		revisionParentsPromise, entityPromise,
		(parents, entity) => {
			const parentSet = parents.find(
				(parent) => parent.get('id') === entity.get('revisionId')
			);

			if (parentSet) {
				return Promise.resolve(null);
			}

			return parents.attach(
				entity.get('revisionId'), {transacting}
			);
		}
	);

	// Finally, update the revision ID and relationship set ID of the entity
	const entityUpdatedPromise =
		Promise.join(
			entityPromise, newRelationshipSetPromise, parentAddedPromise,
			(entity, newRelationshipSet) => {
				entity.set('revisionId', revision.get('id'));
				entity.set('relationshipSetId', newRelationshipSet.get('id'));
				return entity.save(null, {transacting});
			});

	return Promise.join(
		relationshipsBuiltPromise, parentAddedPromise, entityUpdatedPromise
	);
}

function createRelationship(relationship, editorJSON) {
	return bookshelf.transaction((transacting) => {
		const editorUpdatePromise = new Editor({id: editorJSON.id})
			.fetch({transacting})
			.then((editor) => {
				editor.set(
					'totalRevisions', editor.get('totalRevisions') + 1
				);
				editor.set(
					'revisionsApplied', editor.get('revisionsApplied') + 1
				);
				return editor.save(null, {transacting});
			});

		// Make new relationship
		const newRelationshipPromise = new Relationship({
			typeId: relationship.typeId,
			sourceBbid: relationship.source.bbid,
			targetBbid: relationship.target.bbid
		}).save(null, {transacting});

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		// Update the relationship for the source and target entities
		return Promise.join(newRelationshipPromise, newRevisionPromise,
			(newRelationship, newRevision) => {
				const sourcePromise = addRelationshipToEntity(
					transacting, relationship.source, newRelationship,
					newRevision
				);

				const targetPromise = sourcePromise.then(() =>
					addRelationshipToEntity(
						transacting, relationship.target, newRelationship,
						newRevision
					)
				);

				return Promise.join(
					editorUpdatePromise, targetPromise
				);
			});
	});
}

relationshipHelper.addEditRoutes = function addEditRoutes(router) {
	router.get('/:bbid/relationships', auth.isAuthenticated,
		loadEntityRelationships,
		(req, res, next) => {
			const relationshipTypesPromise = new RelationshipType().fetchAll();

			const loadedEntities = {};
			res.locals.entity.relationships.forEach((relationship) => {
				loadedEntities[relationship.sourceBbid] = relationship.source;
				loadedEntities[relationship.targetBbid] = relationship.target;
			});

			relationshipTypesPromise
				.then((collection) => collection.toJSON())
				.then((relationshipTypes) => {
					// _.omit is used here to avoid "Circular reference" errors
					const props = {
						entity: _.omit(res.locals.entity, 'relationships'),
						relationships: res.locals.entity.relationships,
						relationshipTypes,
						loadedEntities
					};

					const markup =
						ReactDOMServer.renderToString(EditForm(props));

					res.render('relationship/edit', {
						props,
						markup
					});
				})
				.catch(next);
		}
	);

	router.post('/:bbid/relationships/handler', auth.isAuthenticatedForHandler,
		(req, res) => {
			function relationshipValid(relationship) {
				return _.has(relationship, 'typeId') &&
					_.has(relationship, 'source.bbid') &&
					_.has(relationship, 'target.bbid') &&
					relationship.source.bbid !== relationship.target.bbid;
			}

			// Send a relationship revision for each of the relationships
			const relationshipsPromise = Promise.all(
				req.body.map((rel) => {
					if (!relationshipValid(rel)) {
						return null;
					}

					return createRelationship(rel, req.session.passport.user);
				})
			);

			return relationshipsPromise
				.then(() =>
					res.send({result: 'success'})
				)
				.catch((err) => error.sendErrorAsJSON(res, err));
		}
	);
};

module.exports = relationshipHelper;
