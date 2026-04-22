/* eslint-disable lines-around-comment, sort-keys, camelcase */
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

import * as commonUtils from './utils';
import ElasticSearch, {type Client, type ClientOptions} from '@elastic/elasticsearch';
import type {IndicesCreateRequest, QueryDslBoolQuery,
	QueryDslQueryContainer, SearchHitsMetadata, SearchRequest} from '@elastic/elasticsearch/lib/api/types';
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

function sanitizeEntityType(type:IndexableEntitiesOrAll | IndexableEntities[]) {
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

/*
Index settings and mappings for ElasticSearch. We use a single index for all entity types, and differentiate them by a `type` field on the documents.
Customizing this is a painful process of trial and error, but you can find some great hints here:
https://web.archive.org/web/20251015115752/https://developer.ibm.com/articles/elasticsearch-ultimate-guide/
https://web.archive.org/web/20260303170636/https://oneuptime.com/blog/post/2026-01-25-elasticsearch-mappings/view
*/
const indexSettings:IndicesCreateRequest = {
	index: _index,
	settings: {
		index: {
			max_ngram_diff: 4,
			'mapping.ignore_malformed': true
		},
		analysis: {
			/* This filter is used to sanitize identifiers and other 'keyword' field types. Removes non-alphanumeric characters */
			char_filter: {
				identifier_cleaner: {
					type: 'pattern_replace',
					pattern: '[^a-zA-Z0-9]',
					replacement: ''
				}
			},
			/*
				Filter out/deprioritize stop words for most popular languages.
				TODO: check whether we can surface the alias language to make this more precise
			*/
			filter: {
				custom_stop_words_filter: {
					type: 'stop',
					ignore_case: true,
					stopwords: [
						'_english_', '_french_', '_german_', '_spanish_', '_italian_',
						'_portuguese_', '_russian_', '_arabic_', '_chinese_', '_japanese_',
						'_norwegian_', '_hindi_'
					]
				}
			},
			/*
				Analysers are used for text fields both at indexing and at search time to break up and clean up the text.
				We don't use differente analysers for indexing vs. searching.
			*/
			analyzer: {
				/*
					Customize the built-in standard tokenizer (grammar based tokenization), see https://www.elastic.co/docs/reference/text-analysis/analysis-standard-analyzer
					Also deburs accents, lowercases and filters stop words for more languages.
					This is the main analyser used for most text fields such as name and disambiguation.
				*/
				custom_standard: {
					type: 'custom',
					tokenizer: 'standard',
					filter: ['asciifolding', 'lowercase', 'custom_stop_words_filter']
				},
				/* Deburs accents, lowercases, filter stop words and uses an n-gram tokenizer to allow parital matches within the words
				Ref: https://www.elastic.co/docs/reference/text-analysis/analysis-ngram-tokenizer
				*/
				ngrams_analyzer: {
					type: 'custom',
					tokenizer: 'ngram_tokenizer',
					filter: ['asciifolding', 'lowercase', 'custom_stop_words_filter']
				},
				/* Cleans up keyword fields (removes non-alphanumeric tokens) such as identifiers and lowercases it */
				identifier_analyzer: {
					type: 'custom',
					char_filter: ['identifier_cleaner'],
					tokenizer: 'keyword',
					filter: ['lowercase']
				}
			},
			normalizer: {
				/* Used only for keyword type when filtering by entity type, keywords types require a 'normalizer', not an 'analyser' */
				keyword_normalizer: {
					type: 'custom',
					char_filter: ['identifier_cleaner'],
					filter: ['lowercase']
				}
			},
			/* Allows for partial matches within the text. Values modified by trial and error, can be reviewed  */
			tokenizer: {
				ngram_tokenizer: {
					type: 'ngram',
					min_gram: 3,
					max_gram: 6
				}
			}
		}
	},
	mappings: {
		properties: {
			/*
				Main search field for entity names. Analyse with trigrams to allow for typos, and using the built-in search-as-you-type for the autocomplete endpoint.
				Use the customized standard analyser first, then also analyse with n-grams for typos/partial matches and autocompletion
				Ref: https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/search-as-you-type
			*/
			aliases: {
				properties: {
					name: {
						type: 'text',
						analyzer: 'custom_standard',
						fields: {
							trigrams: {type: 'text', analyzer: 'ngrams_analyzer'},
							suggest: {type: 'search_as_you_type'}
						}
					}
				}
			},
			/* Search works by author name; author names are attached to the document at indexing time*/
			authors: {
				type: 'text',
				analyzer: 'custom_standard',
				fields: {
					trigrams: {type: 'text', analyzer: 'ngrams_analyzer'}
				}
			},
			/* Used only for filtering by entity type; uses a keyword 'type' field on the documents */
			type: {
				type: 'keyword',
				normalizer: 'keyword_normalizer'
			},
			/* Disambiguation comments are searchable too, but are ranked much lower */
			disambiguation: {
				type: 'text',
				analyzer: 'custom_standard'
			},
			/* Used to search by identifier such as ISBNs */
			identifiers: {
				properties: {
					value: {
						type: 'text',
						analyzer: 'identifier_analyzer',
						fields: {
							keyword: {type: 'keyword'}
						}
					}
				}
			}
		}
	}

};

// Helper to normalize indices.exists response across client versions
async function _indexExists(indexName:string) {
	return await _client.indices.exists({index: indexName});
}

// Helper to add a `type` filter into a dslQuery body, since ES 7+ removed document types
function _applyTypeFilterToDSL(dslQuery:SearchRequest, type:IndexableEntitiesOrAll | IndexableEntities[]) {
	const sanitizedType = sanitizeEntityType(type);
	if (!sanitizedType) {
		return;
	}

	/*
		Filtering by type is done using the 'type' attribute on documents, which is indexed as a keyword (lowercased and dashes removed),
		and using a terms query to match the sanitized type(s) against it.
		We can filter by multiple entity types in the same query, so we normalize to an array of terms for simplicity
	*/
	const sanitizedTypes = Array.isArray(sanitizedType) ? sanitizedType : [sanitizedType];
	const typeFilter = {terms: {type: sanitizedTypes}};

	const existingQuery = dslQuery.query;
	const newQuery:QueryDslBoolQuery = {
		filter: typeFilter,
		must: existingQuery
	};
	dslQuery.query = {bool: newQuery};
}

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

async function _fetchEntityModelsForESResults(orm:ORM, results:SearchHitsMetadata<any>) {
	const {Area, Editor, UserCollection} = orm;

	if (!results?.hits) {
		return null;
	}

	const processedResults = await Promise.all(results.hits.map(async (hit) => {
		const entityStub = hit._source;

		// Special cases first
		if (entityStub.type === 'Area') {
			const area = await new Area({gid: entityStub.id})
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
			const editor = await new Editor({id: entityStub.id})
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
			const collection = await new UserCollection({id: entityStub.id})
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
		const Model = commonUtils.getEntityModelByType(orm, entityStub.type);
		const entity = await new Model({bbid: entityStub.bbid})
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
async function _searchForEntities(orm:ORM, dslQuery:SearchRequest) {
	try {
		const searchResponse = await _client.search(dslQuery);
		const {hits} = searchResponse;
		const results = await _fetchEntityModelsForESResults(orm, hits);
		let total;
		if (typeof hits.total === 'number') {
			({total} = hits);
		}
		else {
			total = hits.total?.value ?? 0;
		}
		return {results, total: total || 0};
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
					_index
				}
			});
			accumulator.push(entity);

			return accumulator;
		}, []);

		operationSucceeded = true;

		try {
			// eslint-disable-next-line no-await-in-loop
			const bulkResponse = await _client.bulk({
				body: bulkOperations
			}).catch((error) => {
				log.error('error bulk indexing entities for search:', error);
			});
			if (!bulkResponse) {
				throw new Error('No response from bulk indexing operation');
			}

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


// eslint-disable-next-line consistent-return
export function indexEntity(entity) {
	const document = getDocumentToIndex(entity);
	if (entity) {
		return _client
			.index({
				body: document,
				id: entity.get('bbid') || entity.get('id'),
				index: _index
				// Document `type` is stored inside the document itself; no ES mapping types in 7+
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
			index: _index
			// No document types in ES 7+
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

export async function generateIndex(orm:ORM, entityType: IndexableEntities | 'allEntities' = 'allEntities', recreateIndex = false) {
	const {Area, Author, Edition, EditionGroup, Editor, Publisher, Series, UserCollection, Work} = orm;

	const allEntities = entityType === 'allEntities';
	const mainIndexExists = await _indexExists(_index);

	const shouldRecreateIndex = !mainIndexExists || recreateIndex || allEntities;

	if (shouldRecreateIndex) {
		if (mainIndexExists) {
			log.notice('Deleting search index');
			await _client.indices.delete({index: _index});
		}
		log.notice('Creating new search index');
		await _client.indices.create(indexSettings);
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

		const areaCollection = await new Area().fetchAll();

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
		const editorCollection = await new Editor()
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
		const userCollections = await new UserCollection()
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

export async function checkIfExists(orm:ORM, name:string, type:EntityTypeString) {
	const {bookshelf} = orm;
	const formattedType = upperFirst(camelCase(type)) as EntityTypeString;
	const bbids:string[] = await new Promise((resolve, reject) => {
		bookshelf.transaction(async (transacting) => {
			try {
				const result = await orm.func.alias.getBBIDsWithMatchingAlias(
					transacting,
					formattedType,
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
				formattedType,
				bbid,
				baseRelations
			))
	);

	return processedResults;
}

export async function autocomplete(orm:ORM, query:string, type:IndexableEntitiesOrAll | IndexableEntities[], size = 42) {
	let queryBody:QueryDslQueryContainer;

	if (commonUtils.isValidBBID(query)) {
		queryBody = {
			ids: {
				/*  Find by BBID directly instead of performing a text search */
				values: [query]
			}
		};
	}
	else {
		queryBody = {
			multi_match: {
				query: query.toLowerCase(),
				type: 'bool_prefix',
				/* Uses the built-in search_as_you_type mapping
				 https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/search-as-you-type*/
				fields: [
					'aliases.name.suggest',
					'aliases.name.suggest._2gram',
					'aliases.name.suggest._3gram'
				]
			}
		};
	}

	const dslQuery:SearchRequest = {
		size,
		query: queryBody,
		index: _index
	};

	_applyTypeFilterToDSL(dslQuery, type);

	const searchResponse = await _searchForEntities(orm, dslQuery);
	// Only return the results array, we're not interested in the total number of hits for this endpoint
	return searchResponse.results;
}

export function searchByName(orm:ORM, name:string, type:IndexableEntitiesOrAll | IndexableEntities[], size = 20, from = 0) {
	const sanitizedEntityType = sanitizeEntityType(type);
	let queryBody:QueryDslQueryContainer;
	const query = name.toLowerCase();

	if (commonUtils.isValidBBID(name)) {
		queryBody = {
			ids: {
				values: [query]
			}
		};
	}
	else {
	 queryBody = {
			bool: {
				should: [
					{
						/* We match both the name and the disambguation text but rank the latter much much lower.
						Values chosen semi-randomly by trial and error, can be tweaked if needed */
						multi_match: {
							query,
							fields: ['aliases.name^15', 'disambiguation'],
							type: 'best_fields'
						}
					},
					{
						/* Alternatively, do partial matches within text fields, rank higher than disambiguation but lower than name
						Reauires a minimum threshold of 75% of the terms to be matched to remove too laxe matches*/
						multi_match: {
							query,
							fields: ['aliases.name.trigrams^2'],
							type: 'most_fields',
							minimum_should_match: '75%'
						}
					},
					{
						/*  Finally, allow searching by identifier (for example ISBN), with a very high boost since hits should be exact matches of identifiers */
						term: {
							'identifiers.value': {
								value: query.replace(/[^a-zA-Z0-9]/g, ''),
								boost: 30
							}
						}
					}
				]
			}
		};
		const isWorkTypeOnly = sanitizedEntityType === 'work';
		const containsWorkType = Array.isArray(sanitizedEntityType) && sanitizedEntityType.includes('work');
		if (
			isWorkTypeOnly || containsWorkType
		) {
			/*
				If this is a work search or for all entities, also search by author name.
				If it's a work-only search, give matches more boost since they are more likely to be relevant (search for work by author name).
				Otherwise use a regular boost value as it is less relevant.
				*/
			const authorBoost = isWorkTypeOnly ? 5 : 1;
			queryBody.bool.should[0].multi_match.fields.push(`authors^${authorBoost}`);
			queryBody.bool.should[1].multi_match.fields.push(`authors.trigrams^${authorBoost}`);
		}
	}
	const dslQuery = {
		from,
		size,
		query: queryBody,
		index: _index
	};


	_applyTypeFilterToDSL(dslQuery, type);

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
	const mainIndexExists = await _indexExists(_index);
	if (!mainIndexExists) {
		// Automatically index on app startup if we haven't already, but don't block app setup
		generateIndex(orm).catch(log.error);
	}
	else {
		log.notice('Search index already exists, skipping generation');
	}
	return true;
}
