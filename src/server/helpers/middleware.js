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

const renderRelationship = require('../helpers/render');
const utils = require('../helpers/utils');

const NotFoundError = require('../helpers/error').NotFoundError;
const SiteError = require('../helpers/error').SiteError;

function makeLoader(modelName, propName, sortFunc) {
	return function loaderFunc(req, res, next) {
		const model = req.app.locals.orm[modelName];
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

middleware.loadCreatorTypes = makeLoader('CreatorType', 'creatorTypes');
middleware.loadEditionFormats = makeLoader('EditionFormat', 'editionFormats');
middleware.loadEditionStatuses = makeLoader('EditionStatus', 'editionStatuses');
middleware.loadIdentifierTypes =
	makeLoader('IdentifierType', 'identifierTypes');
middleware.loadPublicationTypes =
	makeLoader('PublicationType', 'publicationTypes');
middleware.loadPublisherTypes = makeLoader('PublisherType', 'publisherTypes');
middleware.loadWorkTypes = makeLoader('WorkType', 'workTypes');

middleware.loadGenders = makeLoader('Gender', 'genders', (a, b) => a.id > b.id);

middleware.loadLanguages = makeLoader('Language', 'languages', (a, b) => {
	if (a.frequency !== b.frequency) {
		return b.frequency - a.frequency;
	}

	return a.name.localeCompare(b.name);
});

middleware.loadEntityRelationships = (req, res, next) => {
	const {orm} = req.app.locals;
	const {RelationshipSet} = orm;
	const entity = res.locals.entity;

	new Promise((resolve) => {
		if (!entity) {
			throw new SiteError('Failed to load entity');
		}

		resolve();
	})
		.then(() =>
			RelationshipSet.forge({id: entity.relationshipSetId})
				.fetch({
					withRelated: [
						'relationships.source',
						'relationships.target',
						'relationships.type'
					]
				})
		)
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

middleware.makeEntityLoader = (modelName, additionalRels, errMessage) => {
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
		const model = req.app.locals.orm[modelName];
		if (utils.isValidBBID(bbid)) {
			return model.forge({bbid})
				.fetch({
					require: true,
					withRelated: relations
				})
				.then((entity) => {
					res.locals.entity = entity.toJSON();

					next();
				})
				.catch(model.NotFoundError, () => {
					throw new NotFoundError(errMessage);
				})
				.catch(next);
		}

		return next('route');
	};
};

module.exports = middleware;
