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
import httpStatus from 'http-status';


const _index = 'bookbrainz';
const _bulkIndexSize = 128;

// In milliseconds
const _retryDelay = 10;
const _maxJitter = 75;

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

async function _bulkIndexEntities(entities) {
	if (entities.length === 0) {
		return;
	}

	// Proxy the list of entities to index in case we need to retry
	let entitiesToIndex = entities;

	let operationSucceeded = false;
	while (!operationSucceeded) {
		const bulkOperations = entitiesToIndex.reduce((accumulator, entity) => {
			accumulator.push({
				index: {
					_id: entity.bbid,
					_index,
					_type: entity.type.toLowerCase()
				}
			});
			accumulator.push(entity);

			return accumulator;
		}, []);

		operationSucceeded = true;

		// eslint-disable-next-line no-await-in-loop
		const response = await _client.bulk({
			body: bulkOperations
		});

		/*
		 * In case of failed index operations, the promise won't be rejected;
		 * instead, we have to inspect the response and respond to any failures
		 * individually.
		 */
		if (response.errors === true) {
			entitiesToIndex = response.items.reduce((accumulator, item) => {
				// We currently only handle queue overrun
				if (item.index.status === httpStatus.TOO_MANY_REQUESTS) {
					const failedEntity = entities.find(
						(element) => element.bbid === item.index._id
					);

					accumulator.push(failedEntity);
				}

				return accumulator;
			}, []);


			if (entitiesToIndex.length > 0) {
				operationSucceeded = false;

				const jitter = Math.random() * _maxJitter;
				// eslint-disable-next-line no-await-in-loop
				await Promise.delay(_retryDelay + jitter);
			}
		}
	}
}

async function _processEntityListForBulk(entityList) {
	const indexOperations = [];

	let bulkQueue = [];
	for (const entity of entityList) {
		bulkQueue.push(entity);

		if (bulkQueue.length >= _bulkIndexSize) {
			indexOperations.push(_bulkIndexEntities(bulkQueue));
			bulkQueue = [];
		}
	}
	indexOperations.push(_bulkIndexEntities(bulkQueue));

	await Promise.all(indexOperations);
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
										type: 'text'
									},
									search: {
										analyzer: 'trigrams',
										type: 'text'
									}
								},
								type: 'text'
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
							'lowercase'
						],
						tokenizer: 'trigrams',
						type: 'custom'
					}
				},
				filter: {
					edge_filter: {
						max_gram: 20, // eslint-disable-line no-magic-numbers
						min_gram: 1,
						type: 'edge_ngram'
					}
				},
				tokenizer: {
					trigrams: {
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
	const behaviorPromise = entityBehaviors.map(
		(behavior) => behavior.model.forge()
			.query((qb) => {
				qb.where('master', true);
				qb.whereNotNull('data_id');
			})
			.fetchAll({
				withRelated: baseRelations.concat(behavior.relations)
			})
	);
	const entityLists = await Promise.all(behaviorPromise);

	const listIndexes = [];
	for (const entityList of entityLists) {
		const listArray = entityList.toJSON();
		listIndexes.push(_processEntityListForBulk(listArray));
	}
	await Promise.all(listIndexes);

	const areaCollection = await Area.forge()
		// countries only
		.where({type: 1})
		.fetchAll();

	const areas = areaCollection.toJSON();
	const processedAreas = areas.map((area) => new Object({
		bbid: area.gid,
		defaultAlias: {
			name: area.name
		},
		type: 'Area'
	}));
	await _processEntityListForBulk(processedAreas);

	await refreshIndex();
}

export function checkIfExists(orm, name, collection) {
	const {bookshelf} = orm;
	const rawSql = `
		SELECT (
			CASE WHEN count > 0 THEN 'true' ELSE 'false' END
		) FROM (
			SELECT COUNT(*)
			AS count
			FROM ${collection}
			JOIN (
				SELECT DISTINCT set_id
				FROM alias_set__alias
				WHERE alias_id IN (
					SELECT id
					FROM alias
					WHERE name = '${name}'
				)
			) AS sets
			ON sets.set_id = ${collection}.alias_set_id
			WHERE master = 'true'
		) AS result;`;

	return bookshelf.knex.raw(rawSql).then(val => val.rows[0].case);
}

export function searchByName(orm, name, collection) {
	const dslQuery = {
		body: {
			query: {
				bool: {
					must: {
						match: {
							'defaultAlias.name.search': {
								minimum_should_match: '75%',
								query: name
							}
						}
					},
					should: {
						match: {
							'defaultAlias.name': {
								boost: 1.3, // eslint-disable-line max-len,no-magic-numbers
								query: name
							}
						}
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
