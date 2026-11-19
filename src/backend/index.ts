import {getAdminLogsPage, getEditorSearchPage} from './admin';
import {getGenders, getProfileEditData} from './editors';
import {getIdentifierTypes, getRelationshipTypesPage} from './types';
import {getOrderedRevisions, getRevisionsPage} from './revisions';
import type {Client} from '@elastic/elasticsearch';
import type {ORM} from 'bookbrainz-data';
import {getCritiqueBrainzPermission} from './external-service';
import {getIdentifierTypeCreateData} from './type-editors';
import {getPublicCollectionsPage} from './collections';
import {getSearchPage} from './search';
import {getStatisticsPage} from './statistics';


export type BackendDependencies = {
	orm: ORM,
	searchClient: Client | null
};

// Page migrations add their data functions here. Neither requests nor responses enter the backend.
export function createBackend({orm}: BackendDependencies) {
	return {
		admin: {
			getLogsPage: (params: {from: number, size: number}) => getAdminLogsPage(orm, params),
			searchEditors: (params: {from: number, query: string, size: number}) => getEditorSearchPage(orm, params)
		},
		collections: {
			getPublicPage: (params: Parameters<typeof getPublicCollectionsPage>[1]) => getPublicCollectionsPage(orm, params)
		},
		editors: {
			getGenders: () => getGenders(orm),
			getProfileEditData: (params: {editorId: number}) => getProfileEditData(orm, params)
		},
		externalService: {
			getCritiqueBrainzPermission: (params: {editorId: number}) => getCritiqueBrainzPermission(orm, params)
		},
		revisions: {
			getLatest: ({size}: {size: number}) => getOrderedRevisions(0, size, orm),
			getPage: (params: {from: number, size: number}) => getRevisionsPage(orm, params)
		},
		search: {
			getPage: (params: Parameters<typeof getSearchPage>[1]) => getSearchPage(orm, params)
		},
		statistics: {
			getPage: () => getStatisticsPage(orm)
		},
		typeEditors: {
			getIdentifierTypeCreateData: () => getIdentifierTypeCreateData(orm)
		},
		types: {
			getIdentifierTypes: () => getIdentifierTypes(orm),
			getRelationshipTypesPage: (params: {type1: string, type2: string}) => getRelationshipTypesPage(orm, params)
		}
	};
}

export type Backend = ReturnType<typeof createBackend>;
