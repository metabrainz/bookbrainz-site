/*
 * Copyright (C) 2016  Sean Burke
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

const ElasticSearch = require('elasticsearch');
const Promise = require('bluebird');
const _ = require('lodash');

const utils = require('../helpers/utils');

const Publication = require('bookbrainz-data').Publication;
const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Work = require('bookbrainz-data').Work;
const Publisher = require('bookbrainz-data').Publisher;

const search = {};

const _index = 'bookbrainz';

let _client = null;

search.init = (options) => {
	const config = _.extend({
		defer() {
			return Promise.defer();
		}
	}, options);

	_client = ElasticSearch.Client(config);
};

function _fetchEntityModelsForESResults(results) {
	if (!results.hits) {
		return null;
	}

	return Promise.map(results.hits, (hit) => {
		const entityStub = hit._source;
		const model = utils.getEntityModelByType(entityStub.type);

		return model.forge({bbid: entityStub.bbid})
			.fetch({withRelated: ['defaultAlias']})
			.then((entity) => entity.toJSON());
	});
}

// Returns the results of a search translated to entity objects
function _searchForEntities(dslQuery) {
	return _client.search(dslQuery)
		.then((searchResponse) => searchResponse.hits)
		.then((results) => _fetchEntityModelsForESResults(results));
}

const uuidRegex =
	/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

search.autocomplete = (query, collection) => {
	const isValidBBID = Boolean(uuidRegex.exec(query));

	let queryBody = null;
	if (isValidBBID) {
		queryBody = {
			ids: {
				values: [query]
			}
		};
	}
	else {
		queryBody = {
			match: {
				'defaultAlias.name.autocomplete': {
					query,
					minimum_should_match: '80%'
				}
			}
		};
	}

	const dslQuery = {
		index: _index,
		body: {
			query: queryBody
		}
	};

	if (collection) {
		dslQuery.type = collection;
	}

	return _searchForEntities(dslQuery);
};

search.indexEntity = (entity) =>
	_client.index({
		index: _index,
		id: entity.bbid,
		type: entity.type.toLowerCase(),
		body: entity
	});

search.refreshIndex = () =>
	_client.indices.refresh({index: _index});

search.generateIndex = () => {
	const indexMappings = {
		settings: {
			analysis: {
				filter: {
					trigrams_filter: {
						type: 'ngram',
						min_gram: 1,
						max_gram: 3
					},
					edge_filter: {
						type: 'edge_ngram',
						min_gram: 1,
						max_gram: 20
					}
				},
				analyzer: {
					trigrams: {
						type: 'custom',
						tokenizer: 'standard',
						filter: [
							'asciifolding',
							'lowercase',
							'trigrams_filter'
						]
					},
					edge: {
						type: 'custom',
						tokenizer: 'standard',
						filter: [
							'asciifolding',
							'lowercase',
							'edge_filter'
						]
					}
				}
			}
		},
		mappings: {
			_default_: {
				properties: {
					defaultAlias: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
								fields: {
									search: {
										type: 'string',
										analyzer: 'trigrams'
									},
									autocomplete: {
										type: 'string',
										analyzer: 'edge'
									}
								}
							}
						}
					}
				}
			}
		}
	};

	// First, drop index and recreate
	return _client.indices.delete({index: _index})
		.catch((err) => {
			/**
			 * If the index is missing, don't worry, it probably never existed;
			 * otherwise, rethrow
 			 */
			if (!err.message.startsWith('IndexMissingException')) {
				throw err;
			}
		})
		.then(() => _client.indices.create(
			{index: _index, body: indexMappings}
		))
		.then(() => {
			const baseRelations = [
				'annotation',
				'disambiguation',
				'defaultAlias'
			];

			const entityBehaviors = [
				{model: Creator, relations: ['gender', 'creatorType']},
				{
					model: Edition,
					relations: [
						'publication',
						'editionFormat',
						'editionStatus'
					]
				},
				{model: Publication, relations: ['publicationType']},
				{model: Publisher, relations: ['publisherType']},
				{model: Work, relations: ['workType']}
			];

			// Update the indexed entries for each entity type
			return Promise.map(entityBehaviors, (behavior) =>
				behavior.model.forge()
					.fetchAll({
						withRelated: baseRelations.concat(behavior.relations)
					})
					.then(
						(collection) => Promise.all(
							collection.map(
								(entity) => search.indexEntity(entity.toJSON())
							)
						)
					)
			);
		})
		.then(search.refreshIndex);
};

search.searchByName = (name, collection) => {
	const dslQuery = {
		index: _index,
		body: {
			query: {
				match: {
					'defaultAlias.name.search': {
						query: name,
						minimum_should_match: '80%'
					}
				}
			}
		}
	};

	if (collection) {
		dslQuery.type = collection;
	}

	return _searchForEntities(dslQuery);
};

module.exports = search;
