// tiny switch to choose the search backend.
// set USE_SOLR=true to use solr, otherwise we fall back to elasticsearch.
const USE_SOLR = process.env.USE_SOLR === 'true';

// Import the appropriate search implementation
const searchImpl = USE_SOLR 
	? require('./search-solr')
	: require('./search');

// Re-export all functions
export const autocomplete = searchImpl.autocomplete;
export const searchByName = searchImpl.searchByName;
export const checkIfExists = searchImpl.checkIfExists;
export const indexEntity = searchImpl.indexEntity;
export const deleteEntity = searchImpl.deleteEntity;
export const refreshIndex = searchImpl.refreshIndex;
export const generateIndex = searchImpl.generateIndex;
export const init = searchImpl.init;
export const _bulkIndexEntities = searchImpl._bulkIndexEntities;

// also export the types used by the website routes.
export type {IndexableEntities, IndexableEntitiesOrAll} from './search-solr';

console.log(`Search Implementation: ${USE_SOLR ? 'SOLR' : 'ElasticSearch'}`);
