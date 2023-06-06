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
/* eslint-disable camelcase */

import * as commonUtils from '../../common/helpers/utils';
import {camelCase, isString, snakeCase, upperFirst} from 'lodash';

import ElasticSearch from '@elastic/elasticsearch';
import httpStatus from 'http-status';
import log from 'log';


const _index = 'bookbrainz';
const _bulkIndexSize = 10000;

// In milliseconds
const _retryDelay = 10;
const _maxJitter = 75;

let _client = null;

function sanitizeEntityType(type) {
	if (!type) {
		return null;
	}
	if (Array.isArray(type)) {
		return type.map(snakeCase);
	}
	if (snakeCase(type) === 'all_entities') {
		return ['author', 'edition', 'edition_group', 'series', 'work', 'publisher'];
	}

	return snakeCase(type);
}

async function _fetchEntityModelsForESResults(orm, results) {
	const {Area, Editor, UserCollection} = orm;

	if (!results?.hits) {
		return null;
	}

	const processedResults = await Promise.all(results.hits.map(async (hit) => {
		const entityStub = hit._source;

		// Special cases first
		if (entityStub.type === 'Area') {
			const area = await Area.forge({gid: entityStub.bbid})
				.fetch({withRelated: ['areaType']});

			const areaJSON = area.toJSON();
			const areaParents = await area.parents();
			areaJSON.defaultAlias = {
				name: areaJSON.name
			};
			areaJSON.type = 'Area';
			areaJSON.disambiguation = {
				comment: `${areaJSON.areaType?.name}${areaParents?.length ? ' - ' : ''}${areaParents?.map(parent => parent.name).join(', ')}`
			};
			return areaJSON;
		}
		if (entityStub.type === 'Editor') {
			const editor = await Editor.forge({id: entityStub.bbid})
				.fetch();

			const editorJSON = editor.toJSON();
			editorJSON.defaultAlias = {
				name: editorJSON.name
			};
			editorJSON.type = 'Editor';
			editorJSON.bbid = entityStub.bbid;
			return editorJSON;
		}
		if (entityStub.type === 'Collection') {
			const collection = await UserCollection.forge({id: entityStub.bbid})
				.fetch();

			const collectionJSON = collection.toJSON();
			collectionJSON.defaultAlias = {
				name: collectionJSON.name
			};
			collectionJSON.type = 'Collection';
			collectionJSON.bbid = entityStub.bbid;
			return collectionJSON;
		}
		// Regular entity
		const model = commonUtils.getEntityModelByType(orm, entityStub.type);
		const entity = await model.forge({bbid: entityStub.bbid})
			.fetch({require: false, withRelated: ['defaultAlias.language', 'disambiguation', 'aliasSet.aliases', 'identifierSet.identifiers',
				'relationshipSet.relationships.source', 'relationshipSet.relationships.target', 'relationshipSet.relationships.type', 'annotation']});
		const entityJSON = entity?.toJSON();
		if (entityJSON && entityJSON.relationshipSet) {
			entityJSON.relationshipSet.relationships = await Promise.all(entityJSON.relationshipSet.relationships.map(async (rel) => {
				rel.source = await commonUtils.getEntityAlias(orm, rel.source.bbid, rel.source.type);
				rel.target = await commonUtils.getEntityAlias(orm, rel.target.bbid, rel.target.type);
				return rel;
			}));
		}
		return entityJSON;
	})).catch(err => log.error(err));
	return processedResults;
}

// Returns the results of a search translated to entity objects
async function _searchForEntities(orm, dslQuery) {
	try {
		const searchResponse = await _client.search(dslQuery);
		const results = await _fetchEntityModelsForESResults(orm, searchResponse.body.hits);
		return {results, total: searchResponse.body.hits.total};
	}
	catch (error) {
		log.error(error);
	}
	return {results: [], total: 0};
}

