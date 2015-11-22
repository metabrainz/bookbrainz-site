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

const CreatorType = require('../data/properties/creator-type');
const EditionStatus = require('../data/properties/edition-status');
const EditionFormat = require('../data/properties/edition-format');
const Entity = require('../data/entity');
const Gender = require('../data/properties/gender');
const Language = require('../data/properties/language');
const PublicationType = require('../data/properties/publication-type');
const PublisherType = require('../data/properties/publisher-type');
const WorkType = require('../data/properties/work-type');
const IdentifierType = require('../data/properties/identifier-type');

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
	Promise.map(entity.relationships, (relationship) => {
		relationship.template = relationship.relationship_type.template;

		const relEntities = relationship.entities.sort(
			(a, b) => a.position - b.position
		);

		return Promise.map(
			relEntities,
			(relEntity) => Entity.findOne(relEntity.entity.entity_gid)
		)
			.then((loadedEntities) => {
				relationship.rendered =
					renderRelationship(loadedEntities, relationship, null);

				return relationship;
			});
	})
		.then((relationships) => {
			res.locals.entity.relationships = relationships;

			next();
		})
		.catch(next);
};

middleware.makeEntityLoader = function makeEntityLoader(model, errMessage) {
	const bbidRegex =
		/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
	return function loaderFunc(req, res, next, bbid) {
		if (bbidRegex.test(bbid)) {
			const populate = [
				'annotation',
				'disambiguation',
				'relationships',
				'aliases',
				'identifiers'
			];

			// XXX: Don't special case this; instead, let the route specify
			switch (model.name) {
				case 'Edition':
					populate.push('publication');
					populate.push('publisher');
					break;
				case 'Publication':
					populate.push('editions');
					break;
				case 'Publisher':
					populate.push('editions');
					break;
				// no default
			}

			return model.findOne(bbid, {populate})
				.then((entity) => {
					res.locals.entity = entity;

					next();
				})
				.catch((err) => {
					if (err.status === status.SEE_OTHER) {
						return next(new NotFoundError(errMessage));
					}

					next(err);
				});
		}

		return next('route');
	};
};

module.exports = middleware;
