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

const Promise = require('bluebird');

const utils = require('../helpers/utils');

const CreatorType = require('bookbrainz-data').CreatorType;
const EditionStatus = require('bookbrainz-data').EditionStatus;
const EditionFormat = require('bookbrainz-data').EditionFormat;
const Gender = require('bookbrainz-data').Gender;
const IdentifierType = require('bookbrainz-data').IdentifierType;
const Language = require('bookbrainz-data').Language;
const PublicationType = require('bookbrainz-data').PublicationType;
const PublisherType = require('bookbrainz-data').PublisherType;
const RelationshipSet = require('bookbrainz-data').RelationshipSet;
const WorkType = require('bookbrainz-data').WorkType;

const renderRelationship = require('../helpers/render');

const NotFoundError = require('../helpers/error').NotFoundError;

function makeLoader(model, propName, sortFunc) {
	return function loaderFunc(req, res, next) {
		model.fetchAll()
			.then((results) => {
				const resultsSerial = results.toJSON();

				res.locals[propName] =
					sortFunc ? resultsSerial.sort(sortFunc) : resultsSerial;

				next();
			})
			.catch(next);
	};
}

const middleware = {};

middleware.loadCreatorTypes = makeLoader(CreatorType, 'creatorTypes');
middleware.loadEditionFormats = makeLoader(EditionFormat, 'editionFormats');
middleware.loadEditionStatuses = makeLoader(EditionStatus, 'editionStatuses');
middleware.loadIdentifierTypes = makeLoader(IdentifierType, 'identifierTypes');
middleware.loadPublicationTypes =
	makeLoader(PublicationType, 'publicationTypes');
middleware.loadPublisherTypes = makeLoader(PublisherType, 'publisherTypes');
middleware.loadWorkTypes = makeLoader(WorkType, 'workTypes');

middleware.loadGenders = makeLoader(Gender, 'genders', (a, b) => a.id > b.id);

middleware.loadLanguages = makeLoader(Language, 'languages', (a, b) => {
	if (a.frequency !== b.frequency) {
		return b.frequency - a.frequency;
	}

	return a.name.localeCompare(b.name);
});

middleware.loadEntityRelationships =
function loadEntityRelationships(req, res, next) {
	if (!res.locals.entity) {
		return next(new Error('Entity failed to load'));
	}

	const entity = res.locals.entity;

	return RelationshipSet.forge({id: entity.relationshipSetId})
		.fetch({
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
				const model = utils.getEntityModelByType(relEntity.type);

				return model.forge({bbid: relEntity.bbid})
					.fetch({withRelated: 'defaultAlias'});
			}

			/**
			 * Source and target are generic Entity objects, so until we have
			 * a good way of polymorphically fetching the right specific entity,
			 * we need to fetch default alias in a somewhat sketchier way.
			 */
			return Promise.map(entity.relationships, (relationship) =>
				Promise.join(
					getEntityWithAlias(relationship.source),
					getEntityWithAlias(relationship.target),
					(source, target) => {
						relationship.source = source.toJSON();
						relationship.target = target.toJSON();

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

			next();
		})
		.catch(next);
};

middleware.makeEntityLoader = (model, additionalRels, errMessage) => {
	const relations = [
		'aliasSet.aliases.language',
		'annotation.lastRevision',
		'defaultAlias',
		'disambiguation',
		'identifierSet.identifiers.type',
		'relationshipSet.relationships.type',
		'revision.revision'
	].concat(additionalRels);

	return (req, res, next, bbid) => {
		if (utils.isValidBBID(bbid)) {
			return model.forge({bbid})
				.fetch({require: true, withRelated: relations})
				.then((entity) => {
					res.locals.entity = entity.toJSON();

					next();
				})
				.catch(model.NotFoundError, () => {
					next(new NotFoundError(errMessage));
				})
				.catch((err) => {
					const internalError =
						new Error('An internal error occurred fetching entity');
					internalError.stack = err.stack;

					next(internalError);
				});
		}

		return next('route');
	};
};

module.exports = middleware;
