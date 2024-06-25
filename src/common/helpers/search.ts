/* eslint-disable no-undefined */
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

import * as commonUtils from './utils';
import ElasticSearch, {type Client, type ClientOptions} from '@elastic/elasticsearch';
import {camelCase, isString, snakeCase, upperFirst} from 'lodash';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity';
import {type ORM} from 'bookbrainz-data';
import httpStatus from 'http-status';
import log from 'log';


const _index = 'bookbrainz';
const _bulkIndexSize = 10000;

// In milliseconds
const _retryDelay = 10;
const _maxJitter = 75;

let _client:Client = null;

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

export type IndexableEntities = EntityTypeString | 'Editor' | 'Collection' | 'Area';
export type IndexableEntitiesOrAll = IndexableEntities | 'allEntities';
const commonProperties = ['bbid', 'id', 'name', 'type', 'disambiguation'];

const indexMappings = {
	mappings: {
		_default_: {
			properties: {
				aliases: {
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
					}
				},
				authors: {
					analyzer: 'trigrams',
					type: 'text'
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
		},
		'index.mapping.ignore_malformed': true
	}
};

/* We don't currently want to index the entire Model in ElasticSearch,
   which contains a lot of fields we don't use as well as some internal props (_pivot props)
   This utility function prepares the Model into a minimal object that will be indexed
*/
export function getDocumentToIndex(entity:any) {
	const additionalProperties = [];
	const entityType:IndexableEntities = entity.get('type');
	switch (entityType) {
		case 'Work':
			additionalProperties.push('authors');
			break;
		default:
			break;
	}
	let aliases = entity
		.related('aliasSet')
		?.related('aliases')
		?.toJSON({ignorePivot: true, visible: 'name'});
	if (!aliases) {
		// Some models don't have the same aliasSet structure, i.e. Collection, Editor, Area, …
		const name = entity.get('name');
		aliases = {name};
	}
	const identifiers = entity
		.related('identifierSet')
		?.related('identifiers')
		?.toJSON({ignorePivot: true, visible: 'value'});

	return {
		...entity.toJSON({
			ignorePivot: true,
			visible: commonProperties.concat(additionalProperties)
		}),
		aliases,
		identifiers: identifiers ?? null
	};
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
			const area = await Area.forge({gid: entityStub.id})
				.fetch({withRelated: ['areaType']});

			const areaJSON = area.toJSON({omitPivot: true});
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
			const editor = await Editor.forge({id: entityStub.id})
				.fetch();

			const editorJSON = editor.toJSON({omitPivot: true});
			editorJSON.defaultAlias = {
				name: editorJSON.name
			};
			editorJSON.type = 'Editor';
			editorJSON.id = entityStub.id;
			return editorJSON;
		}
		if (entityStub.type === 'Collection') {
			const collection = await UserCollection.forge({id: entityStub.id})
				.fetch();

			const collectionJSON = collection.toJSON({omitPivot: true});
			collectionJSON.defaultAlias = {
				name: collectionJSON.name
			};
			collectionJSON.type = 'Collection';
			collectionJSON.id = entityStub.id;
			return collectionJSON;
		}
		// Regular entity
		const model = commonUtils.getEntityModelByType(orm, entityStub.type);
		const entity = await model.forge({bbid: entityStub.bbid})
			.fetch({require: false, withRelated: ['defaultAlias.language', 'disambiguation', 'aliasSet.aliases', 'identifierSet.identifiers',
				'relationshipSet.relationships.source', 'relationshipSet.relationships.target', 'relationshipSet.relationships.type', 'annotation']});
		const entityJSON = entity?.toJSON({omitPivot: true});
		if (entityJSON && entityJSON.relationshipSet) {
			entityJSON.relationshipSet.relationships = await Promise.all(entityJSON.relationshipSet.relationships.map(async (rel) => {
				rel.source = await commonUtils.getEntity(orm, rel.source.bbid, rel.source.type);
				rel.target = await commonUtils.getEntity(orm, rel.target.bbid, rel.target.type);
				return rel;
			}));
		}
		if (entityStub.authors) {
			entityJSON.authors = entityStub.authors;
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
					_id: entity.bbid ?? entity.id,
					_index,
					_type: snakeCase(entity.type)
				}
			});
			accumulator.push(entity);

			return accumulator;
		}, []);

		operationSucceeded = true;

		try {
			// eslint-disable-next-line no-await-in-loop
			const {body: bulkResponse} = await _client.bulk({
				body: bulkOperations
			}).catch((error) => {
				log.error('error bulk indexing entities for search:', error);
			});

			/*
			 * In case of failed index operations, the promise won't be rejected;
			 * instead, we have to inspect the response and respond to any failures
			 * individually.
			 */
			if (bulkResponse?.errors === true) {
				entitiesToIndex = bulkResponse.items.reduce((accumulator, item) => {
					// We currently only handle queue overrun
					if (item.index.status === httpStatus.TOO_MANY_REQUESTS) {
						const failedEntity = entities.find(
							(element) => (element.bbid ?? element.id) === item.index._id
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
		catch (error) {
			log.error('error bulk indexing entities for search:', error);
			operationSucceeded = false;
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

export async function autocomplete(orm:ORM, query:string, type:IndexableEntitiesOrAll | IndexableEntities[], size = 42) {
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
				'aliases.name.autocomplete': {
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
	const entityType = entity.get('type');
	const document = getDocumentToIndex(entity);
	if (entity) {
		return _client
			.index({
				body: document,
				id: entity.get('bbid') || entity.get('id'),
				index: _index,
				type: snakeCase(entityType)
			})
			.catch((error) => {
				log.error('error indexing entity for search:', error);
			});
	}
}

export function deleteEntity(entity) {
	return _client
		.delete({
			id: entity.bbid ?? entity.id,
			index: _index,
			type: snakeCase(entity.type)
		})
		.catch((error) => {
			log.error('error deleting entity from index:', error);
		});
}

export function refreshIndex() {
	return _client.indices.refresh({index: _index}).catch((error) => {
		log.error('Error refreshing search index:', error);
	});
}

export async function generateIndex(orm, entityType: IndexableEntities | 'allEntities' = 'allEntities', recreateIndex = false) {
	const {Area, Author, Edition, EditionGroup, Editor, Publisher, Series, UserCollection, Work} = orm;

	const allEntities = entityType === 'allEntities';
	const mainIndexExists = await _client.indices.exists({
		index: _index
	});

	const shouldRecreateIndex = !mainIndexExists.body || recreateIndex || allEntities;

	if (shouldRecreateIndex) {
		if (mainIndexExists.body) {
			log.notice('Deleting search index');
			await _client.indices.delete({index: _index});
		}
		log.notice('Creating new search index');
		await _client.indices.create({body: indexMappings, index: _index});
	}

	log.notice(`Starting indexing of ${entityType}`);

	const entityBehaviors:Array<{model:any,
			relations: string[],
			type:string}> = [];
	const baseRelations = [
		'annotation',
		'defaultAlias',
		'aliasSet.aliases',
		'identifierSet.identifiers'
	];

	if (allEntities || entityType === 'Author' || entityType === 'Work') {
		entityBehaviors.push({
			model: Author,
			relations: ['gender', 'beginArea', 'endArea'],
			type: 'Author'
		});
	}
	if (allEntities || entityType === 'Edition') {
		entityBehaviors.push({
			model: Edition,
			relations: ['editionGroup', 'editionFormat', 'editionStatus'],
			type: 'Edition'
		});
	}
	if (allEntities || entityType === 'EditionGroup') {
		entityBehaviors.push({
			model: EditionGroup,
			relations: [],
			type: 'EditionGroup'
		});
	}
	if (allEntities || entityType === 'Publisher') {
		entityBehaviors.push({
			model: Publisher,
			relations: ['area'],
			type: 'Publisher'
		});
	}
	if (allEntities || entityType === 'Series') {
		entityBehaviors.push({
			model: Series,
			relations: ['seriesOrderingType'],
			type: 'Series'
		});
	}
	if (allEntities || entityType === 'Work') {
		log.info('Also indexing Author entities');
		entityBehaviors.push({
			model: Work,
			relations: ['relationshipSet.relationships.type'],
			type: 'Work'
		});
	}
	// Update the indexed entries for each entity type
	const entityLists = await Promise.all(entityBehaviors.map(async (behavior) => {
		log.info(`Fetching ${behavior.type} models from the database`);
		const totalCount:number = await behavior.model.query((qb) => {
			qb.where('master', true);
			qb.whereNotNull('data_id');
		}).count();
		log.info(`${totalCount} ${behavior.type} models in total`);
		const maxChunk = 50000;
		const collectionsPromises = [];
		// Fetch by chunks of 50.000 entities
		for (let i = 0; i < totalCount; i += maxChunk) {
			const collection = behavior.model
				.forge()
				.query((qb) => {
					qb.where('master', true);
					qb.whereNotNull('data_id');
					qb.limit(maxChunk);
					qb.offset(i);
					log.info(`Fetching ${maxChunk} ${behavior.type} models with offset ${i}`);
				})
				.fetchAll({
					withRelated: baseRelations.concat(behavior.relations)
				}).catch(err => { log.error(err); throw err; });
			collectionsPromises.push(collection);
		}
		const collections = await Promise.all(collectionsPromises);
		// Put all models back into a single collection
		const allModels = collections.map(col => col.models).flat();
		return {collection: behavior.model.collection(allModels), type: behavior.type};
	}));
	log.info(`Finished fetching entities from database for types ${entityBehaviors.map(({type}) => type).join(', ')}`);

	if (allEntities || entityType === 'Work') {
		log.info('Attaching author names to Work entities');
		const authorCollection = entityLists.find(
			(result) => result.type === 'Author'
		)?.collection;
		const workCollection = entityLists.find((result) => result.type === 'Work')?.collection;
		workCollection?.forEach((workEntity) => {
			const relationshipSet = workEntity.related('relationshipSet');
			if (relationshipSet) {
				const authorWroteWorkRels = relationshipSet
					.related('relationships')
					?.filter(
						(relationshipModel) =>
							relationshipModel.get('typeId') === 8
					);
				const authorNames = [];
				authorWroteWorkRels.forEach((relationshipModel) => {
					// Search for the Author in the already fetched BookshelfJS Collection
					const sourceBBID = relationshipModel.get('sourceBbid');
					const source = authorCollection.get(sourceBBID);
					const name = source?.related('defaultAlias')?.get('name');
					if (name) {
						authorNames.push(name);
					}
				});
				workEntity.set('authors', authorNames);
			}
		});
	}

	const listIndexes = [];
	// Index all the entities
	entityLists.forEach((entityList) => {
		const listArray = entityList.collection.map(getDocumentToIndex);
		listIndexes.push(_processEntityListForBulk(listArray));
	});

	if (listIndexes.length) {
		log.info(`Indexing documents for entity type ${entityType}`);
		await Promise.all(listIndexes);
		log.info(`Finished indexing entity documents for entity type ${entityType}`);
	}

	if (allEntities || entityType === 'Area') {
		log.info('Indexing Areas');

		const areaCollection = await Area.forge().fetchAll();

		const areas = areaCollection.toJSON({omitPivot: true});

		/** To index names, we use aliases.name and type, which Areas don't have.
		 * We massage the area to return a similar format as BB entities
		 */
		const processedAreas = areas.map((area) => ({
			aliases: [{name: area.name}],
			id: area.gid,
			type: 'Area'
		}));
		await _processEntityListForBulk(processedAreas);
		log.info('Finished indexing Areas');
	}
	if (allEntities || entityType === 'Editor') {
		log.info('Indexing Editors');
		const editorCollection = await Editor.forge()
			// no bots
			.where('type_id', 1)
			.fetchAll();
		const editors = editorCollection.toJSON({omitPivot: true});

		/** To index names, we use aliases.name and type, which Editors don't have.
		 * We massage the editor to return a similar format as BB entities
		 */
		const processedEditors = editors.map((editor) => ({
			aliases: [{name: editor.name}],
			id: editor.id,
			type: 'Editor'
		}));
		await _processEntityListForBulk(processedEditors);
		log.info('Finished indexing Editors');
	}

	if (allEntities || entityType === 'Collection') {
		log.info('Indexing Collections');
		const userCollections = await UserCollection.forge()
			.where({public: true})
			.fetchAll();
		const userCollectionsJSON = userCollections.toJSON({omitPivot: true});

		/** To index names, we use aliases.name and type, which UserCollections don't have.
		 * We massage the editor to return a similar format as BB entities
		 */
		const processedCollections = userCollectionsJSON.map((collection) => ({
			aliases: [{name: collection.name}],
			id: collection.id,
			type: 'Collection'
		}));
		await _processEntityListForBulk(processedCollections);
		log.info('Finished indexing Collections');
	}
	log.info('Refreshing search index');
	await refreshIndex();
	log.notice('Search indexing finished succesfully');
}

export async function checkIfExists(orm, name, type) {
	const {bookshelf} = orm;
	const bbids:string[] = await new Promise((resolve, reject) => {
		bookshelf.transaction(async (transacting) => {
			try {
				const result = await orm.func.alias.getBBIDsWithMatchingAlias(
					transacting,
					snakeCase(type),
					name
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
		bbids.map((bbid) =>
			orm.func.entity.getEntity(
				orm,
				upperFirst(camelCase(type)),
				bbid,
				baseRelations
			))
	);

	return processedResults;
}

export function searchByName(orm, name, type, size, from) {
	const sanitizedEntityType = sanitizeEntityType(type);
	const dslQuery = {
		body: {
			from,
			query: {
				multi_match: {
					fields: [
						'aliases.name^3',
						'aliases.name.search',
						'disambiguation',
						'identifiers.value'
					],
					minimum_should_match: '80%',
					query: name,
					type: 'cross_fields'
				}
			},
			size
		},
		index: _index,
		type: sanitizedEntityType
	};
	if (
		sanitizedEntityType === 'work' ||
		(Array.isArray(sanitizedEntityType) &&
			sanitizedEntityType.includes('work'))
	) {
		dslQuery.body.query.multi_match.fields.push('authors');
	}

	return _searchForEntities(orm, dslQuery);
}

/**
 * Search init
 * @description Sets up the search server connection with defaults,
 * and returns a connection status boolean
 * @param {ORM} orm the BookBrainz ORM
 * @param {ClientOptions} [options] Optional (but recommended) connection settings, will provide defaults if missing
 * @returns {Promise<boolean>} A Promise which resolves to the connection status boolean
 */
export async function init(orm: ORM, options:ClientOptions) {
	if (!isString(options.node)) {
		const defaultOptions:ClientOptions = {
			node: 'http://localhost:9200',
			requestTimeout: 60000
		};
		log.warning('ElasticSearch configuration not provided. Using default settings.');
		_client = new ElasticSearch.Client(defaultOptions);
	}
	else {
		_client = new ElasticSearch.Client(options);
	}
	try {
		await _client.ping();
	}
	catch (error) {
		log.warning('Could not connect to ElasticSearch:', error.toString());
		return false;
	}
	const mainIndexExists = await _client.indices.exists({index: _index});
	if (!mainIndexExists) {
		// Automatically index on app startup if we haven't already, but don't block app setup
		generateIndex(orm).catch(log.error);
	}
	return true;
}
