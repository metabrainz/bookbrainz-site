/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *               2018       Shivam Tripathi
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

import * as error from '../helpers/error';
import * as utils from '../helpers/utils';
import Promise from 'bluebird';
import _ from 'lodash';
import moment from 'moment';
import renderRelationship from '../helpers/render';


function makeLoader(modelName, propName, sortFunc) {
	return function loaderFunc(req, res, next) {
		const model = req.app.locals.orm[modelName];
		return model.fetchAll()
			.then((results) => {
				const resultsSerial = results.toJSON();

				res.locals[propName] =
					sortFunc ? resultsSerial.sort(sortFunc) : resultsSerial;

				next();
			})
			.catch(next);
	};
}

export const loadCreatorTypes = makeLoader('CreatorType', 'creatorTypes');
export const loadEditionFormats = makeLoader('EditionFormat', 'editionFormats');
export const loadEditionStatuses =
	makeLoader('EditionStatus', 'editionStatuses');
export const loadIdentifierTypes =
	makeLoader('IdentifierType', 'identifierTypes');
export const loadPublicationTypes =
	makeLoader('PublicationType', 'publicationTypes');
export const loadPublisherTypes = makeLoader('PublisherType', 'publisherTypes');
export const loadWorkTypes = makeLoader('WorkType', 'workTypes');

export const loadGenders =
	makeLoader('Gender', 'genders', (a, b) => a.id > b.id);

export const loadLanguages = makeLoader('Language', 'languages', (a, b) => {
	if (a.frequency !== b.frequency) {
		return b.frequency - a.frequency;
	}

	return a.name.localeCompare(b.name);
});

export function loadEntityRelationships(req, res, next) {
	const {orm} = req.app.locals;
	const {RelationshipSet} = orm;
	const {entity} = res.locals;

	new Promise((resolve) => {
		if (!entity) {
			throw new error.SiteError('Failed to load entity');
		}

		resolve();
	})
		.then(
			() => RelationshipSet.forge({id: entity.relationshipSetId})
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
			return Promise.map(
				entity.relationships,
				(relationship) => Promise.join(
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
}

export function makeEntityLoader(modelName, additionalRels, errMessage) {
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
					throw new error.NotFoundError(errMessage, req);
				})
				.catch(next);
		}

		return next('route');
	};
}

export function makeImportLoader(modelName, additionalRels, errMessage) {
	const relations = [
		'aliasSet.aliases.language',
		'defaultAlias',
		'disambiguation',
		'identifierSet.identifiers.type'
	].concat(additionalRels);

	return async (req, res, next, _importId) => {
		const importId = parseInt(_importId, 10);

		if (utils.isValidImportId(importId)) {
		const {orm} = req.app.locals;
		const model = utils.getImportModelByType(orm, modelName);
			try {
				const importEntityRecord = await model.forge({importId})
					.fetch({
						withRelated: relations
					});
				res.locals.importEntity = importEntityRecord.toJSON();

				const [votes, details] = await orm.bookshelf.transaction(
					(transacting) =>
						Promise.all([
							orm.func.imports.discardVotesCast(
								transacting, importId
							),
							orm.func.imports.getImportDetails(
								transacting, importId
							)
						])
				);

				if (_.get(req, 'session.passport.user.id')) {
					const editorId = req.session.passport.user.id;
					res.locals.importEntity.hasVoted =
						votes.length > 0 && Boolean(votes.filter(
							vote => vote.editorId === editorId
						));
				}
				else {
					res.locals.importEntity.hasVoted = false;
				}

				res.locals.importEntity.source = details.source;
				res.locals.importEntity.importedAt =
					moment(details.importedAt).format('YYYY-MM-DD');
			}
			catch (err) {
				throw new error.NotFoundError(errMessage, req);
			}

			return next();
		}

		return next('route');
	};
}