export async function _bulkIndexEntities(entities) {
	if (!entities.length) {
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
					_type: snakeCase(entity.type)
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


			if (entitiesToIndex.length) {
				operationSucceeded = false;

				const jitter = Math.random() * _maxJitter;
				// eslint-disable-next-line no-await-in-loop
				await new Promise(resolve => setTimeout(resolve, _retryDelay + jitter));
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

export async function autocomplete(orm, query, type, size = 42) {
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
			query: queryBody,
			size
		},
		index: _index,
		type: sanitizeEntityType(type)
	};


	const searchResponse = await _searchForEntities(orm, dslQuery);
	// Only return the results array, we're not interested in the total number of hits for this endpoint
	return searchResponse.results;
}

// eslint-disable-next-line consistent-return
export function indexEntity(entity) {
	if (entity) {
		return _client.index({
			body: entity,
			id: entity.bbid,
			index: _index,
			type: snakeCase(entity.type)
		});
	}
}

export function deleteEntity(entity) {
	return _client.delete({
		id: entity.bbid,
		index: _index,
		type: snakeCase(entity.type)
	});
}

export function refreshIndex() {
	return _client.indices.refresh({index: _index});
}

export async function generateIndex(orm) {
	const {Area, Author, Edition, EditionGroup, Editor, Publisher, Series, UserCollection, Work} = orm;
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
					},
					disambiguation: {
						analyzer: 'trigrams',
						type: 'text'
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
							'lowercase'
						],
						tokenizer: 'edge_ngram_tokenizer',
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
				tokenizer: {
					edge_ngram_tokenizer: {
						max_gram: 10,
						min_gram: 2,
						token_chars: [
							'letter',
							'digit'
						],
						type: 'edge_ngram'
					},
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
	const mainIndexExistsRequest = await _client.indices.exists({index: _index});
	const mainIndexExists = mainIndexExistsRequest?.body;

	if (mainIndexExists) {
		await _client.indices.delete({index: _index});
	}

	await _client.indices.create(
		{body: indexMappings, index: _index}
	);

	const baseRelations = [
		'annotation',
		'defaultAlias',
		'aliasSet.aliases',
		'identifierSet.identifiers'
	];

	const entityBehaviors = [
		{
			model: Author,
			relations: [
				'gender',
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
		{model: EditionGroup, relations: []},
		{model: Publisher, relations: ['area']},
		{model: Series, relations: ['seriesOrderingType']},
		{model: Work, relations: []}
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

	const editorCollection = await Editor.forge()
		// no bots
		.where('type_id', 1)
		.fetchAll();
	const editors = editorCollection.toJSON();

	/** To index names, we use aliasSet.aliases.name and bbid, which Editors don't have.
	 * We massage the editor to return a similar format as BB entities
	 */
	const processedEditors = editors.map((editor) => new Object({
		aliasSet: {
			aliases: [
				{name: editor.name}
			]
		},
		bbid: editor.id,
		type: 'Editor'
	}));
	await _processEntityListForBulk(processedEditors);

	const userCollections = await UserCollection.forge().where({public: true})
		.fetchAll();
	const userCollectionsJSON = userCollections.toJSON();

	/** To index names, we use aliasSet.aliases.name and bbid, which UserCollections don't have.
	 * We massage the editor to return a similar format as BB entities
	 */
	const processedCollections = userCollectionsJSON.map((collection) => new Object({
		aliasSet: {
			aliases: [
				{name: collection.name}
			]
		},
		bbid: collection.id,
		id: collection.id,
		type: 'Collection'
	}));
	await _processEntityListForBulk(processedCollections);

	await refreshIndex();
}

export async function checkIfExists(orm, name, type) {
	const {bookshelf} = orm;
	const bbids = await new Promise((resolve, reject) => {
		bookshelf.transaction(async (transacting) => {
			try {
				const result = await orm.func.alias.getBBIDsWithMatchingAlias(
					transacting, snakeCase(type), name
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
		'defaultAlias',
		'disambiguation',
		'identifierSet.identifiers.type',
		'relationshipSet.relationships.type',
		'revision.revision'
	];
	const processedResults = await Promise.all(
		bbids.map(
			bbid => orm.func.entity.getEntity(orm, upperFirst(camelCase(type)), bbid, baseRelations)
		)
	);

	return processedResults;
}

export function searchByName(orm, name, type, size, from) {
	const dslQuery = {
		body: {
			from,
			query: {
				multi_match: {
					fields: [
						'aliasSet.aliases.name^3',
						'aliasSet.aliases.name.search',
						'disambiguation',
						'identifierSet.identifiers.value'
					],
					minimum_should_match: '80%',
					query: name,
					type: 'cross_fields'
				}
			},
			size
		},
		index: _index,
		type: sanitizeEntityType(type)
	};

	return _searchForEntities(orm, dslQuery);
}

export async function init(orm, options) {
	if (!isString(options.host)) {
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
