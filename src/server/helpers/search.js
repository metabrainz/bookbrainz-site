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

import * as utils from '../helpers/utils';
import ElasticSearch from 'elasticsearch';
import Promise from 'bluebird';
import _ from 'lodash';


const _index = 'bookbrainz';

let _client = null;


function _fetchEntityModelsForESResults(orm, results) {
	const {Area} = orm;

	if (!results.hits) {
		return null;
	}

	return Promise.map(results.hits, (hit) => {
		const entityStub = hit._source;

		if (entityStub.type === 'Area') {
			return Area.forge({gid: entityStub.bbid})
				.fetch()
				.then((area) => {
					const areaJSON = area.toJSON();
					areaJSON.defaultAlias = {
						name: areaJSON.name
					};
					areaJSON.type = 'Area';
					return areaJSON;
				});
		}
		const model = utils.getEntityModelByType(orm, entityStub.type);
		return model.forge({bbid: entityStub.bbid})
			.fetch({withRelated: ['defaultAlias']})
			.then((entity) => entity.toJSON());
	});
}

// Returns the results of a search translated to entity objects
function _searchForEntities(orm, dslQuery) {
	return _client.search(dslQuery)
		.then((searchResponse) => searchResponse.hits)
		.then((results) => _fetchEntityModelsForESResults(orm, results));
}

export function autocomplete(orm, query, collection) {
	let queryBody = null;

	if (utils.isValidBBID(query)) {
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
					minimum_should_match: '80%',
					query
				}
			}
		};
	}

	const dslQuery = {
		body: {
			query: queryBody
		},
		index: _index
	};

	if (collection) {
		dslQuery.type = collection;
	}

	return _searchForEntities(orm, dslQuery);
}

export function indexArea(area) {
	return _client.index({
		body: {
			bbid: area.gid,
			defaultAlias: {
				name: area.name
			},
			type: 'Area'
		},
		id: area.gid,
		index: _index,
		type: 'area'
	});
}

export function indexEntity(entity) {
	return _client.index({
		body: entity,
		id: entity.bbid,
		index: _index,
		type: entity.type.toLowerCase()
	});
}

export function refreshIndex() {
	return _client.indices.refresh({index: _index});
}

/* eslint camelcase: 0, no-magic-numbers: 1 */
export async function generateIndex(orm) {
	const {Area, Creator, Edition, Publication, Publisher, Work} = orm;
	const indexMappings = {
		mappings: {
			_default_: {
				properties: {
					defaultAlias: {
						properties: {
							name: {
								fields: {
									autocomplete: {
										analyzer: 'edge',
										type: 'string'
									},
									search: {
										analyzer: 'trigrams',
										type: 'string'
									}
								},
								type: 'string'
							}
						},
						type: 'object'
					}
				}
			}
		},
		settings: {
			analysis: {
				analyzer: {
					edge: {
						filter: [
							'asciifolding',
							'lowercase',
							'edge_filter'
						],
						tokenizer: 'standard',
						type: 'custom'
					},
					trigrams: {
						filter: [
							'asciifolding',
							'lowercase',
							'trigrams_filter'
						],
						tokenizer: 'standard',
						type: 'custom'
					}
				},
				filter: {
					edge_filter: {
						max_gram: 20, // eslint-disable-line no-magic-numbers
						min_gram: 1,
						type: 'edge_ngram'
					},
					trigrams_filter: {
						max_gram: 3,
						min_gram: 1,
						type: 'ngram'
					}
				}
			}
		}
	};

	// First, drop index and recreate
	const mainIndexExists = await _client.indices.exists({index: _index});

	if (mainIndexExists) {
		await _client.indices.delete({index: _index});
	}

	await _client.indices.create(
		{body: indexMappings, index: _index}
	);

	const baseRelations = [
		'annotation',
		'disambiguation',
		'defaultAlias'
	];

	const entityBehaviors = [
		{
			model: Creator,
			relations: [
				'gender',
				'creatorType',
				'beginArea',
				'endArea'
			]
		},
		{
			model: Edition,
			relations: [
				'publication',
				'editionFormat',
				'editionStatus'
			]
		},
		{model: Publication, relations: ['publicationType']},
		{model: Publisher, relations: ['publisherType', 'area']},
		{model: Work, relations: ['workType']}
	];

	// Update the indexed entries for each entity type
	const behaviorPromise = entityBehaviors.map((behavior) =>
		behavior.model.forge().fetchAll({
			withRelated: baseRelations.concat(behavior.relations)
		})
	);
	const entityLists = await Promise.all(behaviorPromise);
	const indexedEntities = entityLists.map((entityList) =>
		Promise.all(entityList.toJSON().map((entity) =>
			indexEntity(entity)
		))
	);
	await Promise.all(indexedEntities);

	const areaCollection = await Area.forge()
		// countries only
		.where({type: 1})
		.fetchAll();

	const areas = areaCollection.toJSON();
	const indexedAreas = areas.map((area) => indexArea(area));
	await Promise.all(indexedAreas);

	await refreshIndex();
}

export function searchByName(orm, name, collection) {
	const dslQuery = {
		body: {
			query: {
				match: {
					'defaultAlias.name.search': {
						minimum_should_match: '80%',
						query: name
					}
				}
			}
		},
		index: _index
	};

	if (collection) {
		dslQuery.type = collection;
	}

	return _searchForEntities(orm, dslQuery);
}

export async function init(orm, options) {
	const config = _.extend({
		defer() {
			const defer = {};

			defer.promise = new Promise((resolve, reject) => {
				defer.resolve = resolve;
				defer.reject = reject;
			});

			return defer;
		}
	}, options);

	_client = ElasticSearch.Client(config);

	// Automatically index on app startup if we haven't already
	const mainIndexExists = await _client.indices.exists({index: _index});

	if (mainIndexExists) {
		return null;
	}

	return generateIndex(orm);
}
