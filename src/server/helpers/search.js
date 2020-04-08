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

import * as commonUtils from '../../common/helpers/utils';
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
			.fetch({require: false, withRelated: ['defaultAlias', 'disambiguation', 'aliasSet.aliases']})
			.then((entity) => entity && entity.toJSON());
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
					_type: _.snakeCase(entity.type)
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

	if (commonUtils.isValidBBID(query)) {
		queryBody = {
			ids: {
				values: [query]
			}
		};
	}
	else {
		queryBody = {
			match: {
				'aliasSet.aliases.name.autocomplete': {
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
		if (Array.isArray(collection)) {
			dslQuery.type = collection.map(_.snakeCase);
		}
		else {
			dslQuery.type = _.snakeCase(collection);
		}
	}

	return _searchForEntities(orm, dslQuery);
}

export function indexEntity(entity) {
	return _client.index({
		body: entity,
		id: entity.bbid,
		index: _index,
		type: _.snakeCase(entity.type)
	});
}

export function deleteEntity(entity) {
	return _client.delete({
		id: entity.bbid,
		index: _index,
		type: _.snakeCase(entity.type)
	});
}

export function refreshIndex() {
	return _client.indices.refresh({index: _index});
}

/* eslint camelcase: 0, no-magic-numbers: 1 */
export async function generateIndex(orm) {
	const {Area, Author, Edition, EditionGroup, Publisher, Work} = orm;
	const indexMappings = {
		mappings: {
			_default_: {
				properties: {
					'aliasSet.aliases': {
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
		'defaultAlias',
		'aliasSet.aliases'
	];

	const entityBehaviors = [
		{
			model: Author,
			relations: [
				'gender',
				'authorType',
				'beginArea',
				'endArea'
			]
		},
		{
			model: Edition,
			relations: [
				'editionGroup',
				'editionFormat',
				'editionStatus'
			]
		},
		{model: EditionGroup, relations: ['editionGroupType']},
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

	/** To index names, we use aliasSet.aliases.name and bbid, which Areas don't have.
	 * We massage the area to return a similar format as BB entities
	 */
	const processedAreas = areas.map((area) => new Object({
		aliasSet: {
			aliases: [
				{name: area.name}
			]
		},
		bbid: area.gid,
		type: 'Area'
	}));
	await _processEntityListForBulk(processedAreas);

	await refreshIndex();
}

export async function checkIfExists(orm, name, collection) {
	const {bookshelf} = orm;
	const bbids = await new Promise((resolve, reject) => {
		bookshelf.transaction(async (transacting) => {
			try {
				const result = await orm.func.alias.getBBIDsWithMatchingAlias(
					transacting, _.snakeCase(collection), name
				);
				resolve(result);
			}
			catch (error) {
				reject(error);
			}
		});
	});

	// Follow-up: Fetch all entities in a single transaction from the postgres server
	const baseRelations = [
		'aliasSet.aliases.language',
		'annotation.lastRevision',
		'defaultAlias',
		'disambiguation',
		'identifierSet.identifiers.type',
		'relationshipSet.relationships.type',
		'revision.revision'
	];
	return Promise.all(
		bbids.map(
			bbid => orm.func.entity.getEntity(orm, _.upperFirst(_.camelCase(collection)), bbid, baseRelations)
		)
	);
}

export function searchByName(orm, name, collection, size, from) {
	const dslQuery = {
		body: {
			from,
			query: {
				bool: {
					must: {
						match: {
							'aliasSet.aliases.name.search': {
								minimum_should_match: '75%',
								query: name
							}
						}
					},
					should: {
						match: {
							'aliasSet.aliases.name': {
								boost: 1.3, // eslint-disable-line max-len,no-magic-numbers
								query: name
							}
						}
					}
				}
			},
			size
		},
		index: _index
	};

	if (collection) {
		if (Array.isArray(collection)) {
			dslQuery.type = collection.map(_.snakeCase);
		}
		else {
			dslQuery.type = _.snakeCase(collection);
		}
	}

	return _searchForEntities(orm, dslQuery);
}

export async function init(orm, options) {
	if (!_.isString(options.host)) {
		options.host = 'localhost:9200';
	}

	_client = new ElasticSearch.Client(options);

	// Automatically index on app startup if we haven't already
	try {
		const mainIndexExists = await _client.indices.exists({index: _index});
		if (mainIndexExists) {
			return null;
		}

		return generateIndex(orm);
	}
	catch (error) {
		return null;
	}
}
