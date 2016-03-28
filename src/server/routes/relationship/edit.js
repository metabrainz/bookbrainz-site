/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

const auth = require('../../helpers/auth');
const Relationship = require('bookbrainz-data').Relationship;
const RelationshipSet = require('bookbrainz-data').RelationshipSet;
const RelationshipType = require('bookbrainz-data').RelationshipType;
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm = React.createFactory(
	require('../../../client/components/forms/relationship.jsx')
);
const bookshelf = require('bookbrainz-data').bookshelf;
const Promise = require('bluebird');
const _ = require('lodash');
const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Publisher = require('bookbrainz-data').Publisher;
const Publication = require('bookbrainz-data').Publication;
const Work = require('bookbrainz-data').Work;
const Revision = require('bookbrainz-data').Revision;
const Editor = require('bookbrainz-data').Editor;

const relationshipHelper = {};

const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;

function getEntityByType(entity, withRelated, transacting) {
	switch (entity.type) {
		case 'Creator':
			return new Creator({bbid: entity.bbid})
				.fetch({withRelated, transacting});
		case 'Edition':
			return new Edition({bbid: entity.bbid})
				.fetch({withRelated, transacting});
		case 'Publisher':
			return new Publisher({bbid: entity.bbid})
				.fetch({withRelated, transacting});
		case 'Publication':
			return new Publication({bbid: entity.bbid})
				.fetch({withRelated, transacting});
		case 'Work':
			return new Work({bbid: entity.bbid})
				.fetch({withRelated, transacting});
		default:
			throw Error('Unrecognized entity type!');
	}
}

function copyRelationshipsAndAdd(
	transacting, oldRelationshipSet, newRelationshipSet, newRelationship
) {
	const oldRelationshipsPromise =
		oldRelationshipSet.related('relationships').fetch({transacting});
	const newRelationshipsPromise =
		newRelationshipSet.related('relationships').fetch({transacting});

	return Promise.join(oldRelationshipsPromise, newRelationshipsPromise,
		(oldRelationships, newRelationships) => {
			const relationshipsToBeAdded = _.concat(
				oldRelationships.map('id'), newRelationship.get('id')
			);
			return newRelationships
				.attach(relationshipsToBeAdded, {transacting});
		}
	);
}

function addRelationshipToEntity(transacting, entityJSON, rel, revision) {
	const newRelationshipSetPromise = new RelationshipSet().save(null, {transacting});
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
		(parents, entity) => parents.attach(
			entity.get('revisionId'), {transacting}
		)
	);

	// Finally, update the revision ID and relationship set ID of the entity
	const entityUpdatedPromise =
		Promise.join(entityPromise, newRelationshipSetPromise,
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

				const targetPromise = addRelationshipToEntity(
					transacting, relationship.target, newRelationship,
					newRevision
				);

				return Promise.join(
					editorUpdatePromise, sourcePromise, targetPromise
				);
			});
	});
}

relationshipHelper.addEditRoutes = function addEditRoutes(router) {
	router.get('/:bbid/relationships', loadEntityRelationships, (req, res) => {
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

			const markup = ReactDOMServer.renderToString(EditForm(props));

			res.render('relationship/edit', {props, markup});
		});
	});

	router.post('/:bbid/relationships/handler', auth.isAuthenticated,
		(req, res) => {
			function relationshipValid(relationship) {
				return _.has(relationship, 'typeId') &&
					_.has(relationship, 'source.bbid') &&
					_.has(relationship, 'target.bbid');
			}

			// Send a relationship revision for each of the relationships
			const relationshipsPromise = Promise.all(
				req.body.map((rel) => {
					if (!relationshipValid(rel)) {
						console.log('Relationship invalid');
						return null;
					}

					return createRelationship(rel, req.session.passport.user);
				})
			);

			return relationshipsPromise.then(() => {
				return res.send({result: 'success'});
			})
			.catch(() => {
				return res.send({result: 'error'});
			});
		}
	);
};

module.exports = relationshipHelper;
