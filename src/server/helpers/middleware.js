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
const status = require('http-status');

const dataModels = require('bookbrainz-data');

const CreatorType = require('../data/properties/creator-type');
const EditionStatus = require('../data/properties/edition-status');
const EditionFormat = require('../data/properties/edition-format');
const Gender = require('../data/properties/gender');
const Language = require('../data/properties/language');
const PublicationType = require('../data/properties/publication-type');
const PublisherType = require('../data/properties/publisher-type');
const WorkType = require('../data/properties/work-type');
const IdentifierType = require('../data/properties/identifier-type');

const RelationshipSet = require('bookbrainz-data').RelationshipSet;

const renderRelationship = require('../helpers/render');

const NotFoundError = require('../helpers/error').NotFoundError;

function makeLoader(model, propName, sortFunc) {
	return function loaderFunc(req, res, next) {
		model.find()
			.then((results) => {
				res.locals[propName] =
					sortFunc ? results.sort(sortFunc) : results;

				next();
			})
			.catch(next);
	};
}

const middleware = {};

middleware.loadCreatorTypes = makeLoader(CreatorType, 'creatorTypes');
middleware.loadPublicationTypes =
	makeLoader(PublicationType, 'publicationTypes');
middleware.loadEditionFormats = makeLoader(EditionFormat, 'editionFormats');
middleware.loadEditionStatuses = makeLoader(EditionStatus, 'editionStatuses');
middleware.loadPublisherTypes = makeLoader(PublisherType, 'publisherTypes');
middleware.loadWorkTypes = makeLoader(WorkType, 'workTypes');
middleware.loadIdentifierTypes = makeLoader(IdentifierType, 'identifierTypes');

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

	RelationshipSet.forge({ id: entity.relationshipSetId })
		.fetch({
			withRelated: [
				'relationships.source',
				'relationships.target',
				'relationships.type'
			]
		})
		.then((relationshipSet) => {
			entity.relationships =
				relationshipSet.related('relationships').toJSON();

			function getEntityWithAlias(entity) {
				return dataModels[entity.type].forge({ bbid: entity.bbid })
					.fetch({ withRelated: 'defaultAlias' });
			};

			/**
			 * Source and target are generic Entity objects, so until we have
			 * a good way of polymorphically fetching the right specific entity,
			 * we need to fetch default alias in a somewhat sketchier way.
			 */
			return Promise.map(entity.relationships, (relationship) => {
				return Promise.join(
					getEntityWithAlias(relationship.source),
					getEntityWithAlias(relationship.target),
					(source, target) => {
						relationship.source = source.toJSON();
						relationship.target = target.toJSON();

						return relationship;
					}
				);
			});
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
	const bbidRegex =
		/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
	const relations = [
		'annotation',
		'disambiguation',
		'defaultAlias'
	].concat(additionalRels);

	return (req, res, next, bbid) => {
		if (bbidRegex.test(bbid)) {
			return new model({bbid})
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
