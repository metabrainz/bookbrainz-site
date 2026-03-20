// solr-based search used when USE_SOLR=true.
// this follows solr's usual /select + edismax style queries:
// https://solr.apache.org/guide/solr/latest/query-guide/edismax-query-parser.html
import {solrTestDocuments} from './search-test-data';
import {snakeCase} from 'lodash';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity';
import {type ORM} from 'bookbrainz-data';
import log from 'log';

const _bulkIndexSize = 10000;

let _solrHost = 'http://localhost:8983';
let _solrCore = 'bookbrainz';
let _client: {baseUrl: string} | null = null;

function sanitizeEntityType(type: any) {
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

/**
 * escape lucene special chars for quoted terms (used in checkIfExists)
 */
function escapeQuery(query: string): string {
	return query.replace(/([+\-&|!(){}[\]^"~*?:\\/])/g, '\\$1');
}

async function solrRequest(endpoint: string, params: Record<string, any> = {}) {
	if (!_client) {
		throw new Error('Solr client not initialized');
	}

	const queryParams = new URLSearchParams();
	Object.keys(params).forEach(key => {
		if (Array.isArray(params[key])) {
			params[key].forEach((val: string) => queryParams.append(key, val));
		}
		else {
			queryParams.set(key, String(params[key]));
		}
	});

	const url = `${_client.baseUrl}${endpoint}?${queryParams.toString()}`;

	try {
		const response = await fetch(url, {
			headers: {'Content-Type': 'application/json'}
		});

		if (!response.ok) {
			throw new Error(`Solr request failed: ${response.statusText}`);
		}

		return await response.json();
	}
	catch (error) {
		log.error('Solr request error:', error);
		throw error;
	}
}

async function solrPost(endpoint: string, data: any) {
	if (!_client) {
		throw new Error('Solr client not initialized');
	}

	const url = `${_client.baseUrl}${endpoint}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			throw new Error(`Solr post failed: ${response.statusText}`);
		}

		return await response.json();
	}
	catch (error) {
		log.error('Solr post error:', error);
		throw error;
	}
}

/**
 * for the demo we store the full entity json in `_store` and just return it.
 * in real bb we'd fetch models from postgres by bbid like the es flow.
 */
async function _fetchEntityModelsForSolrResults(orm: ORM, docs: any[]) {
	if (!docs || docs.length === 0) {
		return [];
	}

	return docs.map(doc => {
		try {
			if (doc._store) {
				return JSON.parse(doc._store);
			}
			// Fallback: construct from doc fields
			return {
				bbid: doc.bbid,
				id: doc.id,
				type: doc.type,
				name: doc.name,
				defaultAlias: {name: doc.name},
				disambiguation: doc.disambiguation ? {comment: doc.disambiguation} : null,
				aliasSet: {
					aliases: doc.alias?.map((a: string) => ({name: a})) || []
				},
				identifierSet: {
					identifiers: doc.identifier?.map((i: string) => ({value: i})) || []
				}
			};
		}
		catch (error) {
			log.error('Error parsing stored document:', error);
			return null;
		}
	}).filter(Boolean);
}

/**
 * autocomplete (edge ngrams). note: the website ui may or may not call this,
 * but the endpoint is here and matches solrconfig.xml's /autocomplete handler.
 */
export async function autocomplete(
	orm: ORM,
	query: string,
	type: IndexableEntitiesOrAll | IndexableEntities[],
	size = 42
) {
	try {
		const lowerQuery = query.toLowerCase();

		const params: Record<string, any> = {
			q: lowerQuery,
			defType: 'edismax',
			fl: 'bbid,id,name,type,disambiguation,_store',
			rows: size,
			wt: 'json',
			tie: 0.1
		};

		params.qf = 'name_autocomplete^10 alias_autocomplete^10';

		// Add type filter if specified
		const sanitizedType = sanitizeEntityType(type);
		if (sanitizedType && sanitizedType !== 'allEntities') {
			if (Array.isArray(sanitizedType)) {
				params.fq = `type:(${sanitizedType.join(' OR ')})`;
			}
			else {
				params.fq = `type:${sanitizedType}`;
			}
		}

		log.debug('Solr autocomplete params:', params);
		const response = await solrRequest('/autocomplete', params);
		const results = await _fetchEntityModelsForSolrResults(orm, response.response?.docs || []);

		return results;
	}
	catch (error) {
		log.error('Autocomplete error:', error);
		return [];
	}
}

/**
 * main search endpoint used by the website.
 * we keep this conservative: rely on df=_text_ and copyField rules in schema.xml.
 */
export async function searchByName(
	orm: ORM,
	name: string,
	type: any,
	size: number,
	from: number
) {
	try {
		const sanitizedType = sanitizeEntityType(type);
		const query = name.toLowerCase();

	const isFieldSpecificQuery = query.includes('author:') || query.includes('identifier:');

	const isISBN = /^(\d{1,5}-\d{1,7}-\d{1,7}-[\dX]|\d{3}-\d{1,5}-\d{1,7}-\d{1,7}-[\dX])$/.test(query);

		const params: Record<string, any> = {
			defType: 'edismax',
			wt: 'json',
			indent: true,
			start: from,
			rows: size,
			q: query,
			tie: 0.1,
			fl: 'bbid,id,name,type,disambiguation,author,_store'
		};

	if (isFieldSpecificQuery) {
		params.defType = 'lucene';
		if (query.includes('author:')) {
			const searchTerm = query.split('author:')[1].split(/\s/)[0];
			params.q = query.replace(/author:\S+/, `author_exact:*${searchTerm}*`);
		}
		else {
			params.q = query;
		}
	}
	else if (isISBN) {
		params.fq = [`identifier:"${query}"`];
		params.q = '*:*';
	}
	else {
		// default: let df=_text_ + schema copyField decide what matches.
		// important detail: do not put the 1-3gram fields in global qf or you will match everything.
	}

		// Type filtering for multi-entity search
		if (sanitizedType && sanitizedType !== 'allEntities') {
			const typeFilter = Array.isArray(sanitizedType)
				? `type:(${sanitizedType.join(' OR ')})`
				: `type:${sanitizedType}`;
			
			// If fq is already an array (e.g., from ISBN filter), append to it
			if (Array.isArray(params.fq)) {
				params.fq.push(typeFilter);
			}
			// Otherwise, create new fq
			else {
				params.fq = typeFilter;
			}
		}

		const response = await solrRequest('/select', params);
		const results = await _fetchEntityModelsForSolrResults(orm, response.response?.docs || []);

		return {
			results,
			total: response.response?.numFound || 0
		};
	}
	catch (error) {
		log.error('Search error:', error);
		return {results: [], total: 0};
	}
}

/**
 * used in the entity editor "warn if exists" flow.
 */
export async function checkIfExists(orm: ORM, name: string, type: string) {
	try {
		const params = {
			q: `name:"${escapeQuery(name)}"`,
			fq: `type:${snakeCase(type)}`,
			fl: 'bbid,id,name,type,_store',
			rows: 20,
			wt: 'json'
		};

		const response = await solrRequest('/select', params);
		const results = await _fetchEntityModelsForSolrResults(orm, response.response?.docs || []);

		return results;
	}
	catch (error) {
		log.error('checkIfExists error:', error);
		return [];
	}
}

/**
 * single doc index helper (mostly for dev).
 */
export async function indexEntity(entity: any) {
	try {
		const doc = {
			bbid: entity.bbid || entity.id,
			id: entity.id,
			type: snakeCase(entity.type),
			name: entity.name,
			alias: entity.aliases?.map((a: any) => a.name) || [],
			disambiguation: entity.disambiguation || '',
			identifier: entity.identifiers?.map((i: any) => i.value) || [],
			...(entity.type === 'work' && entity.authors ? {author: entity.authors} : {}),
			_store: JSON.stringify(entity)
		};

		await solrPost('/update/json/docs', doc);
		await solrPost('/update', {commit: {}});

		log.info(`Indexed entity: ${doc.bbid}`);
	}
	catch (error) {
		log.error('Error indexing entity:', error);
	}
}

/**
 * delete one doc by id.
 */
export async function deleteEntity(entity: any) {
	try {
		await solrPost('/update', {
			delete: {id: entity.bbid || entity.id}
		});
		await solrPost('/update', {commit: {}});

		log.info(`Deleted entity: ${entity.bbid || entity.id}`);
	}
	catch (error) {
		log.error('Error deleting entity:', error);
	}
}

/**
 * bulk index helper for the demo dataset.
 */
export async function _bulkIndexEntities(entities: any[]) {
	if (!entities.length) {
		return;
	}

	try {
		const docs = entities.map(entity => ({
			bbid: entity.bbid || entity.id,
			id: entity.id || entity.bbid,
			type: snakeCase(entity.type),
			name: entity.name,
			alias: entity.aliases?.map((a: any) => a.name) || entity.alias || [],
			disambiguation: entity.disambiguation || '',
			identifier: entity.identifiers?.map((i: any) => i.value) || entity.identifier || [],
			...(entity.type === 'work' && entity.authors ? {author: entity.authors} : {}),
			_store: JSON.stringify(entity)
		}));

		await solrPost('/update/json/docs?commit=false', docs);

		if (entities.length >= _bulkIndexSize) {
			await solrPost('/update', {commit: {}});
		}

		log.info(`Bulk indexed ${entities.length} entities`);
	}
	catch (error) {
		log.error('Error bulk indexing:', error);
		throw error;
	}
}

/**
 * hard commit. solrconfig also has autoCommit/softCommit, but we do this so the demo feels instant.
 */
export async function refreshIndex() {
	try {
		await solrPost('/update', {commit: {}});
		log.info('Solr index refreshed (committed)');
	}
	catch (error) {
		log.error('Error refreshing index:', error);
	}
}

/**
 * demo reindex. this indexes the hardcoded dataset in `search-test-data.ts`.
 */
export async function generateIndex(
	orm: ORM,
	entityType: IndexableEntities | 'allEntities' = 'allEntities',
	recreateIndex = false
) {
	try {
		log.notice('Starting Solr MVP indexing with test data');

		if (recreateIndex) {
			await solrPost('/update', {delete: {query: '*:*'}});
			await solrPost('/update', {commit: {}});
			log.notice('Deleted all documents from Solr');
		}

		await _bulkIndexEntities(solrTestDocuments);
		await refreshIndex();

		log.notice(`Indexed ${solrTestDocuments.length} test documents successfully`);
	}
	catch (error) {
		log.error('Error generating index:', error);
		throw error;
	}
}

/**
 * connect to solr. if the core is empty, auto-load the demo dataset.
 */
export async function init(orm: ORM, options: {host?: string; port?: number}) {
	try {
		const host = options.host || 'localhost';
		const port = options.port || 8983;

		_solrHost = `http://${host}:${port}`;
		_client = {
			baseUrl: `${_solrHost}/solr/${_solrCore}`
		};

		await solrRequest('/admin/ping', {wt: 'json'});

		log.info('Solr connection successful');

		const checkResponse = await solrRequest('/select', {q: '*:*', rows: 0, wt: 'json'});
		const docCount = checkResponse.response?.numFound || 0;
		
		if (docCount === 0) {
			log.notice('Solr index is empty, indexing test data...');
			await generateIndex(orm);
		}
		else {
			log.info(`Solr index already has ${docCount} documents, skipping auto-index`);
		}

		return true;
	}
	catch (error) {
		log.warning('Could not connect to Solr:', error);
		return false;
	}
}
