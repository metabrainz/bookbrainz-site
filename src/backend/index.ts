import {getOrderedRevisions, getRevisionsPage} from './revisions';
import type {Client} from '@elastic/elasticsearch';
import type {ORM} from 'bookbrainz-data';
import {getSearchPage} from './search';


export type BackendDependencies = {
	orm: ORM,
	searchClient: Client | null
};

// Page migrations add their data functions here. Neither requests nor responses enter the backend.
export function createBackend({orm}: BackendDependencies) {
	return {
		revisions: {
			getLatest: ({size}: {size: number}) => getOrderedRevisions(0, size, orm),
			getPage: (params: {from: number, size: number}) => getRevisionsPage(orm, params)
		},
		search: {
			getPage: (params: Parameters<typeof getSearchPage>[1]) => getSearchPage(orm, params)
		}
	};
}

export type Backend = ReturnType<typeof createBackend>;
