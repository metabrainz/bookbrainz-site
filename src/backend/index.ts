import type {Client} from '@elastic/elasticsearch';
import type {ORM} from 'bookbrainz-data';


export type BackendDependencies = {
	orm: ORM,
	searchClient: Client | undefined
};

// Page migrations add their data functions here. Neither requests nor responses enter the backend.
export function createBackend(_dependencies: BackendDependencies) {
	return {};
}

export type Backend = ReturnType<typeof createBackend>;
